//TODO: убрать any
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
	App,
	Button,
	Card,
	Col,
	Empty,
	Form,
	Input,
	Modal,
	Row,
	Space,
	Table,
	Tag,
	Tooltip,
	Typography,
	theme,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
	PlusOutlined,
	ReloadOutlined,
	EditOutlined,
	DeleteOutlined,
	BranchesOutlined,
} from '@ant-design/icons';
import type { ISpecialization } from '../../models/specialization/ISpecialization';
import { useAppDispatch, useAppSelector } from '../../hooks/hooks';
import {
	createSpecialization,
	deleteSpecialization,
	fetchSpecializations,
	updateSpecialization,
} from '../../store/reducers/specializations/specializationsThunks';
import type {
	CreateSpecializationDto,
	UpdateSpecializationDto,
} from '../../store/reducers/specializations/types';
import {
	selectSpecializations,
	selectSpecializationsLoading,
} from '../../store/reducers/specializations/specializationsReducer';

const { Title, Text } = Typography;

// --- простая русская транслитерация под slug ---
const slugify = (s: string): string => {
	const map: Record<string, string> = {
		а: 'a',
		б: 'b',
		в: 'v',
		г: 'g',
		д: 'd',
		е: 'e',
		ё: 'e',
		ж: 'zh',
		з: 'z',
		и: 'i',
		й: 'y',
		к: 'k',
		л: 'l',
		м: 'm',
		н: 'n',
		о: 'o',
		п: 'p',
		р: 'r',
		с: 's',
		т: 't',
		у: 'u',
		ф: 'f',
		х: 'h',
		ц: 'c',
		ч: 'ch',
		ш: 'sh',
		щ: 'sch',
		ы: 'y',
		э: 'e',
		ю: 'yu',
		я: 'ya',
		ь: '',
		ъ: '',
	};
	return s
		.toLowerCase()
		.trim()
		.split('')
		.map(ch => map[ch] ?? ch)
		.join('')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
};

