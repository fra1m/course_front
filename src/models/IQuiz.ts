import type { ISurveyJson } from './quiz/IServeyJSON';

export interface IQuiz {
	id: number | null;
	surveyJson: ISurveyJson;
}
