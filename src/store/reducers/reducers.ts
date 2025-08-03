import userSlice from './user/userReducer';
import quizeSlice from './quiz/quizReducer';
import lessonSlice from './lessons/lessonReducer';

export default {
	user: userSlice,
	quiz: quizeSlice,
	lessons: lessonSlice,
};
