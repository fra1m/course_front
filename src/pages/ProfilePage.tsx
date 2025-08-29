// src/pages/ProfilePage.tsx
import { useEffect, useMemo, useState } from 'react';
import {
	Layout,
	Card,
	Row,
	Col,
	Typography,
	Space,
	Tag,
	Avatar,
	theme,
	Statistic,
	Progress,
	Tooltip,
	Skeleton,
	Button,
	Modal,
	Form,
	Input,
	App,
} from 'antd';
import {
	UserOutlined,
	MailOutlined,
	CrownOutlined,
	ReadOutlined,
	BookOutlined,
	FileTextOutlined,
	CheckCircleTwoTone,
	BarChartOutlined,
	FireOutlined,
	ReloadOutlined,
	EditOutlined,
	LockOutlined,
	KeyOutlined,
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import type { Role, IUserStats } from '../store/reducers/user/types';
import {
	getMyStats,
	changeMyPassword,
} from '../store/reducers/user/userThunks';

const { Content } = Layout;
const { Title, Text } = Typography;

const roleMeta: Record<
	Role,
	{ label: string; color: string; icon: React.ReactNode }
> = {
	user: { label: 'Пользователь', color: 'default', icon: <UserOutlined /> },
	student: { label: 'Студент', color: 'blue', icon: <ReadOutlined /> },
	teacher: { label: 'Преподаватель', color: 'purple', icon: <BookOutlined /> },
	admin: { label: 'Администратор', color: 'red', icon: <CrownOutlined /> },
};

function initials(name?: string, email?: string) {
	const base = (name && name.trim()) || email || '';
	const parts = base.split(/\s+/).filter(Boolean);
	if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return 'U';
}
function formatDateTime(iso?: string) {
	if (!iso) return '—';
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return '—';
	return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
}

export default function ProfilePage() {
	const dispatch = useAppDispatch();
	const { token } = theme.useToken();
	const { message } = App.useApp();

	// user
	const meName = useAppSelector(s => s.user.name);
	const meEmail = useAppSelector(s => s.user.email);
	const meRole = useAppSelector(s => s.user.role);

	// stats
	const statsLoading = useAppSelector(s => s.user.isStatsLoading);
	const stats = useAppSelector(s => s.user.myStats) as IUserStats | undefined;

	// modal: смена пароля
	const [pwdOpen, setPwdOpen] = useState(false);
	const [pwdSubmitting, setPwdSubmitting] = useState(false);
	const [form] = Form.useForm<{
		currentPassword: string;
		newPassword: string;
		confirm: string;
	}>();

	useEffect(() => {
		dispatch(getMyStats());
	}, [dispatch]);

	const reload = () => dispatch(getMyStats());

	const completionPct = useMemo(() => {
		if (!stats || stats.lessonsTotal === 0) return 0;
		return Math.round((stats.lessonsCompleted / stats.lessonsTotal) * 100);
	}, [stats]);
	const passRatePct = useMemo(() => {
		if (!stats || stats.quizzesTotal === 0) return 0;
		return Math.round((stats.quizzesPassed / stats.quizzesTotal) * 100);
	}, [stats]);

	// theme backgrounds
	const pageBg = `linear-gradient(180deg, ${token.colorBgContainer}, ${token.colorBgLayout})`;
	const heroBg = `linear-gradient(135deg, ${token.colorPrimary}, ${token.colorPrimaryHover})`;
	const panelBg = token.colorBgElevated;

	const handlePwdSubmit = async (values: {
		currentPassword: string;
		newPassword: string;
	}) => {
		try {
			setPwdSubmitting(true);
			await dispatch(changeMyPassword(values)).unwrap();
			message.success('Пароль обновлён');
			setPwdOpen(false);
			form.resetFields();
		} catch (err) {
			message.error(String(err ?? 'Не удалось сменить пароль'));
		} finally {
			setPwdSubmitting(false);
		}
	};

	return (
		<Layout style={{ minHeight: 'calc(100vh - 64px)', background: pageBg }}>
			<Content style={{ padding: 24 }}>
				{/* HERO */}
				<Card
					bordered={false}
					style={{
						borderRadius: 24,
						background: heroBg,
						color: token.colorWhite,
						marginBottom: 16,
					}}
					styles={{ body: { padding: 24 } }}
					title={null}
					extra={
						<Space>
							<Tooltip title='Редактировать профиль'>
								<Button
									icon={<EditOutlined />}
									onClick={() => setPwdOpen(true)}
									style={{
										background: 'rgba(255,255,255,0.18)',
										borderColor: 'transparent',
										color: token.colorWhite,
									}}
								>
									Редактировать
								</Button>
							</Tooltip>
							<Tooltip title='Обновить статистику'>
								<Button
									icon={<ReloadOutlined />}
									onClick={reload}
									style={{
										background: 'rgba(255,255,255,0.18)',
										borderColor: 'transparent',
										color: token.colorWhite,
									}}
								/>
							</Tooltip>
						</Space>
					}
				>
					<Row gutter={[16, 16]} align='middle' wrap>
						<Col flex='0 0 auto'>
							<Avatar
								size={88}
								style={{
									background: token.colorWhite,
									color: token.colorPrimary,
									fontWeight: 700,
									boxShadow: token.boxShadowSecondary,
								}}
							>
								{initials(meName, meEmail)}
							</Avatar>
						</Col>
						<Col flex='auto'>
							<Space direction='vertical' size={6}>
								<Space size={10} align='center' wrap>
									<Title
										level={3}
										style={{ margin: 0, color: token.colorWhite }}
									>
										{meName || 'Без имени'}
									</Title>
									<Tag
										color='gold'
										style={{ fontWeight: 600, borderRadius: 999 }}
										icon={roleMeta[meRole].icon}
									>
										{roleMeta[meRole].label}
									</Tag>
								</Space>
								<Space size={10} align='center' wrap>
									<MailOutlined />
									<Text style={{ color: 'rgba(255,255,255,0.9)' }}>
										{meEmail}
									</Text>
								</Space>
							</Space>
						</Col>
					</Row>
				</Card>

				{/* Статы */}
				<Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
					<Col xs={24} sm={12} md={6}>
						<Card
							size='small'
							style={{ borderRadius: 16, background: panelBg }}
						>
							{statsLoading ? (
								<Skeleton active paragraph={false} />
							) : (
								<Statistic
									title={
										<span style={{ color: token.colorTextSecondary }}>
											Курсы (зачислен)
										</span>
									}
									value={stats?.coursesEnrolled ?? 0}
									prefix={<ReadOutlined />}
								/>
							)}
						</Card>
					</Col>

					{(meRole === 'teacher' || meRole === 'admin') && (
						<Col xs={24} sm={12} md={6}>
							<Card
								size='small'
								style={{ borderRadius: 16, background: panelBg }}
							>
								{statsLoading ? (
									<Skeleton active paragraph={false} />
								) : (
									<Statistic
										title={
											<span style={{ color: token.colorTextSecondary }}>
												Мои курсы (автор)
											</span>
										}
										value={stats?.coursesAuthored ?? 0}
										prefix={<BookOutlined />}
									/>
								)}
							</Card>
						</Col>
					)}

					<Col xs={24} sm={12} md={6}>
						<Card
							size='small'
							style={{ borderRadius: 16, background: panelBg }}
						>
							{statsLoading ? (
								<Skeleton active paragraph={false} />
							) : (
								<Statistic
									title={
										<span style={{ color: token.colorTextSecondary }}>
											Тестов пройдено
										</span>
									}
									value={stats?.quizzesPassed ?? 0}
									suffix={`/ ${stats?.quizzesTotal ?? 0}`}
									prefix={<FileTextOutlined />}
								/>
							)}
						</Card>
					</Col>

					<Col xs={24} sm={12} md={6}>
						<Card
							size='small'
							style={{ borderRadius: 16, background: panelBg }}
						>
							{statsLoading ? (
								<Skeleton active paragraph={false} />
							) : (
								<Statistic
									title={
										<span style={{ color: token.colorTextSecondary }}>
											Средний балл
										</span>
									}
									value={stats?.averageScore ?? 0}
									suffix='%'
									prefix={<BarChartOutlined />}
								/>
							)}
						</Card>
					</Col>
				</Row>

				{/* Прогресс */}
				<Row gutter={[16, 16]}>
					<Col xs={24} lg={12}>
						<Card
							style={{ borderRadius: 16, background: panelBg }}
							title={
								<Space>
									<CheckCircleTwoTone twoToneColor={token.colorSuccess} />
									Прогресс по урокам
								</Space>
							}
						>
							{statsLoading ? (
								<Skeleton active />
							) : (
								<Space direction='vertical' className='w-full' size={8}>
									<Progress
										percent={completionPct}
										status='active'
										strokeColor={{
											from: token.colorPrimary,
											to: token.colorPrimaryHover,
										}}
									/>
									<Text type='secondary'>
										Завершено: <b>{stats?.lessonsCompleted ?? 0}</b> из{' '}
										<b>{stats?.lessonsTotal ?? 0}</b>
									</Text>
								</Space>
							)}
						</Card>
					</Col>
					<Col xs={24} lg={12}>
						<Card
							style={{ borderRadius: 16, background: panelBg }}
							title={
								<Space>
									<FileTextOutlined />
									Успешность по тестам
								</Space>
							}
						>
							{statsLoading ? (
								<Skeleton active />
							) : (
								<Space direction='vertical' className='w-full' size={8}>
									<Progress
										percent={passRatePct}
										status='active'
										strokeColor={token.colorWarning}
									/>
									<Text type='secondary'>
										Успешно: <b>{stats?.quizzesPassed ?? 0}</b> из{' '}
										<b>{stats?.quizzesTotal ?? 0}</b>
									</Text>
								</Space>
							)}
						</Card>
					</Col>
				</Row>

				{/* Активность/заметки */}
				<Row gutter={[16, 16]} style={{ marginTop: 16 }}>
					<Col xs={24} lg={12}>
						<Card
							style={{ borderRadius: 16, background: panelBg }}
							title={
								<Space>
									<FireOutlined style={{ color: token.colorWarning }} />
									Активность
								</Space>
							}
						>
							{statsLoading ? (
								<Skeleton active />
							) : (
								<Space direction='vertical'>
									<Text>
										Полоса активности: <b>{stats?.streakDays ?? 0}</b>
									</Text>
									<Text type='secondary'>
										Последняя активность:{' '}
										<b>{formatDateTime(stats?.lastActiveAt)}</b>
									</Text>
								</Space>
							)}
						</Card>
					</Col>
					<Col xs={24} lg={12}>
						<Card
							style={{ borderRadius: 16, background: panelBg }}
							title='Заметки'
						>
							<Text type='secondary'>
								Здесь можно показать индивидуальные рекомендации, цели или
								ближайшие задания.
							</Text>
						</Card>
					</Col>
				</Row>
			</Content>

			{/* Модалка смены пароля */}
			<Modal
				open={pwdOpen}
				title='Сменить пароль'
				onCancel={() => setPwdOpen(false)}
				onOk={() => form.submit()}
				okButtonProps={{ loading: pwdSubmitting }}
				destroyOnHidden
			>
				<Form
					form={form}
					layout='vertical'
					onFinish={({ currentPassword, newPassword }) =>
						handlePwdSubmit({ currentPassword, newPassword })
					}
				>
					<Form.Item
						label='Текущий пароль'
						name='currentPassword'
						rules={[{ required: true, message: 'Введите текущий пароль' }]}
					>
						<Input.Password
							prefix={<KeyOutlined />}
							placeholder='Введите текущий пароль'
						/>
					</Form.Item>

					<Form.Item
						label='Новый пароль'
						name='newPassword'
						rules={[
							{ required: true, message: 'Введите новый пароль' },
							{ min: 6, message: 'Минимум 6 символов' },
						]}
					>
						<Input.Password
							prefix={<LockOutlined />}
							placeholder='Новый пароль'
						/>
					</Form.Item>

					<Form.Item
						label='Подтверждение пароля'
						name='confirm'
						dependencies={['newPassword']}
						rules={[
							{ required: true, message: 'Повторите новый пароль' },
							({ getFieldValue }) => ({
								validator(_, value) {
									if (!value || getFieldValue('newPassword') === value)
										return Promise.resolve();
									return Promise.reject(new Error('Пароли не совпадают'));
								},
							}),
						]}
					>
						<Input.Password
							prefix={<LockOutlined />}
							placeholder='Повторите новый пароль'
						/>
					</Form.Item>
				</Form>
			</Modal>
		</Layout>
	);
}
