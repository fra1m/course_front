// LessonsPage.tsx
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import { Card, List, Button, Modal, Typography, Empty, Spin } from 'antd';
import { getAllLessons } from '../store/reducers/lessons/lessonsThunks';
import { getAllQuizzes } from '../store/reducers/quiz/quizThunks';

const { Title, Text } = Typography;

export const LessonsPage = () => {
	const dispatch = useAppDispatch();
	const { lessons, isLoading } = useAppSelector(s => s.lesson);
	const [selected, setSelected] = useState<{
		title: string;
		url: string;
	} | null>(null);

	useEffect(() => {
		dispatch(getAllQuizzes());
		dispatch(getAllLessons());
	}, [dispatch]);

	return (
		<div className='p-6'>
			<Title level={2} className='!mb-6 text-center text-blue-800'>
				Уроки
			</Title>

			{isLoading ? (
				<div className='flex justify-center py-10'>
					<Spin />
				</div>
			) : lessons.length === 0 ? (
				<Empty description='Нет уроков' />
			) : (
				<List
					grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4 }}
					dataSource={lessons}
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					renderItem={(lesson: any) => (
						<List.Item>
							<Card
								className='rounded-xl shadow-lg hover:shadow-2xl transition-shadow'
								title={<span className='text-blue-700'>{lesson.title}</span>}
								extra={
									<Text type='secondary'>
										{lesson.pages?.startWith}–{lesson.pages?.end} стр.
									</Text>
								}
								actions={[
									<Button
										type='primary'
										onClick={() =>
											setSelected({
												title: lesson.title,
												url: lesson.contentUrl,
											})
										}
									>
										Просмотр
									</Button>,
								]}
							></Card>
						</List.Item>
					)}
				/>
			)}

			<Modal
				open={!!selected}
				onCancel={() => setSelected(null)}
				footer={null}
				centered
				width='90%' // шире
				styles={{ body: { padding: 0, height: '85vh' } }} // выше и без паддингов
			>
				{selected && (
					<iframe
						src={selected.url + '#toolbar=0'} // скрыть тулбар браузера (частично)
						className='w-full h-[80vh] border-0 rounded-b-xl'
						title={selected.title}
					/>
				)}
			</Modal>
		</div>
	);
};
