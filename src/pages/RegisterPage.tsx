import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import { registerUser } from '../store/reducers/user/userThunks';
import { Layout, Row, Col, Card, Typography, Alert } from 'antd';
import { Content } from 'antd/es/layout/layout';
import { RouteNames } from '../routes';
import RegistrationForm from '../components/RegistrationForm';

const { Text, Title } = Typography;

export const RegisterPage = () => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	const { isAuth, isLoading, saveError } = useAppSelector(state => state.user);

	const onFinish = (values: {
		email: string;
		password: string;
		name: string;
	}) => {
		dispatch(registerUser(values))
			.unwrap()
			.then(() => navigate(RouteNames.HOME))
			.catch(() => {});
	};

	if (isAuth) {
		return <Navigate to='/' />;
	}

	return (
		<Layout className='min-h-screen bg-gradient-to-br from-blue-50 to-white'>
			<Content>
				<Row justify='center' align='middle' style={{ minHeight: '100vh' }}>
					<Col>
						<Card
							title={
								<Title level={3} className='text-center mb-6'>
									Регистрация
								</Title>
							}
							style={{ width: 400 }}
							className='shadow-lg rounded-lg'
						>
							{saveError && (
								<Alert
									message={saveError ?? undefined}
									type='error'
									showIcon
									className='mb-4'
								/>
							)}

							<RegistrationForm onFinish={onFinish} loading={isLoading} />

							<Text type='secondary' className='block mt-6 text-center'>
								Уже есть аккаунт?{' '}
								<Link to={RouteNames.LOGIN}>
									<Text
										strong
										underline
										className='text-blue-600 cursor-pointer'
									>
										Войти
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
