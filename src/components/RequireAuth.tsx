import { useAppSelector } from '../hooks/hooks';
import { Navigate } from 'react-router-dom';

import type { JSX } from 'react';
import type { Role } from '../store/reducers/user/types';
import { RouteNames } from '../routes';

interface RequireAuthProps {
	children: JSX.Element;
	allowedRoles?: Role[];
}

export const RequireAuth = ({ children, allowedRoles }: RequireAuthProps) => {
	const { isAuth, role, authReady, isLoading } = useAppSelector(s => s.user);

	// Пока не знаем результат checkAuth — ничего не решаем и не логируем
	if (!authReady || isLoading) return null; // или <Spin fullscreen />
	// console.log(role);

	if (!isAuth) return <Navigate to={RouteNames.LOGIN} replace />;

	if (allowedRoles && !allowedRoles.includes(role)) {
		return <Navigate to={RouteNames.HOME} replace />;
	}

	return children;
};
