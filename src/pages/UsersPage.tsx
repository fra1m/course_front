// src/pages/UsersPage.tsx
import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	type JSX,
} from 'react';
import {
	Card,
	Typography,
	Row,
	Col,
	Space,
	Input,
	Select,
	Table,
	Tag,
	Button,
	Tooltip,
	Empty,
	Modal,
	Segmented,
	Dropdown,
	Form,
	theme,
	App,
} from 'antd';
import {
	ReloadOutlined,
	UserAddOutlined,
	TeamOutlined,
	MailOutlined,
	DeleteOutlined,
	ThunderboltOutlined,
	CopyOutlined,
	CrownOutlined,
	ReadOutlined,
	SolutionOutlined,
	MoreOutlined,
	EditOutlined,
} from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import {
	getAllUsers,
	deleteUser,
	updateUser,
} from '../store/reducers/user/userThunks';
import type { IUserListItem, Role } from '../store/reducers/user/types';
import AdminUserCreatePage from './AdminUserCreatePage';
import { genPassword } from '../utils/AdminUserCreate/utils';
import type { IUserRow } from '../utils/UsersPage/types';

const { Title, Text } = Typography;

const roleTag: Record<
	Role,
	{ color: string; label: string; icon: JSX.Element }
> = {
	user: { color: 'default', label: 'Пользователь', icon: <TeamOutlined /> },
	student: { color: 'blue', label: 'Студент', icon: <ReadOutlined /> },
	teacher: {
		color: 'purple',
		label: 'Преподаватель',
		icon: <SolutionOutlined />,
	},
	admin: { color: 'red', label: 'Администратор', icon: <CrownOutlined /> },
};

