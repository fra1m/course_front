import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../api';
import type { RootState } from '../rootReducer';
import type { ErrorTypeAuth } from '../errorTypes';

export const getHTML = createAsyncThunk(
	'lesson/get',
	async (_, { getState, rejectWithValue }) => {
		const state = getState() as RootState;
		const accessToken = state.user.accessToken;
		try {
			const res = await api.get('/lessons/genAndGet', {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});

			return res.data;
		} catch (error) {
			const err = error as { response?: { data: ErrorTypeAuth } };
			console.error('Ошибка при сохранении теста', err.response?.data);

			return rejectWithValue(
				err.response?.data || {
					message: 'Ошибка при сохранении теста',
					statusCode: 500,
				}
			);
		}
	}
);
