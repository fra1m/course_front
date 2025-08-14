import type { IUser } from '../IUser';
import type { ISection } from './ISection';

export interface ICourse {
	id: number | null;
	title: string;
	description: string;
	teacherId: IUser['id'];
	studentsId?: IUser['id'][];
	sections: ISection[];
}
