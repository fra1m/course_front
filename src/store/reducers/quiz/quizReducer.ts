import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { Question } from 'survey-core';
import type { QuizState } from './types';
import { deleteQuiz, getAllQuizzes, saveQuiz, updateQuiz } from './quizThunks';
import type { ErrorTypeAuth } from '../errorTypes';
import type { Page } from '../../../models/quiz/IPage';
import type { IQuiz } from '../../../models/IQuiz';

const initialState: QuizState = {
	id: null,
	surveyJson: {
		title: 'Новый опрос',
		showProgressBar: 'top',
		showNavigationButtons: true,
		firstPageIsStarted: false,
		startSurveyText: 'Начать тест',
		completedHtml:
			'<h4>Спасибо за прохождение теста! Ваши ответы записаны.</h4>',
		pages: [
			{
				name: 'page-1',
				title: 'Вопрос 1',
				elements: [
					{
						type: 'radiogroup', // или другой тип по умолчанию
						name: 'q1',
						title: '',
						choices: [],
						correctAnswer: undefined,
					},
				],
			},
		],
	},
	quizzes: [],
	sectionId: null,
	isSaving: false,
	saveError: null,
	isLoading: false,
	isUpdate: false,
};

const quizSlice = createSlice({
	name: 'quiz',
	initialState,
	reducers: {
		setTitle(state, action: PayloadAction<string>) {
			state.surveyJson.title = action.payload;
		},

		removePage(state, action: PayloadAction<string>) {
			state.surveyJson.pages = state.surveyJson.pages.filter(
				page => page.name !== action.payload
			);
		},
		updatePageTitle(
			state,
			action: PayloadAction<{ pageId: string; title: string }>
		) {
			const page = state.surveyJson.pages.find(
				p => p.name === action.payload.pageId
			);
			if (page) {
				page.title = action.payload.title;
			}
		},

		updateQuestion(
			state,
			action: PayloadAction<{
				pageId: string;
				questionId: string;
				question: Partial<Question>;
			}>
		) {
			const page = state.surveyJson.pages.find(
				p => p.name === action.payload.pageId
			);
			if (page) {
				const question = page.elements.find(
					q => q.name === action.payload.questionId
				);
				if (question) {
					Object.assign(question, action.payload.question);
				}
			}
		},

		addChoice(
			state,
			action: PayloadAction<{ pageId: string; questionId: string }>
		) {
			const { pageId, questionId } = action.payload;
			const page = state.surveyJson.pages.find(p => p.name === pageId);
			if (!page) return;
			const question = page.elements.find(q => q.name === questionId);
			if (!question) return;
			const existingChoicesCount = question.choices
				? question.choices.length
				: 0;

			const newId = pageId + (existingChoicesCount + 1); // например, "page1" + "1" = "page11"

			const newChoice =
				question.type === 'imagepicker'
					? { value: '', imageLink: '' }
					: { value: newId, text: '' };

			if (question.choices) {
				question.choices.push(newChoice);
			} else {
				question.choices = [newChoice];
			}
		},

		removeChoice(
			state,
			action: PayloadAction<{
				pageId: string;
				questionId: string;
				choiceIndex: number;
			}>
		) {
			const page = state.surveyJson.pages.find(
				p => p.name === action.payload.pageId
			);
			if (!page) return;

			const question = page.elements.find(
				q => q.name === action.payload.questionId
			);
			if (!question || !question.choices) return;

			question.choices.splice(action.payload.choiceIndex, 1);

			// Если после удаления choices правильный ответ стал невалидным — сбросить correctAnswer
			if (question.correctAnswer) {
				if (Array.isArray(question.correctAnswer)) {
					question.correctAnswer = question.correctAnswer.filter(ans =>
						question.choices!.some(c => c.value === ans)
					);
				} else {
					if (!question.choices.some(c => c.value === question.correctAnswer)) {
						question.correctAnswer = undefined;
					}
				}
			}
		},

		addPageWithDefaultQuestion(state) {
			const pageIndex = state.surveyJson.pages.length + 1;
			const newPageId = `page-${pageIndex}`;
			const newQuestion = {
				type: 'radiogroup',
				name: `q${pageIndex}`,
				title: '',
				choices: [],
				correctAnswer: '',
			};
			const newPage: Page = {
				name: newPageId,
				title: `Вопрос ${pageIndex}`,
				elements: [newQuestion],
			};
			state.surveyJson.pages.push(newPage);
		},

		generateSurveyJson(state) {
			console.log(state.id);

			state.surveyJson = {
				...state.surveyJson,
			};
		},
		setQuizForEdit(state, action: PayloadAction<IQuiz>) {
			state.isUpdate = true;
			state.surveyJson = {
				...action.payload.surveyJson,
				title: action.payload.surveyJson.title ?? '',
			};
			state.id = action.payload.id;
		},
		resetState() {
			return initialState;
		},
	},

	extraReducers: builder => {
		builder
			.addCase(saveQuiz.pending, state => {
				state.isSaving = true;
				state.saveError = null;
			})
			.addCase(saveQuiz.fulfilled, state => {
				state.isSaving = false;
				state.saveError = null;
			})
			.addCase(
				saveQuiz.rejected,
				(state, action: PayloadAction<ErrorTypeAuth | undefined>) => {
					state.isSaving = false;
					if (action.payload?.message) {
						state.saveError = action.payload.message;
					} else {
						state.saveError = 'Что-то пошло не так';
					}
				}
			)
			.addCase(getAllQuizzes.pending, state => {
				state.isLoading = true;
				state.saveError = null;
			})
			.addCase(getAllQuizzes.fulfilled, (state, action) => {
				state.isLoading = false;
				// state.surveyJson = action.payload;
				console.log(action.payload);
				console.log('state.surveyJson', state.surveyJson);
				state.saveError = null;

				state.quizzes = action.payload;
				console.log('state.quizzes', state.quizzes);
			})
			.addCase(getAllQuizzes.rejected, (state, action) => {
				state.isLoading = false;
				state.saveError =
					(action.payload as string) || 'Ошибка при получении тестов';
			})
			.addCase(updateQuiz.pending, state => {
				state.isUpdate = true;
				state.saveError = null;
			})
			.addCase(updateQuiz.fulfilled, state => {
				state.isUpdate = false;
				state.saveError = null;
			})
			.addCase(
				updateQuiz.rejected,
				(state, action: PayloadAction<ErrorTypeAuth | undefined>) => {
					state.isUpdate = false;
					if (action.payload?.message) {
						state.saveError = action.payload.message;
					} else {
						state.saveError = 'Что-то пошло не так';
					}
				}
			)
			.addCase(deleteQuiz.pending, state => {
				state.isLoading = true;
				state.saveError = null;
			})
			.addCase(deleteQuiz.fulfilled, state => {
				state.isLoading = false;
				state.saveError = null;
			})
			.addCase(
				deleteQuiz.rejected,
				(state, action: PayloadAction<ErrorTypeAuth | undefined>) => {
					state.isLoading = false;
					if (action.payload?.message) {
						state.saveError = action.payload.message;
					} else {
						state.saveError = 'Что-то пошло не так';
					}
				}
			);
	},
});

export const {
	generateSurveyJson,
	setTitle,
	removePage,
	updatePageTitle,
	updateQuestion,
	addChoice,
	removeChoice,
	addPageWithDefaultQuestion,
	setQuizForEdit,
	resetState,
} = quizSlice.actions;

export default quizSlice.reducer;
