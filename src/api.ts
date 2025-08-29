/* eslint-disable @typescript-eslint/no-unused-vars */
// src/api.ts
import axios from 'axios';
import type { AppStore } from './store/store';

export const api = axios.create({
	baseURL: import.meta.env.VITE_API_BASE,
	withCredentials: true,
});

// Позволяет задать/сбросить заголовок Authorization
export function applyAuthHeader(token?: string) {
	if (token) {
		api.defaults.headers.common.Authorization = `Bearer ${token}`;
	} else {
		delete api.defaults.headers.common.Authorization;
	}
}

// Подключаем интерсепторы ПОСЛЕ создания store
export function setupApiInterceptors(store: AppStore) {
	let isRefreshing = false;
	let queue: Array<[(v?: unknown) => void, (e: unknown) => void]> = [];

	api.interceptors.response.use(
		r => r,
		async error => {
			const original = error.config ?? {};
			const url = String(original.url ?? '');
			const is401 = error?.response?.status === 401;
			const isRefreshCall = url.includes('/user/refresh');
			const isLoginCall = url.includes('/user/login');

			if (is401 && !original._retry && !isRefreshCall && !isLoginCall) {
				original._retry = true;

				// чтобы избежать гонок — очередь
				if (isRefreshing) {
					return new Promise((resolve, reject) => queue.push([resolve, reject]))
						.then(() => api(original))
						.catch(e => Promise.reject(e));
				}

				isRefreshing = true;

				try {
					const { checkAuth, logoutUser } = await import(
						'./store/reducers/user/userThunks'
					);
					const { RouteNames } = await import('./routes');

					const result = await store.dispatch(checkAuth());

					if (checkAuth.fulfilled.match(result)) {
						const newToken = result.payload.tokens.accessToken;
						applyAuthHeader(newToken);

						// выпускаем ожидавшие запросы
						queue.forEach(([res]) => res(undefined));
						queue = [];

						// повторяем оригинальный
						original.headers = {
							...(original.headers ?? {}),
							Authorization: `Bearer ${newToken}`,
						};
						return api(original);
					} else {
						store.dispatch(logoutUser());
						applyAuthHeader(undefined);
						queue.forEach(([_, rej]) => rej(error));
						queue = [];
						window.location.href = RouteNames.LOGIN;
						return Promise.reject(error);
					}
				} catch (e) {
					queue.forEach(([_, rej]) => rej(e));
					queue = [];
					return Promise.reject(e);
				} finally {
					isRefreshing = false;
				}
			}

			return Promise.reject(error);
		}
	);
}
