// pages/LessonsForm.tsx
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Spin, Result } from 'antd';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import { getLessonPDFById } from '../store/reducers/lessons/lessonsThunks';

export const LessonsForm = () => {
	const { id } = useParams<{ id: string }>();
	const dispatch = useAppDispatch();
	const { html: pdfUrl, isLoading, saveError } = useAppSelector(s => s.lesson);

	useEffect(() => {
		const lessonId = Number(id);
		if (Number.isFinite(lessonId)) {
			dispatch(getLessonPDFById(lessonId));
		}
		return () => {
			// на всякий — уберём за собой url
			if (pdfUrl) URL.revokeObjectURL(pdfUrl);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id, dispatch]);

	if (isLoading) {
		return (
			<div className='w-full h-[80vh] flex items-center justify-center'>
				<Spin />
			</div>
		);
	}

	if (saveError) {
		return (
			<Result
				status='error'
				title='Не удалось загрузить урок'
				subTitle={saveError}
			/>
		);
	}

	return (
		<Card
			title='Просмотр урока'
			className='m-6 rounded-2xl shadow'
			styles={{ body: { padding: 0 } }}
		>
			{pdfUrl ? (
				<iframe
					src={pdfUrl + '#toolbar=0'}
					className='w-full h-[80vh] border-0 rounded-b-2xl'
					title='Просмотр PDF'
				/>
			) : (
				<div className='p-6 text-center text-gray-500'>Нет данных</div>
			)}
		</Card>
	);
};
