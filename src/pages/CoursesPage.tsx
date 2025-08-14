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
} from 'antd';
import {
	MenuFoldOutlined,
	MenuUnfoldOutlined,
	PlayCircleOutlined,
	FileTextOutlined,
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import { getAllLessons } from '../store/reducers/lessons/lessonsThunks';
import { loadMock } from '../store/reducers/courses/courseReducer';
import { useNavigate } from 'react-router-dom';
import { RouteNames } from '../routes';
import { getAllQuizzes } from '../store/reducers/quiz/quizThunks';

const { Sider, Content } = Layout;
const { Text } = Typography;

export const CoursesPage: FC = () => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	useEffect(() => {
		dispatch(loadMock()); // курсы (временно моки)
		dispatch(getAllQuizzes());
		dispatch(getAllLessons()); // уроки (в них уже есть testId)
	}, [dispatch]);

	const courses = useAppSelector(s => s.course.courses);
	const lessons = useAppSelector(s => s.lesson.lessons);

	const [collapsed, setCollapsed] = useState(false);
	const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

	const selectedCourse = useMemo(
		() => courses?.find(c => String(c.id) === String(selectedCourseId)),
		[courses, selectedCourseId]
	);

	return (
		<Layout className='h-screen'>
			<Sider
				collapsible
				collapsed={collapsed}
				onCollapse={setCollapsed}
				className='bg-white shadow'
				width={250}
			>
				<div className='p-4 flex justify-between items-center border-b'>
					{!collapsed && <span className='text-lg font-semibold'>Курсы</span>}
					<Button
						type='text'
						icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
						onClick={() => setCollapsed(!collapsed)}
					/>
				</div>

				<Menu
					mode='inline'
					selectedKeys={selectedCourseId ? [selectedCourseId] : []}
					onClick={({ key }) => setSelectedCourseId(String(key))}
					items={(courses ?? []).map(c => ({
						key: String(c.id),
						label: c.title,
					}))}
				/>
			</Sider>

			<Layout>
				<Content className='p-6 overflow-auto bg-gray-50'>
					{selectedCourse ? (
						<>
							<Card
								title={selectedCourse.title}
								className='mb-6'
								extra={
									<Button
										type='primary'
										onClick={() =>
											message.success(`Пользователь 12 записался на курс`)
										}
									>
										Записаться на курс
									</Button>
								}
							>
								<Col>{selectedCourse.description}</Col>
							</Card>

							<List
								dataSource={lessons ?? []}
								grid={{ gutter: 12, xs: 1, sm: 1, md: 1, lg: 1 }}
								renderItem={lesson => (
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
																Урок
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
																title={`Открыть урок`}
																placement='top'
																arrow
																trigger={['hover', 'focus']}
																styles={{ root: { whiteSpace: 'nowrap' } }}
															>
																<span className='inline-block'>
																	<Button
																		icon={<PlayCircleOutlined />}
																		onClick={() =>
																			navigate(`/lessons/${lesson.id}`)
																		}
																	>
																		{lesson.title || `Урок #${lesson.id}`}
																	</Button>
																</span>
															</Tooltip>

															{lesson.pages && (
																<Text type='secondary' className='text-xs'>
																	{lesson.pages.startWith}–{lesson.pages.end}{' '}
																	стр.
																</Text>
															)}
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
																styles={{ root: { whiteSpace: 'nowrap' } }}
															>
																<span className='inline-block'>
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
																</span>
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
						</>
					) : (
						<div className='text-center mt-20 text-gray-500 text-lg'>
							Выберите курс слева
						</div>
					)}
				</Content>
			</Layout>
		</Layout>
	);
};
