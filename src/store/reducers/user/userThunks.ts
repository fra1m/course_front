import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { api } from '../../../api';

import type { IUserListItem, IUserStats, UpdateUserArgs } from './types';
import type { RootState } from '../../store';

export const registerUser = createAsyncThunk(
	'user/register',
	async (
		data: { email: string; password: string; name: string; role: string },
		{ getState, rejectWithValue }
	) => {
		const state = getState() as RootState;

		const accessToken = state.user.accessToken;
		try {
			const res = await api.post(
				'/user/registration',
				{
					...data,
				},
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			return res.data;
		} catch (err: unknown) {
			if (axios.isAxiosError(err) && err.response?.data?.message) {
				return rejectWithValue(err.response.data.message);
			}
			return rejectWithValue('Ошибка регистрации');
		}
	}
);

export const getAllUsers = createAsyncThunk(
	'users',
	async (_, { getState, rejectWithValue }) => {
		const state = getState() as RootState;

		const accessToken = state.user.accessToken;
		try {
			const res = await api.get('/user/all', {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});

			console.log(res.data);

			return res.data;
		} catch (err: unknown) {
			if (axios.isAxiosError(err) && err.response?.data?.message) {
				return rejectWithValue(err.response.data.message);
			}
			return rejectWithValue('Ошибка регистрации');
		}
	}
);

export const deleteUser = createAsyncThunk(
	'user/delete',
	async (data: { id: number }, { getState, rejectWithValue }) => {
		const state = getState() as RootState;

		const accessToken = state.user.accessToken;

		try {
			const res = await api.delete('/user/delete', {
				data,
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});

			console.log('DELETE RES:', res.data);

			return res.data;
		} catch (err: unknown) {
			if (axios.isAxiosError(err) && err.response?.data?.message) {
				return rejectWithValue(err.response.data.message);
			}
			return rejectWithValue('Ошибка авторизации');
		}
	}
);

export const updateUser = createAsyncThunk<
	IUserListItem, // fulfilled payload
	UpdateUserArgs, // args
	{ state: RootState; rejectValue: string }
>('user/update', async ({ id, patch }, { getState, rejectWithValue }) => {
	const accessToken = getState().user.accessToken;

	try {
		const res = await api.patch(`/user/${id}`, patch, {
			headers: { Authorization: `Bearer ${accessToken}` },
		});
		// сервер возвращает обновлённого пользователя (IUserListItem)
		return res.data as IUserListItem;
	} catch (err: unknown) {
		if (axios.isAxiosError(err) && err.response?.data?.message) {
			return rejectWithValue(err.response.data.message as string);
		}
		return rejectWithValue('Не удалось обновить пользователя');
	}
});

export const getMyStats = createAsyncThunk<
	IUserStats,
	void,
	{ state: RootState; rejectValue: string }
>('user/getMyStats', async (_: void, { getState, rejectWithValue }) => {
	const accessToken = getState().user.accessToken;

	try {
		const res = await api.get<IUserStats>('/user/me/stats', {
			headers: { Authorization: `Bearer ${accessToken}` },
		});

		return res.data;
	} catch (err: unknown) {
		if (axios.isAxiosError(err) && err.response?.data?.message) {
			return rejectWithValue(err.response.data.message);
		}
		return rejectWithValue('Не удалось получить статистику');
	}
});

export const changeMyPassword = createAsyncThunk<
	void,
	{ currentPassword: string; newPassword: string },
	{ state: RootState; rejectValue: string }
>('user/changeMyPassword', async (data, { getState, rejectWithValue }) => {
	const accessToken = getState().user.accessToken;
	try {
		await api.patch('/user/patch', data, {
			headers: { Authorization: `Bearer ${accessToken}` },
		});
	} catch (err: unknown) {
		if (axios.isAxiosError(err) && err.response?.data?.message) {
			return rejectWithValue(err.response.data.message);
		}
		return rejectWithValue('Не удалось сменить пароль');
	}
});

export const checkAuth = createAsyncThunk(
	'user/check-auth',
	async (_, { rejectWithValue }) => {
		try {
			const res = await api.get('/user/refresh', {});
			return res.data;
		} catch (err: unknown) {
			if (axios.isAxiosError(err) && err.response?.data?.message) {
				return rejectWithValue(err.response.data.message);
			}
			return rejectWithValue('Ошибка авторизации');
		}
	}
);

export const loginUser = createAsyncThunk(
	'user/login',
	async (data: { email: string; password: string }, { rejectWithValue }) => {
		try {
			const res = await api.post('/user/auth', data);
			return res.data;
		} catch (err: unknown) {
			if (axios.isAxiosError(err) && err.response?.data?.message) {
				return rejectWithValue(err.response.data.message);
			}
			return rejectWithValue('Ошибка входа');
		}
	}
);

export const logoutUser = createAsyncThunk(
	'user/logout',
	async (_, { rejectWithValue }) => {
		try {
			await api.post('/user/logout');
			return;
		} catch (err: unknown) {
			if (axios.isAxiosError(err) && err.response?.data?.message) {
				return rejectWithValue(err.response.data.message);
			}
			return rejectWithValue('Ошибка выхода');
		}
	}
);
