import type { ISection } from '../../../models/course/ISection';

export interface SectionState extends ISection {
	sections?: ISection[];
	isSaving: boolean;
	saveError: string | null;
	isLoading: boolean;
	isUpdate: boolean;
}
