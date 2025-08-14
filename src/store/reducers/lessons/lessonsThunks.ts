import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../api';
import type { RootState } from '../rootReducer';
import type { ErrorTypeAuth } from '../errorTypes';

export const getHTML = createAsyncThunk(
	'lesson/create',
	async (_, { getState, rejectWithValue }) => {
		const state = getState() as RootState;
		const { pages, title, testId } = state.lesson;

		console.log('getHTML - save', testId);

		const accessToken = state.user.accessToken;
		try {
			const res = await api.post(
				'/lessons/create',
				{
					title,
					pages,
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


export const getLessonPDFById = createAsyncThunk<
	string, // возвращаем blob-url
	number // принимаем lessonId
>('lesson/getByIdPDF', async (lessonId, { getState, rejectWithValue }) => {
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
});

export const getAllLessons = createAsyncThunk(
	'lesson/getAll',
	async (_, { getState, rejectWithValue }) => {
		const state = getState() as RootState;
		const accessToken = state.user.accessToken;
		try {
			const { data } = await api.get('/lessons/all', {
				headers: { Authorization: `Bearer ${accessToken}` },
			});
			// data: Array<{ id, title, pages, contentUrl }>
			return data;
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
// export const getAllLessons = createAsyncThunk(
// 	'lesson/getAll',
// 	async (_, { getState, rejectWithValue }) => {
// 		const state = getState() as RootState;
// 		const accessToken = state.user.accessToken;
// 		try {
// 			const res = await api.get('/lessons/all', {
// 				headers: {
// 					Authorization: `Bearer ${accessToken}`,
// 				},
// 			});
// 			return res.data;
// 		} catch (error) {
// 			const err = error as { response?: { data: ErrorTypeAuth } };
// 			console.error('Ошибка при получении уроков', err.response?.data);

// 			return rejectWithValue(
// 				err.response?.data || {
// 					message: 'Ошибка при получении уроков',
// 					statusCode: 500,
// 				}
// 			);
// 		}
// 	}
// );
