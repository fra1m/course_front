// src/pages/QuizPage.tsx
import { useLocation } from 'react-router-dom';
import { useAppSelector } from '../hooks/hooks';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import 'survey-core/survey-core.css';

import { useState, type FC } from 'react';
import { Card, Typography } from 'antd';

const { Title, Paragraph } = Typography;

export const QuizPage: FC = () => {
	const { state } = useLocation();
	const quizId = state?.id;

	console.log('QuizPage id:', quizId);
	const quiz = useAppSelector(state =>
		state.quiz.quizzes.find(q => q.id === quizId)
	);

	const [result, setResult] = useState<number | null>(null);

	if (!quiz) {
		return (
			<Card className='m-8'>
				<Title level={3}>Тест не найден</Title>
			</Card>
		);
	}

	const survey = new Model(quiz.surveyJson);

	survey.onComplete.add(s => {
		let correct = 0;
		let total = 0;

		s.getAllQuestions().forEach(q => {
			if ('correctAnswer' in q) {
				total++;
				if (q.isAnswerCorrect()) correct++;
			}
		});

		const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
		setResult(percent);
	});

	return (
		<div className='p-6 max-w-3xl mx-auto'>
			<Title level={2}>{quiz.surveyJson.title || 'Тест'}</Title>

			{result === null ? (
				<Survey model={survey} />
			) : (
				<Card className='mt-6'>
					<Title level={3}>Результат</Title>
					<Paragraph>Вы набрали: {result}%</Paragraph>
				</Card>
			)}
		</div>
	);
};
