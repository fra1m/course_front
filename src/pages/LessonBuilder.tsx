//FIXME: исправить pages

// import type { LessonPage } from '../models/course/ILesson';

import React, { useCallback, useEffect, } from 'react';
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
} from 'antd';
import { useAppSelector, useAppDispatch } from '../hooks/hooks';
import {
	setLessonField,
} from '../store/reducers/lessons/lessonReducer';
import { getAllQuizzes } from '../store/reducers/quiz/quizThunks';
import {
	FileTextOutlined,
	FilePdfOutlined,
	FormOutlined,
	CheckCircleTwoTone,
} from '@ant-design/icons';
import { getHTML } from '../store/reducers/lessons/lessonsThunks';

const { Title, Text } = Typography;

export const LessonBuilder = () => {
	const dispatch = useAppDispatch();

	const lesson = useAppSelector(state => state.lesson);
	const quizzes = useAppSelector(state => state.quiz.quizzes);

	const { startWith, end } = useAppSelector(state => state.lesson.pages);

	useEffect(() => {
		dispatch(getAllQuizzes());
	}, [dispatch]);

	const handleFieldChange = useCallback(
		// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
		(key: string, value: any) => {
			// dispatch(setLessonField({ key, value }));
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
								className='rounded-xl text-lg px-4 py-2 border-blue-300 focus:border-blue-500'
								size='large'
							/>
						</Form.Item>

						<Form.Item
							label={
								<Space align='center' size={8}>
									<FilePdfOutlined className='text-rose-400' />
									<Text strong>Содержимое урока</Text>
								</Space>
							}
						>
							<Row gutter={12} className='mt-2'>
								<Col span={12}>
									<InputNumber
										min={1}
										placeholder='Страница с'
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
										size='large'
										className='rounded-lg w-full'
									/>
								</Col>
								<Col span={12}>
									<InputNumber
										min={startWith || 1}
										placeholder='Страница по'
										value={end}
										onChange={val => {
											const v = (val ?? (startWith || 1)) as number;
											dispatch(
												setLessonField({ key: 'pages', value: { end: v } })
											);
										}}
										size='large'
										className='rounded-lg w-full'
									/>
								</Col>
							</Row>

							{lesson.saveError && (
								<Alert
									message={lesson.saveError}
									type='error'
									showIcon
									className='mt-4'
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
							<Select
								allowClear
								showSearch
								placeholder='Выберите тест для урока'
								value={lesson.testId ?? undefined}
								onChange={val => handleFieldChange('testId', val)}
								className='rounded-xl'
								size='large'
								optionFilterProp='children'
								filterOption={(input, option) =>
									(option?.children as unknown as string)
										?.toLowerCase()
										.includes(input.toLowerCase())
								}
							>
								{quizzes?.map(quiz => (
									<Select.Option key={quiz.id} value={quiz.id}>
										{quiz.surveyJson.title || `Тест #${quiz.id}`}
									</Select.Option>
								))}
							</Select>
						</Form.Item>
						<Form.Item>
							<Button
								type='primary'
								size='large'
								onClick={() => dispatch(getHTML())}
								className='w-full mt-4'
							>
								Сохранить урок
							</Button>
						</Form.Item>
					</Form>
				</Card>
			</Col>
		</Row>
	);
};
