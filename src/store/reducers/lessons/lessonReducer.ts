
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
	getAllLessons,
	createLesson,
	//TODO fetchLessonContent - добавиь addCase нужные
} from './lessonsThunks';
import type { LessonState } from './types';
import type { LessonPage } from '../../../models/course/ILesson';

const initialState: LessonState = {
	id: 0,
	title: '',
	pages: { startWith: 1, end: 1 },
	lessons: [],
	testId: null,
	courseId: 0,
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
		setLessonField: (
			state,
			action: PayloadAction<{
				key: keyof LessonState;
				value: string | number | Partial<LessonPage>;
			}>
		) => {
			const { key, value } = action.payload;

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
			.addCase(createLesson.pending, state => {
				state.isSaving = true;
				state.saveError = '';
			})
			.addCase(createLesson.fulfilled, (state, action) => {
				state.lessons.push(action.payload);
				state.isSaving = false;

				// setLessonField(action.payload);
				state.saveError = '';
			})
			.addCase(createLesson.rejected, (state, action) => {
				if (action.payload?.message) {
					state.saveError = action.payload.message;
				} else {
					state.saveError = 'Что-то пошло не так';
				}
			})

			.addCase(getAllLessons.fulfilled, (state, action) => {
				state.lessons = action.payload;

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
			});
	},
});

export const { setLessonField } = lessonSlice.actions;

export default lessonSlice.reducer;
