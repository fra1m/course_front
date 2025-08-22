import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../api';
import type { RootState } from '../rootReducer';
import type { ErrorTypeAuth } from '../errorTypes';
import type { ILesson } from '../../../models/course/ILesson';

export const createLesson = createAsyncThunk<ILesson>(
	'lesson/create',
	async (_, { getState, rejectWithValue }) => {
		const state = getState() as RootState;
		const { pages, title, testId, courseId } = state.lesson;

		const accessToken = state.user.accessToken;
		try {
			const res = await api.post(
				'/lessons/create',
				{
					title,
					pages,
					courseId,
					quizId: testId,
				},
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

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

export const getLessonPDFById = createAsyncThunk<string, number>( //TODO: delete
	'lesson/getByIdPDF',
	async (lessonId, { getState, rejectWithValue }) => {
		const state = getState() as RootState;
		const accessToken = state.user.accessToken;

		try {
			const res = await api.get(`/lessons/${lessonId}/content`, {
				responseType: 'blob',
				headers: { Authorization: `Bearer ${accessToken}` },
			});

			const url = URL.createObjectURL(
				new Blob([res.data], { type: 'application/pdf' })
			);
			return url;
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

export const getAllLessons = createAsyncThunk(
	'lesson/getAll',
	async (_, { getState, rejectWithValue }) => {
		const state = getState() as RootState;
		const accessToken = state.user.accessToken;
		try {
			const res = await api.get('/lessons/all', {
				headers: { Authorization: `Bearer ${accessToken}` },
			});
			// data: Array<{ id, title, pages, contentUrl }>
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
>('lessons/fetchContent', async (lessonId, { getState, rejectWithValue }) => {
	const token = getState().user.accessToken;

	try {
		const res = await api.get<ArrayBuffer>(`/lessons/${lessonId}/content`, {
			responseType: 'arraybuffer', // важно: сырой бинарь
			withCredentials: true,
			headers: token ? { Authorization: `Bearer ${token}` } : {},
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
