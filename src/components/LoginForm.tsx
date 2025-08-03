import '@ant-design/v5-patch-for-react-19';

import { Input, Button, Form } from 'antd';
import type { FC } from 'react';
import { rulesForm } from '../utils/RulesForm';

interface LoginFormProps {
	onFinish: (values: { email: string; password: string }) => void;
	loading: boolean;
}

const LoginForm: FC<LoginFormProps> = ({ onFinish, loading }) => {
	return (
		<Form layout='vertical' onFinish={onFinish}>
			<Form.Item
				label='Email'
				name='email'
				rules={[rulesForm.requiered('Введите ваш email')]}
			>
				<Input placeholder='example@mail.com' />
			</Form.Item>

			<Form.Item
				label='Пароль'
				name='password'
				rules={[rulesForm.requiered('Введите ваш пароль')]}
			>
				<Input.Password placeholder='••••••••' />
			</Form.Item>

			<Form.Item>
				<Button
					type='primary'
					htmlType='submit'
					loading={loading}
					block
					className='bg-blue-600'
				>
					Войти
				</Button>
			</Form.Item>
		</Form>
	);
};

export default LoginForm;
