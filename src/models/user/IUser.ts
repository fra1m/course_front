import type { IUserStats, Role } from '../../store/reducers/user/types';
import type { ISpecialization } from '../specialization/ISpecialization';

export interface IUser {
	id: number;
	email: string;
	name: string;
	role: Role;
	password?: string; 
	myStats?: IUserStats;
	specialization: ISpecialization | null;
}
