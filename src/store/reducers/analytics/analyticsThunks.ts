import { createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../../api';
import type { RootState } from '../../store';
import { getMyStats } from '../user/userThunks';
import type { SubmitBody } from './types';
import type { ErrorTypeAuth } from '../errorTypes';

export const submitQuizResult = createAsyncThunk<
	void,
	SubmitBody,
	{ state: RootState; rejectValue: string }
>('analytics/submitQuizResult', async (body, { dispatch, rejectWithValue }) => {
	try {
		console.log('quiz/submit: ', body);
		await api.post('/analytics/quiz/submit', body);
		// подтянем свежую статистику в user.myStats
		await dispatch(getMyStats()).unwrap();
		return;
	} catch (error) {
		const err = error as { response?: { data: ErrorTypeAuth } };
		console.error('Ошибка при сохранении теста', err.response?.data);

		return rejectWithValue('Ошибка сохранения результатов');
	}
});
