// src/pages/QuizPage.tsx
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/hooks';
import { useThemeMode } from '../hooks/useThemeMode';

import { useEffect, useMemo, useRef, useState, type FC } from 'react';
import {
	Card,
	Typography,
	Space,
	Row,
	Col,
	Tag,
	Progress,
	Button,
	Result,
	Divider,
	Avatar,
} from 'antd';
import {
	FileTextOutlined,
	ReloadOutlined,
	ArrowLeftOutlined,
	ArrowRightOutlined,
} from '@ant-design/icons';

import { Model, type Question as SurveyQuestion } from 'survey-core';
import { Survey } from 'survey-react-ui';
import 'survey-core/survey-core.min.css';
import 'survey-core/i18n/russian';

import { PlainLight, PlainDark } from 'survey-core/themes';
import type { ILesson } from '../models/course/ILesson';
import { RouteNames } from '../routes';

const { Title, Paragraph, Text } = Typography;

type QWithHelpers = SurveyQuestion & {
	isEmpty?: () => boolean;
	value?: unknown;
};

function hasIsAnswerCorrect(
	q: SurveyQuestion
): q is SurveyQuestion & { isAnswerCorrect: () => boolean } {
	return (
		typeof (q as { isAnswerCorrect?: () => boolean }).isAnswerCorrect ===
		'function'
	);
}
const isAnswered = (q: QWithHelpers) =>
	typeof q.isEmpty === 'function'
		? !q.isEmpty()
		: q.value !== undefined && q.value !== null && q.value !== '';

function applySurveyVars(host: HTMLElement | null) {
	if (!host) return;
	const vars: Record<string, string> = {
		'--sjs-corner-radius': '12px',
		'--sjs-font-size': '16px',
	};
	Object.entries(vars).forEach(([k, v]) => host.style.setProperty(k, v));
}

function readTheme(): 'light' | 'dark' {
	return (
		(document.documentElement.getAttribute('data-ui-theme') as
			| 'light'
			| 'dark') || 'light'
	);
}

