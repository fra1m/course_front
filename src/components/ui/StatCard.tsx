// src/components/StatCard.tsx
import { Card, Space, Typography } from 'antd';
import type { JSX } from 'react';
const { Title, Text } = Typography;

export default function StatCard({
	icon,
	label,
	value,
}: {
	icon: JSX.Element;
	label: string;
	value: number;
}) {
	return (
		<Card size='small'>
			<Space align='center' size={10}>
				<span>{icon}</span>
				<Space direction='vertical' size={0}>
					<Text type='secondary'>{label}</Text>
					<Title level={4} style={{ margin: 0 }}>
						{value}
					</Title>
				</Space>
			</Space>
		</Card>
	);
}
