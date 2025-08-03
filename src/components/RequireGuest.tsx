// src/components/RequireGuest.tsx
import type { JSX } from 'react';
import { useAppSelector } from '../hooks/hooks';
import { Navigate } from 'react-router-dom';
import { RouteNames } from '../routes';

export const RequireGuest = ({ children }: { children: JSX.Element }) => {
	const isAuth = useAppSelector(state => state.user.isAuth);

	if (isAuth) {
		return <Navigate to={RouteNames.HOME} replace />;
	}

	return children;
};
