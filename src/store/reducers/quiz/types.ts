export interface Choice {
	value: string;
	text?: string;
	imageLink?: string;
}

export interface Question {
	type: string; // radiogroup, checkbox, html, imagepicker и т.д.
	name: string;
	title: string;
	choices?: Choice[];
	correctAnswer?: string | string[];
	html?: string;
}

export interface Page {
	name: string;
	title?: string;
	elements: Question[];
}

export interface SurveyJson {
	title?: string;
	showProgressBar: 'top' | 'bottom' | 'none';
	showNavigationButtons: boolean;
	firstPageIsStarted: boolean;
	startSurveyText: string;
	completedHtml: string;
	pages: Page[];
}

export interface QuizState {
	id: number | null;
	surveyJson: SurveyJson ;
	isSaving: boolean;
	saveError: string | null;
	isLoading: boolean;
	isUpdate: boolean;
}
