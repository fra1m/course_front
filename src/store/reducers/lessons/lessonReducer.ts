import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ErrorTypeAuth } from '../errorTypes';
import { getHTML } from './lessonsThunks';

const initialState = {
	id: null,
	html: '',
	isSaving: false,
	saveError: '',
	isLoading: false,
};

const lessonSlice = createSlice({
	name: 'quiz',
	initialState,
	reducers: {},

	extraReducers: builder => {
		builder
			.addCase(getHTML.pending, state => {
				state.isSaving = true;
				state.saveError = '';
			})
			.addCase(getHTML.fulfilled, (state, action) => {
				state.html = action.payload;
				state.saveError = '';
			})
			.addCase(getHTML.rejected, (state, action) => {
				// state.html = action.payload;
				if (action.payload?.message) {
					state.saveError = action.payload.message;
				} else {
					state.saveError = 'Что-то пошло не так';
				}
			});
	},
});

export const {} = lessonSlice.actions;

export default lessonSlice.reducer;
