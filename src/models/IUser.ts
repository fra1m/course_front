import type { IUserStats, Role } from '../store/reducers/user/types';

export interface IUser {
	id: number;
	email: string;
	name: string;
	role: Role;
	password?: string; // пароль приходит ТОЛЬКО у user и только когда вы так решите на бэке
	myStats?: IUserStats; // ← добавили
}
