import type { ILesson } from './ILesson';

export interface ISection {
	id: number | null;
	title: string;
	description: string;
	lessonsId: ILesson['id'][];
}
