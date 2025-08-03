// src/components/LessonsForm.tsx
import { Layout, Typography } from 'antd';
import parse, {
	domToReact,
	type DOMNode,
	Element,
	type HTMLReactParserOptions,
} from 'html-react-parser';
import { useAppSelector } from '../hooks/hooks';
import { FC } from 'react';

const { Title, Paragraph, Text } = Typography;

export const LessonsForm: FC = () => {
	const html = useAppSelector(state => state.lessons.html);

	const options = {
		replace: (domNode: DOMNode) => {
			if (domNode.type === 'tag') {
				const el = domNode as Element;
				const children = domToReact(el.children as DOMNode[], options);

				switch (el.name) {
					case 'div':
						if (el.attribs.class === 'pdf-page') {
							return <div className='mb-6 w-full'>{children}</div>;
						}
						break;
					case 'h1':
						return (
							<Title
								level={1}
								className='!text-3xl !mt-8 !mb-4 font-bold text-gray-800 w-full'
							>
								{children}
							</Title>
						);
					case 'h2':
						return (
							<Title
								level={2}
								className='!text-2xl !mt-6 !mb-3 font-semibold text-gray-700 w-full'
							>
								{children}
							</Title>
						);
					case 'p':
						return (
							<Paragraph className='w-full mb-3 text-base text-gray-800'>
								{children}
							</Paragraph>
						);
					case 'ul':
						return (
							<ul className='w-full list-disc pl-6 space-y-1'>{children}</ul>
						);
					case 'li':
						return <li className='text-base text-gray-800'>{children}</li>;
					case 'code':
						return (
							<Text code className='w-full text-sm block'>
								{children}
							</Text>
						);
					default:
						return;
				}
			}
		},
	};

	return (
		<Layout className='py-8 px-4 md:px-8 w-full leading-relaxed'>
			<div className='w-full'>
				{parse(html, options as HTMLReactParserOptions)}
			</div>
		</Layout>
	);
};
