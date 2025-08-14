//TODO: доделать редьюсер кусра

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ErrorTypeAuth } from '../errorTypes';
import type { CourseState, SectionState } from './types';
import type { ICourse } from '../../../models/course/ICourse';
import type { ISection } from '../../../models/course/ISection';
import type { ILesson } from '../../../models/course/ILesson';

//TODO: убрать моки

const mockSections: ISection[] = [
	{
		id: 1,
		title: 'Введение в JavaScript',
		description: 'Основы JavaScript: синтаксис, переменные, функции.',
		lessons: [
			{
				id: 1,
				title: 'JS',
				sectionId: 1,
				html: 'html',
			},
			{
				id: 2,
				title: 'Типы данных',
				sectionId: 1,
				html: 'html',
			},
			{
				id: 3,
				title: 'Условные операторы',
				sectionId: 1,
				html: 'html',
			},
		],
		testId: [57],
	},
	{
		id: 2,
		title: 'Основы React',
		description: 'Основы работы с React.',
		lessons: [
			{ id: 4, title: 'Компоненты', html: 'Some', sectionId: 2 },
			{
				id: 5,
				title: 'Состояние',
				sectionId: 2,
				html: 'html',
			},
			{
				id: 6,
				title: 'Хуки',
				sectionId: 2,
				html: 'html',
			},
		],
		testId: [1],
	},
	{
		id: 3,
		title: 'Продвинутый React',
		description: 'Продвинутые темы React.',
		lessons: [
			{
				id: 7,
				title: 'Контекст',
				sectionId: 3,
				html: 'html',
			},
			{
				id: 8,
				title: 'Роутинг',
				sectionId: 3,
				html: 'html',
			},
			{
				id: 9,
				title: 'Оптимизация',
				sectionId: 3,
				html: 'html',
			},
		],
		testId: [2],
	},
];

const initialState: SectionState = {
	id: null,
	title: '',
	description: '',
	lessons: [],
	sections: [],
	saveError: '',
	isSaving: false,
	isLoading: false,
	isUpdate: false,
};

const sectionSlice = createSlice({
	name: 'course',
	initialState,
	reducers: {
		loadMock(state) {
			state.sections = mockSections;
		},
	},

	extraReducers: builder => {
		builder;
	},
});

export const { loadMock, addNewSection, updateSection, addLessonToSection } =
	sectionSlice.actions;

export default sectionSlice.reducer;
