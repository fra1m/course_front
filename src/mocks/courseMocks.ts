import type { ICourse } from '../models/course/ICourse';
import type { ISection } from '../models/course/ISection';

const mockSections1: ISection[] = [
	{
		id: 1,
		title: 'Введение в JavaScript',
		description: 'Основы JavaScript: синтаксис, переменные, функции.',
		testId: null,
	},
	{
		id: 2,
		title: 'Основы React',
		description: 'Основы работы с React.',
		testId: null,
	},
];
const mockSections2: ISection[] = [
	{
		id: 3,
		title: 'Продвинутый React',
		description: 'Продвинутые темы React.',
		testId: null,
	},
];

const mockLessons1: ICourse['lessons'] = [
	{
		id: 1,
		title: 'Введение в JavaScript',
		html: 'html',
		sectionId: 1,
	},
	{
		id: 2,
		title: 'Основы React',
		html: 'html',
		sectionId: 2,
	},
];

const mockLessons2: ICourse['lessons'] = [
	{
		id: 3,
		title: 'Продвинутый React',
		html: 'html',
		sectionId: 3,
	},
	{
		id: 4,
		title: 'Контекст',
		html: 'html',
		sectionId: 3,
	},
	{
		id: 5,
		title: 'Роутинг',
		html: 'html',
		sectionId: 3,
	},
];

const mockCourses: ICourse[] = [
	{
		id: 1,
		title: 'Курс по JavaScript',
		description: 'Основы языка JavaScript от переменных до замыканий.',
		sections: mockSections1,
		lessons: mockLessons2,
		teacherId: 1,
		studentsId: [1, 2],
	},
	{
		id: 2,
		title: 'Курс по React',
		description: 'React с нуля: компоненты, хуки, маршрутизация.',
		sections: mockSections2,
		lessons: mockLessons1,
		teacherId: 2,
		studentsId: [1],
	},
];

export default mockCourses;
