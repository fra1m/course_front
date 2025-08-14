import type { IQuiz } from '../../../models/IQuiz';
import type { ISection } from '../../../models/course/ISection';

export interface QuizState extends IQuiz {
	quizzes: IQuiz[];
	sectionId: ISection['id'] | null;
	isSaving: boolean;
	saveError: string | null;
	isLoading: boolean;
	isUpdate: boolean;
}

//TODO: начать использовать
// export interface QuizePayload {
// 	surveyJson: ISurveyJson;
// }
