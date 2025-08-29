import { createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../../api';

import type { ErrorTypeAuth } from '../errorTypes';
import type { QuizState } from './types';
import type { IQuiz } from '../../../models/IQuiz';
import type { RootState } from '../../store';

export const saveQuiz = createAsyncThunk<
	IQuiz, // что возвращает при успехе
	QuizState, // аргумент
	{ rejectValue: ErrorTypeAuth } // если будет ошибка
>('quiz/create', async (_, { getState, rejectWithValue }) => {
	const state = getState() as RootState;
	const quizData = state.quiz.surveyJson;
	try {
		const res = await api.post('/quiz/create', { surveyJson: quizData });

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
});

export const getAllQuizzes = createAsyncThunk(
	'quiz/all',
	async (_, { rejectWithValue }) => {
		try {
			const res = await api.get('/quiz/all');

			return res.data;
		} catch (error) {
			const err = error as { response?: { data: ErrorTypeAuth } };
			console.error('Ошибка при получении тестов', err.response?.data);

			return rejectWithValue(
				err.response?.data || {
					message: 'Ошибка при получении тестов',
					statusCode: 500,
				}
			);
		}
	}
);

export const updateQuiz = createAsyncThunk<
	void, // что возвращает при успехе
	QuizState, // аргумент
	{ rejectValue: ErrorTypeAuth } // если будет ошибка
>('quiz/update', async (_, { getState, rejectWithValue }) => {
	const state = getState() as RootState;
	const quizData = state.quiz;
	// const accessToken = state.user.accessToken;
	try {
		const res = await api.patch('/quiz/update', {
			surveyJson: quizData.surveyJson,
			id: quizData.id,
		});

		return res.data;
	} catch (error) {
		const err = error as { response?: { data: ErrorTypeAuth } };
		console.error('Ошибка при обновление теста', err.response?.data);

		return rejectWithValue(
			err.response?.data || {
				message: 'Ошибка при обновление теста',
				statusCode: 500,
			}
		);
	}
});

export const deleteQuiz = createAsyncThunk<
	void, // что возвращает при успехе
	IQuiz, // аргумент
	{ rejectValue: ErrorTypeAuth } // если будет ошибка
>('quiz/delete', async (_, { getState, rejectWithValue }) => {
	const state = getState() as RootState;
	const quizData = state.quiz;

	try {
		const res = await api.delete('/quiz/delete', { data: { id: quizData.id } });

		return res.data;
	} catch (error) {
		const err = error as { response?: { data: ErrorTypeAuth } };
		console.error('Ошибка при удалении теста', err.response?.data);

		return rejectWithValue(
			err.response?.data || {
				message: 'Ошибка при удалении теста',
				statusCode: 500,
			}
		);
	}
});
