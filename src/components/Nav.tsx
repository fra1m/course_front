import { type FC } from 'react';
import { Layout, Menu, Button, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../hooks/hooks';

import { RouteNames } from '../routes';
import { logoutUser } from '../store/reducers/user/userThunks';
import { resetState } from '../store/reducers/quiz/quizReducer';

const { Header } = Layout;

export const Navbar: FC = () => {
	const { isAuth } = useAppSelector(state => state.user);
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	const handleLogout = () => {
		dispatch(logoutUser());
		// navigate(RouteNames.LOGIN);
	};

	const items = isAuth
		? [
				{
					key: 'home',
					label: 'Главная',
					onClick: () => navigate(RouteNames.HOME),
				},
				{
					key: 'quiz-builder',
					label: 'Конструктор тестов',
					onClick: () => {
						dispatch(resetState());
						navigate(RouteNames.QUIZ_BUILDER);
					},
				},
				{
					key: 'quiz',
					label: 'Ваши тесты',
					onClick: () => navigate(RouteNames.QUIZ),
				},
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
		: [
				{
					key: 'home',
					label: 'Главная',
					onClick: () => navigate(RouteNames.HOME),
				},
				{
					key: 'login',
					label: 'Вход',
					onClick: () => navigate(RouteNames.LOGIN),
				},
				{
					key: 'register',
					label: 'Регистрация',
					onClick: () => navigate(RouteNames.REGISTER),
				},
		  ];

	return (
		<Header className='bg-gradient-to-r from-blue-600 to-indigo-700 px-6'>
			<Row justify='space-between' align='middle'>
				<Col>
					<button
						onClick={() => navigate(RouteNames.HOME)}
						className='text-white font-extrabold text-2xl tracking-wide hover:text-yellow-400 transition-colors focus:outline-none'
						aria-label='Go to homepage'
					>
						🌟 Gerion Courses
					</button>
				</Col>

				<Col>
					<Menu
						theme='dark'
						mode='horizontal'
						selectable={false}
						className='bg-transparent text-white'
						style={{ lineHeight: '64px' }}
						items={items}
					/>
				</Col>
			</Row>
		</Header>
	);
};
