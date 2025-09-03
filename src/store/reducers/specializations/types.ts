// src/store/reducers/specialization/types.ts

import type { ISpecialization } from '../../../models/specialization/ISpecialization';

export interface SpecializationState {
	items: ISpecialization[];
	byId: Record<number, ISpecialization>;
	isLoading: boolean;
	saveError: string | null;
	lastFetchedAt?: number;
}

export type CreateSpecializationDto = {
	title: string;
	slug: string;
	description?: string;
};

export type UpdateSpecializationDto = Partial<CreateSpecializationDto>;
