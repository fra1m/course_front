// src/pages/AdminUserCreatePage.tsx
import { useEffect, useState, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/hooks';
import {
	Layout,
	Row,
	Col,
	Card,
	Typography,
	Form,
	Input,
	Button,
	App,
	Space,
	Tooltip,
	Select,
} from 'antd';
import {
	UserAddOutlined,
	ArrowLeftOutlined,
	ReloadOutlined,
} from '@ant-design/icons';
import { registerUser } from '../../store/reducers/user/userThunks';
import type {
	AdminUserCreatePageProps,
	FormValues,
} from '../../utils/AdminUserCreate/types';
import { genPassword } from '../../utils/AdminUserCreate/utils';

const { Content } = Layout;
const { Title } = Typography;

export const AdminUserCreatePage: FC<AdminUserCreatePageProps> = ({
	embedded,
	defaults,
	autoSubmit,
	copyCredentials,
	onClose,
	onCreated,
}) => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const { message } = App.useApp();

	const { isLoading } = useAppSelector(s => s.user);

	const [form] = Form.useForm<FormValues>();
	const [pwdVisible, setPwdVisible] = useState(false);

	// Применяем defaults и автосабмитим при необходимости
	useEffect(() => {
		const preset: Partial<FormValues> = {
			role: 'user',
			...defaults,
		};
		if (!preset.password) preset.password = genPassword();
		if (!preset.confirm) preset.confirm = preset.password;

		form.setFieldsValue(preset as FormValues);

		if (autoSubmit) {
			// субмитим в следующий тик, чтобы форма успела применить значения
			const t = setTimeout(() => form.submit(), 0);
			return () => clearTimeout(t);
		}
	}, [defaults, autoSubmit, form]);

	const handleGeneratePassword = async () => {
		const pwd = genPassword();
		form.setFieldsValue({ password: pwd, confirm: pwd });
		try {
			await navigator.clipboard.writeText(pwd);
			message.success('Пароль сгенерирован и скопирован');
		} catch {
			message.success('Пароль сгенерирован (не удалось скопировать)');
		}
	};

	const onFinish = (values: FormValues) => {
		const payload = {
			name: values.name.trim(),
			email: values.email.trim().toLowerCase(),
			password: values.password,
			role: values.role,
		};

		dispatch(registerUser(payload))
			.unwrap()
			.then(async () => {
				message.success('Пользователь создан');

				if (copyCredentials) {
					try {
						await navigator.clipboard.writeText(
							`${payload.email}\n${payload.password}`
						);
						message.success('Логин и пароль скопированы');
					} catch {
						message.warning('Не удалось скопировать логин/пароль');
					}
				}

				onCreated?.();
				if (!embedded) {
					form.resetFields();
					navigate(-1);
				}
			})
			.catch((err: unknown) => {
				message.error(String(err ?? 'Не удалось создать пользователя'));
			});
	};

	const body = (
		<Card
			className='shadow-lg rounded-2xl'
			style={{ width: 560, maxWidth: '100%' }}
			title={
				<Space align='center' size='middle' className='w-full justify-center'>
					<div className='h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md'>
						<UserAddOutlined className='text-white' />
					</div>
					<Title level={3} className='!mb-0'>
						Создание пользователя
					</Title>
				</Space>
			}
			extra={
				!embedded && (
					<Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
						Назад
					</Button>
				)
			}
		>
			<Form<FormValues>
				layout='vertical'
				form={form}
				onFinish={onFinish}
				requiredMark='optional'
				disabled={isLoading}
				initialValues={{ role: 'user' }}
			>
				<Form.Item
					label='Имя'
					name='name'
					rules={[
						{ required: true, message: 'Введите имя' },
						{ min: 2, message: 'Минимум 2 символа' },
						{ max: 50, message: 'Не более 50 символов' },
					]}
				>
					<Input
						placeholder='Иван Иванов'
						size='large'
						autoComplete='off'
						className='rounded-lg'
					/>
				</Form.Item>

				<Form.Item
					label='Email'
					name='email'
					rules={[
						{ required: true, message: 'Введите email' },
						{ type: 'email', message: 'Некорректный email' },
					]}
				>
					<Input
						placeholder='user@example.com'
						size='large'
						autoComplete='off'
						className='rounded-lg'
					/>
				</Form.Item>

				<Form.Item
					label='Роль'
					name='role'
					rules={[{ required: true, message: 'Выберите роль' }]}
				>
					<Select
						size='large'
						className='rounded-lg'
						options={[
							{ value: 'student', label: 'Студент' },
							{ value: 'teacher', label: 'Преподаватель' },
							{ value: 'user', label: 'Пользователь' },
							{ value: 'admin', label: 'Админ' },
						]}
					/>
				</Form.Item>

				<Form.Item
					label={
						<Space align='center'>
							Пароль
							<Tooltip title='Сгенерировать надёжный пароль и скопировать в буфер'>
								<Button
									size='small'
									icon={<ReloadOutlined />}
									onClick={handleGeneratePassword}
								>
									Сгенерировать
								</Button>
							</Tooltip>
						</Space>
					}
					name='password'
					rules={[
						{ required: true, message: 'Введите пароль' },
						{ min: 6, message: 'Минимум 6 символов' },
					]}
				>
					<Input.Password
						placeholder='••••••••'
						size='large'
						className='rounded-lg'
						visibilityToggle={{
							visible: pwdVisible,
							onVisibleChange: setPwdVisible,
						}}
					/>
				</Form.Item>

				<Form.Item
					label='Подтверждение пароля'
					name='confirm'
					dependencies={['password']}
					rules={[
						{ required: true, message: 'Повторите пароль' },
						({ getFieldValue }) => ({
							validator(_, value) {
								if (!value || getFieldValue('password') === value)
									return Promise.resolve();
								return Promise.reject(new Error('Пароли не совпадают'));
							},
						}),
					]}
				>
					<Input.Password
						placeholder='Ещё раз пароль'
						size='large'
						className='rounded-lg'
						visibilityToggle={{
							visible: pwdVisible,
							onVisibleChange: setPwdVisible,
						}}
					/>
				</Form.Item>

				{!autoSubmit && (
					<>
						<Form.Item className='!mb-2'>
							<Button
								type='primary'
								htmlType='submit'
								size='large'
								loading={isLoading}
								className='w-full'
							>
								Создать пользователя
							</Button>
						</Form.Item>

						{embedded && (
							<Space className='w-full justify-end'>
								<Button onClick={onClose}>Закрыть</Button>
							</Space>
						)}
					</>
				)}
			</Form>
		</Card>
	);

	if (embedded) return body;

	return (
		<Layout className='min-h-screen bg-gradient-to-br from-blue-50 to-white'>
			<Content>
				<Row justify='center' align='middle' style={{ minHeight: '100vh' }}>
					<Col>{body}</Col>
				</Row>
			</Content>
		</Layout>
	);
};

export default AdminUserCreatePage;
