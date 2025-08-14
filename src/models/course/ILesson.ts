import type { IQuiz } from '../IQuiz';

export interface LessonPage {
	startWith: number;
	end: number;
}

export interface ILesson {
	id: number;
	title: string;
	pages: LessonPage;
	testId: IQuiz['id'] | null;
	html?: string;
}
