import type { IUser } from '../user/IUser';
import type { ISpecialization } from '../specialization/ISpecialization';
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
	specializationId: ISpecialization['id'];
}
