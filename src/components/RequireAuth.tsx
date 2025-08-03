// src/components/RequireAuth.tsx
import type { JSX } from 'react';
import { useAppSelector } from '../hooks/hooks';
import { Navigate } from 'react-router-dom';
import { RouteNames } from '../routes';

export const RequireAuth = ({ children }: { children: JSX.Element }) => {
	const isAuth = useAppSelector(state => state.user.isAuth);


	if (!isAuth) {
		return <Navigate to={RouteNames.LOGIN} replace />;
	}

	return children;
};
