//TODO: добавить состояния урок курсов и тд, чтобы все было в одном месте

import type { ITokens } from '../../../models/ITokens';
import type { IUser } from '../../../models/IUser';

export interface UserState extends Omit<IUser, 'id'> {
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

export interface UserPayload {
	user: IUser;
	tokens: ITokens;
}
