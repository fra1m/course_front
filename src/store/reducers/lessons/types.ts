import type { ILesson } from '../../../models/course/ILesson';

export interface LessonState extends ILesson {
	lessons: ILesson[];
	html?: string;
	saveError: string;
	isSaving: boolean;
	isLoading: boolean;
}
