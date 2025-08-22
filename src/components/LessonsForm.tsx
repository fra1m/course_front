import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
	Layout,
	Space,
	Typography,
	Button,
	Card,
	Result,
	Spin,
	App,
	Col,
	Row,
	Divider,
	Affix,
} from 'antd';
import {
	CheckCircleOutlined,
	LeftOutlined,
	ReadOutlined,
	RightOutlined,
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import {
	fetchLessonContent,
	getAllLessons,
} from '../store/reducers/lessons/lessonsThunks';
import { RouteNames } from '../routes';
import {
	GlobalWorkerOptions,
	getDocument,
	type PDFDocumentProxy,
	type RenderTask,
} from 'pdfjs-dist';

GlobalWorkerOptions.workerSrc = new URL(
	'pdfjs-dist/build/pdf.worker.mjs',
	import.meta.url
).toString();

const { Content } = Layout;
const { Title, Text } = Typography;

export default function LessonsForm() {
	const { message } = App.useApp?.() ?? { message: { error: console.error } };

	const { id } = useParams<{ id: string }>();
	const lessonId = Number(id);
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	const lessons = useAppSelector(s => s.lesson.lessons);
	const lesson = useMemo(
		() => lessons?.find(l => Number(l.id) === lessonId),
		[lessons, lessonId]
	);

	const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
	const [page, setPage] = useState<number>(1);
	const [loading, setLoading] = useState<boolean>(true);
	const [errText, setErrText] = useState<string | null>(null);

	// refs
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const containerRef = useRef<HTMLDivElement | null>(null);

	// текущая видимая ширина контейнера (под неё “вписываем” страницу)
	const [containerW, setContainerW] = useState<number>(0);

	// следим за размерами контейнера
	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		const ro = new ResizeObserver(entries => {
			const w = entries[0]?.contentRect?.width ?? el.clientWidth;
			setContainerW(Math.max(0, Math.floor(w)));
		});
		ro.observe(el);
		// первичная инициализация
		setContainerW(Math.max(0, Math.floor(el.clientWidth)));
		return () => ro.disconnect();
	}, []);

	// подгружаем список уроков при необходимости
	useEffect(() => {
		if (!lessons || lessons.length === 0) {
			dispatch(getAllLessons());
		}
	}, [dispatch, lessons]);

	// загрузка PDF (срез урока) → pdf.js
	useEffect(() => {
		let cancelled = false;

		(async () => {
			if (!lessonId || !lesson) return;
			setLoading(true);
			setErrText(null);
			setPdf(null);
			setPage(1);

			try {
				const ab = await dispatch(fetchLessonContent(lessonId)).unwrap();
				if (cancelled) return;

				const doc = await getDocument({ data: ab, cMapPacked: true }).promise;
				if (cancelled) return;

				setPdf(doc);
				setPage(1); // срез уже 1..N
			} catch (e) {
				if (cancelled) return;
				setErrText(e instanceof Error ? e.message : 'Ошибка загрузки PDF');
				message?.error?.('Не удалось загрузить материал урока');
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();

		return () => {
			cancelled = true;
			setPdf(null);
		};
	}, [lessonId, lesson, dispatch, message]);

	// рендер страницы в canvas с учётом DPR и ширины контейнера (максимально чётко)
	useEffect(() => {
		let cancelled = false;
		let activeTask: RenderTask | null = null;

		(async () => {
			if (!pdf || !canvasRef.current || !containerW) return;

			const p = await pdf.getPage(page);

			// базовый вьюпорт без масштабирования
			const base = p.getViewport({ scale: 1 });

			// вписываем по ширине контейнера
			const cssScale = containerW / base.width;

			// итоговый CSS-вьюпорт (в логических пикселях)
			const viewport = p.getViewport({ scale: cssScale });

			// физический DPR (для Windows это ключ к чёткому тексту)
			const dpr = window.devicePixelRatio || 1;

			const canvas = canvasRef.current;
			const ctx = canvas.getContext('2d');
			if (!ctx) return;

			// физическое разрешение полотна (домножаем на DPR)
			canvas.width = Math.max(1, Math.floor(viewport.width * dpr));
			canvas.height = Math.max(1, Math.floor(viewport.height * dpr));

			// CSS-размеры (отображение) — без DPR
			canvas.style.width = `${Math.floor(viewport.width)}px`;
			canvas.style.height = `${Math.floor(viewport.height)}px`;

			// некоторые браузеры лучше рендерят с выключенным сглаживанием растров,
			// но pdf.js в основном рисует вектор/глифы — оставим high на всякий случай.
			ctx.imageSmoothingEnabled = true;
			ctx.imageSmoothingQuality = 'high';

			// Очень важно: передаём transform с DPR, а НЕ умножаем scale
			const transform = dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined;

			// можно отменять предыдущий рендер при быстром ресайзе/перелистывании
			activeTask = p.render({
				canvasContext: ctx,
				canvas,
				viewport,
				transform,
				intent: 'display',
				annotationMode: 0, // без аннотаций
			});

			try {
				await activeTask.promise;
			} catch {
				// pdf.js при отмене рендера кидает RenderingCancelledException — игнорируем
			}

			if (cancelled) {
				return;
			}
		})();

		return () => {
			cancelled = true;
			if (activeTask) {
				try {
					activeTask.cancel();
				} catch {
					/* no-op */
				}
			}
		};
	}, [pdf, page, containerW]);

	const totalPages = pdf?.numPages ?? 0;
	const displayIndex = page;
	const canPrev = displayIndex > 1;
	const canNext = totalPages > 0 && displayIndex < totalPages;

	const prev = () => setPage(p => Math.max(1, p - 1));
	const next = () => setPage(p => Math.min(totalPages, p + 1));

	const onGoQuiz = () => {
		const testId = (lesson as unknown as { testId?: number })?.testId;
		if (!testId) return;
		navigate(RouteNames.QUIZ, { state: { id: testId } });
	};

	return (
		<Layout className='h-screen'>
			<Content className='p-6 bg-gray-50  '>
				{!lesson ? (
					<Spin spinning tip='Загрузка урока...' />
				) : (
					<Space direction='vertical' size={16} className='w-full'>
						<Space direction='vertical' size={8} className='w-full'>
							<Row justify='center' align='middle' gutter={8}>
								<Col>
									<ReadOutlined className='text-2xl text-indigo-500' />
								</Col>
								<Col>
									<Title
										level={3}
										className='!mb-0 m-0 text-center bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-500 bg-clip-text text-transparent'
										ellipsis={{
											rows: 2,
											tooltip: lesson.title || `Урок #${lessonId}`,
										}}
									>
										{lesson.title || `Урок #${lessonId}`}
									</Title>
								</Col>
							</Row>

							<Divider
								className='!my-2 max-w-3xl mx-auto'
								style={{ borderColor: 'rgba(99,102,241,0.25)' }}
							/>
						</Space>

						{errText && (
							<Result
								status='error'
								title='Не удалось загрузить PDF'
								subTitle={errText}
							/>
						)}

						<Spin spinning={loading && !pdf} tip='Загрузка файла…'>
							<Row justify='center'>
								<Col xs={24} md={18} lg={12}>
									<Card
										variant='outlined'
										styles={{ body: { padding: 0 } }}
										className='select-none'
										onContextMenu={e => e.preventDefault()}
									>
										<div ref={containerRef}>
											{pdf && (
												<canvas
													ref={canvasRef}
													style={{
														width: '100%',
														height: '100%',
														display: 'block',
													}}
													draggable={false}
													onContextMenu={e => e.preventDefault()}
												/>
											)}
										</div>

										<Affix offsetBottom={16}>
											<Row justify='center' className='px-4'>
												<Col>
													<Card
														size='small'
														className='rounded-2xl shadow-xl border-none backdrop-blur-md bg-white/85 dark:bg-slate-900/70'
														styles={{ body: { padding: 12 } }}
													>
														<Row align='middle' gutter={12} wrap={false}>
															<Col>
																<Space
																	align='center'
																	size='middle'
																	wrap={false}
																>
																	<Button
																		icon={<LeftOutlined />}
																		onClick={prev}
																		disabled={!pdf || !canPrev}
																	>
																		Предыдущая
																	</Button>

																	<Text type='secondary'>
																		{pdf
																			? `${displayIndex} / ${totalPages}`
																			: '-- / --'}
																	</Text>

																	<Button
																		icon={<RightOutlined />}
																		onClick={next}
																		disabled={!pdf || !canNext}
																	>
																		Следующая
																	</Button>
																</Space>
															</Col>

															{lesson?.testId &&
																displayIndex === totalPages && (
																	<Col
																		flex='0 0 auto' /* правый блок — автоширина, прижат вправо */
																	>
																		<Button
																			type='primary'
																			icon={<CheckCircleOutlined />}
																			onClick={onGoQuiz}
																		>
																			Пройти тест
																		</Button>
																	</Col>
																)}
														</Row>
													</Card>
												</Col>
											</Row>
										</Affix>
									</Card>
								</Col>
							</Row>
						</Spin>
					</Space>
				)}
			</Content>
		</Layout>
	);
}
