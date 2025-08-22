import {
	Card,
	List,
	Empty,
	Skeleton,
	Col,
	Layout,
	Row,
	Typography,
	Avatar,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import { RouteNames } from '../routes';
import { useEffect, useMemo } from 'react';
import { setSelectedCourseId } from '../store/reducers/courses/courseReducer';
import { getAllLessons } from '../store/reducers/lessons/lessonsThunks';
import { getAllQuizzes } from '../store/reducers/quiz/quizThunks';
import { Content } from 'antd/es/layout/layout';
import { BookOutlined } from '@ant-design/icons';

import type { ICourse } from '../models/course/ICourse';
import { getAllCourses } from '../store/reducers/courses/courseThunks';
const { Title, Paragraph } = Typography;

export const HomePage = () => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	useEffect(() => {
		dispatch(getAllCourses()); // курсы
		dispatch(getAllQuizzes()); // тесты
		dispatch(getAllLessons()); // уроки
	}, [dispatch]);

	const { courses, isLoading } = useAppSelector(s => s.course);
	const { isAuth, name } = useAppSelector(s => s.user);

	// мемо, чтобы не дёргать ререндер без надобности
	const data = useMemo(() => courses ?? [], [courses]);

	const openCourse = (id: number) => {
		dispatch(setSelectedCourseId(id));
		navigate(RouteNames.COURSES);
	};

	return (
		<Layout>
			<Content className='w-full max-w-5xl mx-auto px-6 py-12'>
				<Title
					level={2}
					className='!mb-2 bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent'
				>
					Добро пожаловать{isAuth && `, ${name}`}!
				</Title>

				<Paragraph className='text-gray-700 text-base max-w-[640px] !mb-10 leading-7'>
					Это ваша домашняя страница. Ниже — все доступные курсы.
				</Paragraph>

				{isLoading && (
					<Row gutter={[24, 24]}>
						{Array.from({ length: 6 }).map((_, i) => (
							<Col xs={24} sm={12} md={8} key={i}>
								<Card className='rounded-2xl shadow-sm'>
									<Skeleton active paragraph={{ rows: 3 }} />
								</Card>
							</Col>
						))}
					</Row>
				)}

				{!isLoading && data.length === 0 && (
					<Row justify='center' className='py-16'>
						<Col>
							<Empty description='Пока нет курсов' />
						</Col>
					</Row>
				)}

				{!isLoading && data.length > 0 && (
					<List
						grid={{ gutter: 24, xs: 1, sm: 2, md: 3 }}
						dataSource={data}
						renderItem={(course: ICourse, idx: number) => {
							const gradients = [
								'from-rose-500/20 via-orange-400/15 to-amber-300/15',
								'from-indigo-500/20 via-sky-400/15 to-cyan-300/15',
								'from-emerald-500/20 via-teal-400/15 to-lime-300/15',
							];
							const bg = gradients[idx % gradients.length];

							return (
								<List.Item key={course.id}>
									<Card
										hoverable
										onClick={() => openCourse(course.id)}
										className='w-[300px] overflow-hidden rounded-2xl transition-shadow bg-white shadow-sm hover:shadow-xl ring-1 ring-transparent hover:ring-indigo-200'
										styles={{ body: { padding: 16 } }}
										cover={
											<Row
												align='middle'
												justify='center'
												className={`h-[150px] w-full border-b border-gray-100 bg-gradient-to-br ${bg}`}
											>
												<Col>
													<Avatar
														shape='circle'
														size={72}
														className='backdrop-blur bg-white/80 shadow-md ring-1 ring-white/60'
														icon={
															// яркая иконка курса
															<BookOutlined
																twoToneColor='#fa541c'
																// style={{ fontSize: 36 }}
															/>
														}
													/>
												</Col>
											</Row>
										}
									>
										<Row
											className='h-full'
											style={{ display: 'flex', flexDirection: 'column' }}
											gutter={[0, 8]}
											wrap={false}
										>
											<Col>
												<Title
													level={5}
													ellipsis={{
														rows: 1,
														tooltip: course.title || 'Без названия',
													}}
													className='!mb-1'
												>
													{course.title || 'Без названия'}
												</Title>
											</Col>

											<Col>
												<Paragraph
													type='secondary'
													ellipsis={{
														rows: 2,
														tooltip:
															course.description || 'Описание отсутствует',
													}}
													className='!mb-0 text-gray-600 break-words'
												>
													{course.description || 'Описание отсутствует'}
												</Paragraph>
											</Col>

											<Col flex='auto' />
										</Row>
									</Card>
								</List.Item>
							);
						}}
					/>
				)}
			</Content>
		</Layout>
	);
};
