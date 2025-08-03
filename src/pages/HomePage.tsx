import { Card, Col, Row } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/hooks';
import { RouteNames } from '../routes';

const { Meta } = Card;

export const HomePage = () => {
	const { isAuth, name } = useAppSelector(state => state.user);
	const navigate = useNavigate();

	return (
		<div className='min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col'>
			<main className='flex-grow max-w-5xl mx-auto px-6 py-12'>
				<h2 className='text-4xl font-extrabold text-blue-700 mb-6'>
					Добро пожаловать{isAuth && `, ${name}`}!
				</h2>
				<p className='text-gray-700 text-lg max-w-xl mb-10 leading-relaxed'>
					Это ваша домашняя страница. Здесь можно разместить список курсов,
					приветственное сообщение или аналитику.
				</p>

				<Row gutter={[24, 24]}>
					<Col xs={24} sm={12} md={8}>
						<Card
							hoverable
							onClick={() => navigate(RouteNames.COURSES)}
							cover={
								<div className='text-center text-blue-600 text-6xl pt-6'>
									📚
								</div>
							}
						>
							<Meta
								title='Курсы'
								description='Изучайте новые знания и развивайтесь'
								className='text-center'
							/>
						</Card>
					</Col>

					<Col xs={24} sm={12} md={8}>
						<Card
							hoverable
							onClick={() => navigate(RouteNames.QUIZ)}
							cover={
								<div className='text-center text-green-600 text-6xl pt-6'>
									🧠
								</div>
							}
						>
							<Meta
								title='Тесты'
								description='Проверяйте свои знания и прогресс'
								className='text-center'
							/>
						</Card>
					</Col>

					{/* {isAuth && ( */}
					<Col xs={24} sm={12} md={8}>
						<Card
							hoverable
							onClick={() => navigate(RouteNames.PROFILE)}
							cover={
								<div className='text-center text-purple-600 text-6xl pt-6'>
									👤
								</div>
							}
						>
							<Meta
								title='Профиль'
								description='Управляйте аккаунтом и настройками'
								className='text-center'
							/>
						</Card>
					</Col>

					<Col xs={24} sm={12} md={8}>
						<Card
							hoverable
							onClick={() => navigate(RouteNames.LESSON)}
							cover={
								<div className='text-center text-purple-600 text-6xl pt-6'>
									👤
								</div>
							}
						>
							<Meta
								title='Урок'
								description='Управляйте аккаунтом и настройками'
								className='text-center'
							/>
						</Card>
					</Col>
					{/* } */}
				</Row>
			</main>

			<footer className='bg-white border-t mt-12 py-6 text-center text-gray-500 text-sm'>
				© 2025 Gerion Courses. Все права защищены.
			</footer>
		</div>
	);
};
