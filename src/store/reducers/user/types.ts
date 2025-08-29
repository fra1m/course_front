import type { ITokens } from '../../../models/ITokens';
import type { IUser } from '../../../models/IUser';

export type Role = (typeof Role)[keyof typeof Role];
export type IUserListItem = IUser & { password?: string };

export interface UserState extends Omit<IUser, 'id'> {
	accessToken: string;
	isAuth: boolean;
	users: IUserListItem[];
	saveError: string | null;
	isLoading: boolean;
	isStatsLoading: boolean; // <-- добавили
	authReady: boolean; // ← добавили
}

export const Role = {
	USER: 'user',
	STUDENT: 'student',
	ADMIN: 'admin',
	TEACHER: 'teacher',
} as const;

export interface UserPayload {
	user: IUser;
	tokens: ITokens;
}

export type UpdateUserPatch = Partial<{
	name: string;
	role: Role;
	email: string; // на будущее
	password: string; // на будущее
}>;

export interface UserRegPayload {
	user: IUser;
}

export type UpdateUserArgs = {
	id: number;
	patch: UpdateUserPatch;
};

export interface IUserStats {
	coursesEnrolled: number;
	coursesAuthored?: number; // только для teacher/admin
	lessonsTotal: number;
	lessonsCompleted: number;
	quizzesTotal: number;
	quizzesPassed: number;
	averageScore: number; // 0..100
	streakDays?: number;
	lastActiveAt?: string; // ISO-строка
}
