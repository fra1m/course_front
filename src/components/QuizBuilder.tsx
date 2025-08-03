import 'survey-core/survey-core.css';
import { DeleteOutlined } from '@ant-design/icons';

import {
	Button,
	Card,
	Checkbox,
	Input,
	Select,
	Typography,
	Space,
	Popconfirm,
	message,
} from 'antd';
const { Title, Text } = Typography;
const { Option } = Select;

import React from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/hooks';
import {
	setTitle,
	removePage,
	updatePageTitle,
	updateQuestion,
	resetState,
	addChoice,
	addPageWithDefaultQuestion,
	generateSurveyJson,
} from '../store/reducers/quiz/quizReducer';

import { saveQuiz, updateQuiz } from '../store/reducers/quiz/quizThunks';
import type { Question } from 'survey-core';
import { RouteNames } from '../routes';
import { useNavigate } from 'react-router-dom';

export const QuizBuilder = () => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const title = useAppSelector(state => state.quiz.surveyJson.title);
	const pages = useAppSelector(state => state.quiz.surveyJson.pages).filter(
		p => p.name !== 'start'
	);
	const state = useAppSelector(state => state.quiz);

	// Добавить пустую страницу с базовым вопросом
	const handleAddPage = () => {
		dispatch(addPageWithDefaultQuestion());
	};

	const handleRemovePage = (name: string) => {
		dispatch(removePage(name));
	};

	const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		dispatch(setTitle(e.target.value));
	};

	const onPageTitleChange = (name: string, newTitle: string) => {
		dispatch(updatePageTitle({ pageId: name, title: newTitle }));
	};
	// 	const [showPreview] = useState(false);

	// const surveyModel = useMemo(() => {
	// const surveyJson = {
	// 	title,
	// 	showProgressBar: 'top',
	// 	showNavigationButtons: true,
	// 	firstPageIsStarted: true,
	// 	startSurveyText: 'Начать тест',
	// 	completedHtml:
	// 		'<h4>Спасибо за прохождение теста! Ваши ответы записаны.</h4>',
	// 	pages: [
	// 		{
	// 			name: 'start',
	// 			elements: [
	// 				{
	// 					type: 'html',
	// 					name: 'startText',
	// 					html: '<h3>Добро пожаловать! Нажмите "Начать тест", чтобы приступить.</h3>',
	// 				},
	// 			],
	// 		},
	// 		...pages, // сюда вставляются остальные страницы с вопросами
	// 	],
	// 	};
	// 	const survey = new Model(surveyJson);
	// 	survey.applyTheme(DefaultDark);

	// 	return survey;
	// }, [pages, title]);

	// Изменить свойства вопроса
	const onQuestionChange = <K extends keyof Omit<Question, 'id' | 'name'>>(
		pageId: string,
		questionId: string,
		field: keyof Omit<Question, 'id' | 'name'>,
		value: Question[K]
	) => {
		dispatch(
			updateQuestion({
				pageId,
				questionId,
				question: { [field]: value },
			})
		);
	};

	// Удалить вариант ответа
	const removeChoice = (pageId: string, questionId: string, index: number) => {
		const page = pages.find(p => p.name === pageId);
		if (!page) return;
		const question = page.elements.find(q => q.name === questionId);
		if (!question || !question.choices) return;

		const choices = question.choices.filter((_, i) => i !== index);
		onQuestionChange(pageId, questionId, 'choices', choices);
	};

	// Обновить вариант ответа
	const updateChoice = (
		pageId: string,
		questionId: string,
		index: number,
		field: 'value' | 'text' | 'imageLink',
		value: string
	) => {
		const page = pages.find(p => p.name === pageId);
		if (!page) return;
		const question = page.elements.find(q => q.name === questionId);
		if (!question || !question.choices) return;

		const newChoices = [...question.choices];
		newChoices[index] = { ...newChoices[index], [field]: value };
		onQuestionChange(pageId, questionId, 'choices', newChoices);
	};

	// Обработка правильных ответов
	const onCorrectAnswerChange = (
		pageId: string,
		questionId: string,
		value: string | string[]
	) => {
		onQuestionChange(pageId, questionId, 'correctAnswer', value);
	};

	const questionTypeLabels: Record<string, string> = {
		radiogroup: 'Один вариант',
		checkbox: 'Несколько вариантов',
		imagepicker: 'Выбор изображения',
		html: 'HTML контент',
	};

	return (
		<div className='max-w-7xl mx-auto px-4 py-10'>
			<Card className='rounded-2xl shadow p-8 bg-white'>
				<Title level={2} className='mb-6'>
					Конструктор теста
				</Title>

				<div className='mb-8'>
					<Text strong className='block mb-2'>
						Название теста:
					</Text>
					<Input
						placeholder='Введите название теста'
						value={title}
						onChange={onTitleChange}
						size='large'
					/>
				</div>

				<Title level={3} className='mb-4'>
					Вопросы
				</Title>

				{pages.map(page => (
					<Card
						key={page.name}
						className='mb-6 bg-gray-50 rounded-xl shadow-sm'
						title={
							<Input
								placeholder='Заголовок вопроса'
								value={page.title || ''}
								onChange={e => onPageTitleChange(page.name, e.target.value)}
								size='large'
								className='font-semibold'
							/>
						}
						extra={
							<Popconfirm
								title='Вы уверены, что хотите удалить вопрос?'
								onConfirm={() => handleRemovePage(page.name)}
								okText='Да'
								cancelText='Нет'
							>
								<Button
									type='text'
									danger
									size='middle'
									icon={<DeleteOutlined />}
								>
									Удалить
								</Button>
							</Popconfirm>
						}
					>
						{page.elements.map(question => (
							<Card
								key={question.name}
								className='mb-6 rounded-md bg-white shadow-inner p-6'
							>
								<Space
									direction='vertical'
									size='middle'
									style={{ width: '100%' }}
								>
									<Space
										direction='vertical'
										size='small'
										style={{ width: '100%' }}
									>
										<Text strong>Тип вопроса:</Text>
										<Select
											value={question.type}
											onChange={value =>
												onQuestionChange(
													page.name,
													question.name,
													'type',
													value
												)
											}
											size='middle'
											className='w-60'
										>
											{Object.entries(questionTypeLabels).map(
												([key, label]) => (
													<Option key={key} value={key}>
														{label}
													</Option>
												)
											)}
										</Select>
									</Space>

									{question.type !== 'html' ? (
										<Space
											direction='vertical'
											size='small'
											style={{ width: '100%' }}
										>
											<Text strong className='block mb-1'>
												Название вопроса:
											</Text>
											<Input
												placeholder='Введите вопрос'
												value={question.title || ''}
												onChange={e =>
													onQuestionChange(
														page.name,
														question.name,
														'title',
														e.target.value
													)
												}
												size='middle'
												className='w-full'
											/>
										</Space>
									) : (
										<Space
											direction='vertical'
											size='small'
											style={{ width: '100%' }}
										>
											<Text strong className='block mb-1'>
												HTML контент:
											</Text>
											<Input.TextArea
												placeholder='<h3>Напишите HTML здесь</h3>'
												value={question.html || ''}
												onChange={e =>
													onQuestionChange(
														page.name,
														question.name,
														'html',
														e.target.value
													)
												}
												rows={5}
												className='w-full'
											/>
										</Space>
									)}

									{(question.type === 'radiogroup' ||
										question.type === 'checkbox' ||
										question.type === 'imagepicker') && (
										<Space
											direction='vertical'
											size='small'
											style={{ width: '100%' }}
										>
											<Text strong className='block mb-2'>
												Варианты ответов:
											</Text>
											<Space
												direction='vertical'
												size='small'
												style={{ width: '100%' }}
											>
												{question.choices?.map((choice, idx) => (
													<Space
														key={idx}
														align='start'
														wrap
														className='w-full'
													>
														<Input
															placeholder='Значение'
															value={choice.value}
															onChange={e =>
																updateChoice(
																	page.name,
																	question.name,
																	idx,
																	'value',
																	e.target.value
																)
															}
															size='middle'
															className='min-w-[150px]'
														/>
														{['radiogroup', 'checkbox'].includes(
															question.type
														) && (
															<Input
																placeholder='Текст'
																value={choice.text || ''}
																onChange={e =>
																	updateChoice(
																		page.name,
																		question.name,
																		idx,
																		'text',
																		e.target.value
																	)
																}
																size='middle'
																className='min-w-[150px]'
															/>
														)}
														{question.type === 'imagepicker' && (
															<Input
																placeholder='Ссылка на изображение'
																value={choice.imageLink || ''}
																onChange={e =>
																	updateChoice(
																		page.name,
																		question.name,
																		idx,
																		'imageLink',
																		e.target.value
																	)
																}
																size='middle'
																className='min-w-[150px]'
															/>
														)}
														<Button
															danger
															size='middle'
															onClick={() =>
																removeChoice(page.name, question.name, idx)
															}
														>
															✕
														</Button>
													</Space>
												))}
											</Space>

											<Button
												type='primary'
												size='middle'
												onClick={() =>
													dispatch(
														addChoice({
															pageId: page.name,
															questionId: question.name,
														})
													)
												}
												className='mt-4'
											>
												+ Добавить вариант
											</Button>

											<Space direction='vertical' size='small' className='mt-6'>
												<Text strong className='block mb-2'>
													Правильный ответ:
												</Text>
												{question.type === 'radiogroup' && (
													<Select
														className='w-72'
														value={question.correctAnswer || ''}
														onChange={value =>
															onCorrectAnswerChange(
																page.name,
																question.name,
																value
															)
														}
														placeholder='-- выберите правильный вариант --'
														size='middle'
													>
														{question.choices?.map((choice, idx) => (
															<Option key={idx} value={choice.value}>
																{choice.text || choice.value}
															</Option>
														))}
													</Select>
												)}

												{question.type === 'checkbox' && (
													<CheckboxCorrectAnswerSelector
														choices={question.choices || []}
														correctAnswers={question.correctAnswer || []}
														onChange={selected =>
															onCorrectAnswerChange(
																page.name,
																question.name,
																selected
															)
														}
													/>
												)}

												{question.type === 'imagepicker' && (
													<Select
														className='w-72'
														value={question.correctAnswer || ''}
														onChange={value =>
															onCorrectAnswerChange(
																page.name,
																question.name,
																value
															)
														}
														placeholder='-- выберите правильный вариант --'
														size='middle'
													>
														{question.choices?.map((choice, idx) => (
															<Option key={idx} value={choice.value}>
																{choice.value}
															</Option>
														))}
													</Select>
												)}
											</Space>
										</Space>
									)}
								</Space>
							</Card>
						))}
					</Card>
				))}

				<div className='flex flex-wrap gap-4 mt-4'>
					<Button type='primary' onClick={handleAddPage}>
						+ Добавить вопрос
					</Button>

					<Popconfirm
						title='Вы уверены, что хотите сбросить тест?'
						okText='Сбросить'
						cancelText='Отмена'
						onConfirm={() => dispatch(resetState())}
					>
						<Button danger>Сбросить тест</Button>
					</Popconfirm>

					{state.isUpdate ? (
						<Popconfirm
							title='Вы уверены, что хотите обновить тест?'
							okText='Обновить'
							cancelText='Отмена'
							onConfirm={async () => {
								dispatch(generateSurveyJson());
								try {
									await dispatch(updateQuiz(state)).unwrap(); // unwrap, если RTK Query или createAsyncThunk
									message.success('Тест успешно обновлён!');
									navigate(RouteNames.QUIZ); // переход на "Ваши тесты"
								} catch {
									message.error('Ошибка при обновлении теста');
								}
							}}
						>
							<Button type='primary'>Обновить тест</Button>
						</Popconfirm>
					) : (
						<Button
							type='primary'
							onClick={async () => {
								dispatch(generateSurveyJson());
								try {
									await dispatch(saveQuiz(state)).unwrap();
									message.success('Тест успешно сохранён!');
									navigate(RouteNames.QUIZ); // переход на "Ваши тесты"
								} catch {
									message.error('Ошибка при сохранении теста');
								}
							}}
						>
							Сохранить тест
						</Button>
					)}
				</div>
			</Card>
		</div>
	);
};

