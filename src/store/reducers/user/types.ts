import type { ITokens } from '../../../models/ITokens';
import type { IUser } from '../../../models/IUser';

export interface UserState {
	email: string;
	name: string;
	role: Role;
	accessToken: string;
	isAuth: boolean;
	saveError: string | null;
	isLoading: boolean;
}

export const Role = {
	USER: 'user',
	STUDENT: 'student',
	ADMIN: 'admin',
	TEACHER: 'teacher',
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export interface RegisterPayload {
	user: IUser;
	tokens: ITokens;
}
