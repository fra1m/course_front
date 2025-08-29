import type { Role } from '../../store/reducers/user/types';

export type FormValues = {
	name: string;
	email: string;
	password: string;
	confirm: string;
	role: Role;
};

export type AdminUserCreatePageProps = {
	embedded?: boolean;
	onClose?: () => void;
	onCreated?: () => void;
	/** Предзаполнить поля формы */
	defaults?: Partial<FormValues>;
	/** Автоматически отправить форму после префилла */
	autoSubmit?: boolean;
	/** Скопировать email+password при авто-создании */
	copyCredentials?: boolean;
};
