import type { IUser } from '../IUser';
import type { ILesson } from './ILesson';
export interface ICourse {
	id: number;
	title: string;
	description: string;
	file?: File | null;
	filePath?: string;
	lessons?: ILesson['id'][];
	teacherId: IUser['id'];
	studentsId?: IUser['id'][];
}
