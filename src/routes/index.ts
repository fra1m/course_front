import type React from 'react';
import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';
import { RegisterPage } from '../pages/RegisterPage';
import { QuizBuilder } from '../components/QuizBuilder';
import { QuizPage } from '../pages/QuizPage';
import { CoursesPage } from '../pages/CoursesPage';
import { LessonsForm } from '../components/LessonsForm';

export interface IRoute {
	path: string;
	component: React.ComponentType;
	exact?: boolean;
}

export const RouteNames = {
	LOGIN: '/login',
	REGISTER: '/register',
	HOME: '/',
	QUIZ_BUILDER: '/quiz-builder',
	QUIZ: '/quiz',
	COURSES: '/courses',
	PROFILE: '/profile',
	LESSON: '/lesson',
} as const;

export const publickRoutes: IRoute[] = [
	{ path: RouteNames.LOGIN, exact: true, component: LoginPage },
	{ path: RouteNames.REGISTER, exact: true, component: RegisterPage },
];

export const privateRoutes: IRoute[] = [
	{ path: RouteNames.HOME, exact: true, component: HomePage },
	{ path: RouteNames.QUIZ_BUILDER, exact: true, component: QuizBuilder },
	{ path: RouteNames.QUIZ, exact: true, component: QuizPage },
	{ path: RouteNames.COURSES, exact: true, component: CoursesPage },
	{ path: RouteNames.LESSON, exact: true, component: LessonsForm },
];
