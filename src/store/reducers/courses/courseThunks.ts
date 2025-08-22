import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../api';
import type { ErrorTypeAuth } from '../errorTypes';
import type { RootState } from '../rootReducer';
import type { ICourse } from '../../../models/course/ICourse';

export const createCourse = createAsyncThunk(
	'lesson/create',
	async (_, { getState, rejectWithValue }) => {
		const state = getState() as RootState;
		const { title, description, file } = state.course;



		const accessToken = state.user.accessToken;
		try {
			const fd = new FormData();
			fd.append('title', title);
			fd.append('description', description ?? '');

			if (file) {
				fd.append('file', file, file.name);
			}

			const res = await api.post('/courses/create', fd, {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});



			return res.data;
		} catch (error) {
			const err = error as { response?: { data: ErrorTypeAuth } };
			console.error('Ошибка при сохранении курса', err.response?.data);

			return rejectWithValue(
				err.response?.data || {
					message: 'Ошибка при сохранении курса',
					statusCode: 500,
				}
			);
		}
	}
);

export const updateCourse = createAsyncThunk<ICourse>(
	'lesson/update',
	async (_, { getState, rejectWithValue }) => {
		const state = getState() as RootState;
		const { title, description, selectedCourseId } = state.course;

		const accessToken = state.user.accessToken;
		try {
			const res = await api.patch(
				'/courses/update',
				{ id: selectedCourseId, title, description },
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			return res.data;
		} catch (error) {
			const err = error as { response?: { data: ErrorTypeAuth } };
			console.error('Ошибка при сохранении курса', err.response?.data);

			return rejectWithValue(
				err.response?.data || {
					message: 'Ошибка при сохранении курса',
					statusCode: 500,
				}
			);
		}
	}
);

export const getAllCourses = createAsyncThunk(
	'lesson/getAllCourses',
	async (_, { getState, rejectWithValue }) => {
		const state = getState() as RootState;

		const accessToken = state.user.accessToken;
		try {
			const res = await api.get('/courses/getAllCourses', {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});

			return res.data;
		} catch (error) {
			const err = error as { response?: { data: ErrorTypeAuth } };
			console.error('Ошибка при сохранении курса', err.response?.data);

			return rejectWithValue(
				err.response?.data || {
					message: 'Ошибка при сохранении курса',
					statusCode: 500,
				}
			);
		}
	}
);

export const deleteCourse = createAsyncThunk<ICourse>(
	'lesson/delete',
	async (_, { getState, rejectWithValue }) => {
		const state = getState() as RootState;
		const { selectedCourseId } = state.course;

		const accessToken = state.user.accessToken;
		try {
			const res = await api.delete('/courses/delete', {
				data: { id: selectedCourseId },
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});

			return res.data;
		} catch (error) {
			const err = error as { response?: { data: ErrorTypeAuth } };
			console.error('Ошибка при сохранении курса', err.response?.data);

			return rejectWithValue(
				err.response?.data || {
					message: 'Ошибка при сохранении курса',
					statusCode: 500,
				}
			);
		}
	}
);
