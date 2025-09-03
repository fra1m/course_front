
import type { IQuiz } from '../quiz/IQuiz';
import type { ICourse } from './ICourse';

export interface LessonPage {
	startWith: number;
	end: number;
}

export interface ILesson {
	id: number;
	title: string;
	pages: LessonPage;
	testId: IQuiz | null;
	html?: string;
	courseId: ICourse['id'];
}
