import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/hooks';
import { RouteNames } from '../../routes';
import { loginUser } from '../../store/reducers/user/userThunks';
import LoginForm from '../../components/Forms/LoginForm';
import { App as AntdApp, Layout, Row, Col, Card, Typography } from 'antd';

const { Content } = Layout;
const { Title } = Typography;

export const LoginPage = () => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const { isAuth, isLoading, saveError } = useAppSelector(state => state.user);

	const { message } = AntdApp.useApp();

	useEffect(() => {
		if (isAuth) {
			navigate(RouteNames.HOME);
		}
	}, [isAuth, navigate]);

	useEffect(() => {
		if (saveError) {
			message.error(saveError);
		}
	}, [saveError, message]);

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
						</Card>
					</Col>
				</Row>
			</Content>
		</Layout>
	);
};
