import type React from 'react';
import { LoginPage } from '../pages/Loggin/LoginPage';
import { HomePage } from '../pages/Home/HomePage';
import { QuizBuilder } from '../pages/Quiz/QuizBuilder';
import { QuizzesPage } from '../pages/Quiz/QuizzesPage';
import { CoursesPage } from '../pages/Course/CoursesPage';
import LessonsForm from '../components/Forms/LessonsForm';
import { Role } from '../store/reducers/user/types';
import { CourseBuilder } from '../pages/Course/CourseBuilder';
import { QuizPage } from '../pages/Quiz/QuizePage';
import { LessonBuilder } from '../pages/Lesson/LessonBuilder';
import UsersPage from '../pages/User/UsersPage';
import ProfilePage from '../pages/Profile/ProfilePage';
import SpecializationPage from '../pages/Specialization/SpecializationPage';

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

	CREATE_USER: '/user-create',
	GET_ALL_USERS: '/users',
	PROFILE: '/profile',

	SPECIALIZATION: '/specializations',
	// LOGOUT: '/logout',
} as const;

export const publickRoutes: IRoute[] = [
	{ path: RouteNames.LOGIN, exact: true, component: LoginPage, label: 'Вход' },
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
		roles: [Role.TEACHER, Role.ADMIN],
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
		roles: [Role.STUDENT, Role.TEACHER, Role.ADMIN],
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
		path: RouteNames.LESSON_VIEW,
		exact: true,
		component: LessonsForm,
		roles: [Role.STUDENT, Role.TEACHER, Role.ADMIN],
	},

	{
		path: RouteNames.PROFILE,
		exact: true,
		component: ProfilePage,
		roles: [Role.USER, Role.STUDENT, Role.TEACHER, Role.ADMIN],
		label: 'Профиль',
	},
	{
		path: RouteNames.GET_ALL_USERS,
		exact: true,
		component: UsersPage,
		roles: [Role.ADMIN],
		label: 'Пользователи',
	},

	{
		path: RouteNames.SPECIALIZATION,
		exact: true,
		component: SpecializationPage,
		roles: [Role.ADMIN], // только админ
		label: 'Специализации',
	},
];
