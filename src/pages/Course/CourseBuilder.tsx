// src/pages/CourseBuilder.tsx
import { useCallback, useEffect, useRef } from 'react';
import {
	Button,
	Card,
	Form,
	Input,
	Typography,
	Layout,
	Space,
	Select,
	type UploadFile,
} from 'antd';
import { useAppSelector, useAppDispatch } from '../../hooks/hooks';
import { setCourseField } from '../../store/reducers/courses/courseReducer';
import { InboxOutlined } from '@ant-design/icons';
import type { CourseState } from '../../store/reducers/courses/types';
import Dragger from 'antd/es/upload/Dragger';
import type { RcFile } from 'antd/es/upload';
import { createCourse } from '../../store/reducers/courses/courseThunks';
import { openPdfPreview } from '../../store/reducers/pdf/pdfThunk';
import {
	selectSpecializations,
	selectSpecializationsLoading,
	selectSpecializationOptions,
} from '../../store/reducers/specializations/specializationsReducer';
import { fetchSpecializations } from '../../store/reducers/specializations/specializationsThunks';

const { Title } = Typography;
const { Content } = Layout;

const normFile = (e: any) =>
	Array.isArray(e) ? e : e?.fileList?.slice(-1) ?? [];

export const CourseBuilder = () => {
	const dispatch = useAppDispatch();
	const course = useAppSelector(state => state.course);

	const [form] = Form.useForm();

	// ---- СПЕЦИАЛИЗАЦИИ ----
	const specs = useAppSelector(selectSpecializations);
	const specsLoading = useAppSelector(selectSpecializationsLoading);
	const specOptions = useAppSelector(selectSpecializationOptions);

	// загрузка 1 раз
	useEffect(() => {
		if (specs.length === 0) dispatch(fetchSpecializations());
	}, [dispatch, specs.length]);

	const didFetchSpecs = useRef(false);

	useEffect(() => {
		if (didFetchSpecs.current) return;
		didFetchSpecs.current = true;
	}, []);

	// заполняем поля формы из стора
	useEffect(() => {
		form.setFieldsValue({
			title: course.title ?? '',
			description: course.description ?? '',
			specializationId: course.specializationId ?? undefined,
			lessons: course.lessons ?? [],
		});
	}, [
		course.title,
		course.description,
		course.specializationId,
		course.lessons,
		form,
	]);

	const handleChange = useCallback(
		async (
			key: keyof CourseState,
			value: string | number | RcFile | null | number[]
		) => {
			dispatch(setCourseField({ key, value }));
		},
		[dispatch]
	);

	const handleSave = async () => {
		const created = await dispatch(createCourse()).unwrap();
		await dispatch(openPdfPreview(created.id));
	};

	return (
		<Layout className='p-6 max-w-5xl mx-auto bg-transparent'>
			<Content>
				<Title level={2} className='!mb-6'>
					Создание курса
				</Title>

				<Card
					className='rounded-2xl shadow-sm mb-6'
					styles={{ body: { padding: 20 } }}
				>
					<Form
						form={form}
						layout='vertical'
						onValuesChange={changed => {
							if ('title' in changed) handleChange('title', changed.title);
							if ('description' in changed)
								handleChange('description', changed.description);
							if ('specializationId' in changed) {
								handleChange(
									'specializationId',
									changed.specializationId ?? null
								);
							}
							if ('file' in changed) {
								const list = (changed.file as UploadFile[]) ?? [];
								const file = list[0]?.originFileObj ?? null; // File | null
								handleChange('file', file);
							}
						}}
					>
						<Form.Item
							label='Название курса'
							name='title'
							rules={[{ required: true, message: 'Введите название курса' }]}
						>
							<Input
								maxLength={25}
								showCount
								placeholder='Введите название'
								className='rounded-xl'
							/>
						</Form.Item>

						<Form.Item
							label='Описание курса'
							name='description'
							rules={[{ required: true, message: 'Введите описание курса' }]}
						>
							<Input.TextArea
								rows={4}
								placeholder='Описание курса'
								className='rounded-xl'
								maxLength={100}
								showCount
							/>
						</Form.Item>

						<Form.Item
							label='Специализация'
							name='specializationId'
							rules={[{ required: true, message: 'Выберите специализацию' }]}
						>
							<Select<number>
								loading={specsLoading}
								options={specOptions}
								placeholder='Выберите специализацию'
							/>
						</Form.Item>

						<Form.Item
							label='Файл курса'
							name='file'
							valuePropName='fileList'
							getValueFromEvent={normFile}
							extra='PDF до 25 МБ'
							rules={[
								{ required: true, message: 'Добавьте файл PDF по курсу' },
							]}
						>
							<Dragger beforeUpload={() => false} maxCount={1} accept='.pdf'>
								<Space
									direction='vertical'
									align='center'
									style={{ width: '100%', padding: 16 }}
								>
									<InboxOutlined style={{ fontSize: 48 }} />
									<Typography.Text>
										Перетащи файл или нажми для выбора
									</Typography.Text>
								</Space>
							</Dragger>
						</Form.Item>
					</Form>

					<Space wrap>
						<Button
							type='primary'
							onClick={handleSave}
							loading={course.isSaving}
						>
							Сохранить курс
						</Button>
					</Space>
				</Card>
			</Content>
		</Layout>
	);
};
