import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import api from '../../../api';

export const registerUser = createAsyncThunk(
	'user/register',
	async (
		data: { email: string; password: string; name: string },
		{ rejectWithValue }
	) => {
		try {
			const res = await api.post('/user/registration', data);

			return res.data;
		} catch (err: unknown) {
			if (axios.isAxiosError(err) && err.response?.data?.message) {
				return rejectWithValue(err.response.data.message);
			}
			return rejectWithValue('Ошибка регистрации');
		}
	}
);

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
