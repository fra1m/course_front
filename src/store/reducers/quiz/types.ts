import type { IQuiz } from "../../../models/quiz/IQuiz";


export interface QuizState extends IQuiz {
	quizzes: IQuiz[];
	isSaving: boolean;
	saveError: string | null;
	isLoading: boolean;
	isUpdate: boolean;
	lastCreatedId: IQuiz['id'];
}

//TODO: начать использовать
// export interface QuizePayload {
// 	surveyJson: ISurveyJson;
// }
