import { createAsyncThunk } from '@reduxjs/toolkit';

import type { ErrorTypeAuth } from '../errorTypes';

import type { ICourse } from '../../../models/course/ICourse';
import { api } from '../../../api';
import type { RootState } from '../../store';

export const createCourse = createAsyncThunk(
	'lesson/create',
	async (_, { getState, rejectWithValue }) => {
		const state = getState() as RootState;
		const { title, description, file, specializationId } = state.course;

		console.log(specializationId);

		try {
			const fd = new FormData();
			fd.append('title', title);
			fd.append('description', description ?? '');
			fd.append('specializationId', String(specializationId));

			if (file) {
				fd.append('file', file, file.name);
			}

			const res = await api.post('/courses/create', fd);

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

		try {
			const res = await api.patch('/courses/update', {
				id: selectedCourseId,
				title,
				description,
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

export const getAllCourses = createAsyncThunk(
	'lesson/getAllCourses',
	async (_, { rejectWithValue }) => {
		try {
			const res = await api.get('/courses/getAllCourses');

			console.log('ALL COURSES: ', res.data);

			return res.data;
		} catch (error) {
			const err = error as { response?: { data: ErrorTypeAuth } };
			console.error('Ошибка при получение курсов', err.response?.data);

			return rejectWithValue(
				err.response?.data || {
					message: 'Ошибка при получение курсов',
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
		try {
			const res = await api.delete('/courses/delete', {
				data: { id: selectedCourseId },
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
