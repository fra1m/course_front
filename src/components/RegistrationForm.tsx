import '@ant-design/v5-patch-for-react-19';

import { Input, Button, Form, Typography } from 'antd';
import type { FC } from 'react';
import { rulesForm } from '../utils/RulesForm';

const { Text } = Typography;

interface RegistrationFormProps {
	onFinish: (values: { email: string; password: string; name: string }) => void;
	loading: boolean;
	error?: string;
}

const passwordRules = [
	rulesForm.requiered('Введите пароль'),
	{
		min: 8,
		message: 'Пароль должен содержать минимум 8 символов',
	},
	{
		pattern: /[A-Z]/,
		message: 'Пароль должен содержать хотя бы одну заглавную букву',
	},
	{
		pattern: /[0-9]/,
		message: 'Пароль должен содержать хотя бы одну цифру',
	},
];

const RegistrationForm: FC<RegistrationFormProps> = ({
	onFinish,
	loading,
	error,
}) => {
	return (
		<Form layout='vertical' onFinish={onFinish} className='space-y-4'>
			<Form.Item
				label='Имя'
				name='name'
				rules={[rulesForm.requiered('Введите ваше имя')]}
			>
				<Input placeholder='Ваше имя' />
			</Form.Item>

			<Form.Item
				label='Email'
				name='email'
				rules={[
					rulesForm.requiered('Введите ваш email'),
					{ type: 'email', message: 'Введите корректный email' },
				]}
			>
				<Input placeholder='example@mail.com' />
			</Form.Item>

			<Form.Item
				label='Пароль'
				name='password'
				rules={passwordRules}
				hasFeedback
			>
				<Input.Password placeholder='••••••••' />
			</Form.Item>

			<Form.Item>
				<Text type='secondary' className='text-sm block mb-2'>
					Пароль должен содержать минимум 8 символов, одну заглавную букву и
					цифру
				</Text>
				<Button
					type='primary'
					htmlType='submit'
					loading={loading}
					block
					className='bg-blue-600'
				>
					Зарегистрироваться
				</Button>
			</Form.Item>

			{error && (
				<Text type='danger' className='block text-center mt-2'>
					{error}
				</Text>
			)}
		</Form>
	);
};

export default RegistrationForm;
