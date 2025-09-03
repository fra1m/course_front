export type SubmitBody = {
	quizId: number;
	lessonId?: number;
	courseId?: number;
	questionsTotal: number;
	correctCount: number;
};