type Choice = {
	value: string;
	text?: string;
	imageLink?: string;
};

type CheckboxCorrectAnswerSelectorProps = {
	choices: Choice[];
	correctAnswers: string[] | string;
	onChange: (values: string[]) => void;
};

// Компонент для выбора нескольких правильных ответов (checkbox)
const CheckboxCorrectAnswerSelector: React.FC<
	CheckboxCorrectAnswerSelectorProps
> = ({ choices, correctAnswers, onChange }) => {
	// Убедимся что correctAnswers — массив
	const selected = Array.isArray(correctAnswers) ? correctAnswers : [];

	const toggle = (value: string) => {
		if (selected.includes(value)) {
			onChange(selected.filter(v => v !== value));
		} else {
			onChange([...selected, value]);
		}
	};

	return (
		<Checkbox.Group
			value={selected}
			onChange={values => {
				values.forEach(val => {
					if (!selected.includes(val)) toggle(val); // Добавить
				});
				selected.forEach(val => {
					if (!values.includes(val)) toggle(val); // Удалить
				});
			}}
		>
			<div className='flex flex-wrap gap-3 mt-2'>
				{choices.map(choice => (
					<Checkbox key={choice.value} value={choice.value}>
						{choice.text || choice.value}
					</Checkbox>
				))}
			</div>
		</Checkbox.Group>
	);
};