export default function UsersPage() {
	const dispatch = useAppDispatch();
	const { token } = theme.useToken();
	const { message } = App.useApp();

	// ждём завершения checkAuth, чтобы не стрелять раньше времени
	const isAuth = useAppSelector(s => s.user.isAuth);
	const authReady = useAppSelector(s => s.user.authReady);

	// state
	const meEmail = useAppSelector(s => s.user.email);
	const users = useAppSelector(s => s.user.users);
	const isLoading = useAppSelector(s => s.user.isLoading);
	const loadError = useAppSelector(s => s.user.saveError);

	const [q, setQ] = useState('');
	const [role, setRole] = useState<Role | undefined>(undefined);
	const [openCreate, setOpenCreate] = useState(false);

	const [pager, setPager] = useState<{ current: number; pageSize: number }>({
		current: 1,
		pageSize: 10,
	});

	const [quickDefaults, setQuickDefaults] = useState<{
		name?: string;
		email?: string;
		password?: string;
		role?: Role;
	} | null>(null);
	const [quickAuto, setQuickAuto] = useState(false);

	// edit modal
	const [editOpen, setEditOpen] = useState(false);
	const [editing, setEditing] = useState<IUserRow | null>(null);
	const [editForm] = Form.useForm<{ name: string; role: Role }>();

	const flatUsers = useMemo<IUserListItem[]>(
		() => (Array.isArray(users) ? users : []),
		[users]
	);

	// ---- ФЕТЧ: один раз, только после авторизации, и если ещё не загружено ----
	const didFetch = useRef(false);
	useEffect(() => {
		if (!authReady || !isAuth) return; // ждём checkAuth
		if (flatUsers.length > 0) return; // уже есть данные — не фетчим
		if (didFetch.current) return; // защита от StrictMode
		didFetch.current = true;

		dispatch(getAllUsers());
	}, [dispatch, authReady, isAuth, flatUsers.length]);
	// --------------------------------------------------------------------------

	// счётчики/виджеты
	const stats = useMemo(() => {
		const total = flatUsers.length;
		const byRole = flatUsers.reduce(
			(acc, u) => {
				acc[u.role] = (acc[u.role] ?? 0) + 1;
				return acc;
			},
			{ user: 0, student: 0, teacher: 0, admin: 0 } as Record<Role, number>
		);
		return { total, ...byRole };
	}, [flatUsers]);

	// набор занятых email для быстрого создания
	const existingEmails = useMemo(
		() =>
			new Set(
				(flatUsers ?? [])
					.map(u => (u.email ?? '').trim().toLowerCase())
					.filter(Boolean)
			),
		[flatUsers]
	);

	const pickUniqueStudentIdentity = useCallback(() => {
		let maxN = 0;
		existingEmails.forEach(e => {
			const m = /^student(\d+)@example\.com$/i.exec(e);
			if (m) {
				const n = parseInt(m[1], 10);
				if (!Number.isNaN(n) && n > maxN) maxN = n;
			}
		});

		let n = maxN + 1;
		for (let guard = 0; guard < 100000; guard++, n++) {
			const name = `student${n}`;
			const email = `${name}@example.com`;
			if (!existingEmails.has(email.toLowerCase())) {
				return { name, email };
			}
		}
		return {
			name: `student${Date.now()}`,
			email: `student${Date.now()}@example.com`,
		};
	}, [existingEmails]);

	const handleQuickUser = useCallback(() => {
		const { name, email } = pickUniqueStudentIdentity();
		const password = genPassword(10);
		setQuickDefaults({ name, email, password, role: 'user' });
		setQuickAuto(true);
		setOpenCreate(true);
	}, [pickUniqueStudentIdentity]);

	const data = useMemo<IUserRow[]>(() => {
		const needle = q.trim().toLowerCase();
		return flatUsers
			.filter(u => (!role ? true : u.role === role))
			.filter(u =>
				needle
					? (u.name ?? '').toLowerCase().includes(needle) ||
					  (u.email ?? '').toLowerCase().includes(needle)
					: true
			)
			.map(u => ({ ...u, key: u.id }));
	}, [flatUsers, q, role]);

	const isMe = useCallback(
		(r: IUserRow) =>
			!!meEmail && r.email?.toLowerCase() === meEmail.toLowerCase(),
		[meEmail]
	);

	const handleDelete = useCallback(
		async (id: number) => {
			try {
				await dispatch(deleteUser({ id })).unwrap();
				await dispatch(getAllUsers()); // вручную обновляем после удаления
			} catch {
				message.error('Не удалось удалить пользователя');
			}
		},
		[dispatch, message]
	);

	const handleCopyCreds = useCallback(
		async (u: IUserListItem) => {
			if (u.role !== 'user') return;
			const login = u.email?.trim();
			const pwd = u.password?.trim();
			if (!login || !pwd) {
				message.warning('Пароль недоступен для копирования');
				return;
			}
			try {
				await navigator.clipboard.writeText(`${login}\n${pwd}`);
				message.success('Логин и пароль скопированы');
			} catch {
				message.error('Не удалось скопировать в буфер обмена');
			}
		},
		[message]
	);

	const openEdit = useCallback(
		(u: IUserRow) => {
			setEditing(u);
			editForm.setFieldsValue({ name: u.name ?? '', role: u.role });
			setEditOpen(true);
		},
		[editForm]
	);

	const onSubmitEdit = useCallback(async () => {
		try {
			const values = await editForm.validateFields();
			if (!editing) return;
			await dispatch(
				updateUser({
					id: editing.id,
					patch: { name: values.name.trim(), role: values.role },
				})
			).unwrap();

			message.success('Пользователь обновлён');
			setEditOpen(false);
			setEditing(null);
		} catch (e) {
			if (typeof e === 'string') message.error(e);
		}
	}, [dispatch, editForm, editing, message]);

	// ===== стили/вспомогательные =====
	const {
		colorBgElevated,
		colorBgContainer,
		boxShadowSecondary,
		colorPrimary,
		colorPrimaryHover,
		colorWarningBg,
		colorWarningBorder,
		colorTextSecondary,
		colorError,
		colorWhite,
	} = token;

	const cardBg = `linear-gradient(180deg, ${colorBgElevated}, ${colorBgContainer})`;
	const cardShadow = boxShadowSecondary;
	const accentIconBg = `linear-gradient(135deg, ${colorPrimary}, ${colorPrimaryHover})`;
	const meRowBg = colorWarningBg;
	const meRowBorder = colorWarningBorder;
	const subtleText = colorTextSecondary;

	const StatCard = ({
		icon,
		label,
		value,
	}: {
		icon: JSX.Element;
		label: string;
		value: number;
	}) => (
		<Card
			size='small'
			style={{
				borderRadius: 14,
				background: token.colorBgElevated,
				boxShadow: token.boxShadowTertiary,
			}}
			styles={{ body: { padding: 12 } }}
		>
			<Space align='center' size={10}>
				<span
					className='h-8 w-8 rounded-lg'
					style={{
						display: 'inline-flex',
						alignItems: 'center',
						justifyContent: 'center',
						background: token.colorFillSecondary,
						color: token.colorText,
					}}
				>
					{icon}
				</span>
				<Space direction='vertical' size={0}>
					<Text type='secondary' style={{ fontSize: 12 }}>
						{label}
					</Text>
					<Title level={4} style={{ margin: 0 }}>
						{value}
					</Title>
				</Space>
			</Space>
		</Card>
	);

	const columns = useMemo<ColumnsType<IUserRow>>(() => {
		const cols: ColumnsType<IUserRow> = [
			{
				title: '#',
				key: 'rownum',
				width: 64,
				align: 'right',
				render: (_: unknown, __: IUserRow, index: number) => {
					const start = (pager.current - 1) * pager.pageSize;
					return <Text type='secondary'>{start + index + 1}</Text>;
				},
			},
			{
				title: 'Пользователь',
				dataIndex: 'name',
				key: 'name',
				render: (_: unknown, r) => (
					<Space direction='vertical' size={2}>
						<Space size={8} align='center' wrap>
							<Text strong>{r.name || 'Без имени'}</Text>
							{isMe(r) && <Tag color='gold'>Это вы</Tag>}
						</Space>
						<Space size={6}>
							<MailOutlined />
							<Text style={{ color: subtleText }}>{r.email}</Text>
						</Space>
					</Space>
				),
			},
			{
				title: 'Роль',
				dataIndex: 'role',
				key: 'role',
				width: 220,
				filters: (Object.keys(roleTag) as Role[]).map(r => ({
					text: roleTag[r].label,
					value: r,
				})),
				onFilter: (value, record) => record.role === (value as Role),
				render: (val: Role) => {
					const meta = roleTag[val] ?? roleTag.user;
					return (
						<Space size={6}>
							{meta.icon}
							<Tag color={meta.color}>{meta.label}</Tag>
						</Space>
					);
				},
				responsive: ['sm'],
			},
			{
				title: 'Действия',
				key: 'actions',
				width: 160,
				render: (_: unknown, r) => {
					const canCopy = r.role === 'user' && !!r.password;
					const items = [
						{
							key: 'edit',
							icon: <EditOutlined />,
							label: 'Редактировать',
							onClick: () => openEdit(r),
						},
						{
							key: 'copy',
							icon: <CopyOutlined />,
							label: 'Скопировать доступы',
							disabled: !canCopy,
							onClick: () => handleCopyCreds(r),
						},
						{ type: 'divider' as const },
						{
							key: 'delete',
							icon: <DeleteOutlined style={{ color: colorError }} />,
							label: <span style={{ color: colorError }}>Удалить</span>,
							onClick: () =>
								Modal.confirm({
									title: 'Удалить пользователя?',
									content: (
										<span>
											Это действие необратимо.
											<br />
											Пользователь: <b>{r.name || r.email}</b>
										</span>
									),
									okText: 'Удалить',
									okButtonProps: { danger: true },
									cancelText: 'Отмена',
									onOk: () => handleDelete(r.id),
								}),
						},
					];
					return (
						<Dropdown menu={{ items }} trigger={['click']}>
							<Button icon={<MoreOutlined />} />
						</Dropdown>
					);
				},
			},
		];

		// подсветка своей строки
		return cols.map((col, i, arr) => ({
			...col,
			onCell: record =>
				isMe(record)
					? {
							style: {
								background: meRowBg,
								boxShadow: `inset 0 0 0 2px ${meRowBorder}`,
								...(i === 0
									? { borderTopLeftRadius: 10, borderBottomLeftRadius: 10 }
									: null),
								...(i === arr.length - 1
									? { borderTopRightRadius: 10, borderBottomRightRadius: 10 }
									: null),
								transition: 'background-color .2s ease',
							},
					  }
					: {},
		}));
	}, [
		pager,
		isMe,
		subtleText,
		meRowBg,
		meRowBorder,
		handleCopyCreds,
		handleDelete,
		openEdit,
		colorError,
	]);

	const roleSegment = (
		<Segmented
			value={role ?? 'all'}
			onChange={val => setRole(val === 'all' ? undefined : (val as Role))}
			options={[
				{ label: 'Все', value: 'all' },
				{ label: roleTag.user.label, value: 'user' },
				{ label: roleTag.student.label, value: 'student' },
				{ label: roleTag.teacher.label, value: 'teacher' },
				{ label: roleTag.admin.label, value: 'admin' },
			]}
		/>
	);

	return (
		<Row justify='center'>
			<Col>
				<Card
					className='rounded-3xl border-0'
					styles={{ body: { padding: 20 } }}
					style={{ background: cardBg, boxShadow: cardShadow }}
					title={
						<Space size='large' align='center'>
							<span
								className='h-9 w-9 rounded-xl shadow-md'
								style={{
									display: 'inline-flex',
									alignItems: 'center',
									justifyContent: 'center',
									background: accentIconBg,
								}}
							>
								<TeamOutlined style={{ color: colorWhite }} />
							</span>
							<Title level={3} className='!mb-0'>
								Пользователи
							</Title>
						</Space>
					}
					extra={
						<Space wrap>
							<Tooltip title='Обновить'>
								<Button
									icon={<ReloadOutlined />}
									onClick={() => dispatch(getAllUsers())}
								/>
							</Tooltip>
							<Tooltip title='Быстро создать пользователя (role=user)'>
								<Button
									icon={<ThunderboltOutlined />}
									onClick={handleQuickUser}
								>
									Быстрый доступ
								</Button>
							</Tooltip>
							<Button
								type='primary'
								icon={<UserAddOutlined />}
								onClick={() => {
									setQuickDefaults(null);
									setQuickAuto(false);
									setOpenCreate(true);
								}}
							>
								Создать пользователя
							</Button>
						</Space>
					}
				>
					{/* панель фильтров */}
					<Card
						size='small'
						style={{
							borderRadius: 16,
							background: token.colorBgElevated,
							boxShadow: token.boxShadowTertiary,
							marginBottom: 16,
						}}
						styles={{ body: { padding: 12 } }}
					>
						<Row gutter={[12, 12]} align='middle'>
							<Col xs={24} md={10}>
								<Input
									allowClear
									placeholder='Поиск по имени или email…'
									value={q}
									onChange={e => setQ(e.target.value)}
								/>
							</Col>
							<Col xs={24} md={14}>
								<Space className='w-full justify-end' wrap>
									{roleSegment}
									<Select<Role>
										allowClear
										placeholder='Роль (доп. фильтр)'
										value={role}
										onChange={val => setRole(val)}
										style={{ width: 220 }}
										options={(Object.keys(roleTag) as Role[]).map(r => ({
											value: r,
											label: roleTag[r].label,
										}))}
									/>
									<Button
										onClick={() => {
											setQ('');
											setRole(undefined);
										}}
									>
										Сбросить
									</Button>
								</Space>
							</Col>
						</Row>
					</Card>

					{/* статистика */}
					<Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
						<Col xs={12} md={6}>
							<StatCard
								icon={<TeamOutlined />}
								label='Всего'
								value={stats.total}
							/>
						</Col>
						<Col xs={12} md={6}>
							<StatCard
								icon={roleTag.user.icon}
								label={roleTag.user.label}
								value={stats.user}
							/>
						</Col>
						<Col xs={12} md={6}>
							<StatCard
								icon={roleTag.student.icon}
								label={roleTag.student.label}
								value={stats.student}
							/>
						</Col>
						<Col xs={12} md={6}>
							<StatCard
								icon={roleTag.teacher.icon}
								label={roleTag.teacher.label}
								value={stats.teacher}
							/>
						</Col>
					</Row>

					{/* таблица */}
					<Table<IUserRow>
						bordered={false}
						size='middle'
						loading={isLoading}
						rowKey='id'
						dataSource={data}
						columns={columns}
						rowClassName={r => (isMe(r) ? 'transition-colors' : '')}
						scroll={{ y: 560 }}
						sticky
						pagination={{
							current: pager.current,
							pageSize: pager.pageSize,
							showSizeChanger: true,
						}}
						onChange={(p: TablePaginationConfig) =>
							setPager({ current: p.current ?? 1, pageSize: p.pageSize ?? 10 })
						}
						locale={{
							emptyText: loadError ? (
								<Empty
									description={
										<span>
											Не удалось загрузить пользователей
											<br />
											<Text type='secondary'>{String(loadError)}</Text>
										</span>
									}
								/>
							) : (
								<Empty description='Пользователи не найдены' />
							),
						}}
					/>
				</Card>

				{/* модалка создания пользователя */}
				<Modal
					open={openCreate}
					onCancel={() => setOpenCreate(false)}
					footer={null}
					destroyOnHidden
					width={720}
					title={quickAuto ? 'Создание пользователя…' : 'Создать пользователя'}
					styles={{
						content: { background: token.colorBgElevated },
						header: { background: token.colorBgElevated },
						body: { background: token.colorBgElevated },
					}}
				>
					<AdminUserCreatePage
						embedded
						defaults={quickDefaults ?? undefined}
						autoSubmit={quickAuto}
						copyCredentials={quickAuto}
						onClose={() => setOpenCreate(false)}
						onCreated={() => {
							setOpenCreate(false);
							setQuickDefaults(null);
							setQuickAuto(false);
							dispatch(getAllUsers());
						}}
					/>
				</Modal>

				{/* модалка редактирования пользователя */}
				<Modal
					open={editOpen}
					onCancel={() => {
						setEditOpen(false);
						setEditing(null);
					}}
					onOk={onSubmitEdit}
					okText='Сохранить'
					cancelText='Отмена'
					title='Редактирование пользователя'
					destroyOnHidden
					styles={{
						content: { background: token.colorBgElevated },
						header: { background: token.colorBgElevated },
						body: { background: token.colorBgElevated },
					}}
				>
					<Form form={editForm} layout='vertical'>
						<Form.Item
							label='Имя'
							name='name'
							rules={[
								{ required: true, message: 'Введите имя' },
								{ min: 2, message: 'Минимум 2 символа' },
								{ max: 50, message: 'Не более 50 символов' },
							]}
						>
							<Input placeholder='Имя пользователя' />
						</Form.Item>

						<Form.Item
							label='Роль'
							name='role'
							rules={[{ required: true, message: 'Выберите роль' }]}
						>
							<Select<Role>
								options={(Object.keys(roleTag) as Role[]).map(r => ({
									value: r,
									label: roleTag[r].label,
								}))}
							/>
						</Form.Item>
					</Form>
					{editing?.role === 'admin' && isMe(editing) && (
						<Text type='secondary'>
							Изменение собственной роли может ограничить доступ к разделам
							админки.
						</Text>
					)}
				</Modal>
			</Col>
		</Row>
	);
}
