import type React from 'react';
import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';
import { RegisterPage } from '../pages/RegisterPage';
import { QuizBuilder } from '../components/QuizBuilder';
import { QuizzesPage } from '../pages/QuizzesPage';
import { CoursesPage } from '../pages/CoursesPage';
import { LessonsForm } from '../components/LessonsForm';
import { Role } from '../store/reducers/user/types';
import { CourseBuilder } from '../pages/CourseBuilder';
import { QuizPage } from '../pages/QuizePage';
import { LessonBuilder } from '../pages/LessonBuilder';
import { LessonsPage } from '../pages/LessonsPage';

export interface IRoute {
	path: string;
	component: React.ComponentType;
	exact?: boolean;
	roles?: Role[];
	label?: string;
	reset?: boolean;
}

export const RouteNames = {
	HOME: '/',
	REGISTER: '/register',
	PROFILE: '/profile',
	LOGIN: '/login',

	QUIZ_BUILDER: '/quiz-builder',
	QUIZ: '/quiz',
	QUIZZES: '/quizzes',

	COURSES: '/courses',
	COURSE_BUILDER: '/course-builder',

	LESSON: '/lesson',
	LESSON_BUILDER: '/lesson-builder',
	LESSONS: '/lessons',
	LESSON_VIEW: '/lessons/:id',

	// LOGOUT: '/logout',
} as const;

export const publickRoutes: IRoute[] = [
	{ path: RouteNames.LOGIN, exact: true, component: LoginPage, label: 'Вход' },
	{
		path: RouteNames.REGISTER,
		exact: true,
		component: RegisterPage,
		label: 'Регистрация',
	},
];

export const privateRoutes: IRoute[] = [
	{
		path: RouteNames.HOME,
		exact: true,
		component: HomePage,
		roles: [Role.STUDENT, Role.TEACHER, Role.ADMIN],
		label: 'Главная',
	},

	{
		path: RouteNames.QUIZ_BUILDER,
		exact: true,
		component: QuizBuilder,
		roles: [Role.TEACHER, Role.ADMIN],
		label: 'Конструктор тестов',
		reset: true,
	},
	{
		path: RouteNames.QUIZZES,
		exact: true,
		component: QuizzesPage,
		roles: [Role.STUDENT, Role.TEACHER, Role.ADMIN],
		label: 'Ваши тесты',
	},
	{
		path: RouteNames.QUIZ,
		exact: true,
		component: QuizPage,
		roles: [Role.STUDENT, Role.TEACHER, Role.ADMIN],
	},

	{
		path: RouteNames.COURSES,
		exact: true,
		component: CoursesPage,
		roles: [Role.STUDENT, Role.ADMIN],
		label: 'Курсы',
	},
	{
		path: RouteNames.COURSE_BUILDER,
		exact: true,
		component: CourseBuilder,
		roles: [Role.TEACHER, Role.ADMIN],
		label: 'Конструктор курсов',
	},

	{
		path: RouteNames.LESSON,
		exact: true,
		component: LessonsForm,
		roles: [Role.STUDENT, Role.TEACHER, Role.ADMIN],
		label: 'Урок',
	},
	{
		path: RouteNames.LESSON_BUILDER,
		exact: true,
		component: LessonBuilder,
		roles: [Role.TEACHER, Role.ADMIN],
		label: 'Конструктор уроков',
	},
	{
		path: RouteNames.LESSONS,
		exact: true,
		component: LessonsPage,
		roles: [Role.TEACHER, Role.ADMIN],
		label: 'Ваши уроки',
	},
	{
		path: RouteNames.LESSON_VIEW,
		exact: true,
		component: LessonsForm,
		roles: [Role.STUDENT, Role.TEACHER, Role.ADMIN],
	},
];
