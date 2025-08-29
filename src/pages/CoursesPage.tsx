import { useEffect, useMemo, useState, type FC } from 'react';
import {
	Layout,
	Menu,
	Button,
	Card,
	message,
	Col,
	Typography,
	Space,
	List,
	Row,
	Tooltip,
	Empty,
	Form,
	Input,
	Modal,
	Popconfirm,
} from 'antd';
import {
	MenuFoldOutlined,
	MenuUnfoldOutlined,
	PlayCircleOutlined,
	FileTextOutlined,
	BookOutlined,
	EditOutlined,
	DeleteOutlined,
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
// import { getAllLessons } from '../store/reducers/lessons/lessonsThunks';
import {
	setCourseField,
	setSelectedCourseId,
} from '../store/reducers/courses/courseReducer';
import { useNavigate } from 'react-router-dom';
import { RouteNames } from '../routes';
import { getAllQuizzes } from '../store/reducers/quiz/quizThunks';
import { openPdfPreview } from '../store/reducers/pdf/pdfThunk';
import type { ILesson } from '../models/course/ILesson';
import { setLessonField } from '../store/reducers/lessons/lessonReducer';
import {
	deleteCourse,
	updateCourse,
} from '../store/reducers/courses/courseThunks';

const { Sider, Content } = Layout;
const { Text, Paragraph } = Typography;

export const CoursesPage: FC = () => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	useEffect(() => {
		// dispatch(getAllQuizzes());
		// dispatch(getAllLessons()); // уроки (в них уже есть testId)
	}, [dispatch]);

	const { courses, selectedCourseId } = useAppSelector(s => s.course);

	const lessons = useAppSelector(s => s.lesson.lessons);

	const [collapsed, setCollapsed] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [form] = Form.useForm<{ title: string; description: string }>();
	const [deleting, setDeleting] = useState(false);

	// если selectedCourseId пустой/некорректный — выбираем первый курс
	useEffect(() => {
		if (!Array.isArray(courses) || courses.length === 0) return;
		const exists =
			typeof selectedCourseId === 'number' &&
			courses.some(c => c.id === selectedCourseId);
		if (!exists) {
			dispatch(setSelectedCourseId(courses[0].id));
		}
	}, [courses, selectedCourseId, dispatch]);

	const selectedCourse = useMemo(
		() =>
			Array.isArray(courses)
				? courses.find(c => c.id === selectedCourseId)
				: undefined,
		[courses, selectedCourseId]
	);

	useEffect(() => {
		if (editOpen && selectedCourse) {
			form.setFieldsValue({
				title: selectedCourse.title ?? '',
				description: selectedCourse.description ?? '',
			});
		}
		if (!editOpen) {
			form.resetFields();
		}
	}, [editOpen, selectedCourse, form]);

	const onDeleteCourse = async () => {
		if (!selectedCourse) return;
		try {
			setDeleting(true);

			await dispatch(deleteCourse()).unwrap();
			message.success('Курс удалён');

			// выбрать следующий/предыдущий курс, чтобы UI не остался висеть без выбора
			const idx = courses.findIndex(c => c.id === selectedCourse.id);
			const next = (courses[idx + 1]?.id ?? courses[idx - 1]?.id) as
				| number
				| undefined;

			if (typeof next === 'number') {
				dispatch(setSelectedCourseId(next));
			} else {
				// курсов не осталось
				dispatch(setSelectedCourseId(undefined as unknown as number));
			}

			// опционально: обновить список курсов
			await dispatch(getAllQuizzes());
		} catch {
			message.error('Не удалось удалить курс');
		} finally {
			setDeleting(false);
		}
	};

	useEffect(() => {
		if (selectedCourse) {
			form.setFieldsValue({
				title: selectedCourse.title ?? '',
				description: selectedCourse.description ?? '',
			});
		} else {
			form.resetFields();
		}
	}, [selectedCourse, form]);

	const onOpenEdit = () => setEditOpen(true);
	const onCancelEdit = () => setEditOpen(false);

	const onSubmitEdit = async () => {
		try {
			const values = await form.validateFields();
			const title = values.title.trim();
			const description = values.description.trim();

			if (!selectedCourse) return;

			// кладём черновики в стор, т.к. updateCourse берёт данные из state
			dispatch(setCourseField({ key: 'title', value: title }));
			dispatch(setCourseField({ key: 'description', value: description }));

			await dispatch(updateCourse()).unwrap();
			message.success('Курс обновлён');
			setEditOpen(false);
		} catch {
			// ошибки валидации/запроса уже подсвечены, тут ничего не делаем
		}
	};

	// уроки берём по списку id, который хранится в КУРСЕ (например, course.lessons или course.lessonIds)
	const courseLessons = useMemo(() => {
		if (!Array.isArray(lessons)) return [];
		if (typeof selectedCourseId !== 'number') return [];
		return lessons.filter(
			(l: ILesson) =>
				Number((l as ILesson).courseId) === Number(selectedCourseId)
		);
	}, [lessons, selectedCourseId]);

	return (
		<Layout
			className='bg-transparent'
			style={{ minHeight: 'calc(100vh - 64px)' }}
		>
			<Sider
				collapsible
				collapsed={collapsed}
				onCollapse={setCollapsed}
				width={260}
				className='bg-white/90 shadow z-[10] backdrop-blur'
				style={{
					position: 'sticky',
					top: 64, // отступ под хедер
					height: 'calc(100vh - 64px)', // вся видимая высота
					overflow: 'auto', // скролл внутри сайдера
				}}
			>
				<Row
					align='middle'
					justify='space-between'
					className='p-3 bg-gradient-to-r from-blue-600 to-indigo-700 sticky top-0 z-10'
				>
					{!collapsed && (
						<Col>
							<Text strong className='!text-white'>
								Курсы
							</Text>
						</Col>
					)}
					<Col>
						<Tooltip title={collapsed ? 'Развернуть' : 'Свернуть'}>
							<Button
								type='primary'
								ghost
								size='large'
								shape='circle'
								icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
								onClick={() => setCollapsed(!collapsed)}
								className='!text-white !border-white hover:!text-yellow-300 hover:!border-yellow-300'
								aria-label={
									collapsed
										? 'Развернуть список курсов'
										: 'Свернуть список курсов'
								}
							/>
						</Tooltip>
					</Col>
				</Row>

				<Menu
					mode='inline'
					selectedKeys={
						typeof selectedCourseId === 'number' ? [`${selectedCourseId}`] : []
					}
					onClick={({ key }) => dispatch(setSelectedCourseId(Number(key)))}
					items={(courses ?? []).map(c => ({
						key: String(c.id),
						label: c.title,
						icon: <BookOutlined />,
					}))}
				/>
			</Sider>

			<Layout>
				<Content
					className='p-6 bg-gray-50/40'
					style={{ minHeight: 0, overflow: 'visible' }}
				>
					{selectedCourse ? (
						<Space direction='vertical' size={16} className='w-full'>
							<Card
								title={selectedCourse.title}
								className='mb-2'
								extra={
									<Space>
										<Popconfirm
											title='Удалить курс?'
											description='Будут удалены уроки и файл материала. Действие необратимо.'
											okText='Удалить'
											cancelText='Отмена'
											okType='danger'
											onConfirm={onDeleteCourse}
										>
											<Button
												danger
												icon={<DeleteOutlined />}
												loading={deleting}
											>
												Удалить
											</Button>
										</Popconfirm>

										<Button onClick={onOpenEdit} icon={<EditOutlined />}>
											Редактировать
										</Button>

										<Button
											type='primary'
											onClick={() =>
												dispatch(openPdfPreview(selectedCourse.id))
											}
										>
											Открыть материал по курсу
										</Button>

										<Button
											type='primary'
											onClick={() =>
												dispatch(
													setLessonField({
														key: 'courseId',
														value: selectedCourse.id,
													}),
													navigate(RouteNames.LESSON_BUILDER)
												)
											}
										>
											Добавить урок
										</Button>
									</Space>
								}
							>
								<Col>
									<Paragraph className='!mb-0'>
										{selectedCourse.description}
									</Paragraph>
								</Col>
							</Card>

							<List
								dataSource={courseLessons}
								grid={{ gutter: 12, xs: 1, sm: 1, md: 1, lg: 1 }}
								renderItem={(lesson: ILesson) => (
									<List.Item key={lesson.id}>
										<Card
											size='small'
											className='rounded-xl shadow-sm hover:shadow-md transition-shadow'
											styles={{ body: { padding: 12 } }}
										>
											<Row gutter={12} align='stretch' wrap={false}>
												{/* Урок */}
												<Col flex='1 1 260px'>
													<Card
														size='small'
														className='rounded-lg bg-blue-50'
														title={
															<Text type='secondary' className='text-xs'>
																{lesson.title || `Урок #${lesson.id}`}
															</Text>
														}
														styles={{ body: { padding: 12 } }}
														style={{ height: '100%' }}
													>
														<Space
															direction='vertical'
															size={6}
															className='w-full'
														>
															<Tooltip
																title='Открыть урок'
																placement='top'
																arrow
																trigger={['hover', 'focus']}
															>
																<Button
																	icon={<PlayCircleOutlined />}
																	className='w-full'
																	onClick={() =>
																		navigate(
																			RouteNames.LESSON_VIEW.replace(
																				':id',
																				String(lesson.id)
																			)
																		)
																	}
																></Button>
															</Tooltip>
														</Space>
													</Card>
												</Col>

												{/* Тест */}
												<Col flex='0 0 auto'>
													<Card
														size='small'
														className='rounded-lg bg-gray-50'
														title={
															<Text type='secondary' className='text-xs'>
																Тест
															</Text>
														}
														styles={{ body: { padding: 12 } }}
														style={{ height: '100%', whiteSpace: 'nowrap' }}
													>
														{typeof lesson.testId === 'number' ? (
															<Tooltip
																title={`Пройти тест №${lesson.testId}`}
																placement='top'
																arrow
																trigger={['hover', 'focus']}
															>
																<Button
																	size='small'
																	type='dashed'
																	icon={<FileTextOutlined />}
																	onClick={() =>
																		navigate(RouteNames.QUIZ, {
																			state: { id: lesson.testId },
																		})
																	}
																>
																	Пройти тест №{lesson.testId}
																</Button>
															</Tooltip>
														) : (
															<Text type='secondary'>Теста нет</Text>
														)}
													</Card>
												</Col>
											</Row>
										</Card>
									</List.Item>
								)}
							/>

							<Modal
								open={editOpen}
								title='Редактирование курса'
								okText='Обновить'
								cancelText='Отмена'
								onCancel={onCancelEdit}
								onOk={onSubmitEdit}
								destroyOnHidden
								forceRender // ← добавили: форма всегда смонтирована
							>
								<Form form={form} layout='vertical'>
									<Form.Item
										label='Название'
										name='title'
										rules={[
											{ required: true, message: 'Название обязательно' },
											{ max: 100, message: 'Не более 100 символов' },
										]}
									>
										<Input placeholder='Введите название курса' />
									</Form.Item>

									<Form.Item
										label='Описание'
										name='description'
										rules={[
											{ required: true, message: 'Описание обязательно' },
											{ max: 1000, message: 'Не более 1000 символов' },
										]}
									>
										<Input.TextArea
											placeholder='Краткое описание курса'
											autoSize={{ minRows: 3, maxRows: 6 }}
										/>
									</Form.Item>
								</Form>
							</Modal>
						</Space>
					) : (
						<Row justify='center' className='mt-20'>
							<Col>
								<Empty description='Выберите курс слева' />
							</Col>
						</Row>
					)}
				</Content>
			</Layout>
		</Layout>
	);
};
