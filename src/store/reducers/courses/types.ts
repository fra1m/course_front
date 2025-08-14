import type { ICourse } from '../../../models/course/ICourse';

export interface CourseState extends ICourse {
	courses?: ICourse[];
	isSaving: boolean;
	saveError: string | null;
	isLoading: boolean;
	isUpdate: boolean;
}
