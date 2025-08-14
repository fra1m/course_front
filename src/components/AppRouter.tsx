// src/components/AppRouter.tsx
import { Route, Routes } from 'react-router-dom';
import { privateRoutes, publickRoutes } from '../routes';
import { RequireAuth } from './RequireAuth';
import { RequireGuest } from './RequireGuest';

export const AppRouter = () => {
	return (
		<Routes>
			{privateRoutes.map(route => (
				<Route
					key={route.path}
					path={route.path}
					element={
						<RequireAuth allowedRoles={route.roles}>
							<route.component />
						</RequireAuth>
					}
				/>
			))}

			{publickRoutes.map(route => (
				<Route
					key={route.path}
					path={route.path}
					element={
						<RequireGuest>
							<route.component />
						</RequireGuest>
					}
				/>
			))}
		</Routes>
	);
};
