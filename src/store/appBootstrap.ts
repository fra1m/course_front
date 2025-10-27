import { createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from './store';
import { markBootstrapped } from './appSlice';
import { getMyStats, getAllUsers } from './reducers/user/userThunks';
import { Role } from './reducers/user/types';
import { getAllCourses } from './reducers/courses/courseThunks';
import { fetchSpecializations } from './reducers/specializations/specializationsThunks';
import { getAllLessons } from './reducers/lessons/lessonsThunks';
import { getAllQuizzes } from './reducers/quiz/quizThunks';

export const appBootstrap = createAsyncThunk<void, void, { state: RootState }>(
	'app/bootstrap',
	async (_: void, { dispatch, getState }) => {
		const { app, user } = getState();
		if (app.bootstrapped) return;
		if (!user.isAuth) return;

		const jobs: Promise<unknown>[] = [];

		// общие данные для любого пользователя:
		jobs.push(
			dispatch(getMyStats())
				.unwrap()
				.catch(() => {})
		);

		jobs.push(
			dispatch(getAllCourses())
				.unwrap()
				.catch(() => {})
		);

		jobs.push(
			dispatch(getAllLessons())
				.unwrap()
				.catch(() => {})
		);

		// админ/преподаватель — часто нужен список пользователей
		if (user.role === Role.ADMIN || user.role === Role.TEACHER) {
			jobs.push(
				dispatch(getAllUsers())
					.unwrap()
					.catch(() => {})
			);

			jobs.push(
				dispatch(getAllQuizzes())
					.unwrap()
					.catch(() => {})
			);

			jobs.push(
				dispatch(fetchSpecializations())
					.unwrap()
					.catch(() => {})
			);
		}

		await Promise.all(jobs);
		dispatch(markBootstrapped(Date.now()));
	}
);
