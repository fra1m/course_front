import { createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../../api';
import type { ErrorTypeAuth } from '../errorTypes';
import type { RootState } from '../../store';

/** Открыть предпросмотр и подтянуть PDF */
export const openPdfPreview = createAsyncThunk<
	{ courseId: number; blobUrl: string }, // payload on success
	number, // arg: courseId
	{ rejectValue: ErrorTypeAuth }
>('pdfPreview/open', async (courseId, { getState, rejectWithValue }) => {
	const state = getState() as RootState;
	const prevUrl = state.pdf.blobUrl;
	// корректно ревокаем предыдущий blobUrl (побочка допустима внутри thunk)
	if (prevUrl) {
		try {
			URL.revokeObjectURL(prevUrl);
		} catch {
			/* no-op */
		}
	}

	// const accessToken = state.user.accessToken;

	try {
		const res = await api.get(`/courses/${courseId}/file`, {
			responseType: 'blob',
			withCredentials: true,
		});

		const blob = res.data as Blob;
		const blobUrl = URL.createObjectURL(blob);

		return { courseId, blobUrl };
	} catch (error) {
		const err = error as { response?: { data: ErrorTypeAuth } };
		console.error('Ошибка при получении теста', err.response?.data);

		return rejectWithValue(
			err.response?.data || {
				message: 'Ошибка при открытии Файла',
				statusCode: 500,
			}
		);
	}
});
