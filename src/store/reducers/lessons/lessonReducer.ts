//TODO: доделать редьюсер урока

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { getAllLessons, getHTML, getLessonPDFById, } from './lessonsThunks';
import type { LessonState } from './types';
import type { ILesson, LessonPage } from '../../../models/course/ILesson';

const initialState: LessonState = {
	id: 0,
	title: '',
	pages: { startWith: 1, end: 1 },
	lessons: [],
	testId: null,
	isSaving: false,
	isLoading: false,
	saveError: '',
};

// type guards
function isLessonPagePartial(v: any): v is Partial<LessonPage> {
	return (
		v &&
		typeof v === 'object' &&
		(('startWith' in v && typeof v.startWith === 'number') ||
			('end' in v && typeof v.end === 'number'))
	);
}
const lessonSlice = createSlice({
	name: 'lesson',
	initialState,
	reducers: {
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

		setLessonField: (
			state,
			action: PayloadAction<{
				key: keyof LessonState; // ключ состояния
				value: string | number | Partial<LessonPage>;
			}>
		) => {
			const { key, value } = action.payload;
			console.log('setLessonField', key, value);
			if (key === 'pages' && isLessonPagePartial(value)) {
				// обеспечим начальное значение, если pages ещё пустой
				const current = state.pages ?? { startWith: 1, end: 1 };

				const next = { ...current, ...value };

				// инварианты: end >= startWith
				if (
					typeof next.startWith === 'number' &&
					typeof next.end === 'number'
				) {
					if (next.end < next.startWith) {
						// подвинем end вверх до startWith
						next.end = next.startWith;
					}
				}

				state.pages = next;
				return; // ВАЖНО: не продолжаем ниже!
			}

			// для всех прочих ключей — обычная запись
			// (если нужно — сузить типы значений конкретных ключей)
			state[key] = value;
		},
	},

	extraReducers: builder => {
		builder
			.addCase(getHTML.pending, state => {
				state.isSaving = true;
				state.saveError = '';
			})
			.addCase(getHTML.fulfilled, (state, action) => {
				state.html = action.payload.html;
				state.saveError = '';
			})
			.addCase(getHTML.rejected, (state, action) => {
				// state.html = action.payload;
				if (action.payload?.message) {
					state.saveError = action.payload.message;
				} else {
					state.saveError = 'Что-то пошло не так';
				}
			})

			.addCase(getLessonPDFById.pending, state => {
				state.isLoading = true;
				state.saveError = '';
			})
			.addCase(getLessonPDFById.fulfilled, (state, action) => {
				state.isLoading = false;
				// если раньше был url — освободим
				if (state.html) URL.revokeObjectURL(state.html);
				state.html = action.payload; // blob-url
			})
			.addCase(getLessonPDFById.rejected, (state, action: any) => {
				state.isLoading = false;
				state.saveError = action.payload?.message ?? 'Ошибка загрузки урока';
			})

			.addCase(getAllLessons.fulfilled, (state, action) => {
				state.lessons = action.payload; // храним список с contentUrl
				state.isLoading = false;
				state.saveError = '';
			})
			.addCase(getAllLessons.pending, state => {
				state.isLoading = true;
				state.saveError = '';
			})
			.addCase(getAllLessons.rejected, (state, action) => {
				state.isLoading = false;
				state.saveError = (action.payload as any)?.message ?? 'Ошибка';
			})
	},
});

export const { updateLesson, setLessonField } = lessonSlice.actions;

export default lessonSlice.reducer;
