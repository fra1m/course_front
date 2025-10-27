//NOTE взоможно не нужен или тогда переделать дизайн
import { useEffect, useState, type FC } from 'react';
import {
	Button,
	Card,
	Typography,
	Spin,
	Alert,
	Layout,
	Row,
	Col,
	Space,
} from 'antd';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import { SharpLight } from 'survey-core/themes';
import 'survey-core/survey-core.css';

import { useAppSelector, useAppDispatch } from '../../hooks/hooks';
import {
	deleteQuiz,
	getAllQuizzes,
} from '../../store/reducers/quiz/quizThunks';
import { setQuizForEdit } from '../../store/reducers/quiz/quizReducer';
import { useNavigate } from 'react-router-dom';
import { RouteNames } from '../../routes';

const { Title } = Typography;
const { Content } = Layout;
// TODO: мб надо survey.startTimer() и  survey.stopTimer();

export const QuizzesPage: FC = () => {
	const quizzes = useAppSelector(state => state.quiz.quizzes);
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	const [selectedQuizIndex, setSelectedQuizIndex] = useState<number | null>(
		null
	);
	const [surveyModel, setSurveyModel] = useState<Model | null>(null);

	useEffect(() => {
		dispatch(getAllQuizzes());
	}, [dispatch]);

	useEffect(() => {
		if (
			selectedQuizIndex !== null &&
			Array.isArray(quizzes) &&
			quizzes[selectedQuizIndex]
		) {
			const model = new Model(quizzes[selectedQuizIndex].surveyJson);
			model.applyTheme(SharpLight);
			setSurveyModel(model);
		}
	}, [selectedQuizIndex, quizzes]);

	if (!quizzes) {
		return (
			<Layout className='min-h-screen'>
				<Content className='flex justify-center items-center'>
					<Spin tip='Загрузка тестов...' size='large' fullscreen />
				</Content>
			</Layout>
		);
	}

	if (!Array.isArray(quizzes)) {
		return (
			<Layout className='min-h-screen'>
				<Content className='flex justify-center items-center'>
					<Alert message='Ошибка загрузки тестов' type='error' showIcon />
				</Content>
			</Layout>
		);
	}

	return (
		<Layout className='min-h-screen bg-gray-100'>
			<Content style={{ padding: '40px 24px' }}>
				<div style={{ maxWidth: '1000px', margin: '0 auto' }}>
					{selectedQuizIndex === null ? (
						<Space direction='vertical' size='large' className='w-full'>
							<Title
								level={2}
								className='!text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 text-center'
							>
								🧠 Выберите тест
							</Title>

							{quizzes.length === 0 ? (
								<Alert message='Нет доступных тестов' type='info' />
							) : (
								<Row gutter={[24, 24]}>
									{quizzes.map((quiz, idx) => (
										<Col key={quiz.id ?? idx} xs={24} sm={12}>
											<Card
												hoverable
												className='rounded-2xl transition-transform hover:scale-105'
												style={{
													background:
														'linear-gradient(to right, #6366F1, #A855F7, #EC4899)',
													color: 'white',
												}}
											>
												<div
													className='cursor-pointer'
													onClick={() => {
														setSelectedQuizIndex(idx);
													}}
												>
													<Title
														level={4}
														className='!text-white m-0 hover:underline transition-all duration-150'
													>
														{quiz.surveyJson.title || `Тест #${idx + 1}`}
													</Title>
												</div>

												<div className='mt-4 flex justify-end gap-2'>
													<Button
														className='bg-white text-indigo-700 border-none hover:bg-gray-100'
														size='middle'
														type='default'
														onClick={() => {
															dispatch(setQuizForEdit(quiz));
															navigate(RouteNames.QUIZ_BUILDER);
														}}
													>
														✏️ Редактировать
													</Button>

													<Button
														size='middle'
														danger
														onClick={async () => {
															dispatch(setQuizForEdit(quiz));
															await dispatch(deleteQuiz(quiz)).unwrap(); // TODO: чтобы не перенагружать сервер, добавить возврат всех оставшихся квизов ??????
															dispatch(getAllQuizzes());

															// navigate(RouteNames.QUIZZES);
														}}
														className='bg-white text-red-600 border-none hover:bg-red-100'
													>
														🗑️ Удалить
													</Button>
												</div>
											</Card>
										</Col>
									))}
								</Row>
							)}
						</Space>
					) : (
						<Card className='rounded-2xl animate-fade-in'>
							<div className='mb-6'>
								<Button onClick={() => setSelectedQuizIndex(null)}>
									← Назад к списку тестов
								</Button>
							</div>

							{surveyModel ? (
								<Survey model={surveyModel} />
							) : (
								<Spin tip='Загрузка тестов...' fullscreen />
							)}
						</Card>
					)}
				</div>
			</Content>
		</Layout>
	);
};
