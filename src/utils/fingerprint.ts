import type { IUser } from '../models/user/IUser';

export const makeProfileFingerprint = (u: IUser | null | undefined) => {
	if (!u) return 'none';
	const specId = u.specialization?.id ?? u.specialization?.id ?? 0;
	return `${u.email}|${u.role}|${specId}`;
};