export const QuizPage: FC = () => {
	const { state } = useLocation();
	const navigate = useNavigate();
	const quizId = state?.id as number | undefined;

	const quiz = useAppSelector(s => s.quiz.quizzes.find(q => q.id === quizId));
	const lessons = useAppSelector(s => s.lesson.lessons);

	const currentLesson = useMemo<ILesson | undefined>(() => {
		if (!Array.isArray(lessons) || !quizId) return undefined;

		return lessons.find((l: ILesson) => l.testId === Number(quizId));
	}, [lessons, quizId]);

	// все уроки того же курса, отсортированные по id
	const siblings = useMemo<ILesson[]>(() => {
		if (!currentLesson || !Array.isArray(lessons)) return [];
		return lessons
			.filter(
				l => Number((l as ILesson).courseId) === Number(currentLesson.courseId)
			)
			.sort((a, b) => Number(a.id) - Number(b.id));
	}, [lessons, currentLesson]);

	// следующий урок
	const nextLesson = useMemo<ILesson | undefined>(() => {
		if (!currentLesson || siblings.length === 0) return undefined;
		const idx = siblings.findIndex(l => l.id === currentLesson.id);
		return idx >= 0 ? siblings[idx + 1] : undefined;
	}, [siblings, currentLesson]);

	const [percent, setPercent] = useState<number | null>(null);
	const [correctCount, setCorrectCount] = useState(0);
	const [totalCount, setTotalCount] = useState(0);
	const [answeredCount, setAnsweredCount] = useState(0);

	const { mode } = useThemeMode();
	const isDark = mode === 'dark';

	const themeHostRef = useRef<HTMLDivElement | null>(null);
	useEffect(() => {
		applySurveyVars(themeHostRef.current);
	}, [isDark]);

	const [themeKey, setThemeKey] = useState<'light' | 'dark'>(readTheme());

	// создаём модель
	const survey = useMemo(() => {
		if (!quiz) return null;
		const m = new Model(quiz.surveyJson);
		m.locale = 'ru';

		m.getAllQuestions().forEach(q => {
			q.isRequired = true;
			q.requiredErrorText ||= 'Выберите минимум один вариант ответа';
		});
		m.showProgressBar =
			quiz.surveyJson.showProgressBar &&
			quiz.surveyJson.showProgressBar !== 'none'
				? quiz.surveyJson.showProgressBar
				: 'top';
		m.showNavigationButtons = true;
		return m;
	}, [quiz]);

	// первичное применение темы (по атрибуту на <html>)
	useEffect(() => {
		if (!survey) return;
		const dark = readTheme() === 'dark';
		survey.applyTheme(dark ? PlainDark : PlainLight);
		setThemeKey(dark ? 'dark' : 'light');
	}, [survey]);

	// реакция на глобальное событие
	useEffect(() => {
		if (!survey) return;
		const handler = (e: Event) => {
			const next = (e as CustomEvent).detail as 'light' | 'dark' | undefined;
			const mode = next ?? readTheme();
			survey.applyTheme(mode === 'dark' ? PlainDark : PlainLight);
			setThemeKey(mode); // форсим ремоунт Survey ниже
		};
		window.addEventListener('ui-themechange', handler);
		return () => window.removeEventListener('ui-themechange', handler);
	}, [survey]);

	useEffect(() => {
		if (!survey) return;

		const recomputeAnswered = () => {
			const all = survey.getAllQuestions() as QWithHelpers[];
			setAnsweredCount(all.filter(isAnswered).length);
			setTotalCount(all.length);
		};

		recomputeAnswered();

		const onChange = () => recomputeAnswered();
		survey.onValueChanged.add(onChange);
		survey.onCurrentPageChanged.add(onChange);

		const onComplete = (s: Model) => {
			let correct = 0;
			let total = 0;
			s.getAllQuestions().forEach(q => {
				if (hasIsAnswerCorrect(q)) {
					total++;
					if (q.isAnswerCorrect()) correct++;
				}
			});
			setCorrectCount(correct);
			setTotalCount(total);
			setPercent(total > 0 ? Math.round((correct / total) * 100) : 0);
		};
		survey.onComplete.add(onComplete);

		return () => {
			survey.onValueChanged.remove(onChange);
			survey.onCurrentPageChanged.remove(onChange);
			survey.onComplete.remove(onComplete);
		};
	}, [survey]);

	const totalQuestions = useMemo(() => {
		const pages = quiz?.surveyJson?.pages ?? [];
		let sum = 0;
		for (const p of pages) sum += p.elements?.length ?? 0;
		return sum;
	}, [quiz]);

	if (!quiz) {
		return (
			<Row justify='center' className='p-6'>
				<Col xs={24} sm={22} md={18} lg={14}>
					<Card className='rounded-2xl shadow-lg'>
						<Result
							status='404'
							title='Тест не найден'
							subTitle='Возможно, его удалили или вы перешли по неверной ссылке.'
							extra={
								<Button type='primary' onClick={() => navigate(-1)}>
									Назад
								</Button>
							}
						/>
					</Card>
				</Col>
			</Row>
		);
	}

	const handleRestart = () => {
		setPercent(null);
		setCorrectCount(0);
		setTotalCount(0);
		if (survey) {
			survey.clear(false);
			survey.currentPageNo = 0;
			survey.mode = 'edit';
		}
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	return (
		<Row justify='center' className='px-6 py-8' ref={themeHostRef}>
			<Col xs={24} xl={20} xxl={16}>
				<Card
					className='rounded-3xl shadow-xl border-0 bg-white/90 backdrop-blur'
					styles={{ body: { padding: 24 } }}
					title={
						<Row align='middle' gutter={12} wrap={false}>
							<Col>
								<Avatar
									shape='square'
									size={44}
									className='shadow-md'
									style={{
										background:
											'linear-gradient(135deg, rgba(59,130,246,1) 0%, rgba(79,70,229,1) 100%)',
									}}
									icon={<FileTextOutlined className='text-white' />}
								/>
							</Col>
							<Col flex='auto'>
								<Space direction='vertical' size={0} className='w-full'>
									<Space size='small' align='center' wrap>
										<Tag color='blue'>{totalQuestions} вопрос(ов)</Tag>
										{percent === null && (
											<Tag>
												{answeredCount} / {totalCount} отвечено
											</Tag>
										)}
									</Space>
								</Space>
							</Col>
							<Col flex='none'>
								<Button
									icon={<ArrowLeftOutlined />}
									onClick={() => navigate(-1)}
								>
									Назад
								</Button>
							</Col>
						</Row>
					}
				>
					{percent === null && (
						<>
							<Progress
								percent={
									totalCount
										? Math.round((answeredCount / totalCount) * 100)
										: 0
								}
								status='active'
								size='small'
								showInfo={false}
								strokeColor={{ from: '#3b82f6', to: '#6366f1' }}
								trailColor='#eef2ff'
								className='mb-4'
							/>
							<Divider className='!my-3' />
						</>
					)}

					{percent === null && survey ? (
						<Row justify='center'>
							<Col xs={24} sm={22} md={20} lg={18} xl={16}>
								<Survey key={themeKey} model={survey} />
							</Col>
						</Row>
					) : (
						<Row gutter={[24, 24]} justify='center'>
							<Col xs={24} sm={22} md={18}>
								<Card className='rounded-2xl shadow-lg border-0'>
									<Row gutter={[24, 24]} align='middle' wrap={false}>
										<Col flex='none'>
											<Progress
												type='dashboard'
												percent={percent ?? 0}
												strokeColor={{ from: '#3b82f6', to: '#6366f1' }}
												trailColor='#eef2ff'
											/>
										</Col>
										<Col flex='auto'>
											<Space direction='vertical' size={8} className='w-full'>
												<Title level={3} className='!mb-1'>
													Результат
												</Title>
												<Paragraph className='!mb-2'>
													Вы набрали <Text strong>{percent}%</Text> правильных
													ответов.
												</Paragraph>
												<Text type='secondary'>
													Правильных: <Text strong>{correctCount}</Text> из{' '}
													<Text strong>{totalCount}</Text>
												</Text>
												<Space size='middle' className='mt-2'>
													<Button
														type='primary'
														icon={<ReloadOutlined />}
														onClick={handleRestart}
													>
														Пройти заново
													</Button>
													<Button
														icon={<ArrowLeftOutlined />}
														onClick={() => navigate(-1)}
													>
														Вернуться к курсу
													</Button>

													{nextLesson && (
														<Button
															type='primary'
															ghost
															icon={<ArrowRightOutlined />}
															onClick={() =>
																navigate(
																	RouteNames.LESSON_VIEW.replace(
																		':id',
																		String(nextLesson.id)
																	)
																)
															}
														>
															Следующий урок
														</Button>
													)}
												</Space>
											</Space>
										</Col>
									</Row>
								</Card>
							</Col>
						</Row>
					)}
				</Card>
			</Col>
		</Row>
	);
};
