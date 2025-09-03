// src/realtime/socket.ts
import { io, Socket } from 'socket.io-client';
import type { AppStore } from '../store/store';
import type { RootState } from '../store/store';
import { resetBootstrap } from '../store/appSlice';
import { appBootstrap } from '../store/appBootstrap';
import { checkAuth, logoutUser } from '../store/reducers/user/userThunks';

const API_BASE = import.meta.env.VITE_API_BASE || '/course_api';

let socket: Socket | null = null;
let unsubscribe: (() => void) | null = null;

function selectAccessToken(s: RootState): string | undefined {
	return s.user.accessToken;
}

function selectIsAuth(s: RootState): boolean {
	return !!s.user.isAuth;
}

function createSocket(token: string) {
	const path = `${API_BASE.replace(/\/$/, '')}/socket.io`;

	return io('/ws', {
		path, // <— ключевой момент
		transports: ['websocket', 'polling'],
		withCredentials: true,
		auth: { token },
	});
}

function connect(store: AppStore) {
	const state = store.getState() as RootState;
	const token = selectAccessToken(state);
	const isAuth = selectIsAuth(state);
	if (!isAuth || !token) return;

	if (socket && socket.connected) return;

	socket = createSocket(token);

	socket.on('connect', () => {});
	socket.on('disconnect', () => {});
	socket.on('connect_error', err => {
		// console.warn('[ws] connect_error', err);
	});

	socket.on('specialization-changed', async () => {
		try {
			await store.dispatch(checkAuth()).unwrap();
		} catch {
			store.dispatch(logoutUser());
			return;
		}
		store.dispatch(resetBootstrap());
		await store.dispatch(appBootstrap());
	});
}

function disconnect() {
	if (socket) {
		socket.removeAllListeners();
		socket.disconnect();
		socket = null;
	}
}

export function startRealtime(store: AppStore) {
	// первичная попытка
	connect(store);

	// Подписка на изменения авторизации/токена
	let prevAuth = selectIsAuth(store.getState() as RootState);
	let prevToken = selectAccessToken(store.getState() as RootState);

	unsubscribe = store.subscribe(() => {
		const s = store.getState() as RootState;
		const currAuth = selectIsAuth(s);
		const currToken = selectAccessToken(s);

		// logout -> Disconnect
		if (!currAuth) {
			disconnect();
			prevAuth = currAuth;
			prevToken = currToken;
			return;
		}

		// login -> Connect
		if (currAuth && !prevAuth) {
			disconnect();
			connect(store);
			prevAuth = currAuth;
			prevToken = currToken;
			return;
		}

		// смена токена (refresh) -> reconnect c новым auth
		if (currAuth && currToken && currToken !== prevToken) {
			disconnect();
			connect(store);
			prevAuth = currAuth;
			prevToken = currToken;
			return;
		}

		prevAuth = currAuth;
		prevToken = currToken;
	});
}

export function stopRealtime() {
	disconnect();
	if (unsubscribe) {
		unsubscribe();
		unsubscribe = null;
	}
}
