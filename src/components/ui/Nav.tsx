// Navbar.tsx
import { useCallback, type FC } from 'react';
import { Layout, Menu, Button, Row, Col, Tooltip, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks/hooks';

import { RouteNames, privateRoutes, publickRoutes } from '../../routes';
import { logoutUser } from '../../store/reducers/user/userThunks';
import { resetState } from '../../store/reducers/quiz/quizReducer';
import { Role } from '../../store/reducers/user/types';
import { ArrowLeftOutlined } from '@ant-design/icons';

const { Header } = Layout;

type NavbarProps = {
	onToggleTheme?: () => void;
	themeMode?: 'light' | 'dark';
};

export const Navbar: FC<NavbarProps> = ({ onToggleTheme, themeMode }) => {
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

	const handleBack = useCallback(() => {
		if (window.history.length > 1) navigate(-1);
		else navigate(RouteNames.HOME);
	}, [navigate]);

	// Меню для авторизованных пользователей
	const authMenuItems = privateRoutes
		.filter(route => !route.roles || route.roles.includes(role as Role))
		.map(route => ({
			key: route.path,
			label: route.label,
			onClick: () => handleNavigate(route.path, route.reset),
		}))
		.filter(
			r =>
				r.key !== RouteNames.QUIZ &&
				r.key !== RouteNames.LESSON_VIEW &&
				r.key !== RouteNames.LESSON_BUILDER &&
				r.key !== RouteNames.LESSON
		);

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
		<Header className='bg-gradient-to-r from-blue-600 to-indigo-700 px-6 sticky top-0 z-[1000]'>
			<Row justify='space-between' align='middle'>
				<Col>
					<Space size='middle' align='center'>
						<Tooltip title='Назад'>
							<Button
								type='primary'
								ghost
								// size='large'
								shape='round'
								icon={<ArrowLeftOutlined />}
								onClick={handleBack}
								disabled={window.history.length <= 1}
								className='!text-white !border-white hover:!text-yellow-300 hover:!border-yellow-300 disabled:!opacity-60 disabled:!text-white disabled:!border-white'
							>
								Назад
							</Button>
						</Tooltip>
						<Button
							onClick={() => navigate(RouteNames.HOME)}
							className='text-white font-extrabold text-2xl tracking-wide hover:text-yellow-400 transition-colors focus:outline-none'
							aria-label='Go to homepage'
						>
							🌟 Gerion Courses
						</Button>
					</Space>
				</Col>

				<Col>
					<Row gutter={16} align='middle' wrap={false}>
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
						<Col>
							<Button
								type='text'
								onClick={() => {
									const next = themeMode === 'dark' ? 'light' : 'dark';
									onToggleTheme?.(); // ваша текущая логика переключения
									// глобальные маркеры для слушателей
									document.documentElement.setAttribute('data-ui-theme', next);
									window.dispatchEvent(
										new CustomEvent('ui-themechange', { detail: next })
									);
								}}
								className='text-white hover:!text-yellow-300'
								icon={
									themeMode === 'dark' ? (
										<span style={{ fontSize: 18 }}>🌞</span>
									) : (
										<span style={{ fontSize: 18 }}>🌙</span>
									)
								}
								aria-label='Toggle theme'
							/>
						</Col>
					</Row>
				</Col>
			</Row>
		</Header>
	);
};
