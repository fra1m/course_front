//TODO: доделать редьюсер кусра

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CourseState } from './types';

import mockCourses from '../../../mocks/courseMocks'; //FIXME: убрать моки
import type { ICourse } from '../../../models/course/ICourse';
import type { ILesson } from '../../../models/course/ILesson';
import type { ISection } from '../../../models/course/ISection';

const initialState: CourseState = {
	id: null,
	title: '',
	description: '',
	sections: [],
	teacherId: 0,
	saveError: '',
	isSaving: false,
	isLoading: false,
	isUpdate: false,
};

const courseSlice = createSlice({
	name: 'course',
	initialState,
	reducers: {
		loadMock(state) {
			state.courses = mockCourses;
		},
		setCourseField: (state, action) => {
			state[action.payload.field] = action.payload.value;
		},
		// addSection: state => {
		// 	const sectionLendth = state.sections.length;
		// 	state.sections.push(sectionLendth + 1);
		// },
		// updateLessonSection: (state, action) => {
		// 	const section = state.lessons.find(l => l.id === action.payload.id); //FIXME: ошибка при доабвлении теста [Error] TypeError: undefined is not an object (evaluating 'state.lessons.find')
		// 	if (section) Object.assign(section, action.payload.data);
		// },
		removeLessonSection: (state, action: PayloadAction<number>) => {
			const sectionId = action.payload;
			state.sections = state.sections.filter(s => s.id !== sectionId);
			state.lessons = state.lessons.filter(l => l.sectionId !== sectionId);
		},
		saveCourse: (state, action: PayloadAction<CourseState>) => {
			console.log('saveCourse', action.payload);
		}, // thunk

		updateLesson: (
			state,
			action: PayloadAction<{
				sectionId: number;
				data: Partial<ILesson>;
			}>
		) => {
			const { sectionId, data } = action.payload;

			console.log('updateLesson', state.lessons);

			const section = state.lessons.find(l => l.sectionId === sectionId);
			if (section) {
				Object.assign(section, data);
			}
			console.log('updateLesson', section);
		},
		addNewSection(state) {
			state.sections.push({
				id: state.sections.length + 1,
				title: '',
				description: '',
				lessons: [] as ILesson[],
			} as ISection);

			console.log(state.sections);
		},
		addLessonToSection: (
			state,
			action: PayloadAction<{ sectionId: number; lesson: ILesson }>
		) => {
			const section = state.sections.find(
				s => s.id === action.payload.sectionId
			);
			console.log(section?.id);
			if (section) {
				section.lessons.push(action.payload.lesson);
			}
		},
		updateSection: (
			state,
			action: PayloadAction<{
				sectionId: number;
				data: Partial<ISection>;
			}>
		) => {
			const { sectionId, data } = action.payload;
			const section = state.sections.find(s => s.id === sectionId);

			if (section) {
				Object.assign(section, data);
			}
		},
	},

	extraReducers: builder => {
		builder;
	},
});

export const {
	setCourseField,
	// addSection,
	// updateLessonSection,
	removeLessonSection,
	saveCourse,

	updateLesson,
	addLessonToSection,
	addNewSection,
	updateSection,
	loadMock, //TODO: удалить после тестов
} = courseSlice.actions;

export default courseSlice.reducer;
