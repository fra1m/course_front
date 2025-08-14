// Navbar.tsx
import { type FC } from 'react';
import { Layout, Menu, Button, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../hooks/hooks';

import { RouteNames, privateRoutes, publickRoutes } from '../routes';
import { logoutUser } from '../store/reducers/user/userThunks';
import { resetState } from '../store/reducers/quiz/quizReducer';
import { Role } from '../store/reducers/user/types';

const { Header } = Layout;

export const Navbar: FC = () => {
	const { isAuth, role } = useAppSelector(state => state.user);
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	const handleNavigate = (path: string, reset?: boolean) => {
		if (reset) {
			dispatch(resetState());
		}
		navigate(path);
	};

	const handleLogout = () => {
		dispatch(logoutUser());
	};

	// Меню для авторизованных пользователей
	const authMenuItems = privateRoutes
		.filter(route => !route.roles || route.roles.includes(role as Role))
		.map(route => ({
			key: route.path,
			label: route.label,
			onClick: () => handleNavigate(route.path, route.reset),
		}))
		.filter(r => r.key !== RouteNames.QUIZ && r.key !== RouteNames.LESSON_VIEW);

	// Меню для неавторизованных пользователей
	const guestMenuItems = publickRoutes.map(route => ({
		key: route.path,
		label: route.label,
		onClick: () => handleNavigate(route.path),
	}));

	const menuItems = isAuth
		? [
				...authMenuItems,
				{
					key: 'logout',
					label: (
						<Button
							type='link'
							onClick={handleLogout}
							className='text-yellow-400 hover:text-yellow-300 p-0 font-semibold'
						>
							Выйти
						</Button>
					),
				},
		  ]
		: guestMenuItems;

	return (
		<Header className='bg-gradient-to-r from-blue-600 to-indigo-700 px-6'>
			<Row justify='space-between' align='middle'>
				<Col>
					<Button
						onClick={() => navigate(RouteNames.HOME)}
						className='text-white font-extrabold text-2xl tracking-wide hover:text-yellow-400 transition-colors focus:outline-none'
						aria-label='Go to homepage'
					>
						🌟 Gerion Courses
					</Button>
				</Col>

				<Col>
					<Menu
						theme='dark'
						mode='horizontal'
						selectable={false}
						className='bg-transparent text-white'
						style={{ lineHeight: '64px' }}
						items={menuItems}
					/>
				</Col>
			</Row>
		</Header>
	);
};