export default function SpecializationPage() {
	const { token } = theme.useToken();
	const { message, modal } = App.useApp();

	const dispatch = useAppDispatch();
	const list = useAppSelector(selectSpecializations);
	const loading = useAppSelector(selectSpecializationsLoading);

	// --- создание ---
	const [createForm] = Form.useForm<CreateSpecializationDto>();
	const [creating, setCreating] = useState(false);

	// --- редактирование ---
	const [editOpen, setEditOpen] = useState(false);
	const [editForm] = Form.useForm<CreateSpecializationDto>();
	const [editing, setEditing] = useState<ISpecialization | null>(null);
	const [savingEdit, setSavingEdit] = useState(false);

	// --- однократная загрузка (в т.ч. в StrictMode) ---
	useEffect(() => {
		if (list.length === 0) dispatch(fetchSpecializations());
	}, [dispatch, list.length]);

	// --- авто-генерация slug из title при вводе (только если пользователь не трогал slug вручную) ---
	const slugTouchedRef = useRef(false);
	const onTitleChangeCreate = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const title = e.target.value ?? '';
			if (!slugTouchedRef.current) {
				createForm.setFieldsValue({ slug: slugify(title) });
			}
		},
		[createForm]
	);
	const onSlugChangeCreate = useCallback(() => {
		slugTouchedRef.current = true;
	}, []);

	const handleRefresh = useCallback(() => {
		dispatch(fetchSpecializations());
	}, [dispatch]);

	// --- создать специализацию ---
	const onCreate = useCallback(async () => {
		try {
			const values = await createForm.validateFields();
			setCreating(true);
			const payload: CreateSpecializationDto = {
				title: values.title.trim(),
				slug: values.slug.trim(),
				description: values.description?.trim() || undefined,
			};

			await dispatch(createSpecialization(payload)).unwrap();
			message.success('Специализация создана');
			createForm.resetFields();
			slugTouchedRef.current = false;
		} catch (e: any) {
			if (e?.errorFields) {
				// ошибки валидации формы — ничего
			} else {
				message.error(e?.response?.data?.message ?? 'Не удалось создать');
			}
		} finally {
			setCreating(false);
		}
	}, [createForm, dispatch, message]);

	// --- открыть модалку редактирования ---
	const openEdit = useCallback(
		(row: ISpecialization) => {
			setEditing(row);
			editForm.setFieldsValue({
				title: row.title,
				slug: row.slug,
				description: row.description ?? '',
			});
			setEditOpen(true);
		},
		[editForm]
	);

	// --- сохранить изменения ---
	const onSaveEdit = useCallback(async () => {
		if (!editing) return;
		try {
			const values = await editForm.validateFields();
			setSavingEdit(true);

			const patch: UpdateSpecializationDto = {};
			if (values.title?.trim() !== editing.title)
				patch.title = values.title.trim();
			if (values.slug?.trim() !== editing.slug) patch.slug = values.slug.trim();
			const desc = values.description?.trim() || '';
			if ((editing.description ?? '') !== desc)
				patch.description = desc || undefined;

			if (Object.keys(patch).length === 0) {
				setEditOpen(false);
				setEditing(null);
				return;
			}

			await dispatch(updateSpecialization({ id: editing.id, patch })).unwrap();
			message.success('Изменения сохранены');
			setEditOpen(false);
			setEditing(null);
		} catch (e: any) {
			if (e?.errorFields) {
				// форма
			} else {
				message.error(e?.response?.data?.message ?? 'Не удалось сохранить');
			}
		} finally {
			setSavingEdit(false);
		}
	}, [dispatch, editForm, editing, message]);

	// --- удалить ---
	const onDelete = useCallback(
		(row: ISpecialization) => {
			modal.confirm({
				title: 'Удалить специализацию?',
				content: (
					<span>
						Это действие необратимо.
						<br />
						<b>{row.title}</b>
					</span>
				),
				okText: 'Удалить',
				okButtonProps: { danger: true },
				cancelText: 'Отмена',
				onOk: async () => {
					try {
						await dispatch(deleteSpecialization({ id: row.id })).unwrap();
						message.success('Специализация удалена');
					} catch (e: any) {
						message.error(e?.response?.data?.message ?? 'Не удалось удалить');
					}
				},
			});
		},
		[dispatch, message, modal]
	);

	const columns = useMemo<ColumnsType<ISpecialization>>(
		() => [
			{
				title: '#',
				dataIndex: 'id',
				key: 'id',
				width: 80,
				align: 'right',
			},
			{
				title: 'Название',
				dataIndex: 'title',
				key: 'title',
				render: (v: string) => <Text strong>{v}</Text>,
			},
			{
				title: 'Slug',
				dataIndex: 'slug',
				key: 'slug',
				width: 240,
				render: (v: string) => <Tag>{v}</Tag>,
			},
			{
				title: 'Описание',
				dataIndex: 'description',
				key: 'description',
				ellipsis: true,
				render: (v: string | null | undefined) =>
					v ? (
						<Text type='secondary'>{v}</Text>
					) : (
						<Text type='secondary'>—</Text>
					),
			},
			{
				title: 'Действия',
				key: 'actions',
				width: 140,
				render: (_: unknown, r) => (
					<Space>
						<Tooltip title='Редактировать'>
							<Button icon={<EditOutlined />} onClick={() => openEdit(r)} />
						</Tooltip>
						<Tooltip title='Удалить'>
							<Button
								danger
								icon={<DeleteOutlined />}
								onClick={() => onDelete(r)}
							/>
						</Tooltip>
					</Space>
				),
			},
		],
		[onDelete, openEdit]
	);

	const headerIconBg = `linear-gradient(135deg, ${token.colorPrimary}, ${token.colorPrimaryHover})`;

	return (
		<Row justify='center'>
			<Col xs={24} lg={22} xl={20} xxl={18}>
				<Card
					className='rounded-3xl border-0'
					styles={{ body: { padding: 20 } }}
					title={
						<Space size='large' align='center'>
							<span
								className='h-9 w-9 rounded-xl shadow-md'
								style={{
									display: 'inline-flex',
									alignItems: 'center',
									justifyContent: 'center',
									background: headerIconBg,
								}}
							>
								<BranchesOutlined style={{ color: '#fff' }} />
							</span>
							<Title level={3} className='!mb-0'>
								Специализации
							</Title>
						</Space>
					}
					extra={
						<Space>
							<Tooltip title='Обновить'>
								<Button
									icon={<ReloadOutlined />}
									onClick={handleRefresh}
									loading={loading}
								/>
							</Tooltip>
						</Space>
					}
				>
					<Row gutter={[16, 16]}>
						{/* Форма создания */}
						<Col xs={24} md={10} lg={8}>
							<Card
								size='small'
								title='Создать специализацию'
								styles={{ body: { paddingTop: 12 } }}
							>
								<Form
									form={createForm}
									layout='vertical'
									initialValues={{ title: '', slug: '', description: '' }}
								>
									<Form.Item
										label='Название'
										name='title'
										rules={[
											{ required: true, message: 'Введите название' },
											{ min: 2, message: 'Минимум 2 символа' },
											{ max: 100, message: 'Максимум 100 символов' },
										]}
									>
										<Input
											placeholder='Например: Фронтенд'
											onChange={onTitleChangeCreate}
										/>
									</Form.Item>

									<Form.Item
										label='Slug'
										name='slug'
										rules={[
											{ required: true, message: 'Укажите slug' },
											{
												pattern: /^[a-z0-9]+(-[a-z0-9]+)*$/,
												message: 'Допустимы латиница, цифры и дефис',
											},
										]}
									>
										<Input
											placeholder='napravlenie'
											onChange={onSlugChangeCreate}
										/>
									</Form.Item>

									<Form.Item label='Описание' name='description'>
										<Input.TextArea
											placeholder='Краткое описание (необязательно)'
											rows={4}
											maxLength={400}
											showCount
										/>
									</Form.Item>

									<Space>
										<Button
											type='primary'
											icon={<PlusOutlined />}
											onClick={onCreate}
											loading={creating}
										>
											Создать
										</Button>
										<Button
											onClick={() => {
												createForm.resetFields();
												slugTouchedRef.current = false;
											}}
										>
											Очистить
										</Button>
									</Space>
								</Form>
							</Card>
						</Col>

						{/* Таблица */}
						<Col xs={24} md={14} lg={16}>
							<Card size='small' title='Список'>
								<Table<ISpecialization>
									rowKey='id'
									columns={columns}
									dataSource={list}
									loading={loading}
									pagination={{ pageSize: 10, showSizeChanger: true }}
									locale={{
										emptyText: <Empty description='Пока нет специализаций' />,
									}}
								/>
							</Card>
						</Col>
					</Row>
				</Card>

				{/* Модалка редактирования */}
				<Modal
					open={editOpen}
					title='Редактировать специализацию'
					onCancel={() => {
						setEditOpen(false);
						setEditing(null);
					}}
					onOk={onSaveEdit}
					okText='Сохранить'
					cancelText='Отмена'
					confirmLoading={savingEdit}
					destroyOnHidden
				>
					<Form form={editForm} layout='vertical'>
						<Form.Item
							label='Название'
							name='title'
							rules={[
								{ required: true, message: 'Введите название' },
								{ min: 2, message: 'Минимум 2 символа' },
								{ max: 100, message: 'Максимум 100 символов' },
							]}
						>
							<Input placeholder='Название' />
						</Form.Item>

						<Form.Item
							label='Slug'
							name='slug'
							rules={[
								{ required: true, message: 'Укажите slug' },
								{
									pattern: /^[a-z0-9]+(-[a-z0-9]+)*$/,
									message: 'Допустимы латиница, цифры и дефис',
								},
							]}
						>
							<Input placeholder='slug' />
						</Form.Item>

						<Form.Item label='Описание' name='description'>
							<Input.TextArea
								placeholder='Краткое описание (необязательно)'
								rows={4}
								maxLength={400}
								showCount
							/>
						</Form.Item>
					</Form>
				</Modal>
			</Col>
		</Row>
	);
}
