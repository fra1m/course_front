import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CourseState } from './types';
import type { RcFile } from 'antd/es/upload';
import {
	createCourse,
	deleteCourse,
	getAllCourses,
	updateCourse,
} from './courseThunks';

const initialState: CourseState = {
	id: 0,
	title: '',
	description: '',
	lessons: [],
	courses: [],
	teacherId: 0,
	selectedCourseId: 0,
	file: null,
	saveError: '',
	isSaving: false,
	isLoading: false,
	isUpdate: false,
};

const courseSlice = createSlice({
	name: 'course',
	initialState,
	reducers: {
		setCourseField: (
			state,
			action: PayloadAction<{
				key: keyof CourseState;
				value: string | number | RcFile | null | number[];
			}>
		) => {
			const { key, value } = action.payload;

			switch (key) {
				case 'id':
				case 'teacherId':
				case 'selectedCourseId':
					state[key] = value as number;
					break;
				case 'title':
				case 'description':
				case 'filePath':
				case 'saveError':
					state[key] = value as string;
					break;
				case 'file':
					state[key] = value as File | null;
					break;
				case 'lessons':
					state[key] = value as number[];
					break;
				case 'isSaving':
				case 'isLoading':
				case 'isUpdate':
					if (typeof value === 'boolean') state[key] = value;
					break;
				default:
					break;
			}
		},

		setSelectedCourseId(state, action: PayloadAction<number>) {
			state.selectedCourseId = action.payload;
		},
	},

	extraReducers: builder => {
		builder
			.addCase(createCourse.pending, state => {
				state.isSaving = true;
				state.saveError = '';
			})
			.addCase(createCourse.fulfilled, (state, action) => {
				state.courses?.push(action.payload);
				state.isSaving = false;
			})
			.addCase(createCourse.rejected, (state, action) => {
				state.isSaving = false;
				state.saveError = action.payload?.message;
			})

			.addCase(getAllCourses.fulfilled, (state, action) => {
				state.courses = action.payload;
				state.saveError = '';
			})
			.addCase(getAllCourses.rejected, (state, action) => {
				state.saveError = action.payload?.message;
			})

			.addCase(updateCourse.fulfilled, (state, action) => {
				const i = state.courses.findIndex(c => c.id === action.payload.id);
				if (i !== -1) {
					state.courses[i] = { ...state.courses[i], ...action.payload };
				}
			})

			.addCase(deleteCourse.fulfilled, (state, action) => {
				const deletedId = action.payload.id;
				state.courses = state.courses.filter(c => c.id !== deletedId);
				if (state.selectedCourseId === deletedId) {
					// выбрать первый оставшийся или сбросить выбор
					state.selectedCourseId = state.courses[0]?.id as any;
				}
			});
	},
});

export const { setCourseField, setSelectedCourseId } = courseSlice.actions;

export default courseSlice.reducer;
