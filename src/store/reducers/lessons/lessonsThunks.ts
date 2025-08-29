import { createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../../api';

import type { ErrorTypeAuth } from '../errorTypes';
import type { ILesson } from '../../../models/course/ILesson';
import type { RootState } from '../../store';

export const createLesson = createAsyncThunk<ILesson>(
	'lesson/create',
	async (_, { getState, rejectWithValue }) => {
		const state = getState() as RootState;
		const { pages, title, testId, courseId } = state.lesson;

		try {
			const res = await api.post('/lessons/create', {
				title,
				pages,
				courseId,
				quizId: testId,
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

export const getAllLessons = createAsyncThunk(
	'lesson/getAll',
	async (_, { rejectWithValue }) => {
		try {
			const res = await api.get('/lessons/all');

			return res.data;
		} catch (error) {
			const err = error as { response?: { data: ErrorTypeAuth } };
			return rejectWithValue(
				err.response?.data ?? {
					message: 'Ошибка при получении уроков',
					statusCode: 500,
				}
			);
		}
	}
);

export const fetchLessonContent = createAsyncThunk<
	ArrayBuffer, // payload on success
	number, // arg: lessonId
	{ state: RootState; rejectValue: ErrorTypeAuth }
>('lessons/fetchContent', async (lessonId, { rejectWithValue }) => {
	try {
		const res = await api.get<ArrayBuffer>(`/lessons/${lessonId}/content`, {
			responseType: 'arraybuffer', // важно: сырой бинарь
			withCredentials: true,
		});

		return res.data;
	} catch (error) {
		const err = error as { response?: { data: ErrorTypeAuth } };
		return rejectWithValue(
			err.response?.data ?? {
				message: 'Не удалось получить PDF',
				statusCode: 500,
			}
		);
	}
});
