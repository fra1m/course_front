import type { ILesson } from '../../../models/course/ILesson';
import type { IQuiz } from '../../../models/IQuiz';

export interface LessonState extends ILesson {
	testId: IQuiz['id'] | null;
	lessons: ILesson[];
	html?: string;
	saveError: string;
	isSaving: boolean;
	isLoading: boolean;
}
