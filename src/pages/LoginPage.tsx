import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import { RouteNames } from '../routes';
import { loginUser } from '../store/reducers/user/userThunks';
import LoginForm from '../components/LoginForm';
import { Layout, Row, Col, Card, Typography, message } from 'antd';

const { Content } = Layout;
const { Title, Text } = Typography;

export const LoginPage = () => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const { isAuth, isLoading, saveError } = useAppSelector(state => state.user);

	useEffect(() => {
		if (isAuth) {
			navigate(RouteNames.HOME);
		}
	}, [isAuth, navigate]);

	useEffect(() => {
		if (saveError) {
			message.error(saveError);
		}
	}, [saveError]);

	const onFinish = (values: { email: string; password: string }) => {
		dispatch(loginUser(values))
			.unwrap()
			.then(() => navigate(RouteNames.HOME))
			.catch(() => {});
	};

	return (
		<Layout className='min-h-screen bg-gradient-to-br from-blue-50 to-white'>
			<Content>
				<Row justify='center' align='middle' style={{ minHeight: '100vh' }}>
					<Col>
						<Card
							title={
								<Title level={3} className='text-center mb-0'>
									Вход в аккаунт
								</Title>
							}
							variant='borderless'
							style={{ width: 400 }}
							className='shadow-lg'
						>
							<LoginForm onFinish={onFinish} loading={isLoading} />

							<Text type='secondary'>
								Нет аккаунта?{' '}
								<Link to={RouteNames.REGISTER}>
									<Text strong underline className='text-blue-600'>
										Зарегистрироваться
									</Text>
								</Link>
							</Text>
						</Card>
					</Col>
				</Row>
			</Content>
		</Layout>
	);
};
