/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect } from 'react';
import {
	Button,
	Card,
	Form,
	Input,
	Typography,
	Layout,
	Select,
} from 'antd';
import { useAppSelector, useAppDispatch } from '../hooks/hooks';
import {
	setCourseField,
	removeLessonSection,
	saveCourse,
	updateSection,
	addNewSection,
	addLessonToSection,
	updateLesson,
} from '../store/reducers/courses/courseReducer';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { getAllQuizzes } from '../store/reducers/quiz/quizThunks';
// import { updateLesson } from '../store/reducers/lessons/lessonReducer';

const { Title } = Typography;

export const CourseBuilder = () => {
	const dispatch = useAppDispatch();
	useEffect(() => {
		// dispatch(loadMock());
		dispatch(getAllQuizzes());
	}, [dispatch]);
	const course = useAppSelector(state => state.course);
	const { sections } = useAppSelector(state => state.course); // FIXME: обьеденить в один useAppSelector(course) и достать только то что используем

	const lessons = useAppSelector(state => state.lesson.lessons);

	const quizzes = useAppSelector(state => state.quiz.quizzes);

	const [form] = Form.useForm();

	const handleChange = (field: keyof typeof course, value: string) => {
		dispatch(setCourseField({ field, value }));
	};

	const handleSave = () => {
		dispatch(
			saveCourse({
				id: course.id,
				title: course.title,
				description: course.description,
				teacherId: course.teacherId,
				sections: sections,
				isSaving: false,
				saveError: null,
				isLoading: false,
				isUpdate: false,
				// quizzes: quizzes.map(q => q.id),
			})
		);
	};

	useEffect(() => {
		form.setFieldsValue({
			title: course.title,
			description: course.description,
		});
	}, [course.title, course.description]);

	return (
		<Layout className='p-6 max-w-5xl mx-auto'>
			<Title level={2}>Создание курса</Title>

			<Form
				form={form}
				layout='vertical'
				onValuesChange={(changed, _all) => {
					if ('title' in changed) handleChange('title', changed.title);
					if ('description' in changed)
						handleChange('description', changed.description);
				}}
			>
				<Form.Item
					label='Название курса'
					name='title'
					rules={[{ required: true }]}
				>
					<Input placeholder='Введите название' className='rounded-xl' />
				</Form.Item>

				<Form.Item label='Описание курса' name='description'>
					<Input.TextArea
						rows={4}
						placeholder='Описание курса'
						className='rounded-xl'
					/>
				</Form.Item>
			</Form>

			<Title level={4}>Разделы курса</Title>

			{sections?.map((section, index) => (
				<Card
					key={section.id}
					title={`Раздел ${index + 1}`}
					className='mb-4 rounded-xl shadow'
					extra={
						<Button
							type='text'
							danger
							icon={<DeleteOutlined />}
							onClick={() =>
								dispatch(removeLessonSection(section.id as number))
							}
						/>
					}
				>
					<Input
						className='mb-3'
						placeholder='Название раздела'
						value={section.title}
						onChange={e =>
							dispatch(
								updateSection({
									sectionId: section.id as number,
									data: {
										title: e.target.value,
										// sectionId: section.id as number,
									},
								})
							)
						}
					/>

					<Title level={5}>Уроки</Title>

					{lessons.map((lesson, lIdx) => (
						<Input
							key={lIdx}
							className='mb-2'
							value={lesson.title}
							onChange={title =>
								dispatch(
									updateLesson({
										sectionId: section.id as number,
										data: {
											title: title.target.value,
											// sectionId: section.id as number,
										},
									})
								)
							}
							placeholder={`Урок ${lIdx + 1}`}
						/>
					))}
					<Button
						type='dashed'
						block
						className='my-2'
						onClick={() => {
							// dispatch(
							// 	addLessonToSection({
							// 		sectionId: section.id as number,
							// 		lesson: {
							// 			id: 12,
							// 			html: 'New html',
							// 			title: 'Новый урок',
							// 			sectionId: section.id as number,
							// 			testId: null,
							// 		},
							// 	})
							// );
						}}
					>
						+ Добавить урок
					</Button>

					<Title level={5}>Тесты</Title>
					<Select
						mode='multiple'
						style={{ width: '100%' }}
						placeholder='Выберите тесты из списка'
						// value={section.testId}
						// onChange={selectedTestId => {
						// 	// dispatch(
						// 	// 	updateSection({
						// 	// 		sectionId: section.id as number,
						// 	// 		data: {
						// 	// 			testId: selectedTestId, // ✅ вот что нужно!
						// 	// 		},
						// 	// 	})
						// 	// );
						// }}
						optionFilterProp='label'
					>
						{quizzes.map(quiz => (
							<Select.Option
								key={quiz.id}
								value={quiz.id}
								label={quiz.surveyJson.title || `Тест #${quiz.id}`}
							>
								{quiz.surveyJson.title || `Тест #${quiz.id}`}
							</Select.Option>
						))}
					</Select>
				</Card>
			))}

			<Button
				type='primary'
				icon={<PlusOutlined />}
				className='rounded-xl my-4'
				onClick={() => {
					dispatch(addNewSection());
				}}
			>
				Добавить раздел
			</Button>

			<Button
				type='default'
				onClick={handleSave}
				loading={course.isSaving}
				className='ml-4'
			>
				Сохранить курс
			</Button>
		</Layout>
	);
};
