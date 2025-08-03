import axios from 'axios';
import { checkAuth, logoutUser } from './store/reducers/user/userThunks';
import { store } from './store/store';
import { RouteNames } from './routes';

// import { store } from './store/store';
// import { logoutUser } from './store/reducers/userReducer';

const api = axios.create({
	baseURL: 'http://localhost:8080',
	withCredentials: true,
});

api.interceptors.response.use(
	response => response,
	async error => {
		const originalRequest = error.config;

		// Убедись, что это не запрос к /user/refresh, иначе будет бесконечный цикл
		const isRefreshingCall = originalRequest.url?.includes('/user/refresh');
		const isLoginCall = originalRequest.url?.includes('/user/login');

		if (
			error.response?.status === 401 &&
			!originalRequest._retry &&
			!isRefreshingCall &&
			!isLoginCall
		) {
			originalRequest._retry = true;

			try {
				const actionResult = await store.dispatch(checkAuth());

				if (checkAuth.fulfilled.match(actionResult)) {
					const newAccessToken = actionResult.payload.tokens.accessToken;

					// Обновим заголовок и повторим оригинальный запрос
					originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
					return api(originalRequest);
				} else {
					// refreshToken просрочен или недействителен
					store.dispatch(logoutUser());
					window.location.href = RouteNames.LOGIN;
					return Promise.reject(error);
				}
			} catch (e) {
				store.dispatch(logoutUser());
				window.location.href = RouteNames.LOGIN;
				return Promise.reject(e);
			}
		}

		return Promise.reject(error);
	}
);

export default api;
