import { useCallback, useEffect, useState } from 'react';
import {
	Card,
	Form,
	Input,
	InputNumber,
	Button,
	Typography,
	Select,
	Col,
	Row,
	Space,
	Alert,
	Modal,
	Tooltip, // ⬅️ добавили
} from 'antd';
import { useAppSelector, useAppDispatch } from '../hooks/hooks';
import { setLessonField } from '../store/reducers/lessons/lessonReducer';
import { getAllQuizzes } from '../store/reducers/quiz/quizThunks';
import {
	FileTextOutlined,
	FilePdfOutlined,
	FormOutlined,
	CheckCircleTwoTone,
	PlusOutlined, // ⬅️ иконка для кнопки
} from '@ant-design/icons';
import { createLesson } from '../store/reducers/lessons/lessonsThunks';
import type { LessonState } from '../store/reducers/lessons/types';
import type { LessonPage } from '../models/course/ILesson';
import { QuizBuilder } from '../components/QuizBuilder';
import { clearLastCreatedQuiz } from '../store/reducers/quiz/quizReducer';
import { RouteNames } from '../routes';
import { useNavigate } from 'react-router-dom';
import { openPdfPreview } from '../store/reducers/pdf/pdfThunk';

const { Title, Text } = Typography;

export const LessonBuilder = () => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	const lesson = useAppSelector(state => state.lesson);
	const courseId = useAppSelector(s => s.lesson.courseId);
	const quizzes = useAppSelector(state => state.quiz.quizzes);
	const lastCreatedQuizId = useAppSelector(s => s.quiz.lastCreatedId);

	const { startWith, end } = useAppSelector(state => state.lesson.pages);

	const [quizModalOpen, setQuizModalOpen] = useState(false);

	useEffect(() => {
		dispatch(getAllQuizzes());
	}, [dispatch]);

	useEffect(() => {
		if (quizModalOpen && lastCreatedQuizId) {
			dispatch(getAllQuizzes());
			dispatch(setLessonField({ key: 'testId', value: lastCreatedQuizId }));
			setQuizModalOpen(false);
			// при желании сразу сбросить маркер
			dispatch(clearLastCreatedQuiz());
		}
	}, [quizModalOpen, lastCreatedQuizId, dispatch]);

	// при открытии модалки — обнулим маркер, чтобы не поймать «старое» значение
	const openQuizModal = () => {
		dispatch(clearLastCreatedQuiz());
		setQuizModalOpen(true);
	};

	const handleFieldChange = useCallback(
		(key: keyof LessonState, value: string | number | Partial<LessonPage>) => {
			dispatch(setLessonField({ key, value }));
		},
		[dispatch]
	);

	return (
		<Row justify='center' className='p-6'>
			<Col xs={24} md={20} lg={16} xl={12}>
				<Card className='rounded-2xl shadow-2xl border-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50'>
					<Space align='center' size='large' className='mb-8'>
						<FileTextOutlined className='text-blue-500 text-3xl' />
						<Title level={3} className='!mb-0 text-blue-800'>
							Редактор урока
						</Title>
					</Space>
					<Form layout='vertical' component={false}>
						<Form layout='vertical'>
							<Form.Item
								label={
									<Space align='center' size={8}>
										<FormOutlined className='text-indigo-500' />
										<Text strong>Название урока</Text>
									</Space>
								}
								required
							>
								<Input
									placeholder='Введите название урока'
									value={lesson.title}
									onChange={e => handleFieldChange('title', e.target.value)}
									maxLength={25}
									showCount
									className='rounded-xl text-lg px-4 py-2 border-blue-300 focus:border-blue-500'
									size='large'
								/>
							</Form.Item>
						</Form>

						<Form.Item
							label={
								<Space align='center' size={8}>
									<FilePdfOutlined className='text-rose-400' />
									<Text strong>Страницы урока</Text>
								</Space>
							}
						>
							<Row align='middle' gutter={12} wrap>
								{/* ЛЕВАЯ ЧАСТЬ: "с — по" в компактном стиле */}
								<Col flex='auto'>
									<Space.Compact block size='large'>
										<InputNumber
											min={1}
											precision={0}
											placeholder='с'
											value={startWith}
											onChange={val => {
												const v = (val ?? 1) as number;
												dispatch(
													setLessonField({
														key: 'pages',
														value: { startWith: v },
													})
												);
											}}
											className='w-full'
										/>
										<InputNumber
											min={startWith || 1}
											precision={0}
											placeholder='по'
											value={end}
											onChange={val => {
												const v = (val ?? (startWith || 1)) as number;
												dispatch(
													setLessonField({ key: 'pages', value: { end: v } })
												);
											}}
											className='w-full'
										/>
									</Space.Compact>
								</Col>

								{/* ПРАВАЯ ЧАСТЬ: кнопка открытия материала */}
								<Col flex='none' className='text-right'>
									<Tooltip
										title={
											courseId
												? 'Предпросмотр PDF материала курса'
												: 'Сначала выберите курс'
										}
									>
										{/* span нужен, чтобы Tooltip работал и в disabled-состоянии */}
										<span>
											<Button
												size='large'
												icon={<FilePdfOutlined />}
												disabled={!courseId}
												onClick={() => {
													if (courseId) dispatch(openPdfPreview(courseId));
												}}
												className='rounded-lg shadow-sm'
											>
												Открыть материал по курсу
											</Button>
										</span>
									</Tooltip>
								</Col>
							</Row>

							{lesson.saveError && (
								<Alert
									message={lesson.saveError}
									type='error'
									showIcon
									className='mt-3'
								/>
							)}
						</Form.Item>

						<Form.Item
							label={
								<Space align='center' size={8}>
									<CheckCircleTwoTone twoToneColor='#52c41a' />
									<Text strong>Связанный тест</Text>
								</Space>
							}
						>
							<Space.Compact block size='large'>
								<Select
									allowClear
									showSearch
									placeholder='Выберите тест для урока'
									value={lesson.testId ?? undefined}
									onChange={val => handleFieldChange('testId', val)}
									// ВАЖНО: даём гибкую ширину и разрешаем сжатие содержимого
									className='flex-1 min-w-0 rounded-xl'
									// Отдаём AntD «строковую метку» — она корректно эллипсируется
									optionLabelProp='label'
									// Рендерим options массивом (label — строка)
									options={(quizzes ?? []).map(q => ({
										value: q.id,
										label: q.surveyJson?.title || `Тест #${q.id}`,
									}))}
									// Поиск по label
									optionFilterProp='label'
									filterOption={(input, option) =>
										String(option?.label ?? '')
											.toLowerCase()
											.includes(input.toLowerCase())
									}
								/>

								<Button
									size='large'
									icon={<PlusOutlined />}
									onClick={openQuizModal}
								>
									Создать тест
								</Button>
							</Space.Compact>
						</Form.Item>

						<Form.Item>
							<Button
								type='primary'
								size='large'
								onClick={() => {
									dispatch(createLesson());
									navigate(RouteNames.COURSES);
								}}
								className='w-full mt-4'
							>
								Сохранить урок
							</Button>
						</Form.Item>
					</Form>
				</Card>
			</Col>

			{/* Модалка с QuizBuilder */}
			<Modal
				open={quizModalOpen}
				onCancel={() => {
					setQuizModalOpen(false);
					dispatch(clearLastCreatedQuiz());
				}}
				footer={null}
				width={1000}
				destroyOnHidden
				title='Конструктор теста'
				maskClosable={false}
				wrapClassName='pointer-events-none'
				mask={false}
			>
				<QuizBuilder />
			</Modal>
		</Row>
	);
};
