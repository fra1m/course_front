import userSlice from './user/userReducer';
import quizeSlice from './quiz/quizReducer';
import lessonSlice from './lessons/lessonReducer';
import courseSlice from './courses/courseReducer';
import pdfSlice from './pdf/pdfReducer';

export default {
	user: userSlice,
	quiz: quizeSlice,
	lesson: lessonSlice,
	course: courseSlice,
	pdf: pdfSlice,
};
