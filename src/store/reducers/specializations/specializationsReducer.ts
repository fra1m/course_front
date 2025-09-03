// src/store/reducers/specialization/specializationSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { SpecializationState } from './types';
import type { ISpecialization } from '../../../models/specialization/ISpecialization';
import {
	createSpecialization,
	deleteSpecialization,
	fetchSpecializations,
	updateSpecialization,
} from './specializationsThunks';

const initialState: SpecializationState = {
	items: [],
	byId: {},
	isLoading: false,
	saveError: null,
	lastFetchedAt: undefined,
};

const upsertMany = (state: SpecializationState, list: ISpecialization[]) => {
	state.items = list;
	state.byId = {};
	for (const s of list) state.byId[s.id] = s;
};

const upsertOne = (state: SpecializationState, s: ISpecialization) => {
	const idx = state.items.findIndex(x => x.id === s.id);
	if (idx >= 0) state.items[idx] = s;
	else state.items.unshift(s);
	state.byId[s.id] = s;
};

const slice = createSlice({
	name: 'specialization',
	initialState,
	reducers: {
		clear(state) {
			state.items = [];
			state.byId = {};
			state.saveError = null;
			state.isLoading = false;
			state.lastFetchedAt = undefined;
		},
	},
	extraReducers: builder => {
		builder
			// fetch
			.addCase(fetchSpecializations.pending, state => {
				state.isLoading = true;
				state.saveError = null;
			})
			.addCase(
				fetchSpecializations.fulfilled,
				(state, action: PayloadAction<ISpecialization[]>) => {
					state.isLoading = false;
					state.saveError = null;
					upsertMany(state, action.payload);
					state.lastFetchedAt = Date.now();
				}
			)
			.addCase(fetchSpecializations.rejected, (state, action) => {
				state.isLoading = false;
				state.saveError =
					(action.payload as string) ?? 'Не удалось загрузить специализации';
			})

			// create
			.addCase(createSpecialization.pending, state => {
				state.saveError = null;
			})
			.addCase(
				createSpecialization.fulfilled,
				(state, action: PayloadAction<ISpecialization>) => {
					upsertOne(state, action.payload);
				}
			)
			.addCase(createSpecialization.rejected, (state, action) => {
				state.saveError =
					(action.payload as string) ?? 'Не удалось создать специализацию';
			})

			// update
			.addCase(updateSpecialization.pending, state => {
				state.saveError = null;
			})
			.addCase(
				updateSpecialization.fulfilled,
				(state, action: PayloadAction<ISpecialization>) => {
					upsertOne(state, action.payload);
				}
			)
			.addCase(updateSpecialization.rejected, (state, action) => {
				state.saveError =
					(action.payload as string) ?? 'Не удалось обновить специализацию';
			})

			// delete
			.addCase(deleteSpecialization.fulfilled, (state, action) => {
				const id = action.payload.id;
				state.items = state.items.filter(x => x.id !== id);
				delete state.byId[id];
			})
			.addCase(deleteSpecialization.rejected, (state, action) => {
				state.saveError =
					(action.payload as string) ?? 'Не удалось удалить специализацию';
			});
	},
});

export const { clear } = slice.actions;
export default slice.reducer;

// —— удобные селекторы ——
export const selectSpecializations = (s: {
	specialization: SpecializationState;
}) => s.specialization.items;

export const selectSpecializationsLoading = (s: {
	specialization: SpecializationState;
}) => s.specialization.isLoading;

export const selectSpecializationOptions = (s: {
	specialization: SpecializationState;
}) => s.specialization.items.map(it => ({ value: it.id, label: it.title }));
