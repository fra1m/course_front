import sessionStorage from 'redux-persist/lib/storage/session';
import { persistReducer } from 'redux-persist';
import appSlice from '../appSlice';
import userSlice from './user/userReducer';
import quizeSlice from './quiz/quizReducer';
import lessonSlice from './lessons/lessonReducer';
import courseSlice from './courses/courseReducer';
import pdfSlice from './pdf/pdfReducer';
import specializationSlice from './specializations/specializationsReducer';

const userPersist = persistReducer(
	{
		key: 'user',
		storage: sessionStorage,
		blacklist: [
			'isLoading',
			'saveError',
			'isStatsLoading',
			'authReady',
			'accessToken',
		],
	},
	userSlice
);
const appPersist = persistReducer(
	{ key: 'app', storage: sessionStorage },
	appSlice
);
// если нужно кэшировать тяжёлые сущности — избирательно
const coursePersist = persistReducer(
	{
		key: 'course',
		storage: sessionStorage,
		blacklist: ['isLoading', 'saveError', 'file', 'filePath'],
	},
	courseSlice
);
const lessonPersist = persistReducer(
	{
		key: 'lesson',
		storage: sessionStorage,
		blacklist: ['isLoading', 'saveError'],
	},
	lessonSlice
);
const quizPersist = persistReducer(
	{
		key: 'quiz',
		storage: sessionStorage,
		blacklist: ['isLoading', 'saveError'],
	},
	quizeSlice
);
const specializationPersist = persistReducer(
	{
		key: 'specialization',
		storage: sessionStorage,
		blacklist: ['isLoading', 'saveError'],
	},
	specializationSlice
);

export default {
	app: appPersist,
	user: userPersist,
	course: coursePersist,
	lesson: lessonPersist,
	quiz: quizPersist,
	specialization: specializationPersist,
	pdf: pdfSlice,
};
