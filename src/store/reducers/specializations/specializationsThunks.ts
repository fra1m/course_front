import { createAsyncThunk } from '@reduxjs/toolkit';

import axios from 'axios';
import type { CreateSpecializationDto, UpdateSpecializationDto } from './types';
import type { ISpecialization } from '../../../models/specialization/ISpecialization';
import type { RootState } from '../../store';
import { api } from '../../../api';

// GET /specializations/all
export const fetchSpecializations = createAsyncThunk<
	ISpecialization[],
	void,
	{ state: RootState; rejectValue: string }
>('specialization/all', async (_: void, { rejectWithValue }) => {
	try {
		const res = await api.get<ISpecialization[]>('/specializations/all');

		return Array.isArray(res.data) ? res.data : [];
	} catch (err) {
		if (axios.isAxiosError(err) && err.response?.data?.message) {
			return rejectWithValue(err.response.data.message);
		}
		return rejectWithValue('Не удалось загрузить специализации');
	}
});

// POST /specializations/create
export const createSpecialization = createAsyncThunk<
	ISpecialization,
	CreateSpecializationDto,
	{ state: RootState; rejectValue: string }
>('specialization/create', async (dto, { rejectWithValue }) => {
	try {
		const res = await api.post<ISpecialization>('/specializations/create', dto);
		return res.data;
	} catch (err) {
		if (axios.isAxiosError(err) && err.response?.data?.message) {
			return rejectWithValue(err.response.data.message);
		}
		return rejectWithValue('Не удалось создать специализацию');
	}
});

// PATCH /specializations/:id
export const updateSpecialization = createAsyncThunk<
	ISpecialization,
	{ id: number; patch: UpdateSpecializationDto },
	{ state: RootState; rejectValue: string }
>('specialization/update', async ({ id, patch }, { rejectWithValue }) => {
	try {
		const res = await api.patch<ISpecialization>(
			`/specializations/${id}`,
			patch
		);
		return res.data;
	} catch (err) {
		if (axios.isAxiosError(err) && err.response?.data?.message) {
			return rejectWithValue(err.response.data.message);
		}
		return rejectWithValue('Не удалось обновить специализацию');
	}
});

// DELETE /specializations/:id
export const deleteSpecialization = createAsyncThunk<
	{ id: number },
	{ id: number },
	{ state: RootState; rejectValue: string }
>('specialization/delete', async ({ id }, { rejectWithValue }) => {
	try {
		await api.delete(`/specializations/${id}`);
		return { id };
	} catch (err) {
		if (axios.isAxiosError(err) && err.response?.data?.message) {
			return rejectWithValue(err.response.data.message);
		}
		return rejectWithValue('Не удалось удалить специализацию');
	}
});
