import type { Role } from '../store/reducers/user/types';

export interface IUser {
	id: number;
	email: string;
	name: string;
	role: Role;
}
