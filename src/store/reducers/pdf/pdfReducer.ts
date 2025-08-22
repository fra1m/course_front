import { createSlice } from '@reduxjs/toolkit';
import type { PdfState } from './types';
import { openPdfPreview } from './pdfThunk';

const initialState: PdfState = {
	open: false,
	courseId: null,
	blobUrl: null,
	loading: false,
	error: null,
};

const pdfSlice = createSlice({
	name: 'pdf',
	initialState,
	reducers: {
		// пригодится для явного закрытия
		closePdfPreview(state) {
			state.open = false;
			state.courseId = null;
			state.blobUrl = null;
			state.loading = false;
			state.error = null;
		},
	},
	extraReducers: builder => {
		builder
			.addCase(openPdfPreview.pending, (state, action) => {
				state.open = true;
				state.courseId = action.meta.arg;
				state.loading = true;
				state.error = null;
				state.blobUrl = null;
			})
			.addCase(openPdfPreview.fulfilled, (state, action) => {
				state.loading = false;
				state.blobUrl = action.payload.blobUrl;
			})
			.addCase(openPdfPreview.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload?.message ?? 'Ошибка загрузки PDF';
			});
	},
});

export const { closePdfPreview } = pdfSlice.actions;
export default pdfSlice.reducer;
