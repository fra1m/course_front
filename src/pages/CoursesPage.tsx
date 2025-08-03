//TODO: сделать логику страницы + pdf
//TODO: сделать страницу формы для урока

import { useState, type FC } from 'react';
import { Layout, Menu, Button, Card, Collapse, message, Col } from 'antd';
import {
	MenuFoldOutlined,
	MenuUnfoldOutlined,
	PlayCircleOutlined,
	FileTextOutlined,
} from '@ant-design/icons';
import { useAppDispatch } from '../hooks/hooks';
import { getHTML } from '../store/reducers/lessons/lessonsThunks';

const { Sider, Content } = Layout;
const { Panel } = Collapse;

// Типы
interface Section {
	id: string;
	title: string;
	lessons: string[];
	tests: string[];
}

interface Course {
	id: string;
	title: string;
	description: string;
	lessons: Section[];
}

// Заглушки
const mockCourses: Course[] = [
	{
		id: '1',
		title: 'Курс по JavaScript',
		description: 'Основы языка JavaScript от переменных до замыканий.',
		lessons: [
			{
				id: 's1',
				title: 'Введение',
				lessons: ['Что такое JS', 'Переменные'],
				tests: ['Тест 1'],
			},
			{
				id: 's2',
				title: 'Функции',
				lessons: ['Функции', 'Стрелочные функции'],
				tests: ['Тест 2'],
			},
		],
	},
	{
		id: '2',
		title: 'Курс по React',
		description: 'React с нуля: компоненты, хуки, маршрутизация.',
		lessons: [
			{
				id: 's3',
				title: 'Основы React',
				lessons: ['JSX', 'useState'],
				tests: ['Тест по основам'],
			},
		],
	},
];

export const CoursesPage: FC = () => {
	const dispatch = useAppDispatch();

	const [collapsed, setCollapsed] = useState(false);
	const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

	const selectedCourse = mockCourses.find(c => c.id === selectedCourseId);

	return (
		<Layout className='h-screen'>
			<Sider
				collapsible
				collapsed={collapsed}
				onCollapse={value => setCollapsed(value)}
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
					onClick={({ key }) => setSelectedCourseId(key)}
					items={mockCourses.map(course => ({
						key: course.id,
						label: course.title,
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

							<Card title={selectedCourse.title} className='mb-6'>
								<Col>{selectedCourse.description}</Col>
							</Card>

							<Collapse accordion>
								{selectedCourse.lessons.map(section => (
									<Panel header={section.title} key={section.id}>
										<div className='mb-4'>
											<h4 className='font-semibold'>Уроки:</h4>
											<div className='flex flex-wrap gap-2 mt-2'>
												{section.lessons.map((lesson, idx) => (
													<Button
														key={idx}
														icon={<PlayCircleOutlined />}
														onClick={() => {
															dispatch(getHTML());
															message.info(`Открыт урок: ${lesson}`);
														}}
													>
														{lesson}
													</Button>
												))}
											</div>
										</div>
										<div>
											<h4 className='font-semibold'>Тесты:</h4>
											<div className='flex flex-wrap gap-2 mt-2'>
												{section.tests.map((test, idx) => (
													<Button
														key={idx}
														icon={<FileTextOutlined />}
														type='dashed'
														onClick={() => message.info(`Открыт тест: ${test}`)}
													>
														{test}
													</Button>
												))}
											</div>
										</div>
									</Panel>
								))}
							</Collapse>
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
