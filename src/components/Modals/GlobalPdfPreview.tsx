import { Modal, Typography, Space, Button, Result, Spin, Card } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import Draggable from 'react-draggable';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/hooks';
import { openPdfPreview } from '../../store/reducers/pdf/pdfThunk';
import { closePdfPreview } from '../../store/reducers/pdf/pdfReducer';

import {
	GlobalWorkerOptions,
	getDocument,
	type PDFDocumentProxy,
} from 'pdfjs-dist';

GlobalWorkerOptions.workerSrc = new URL(
	'pdfjs-dist/build/pdf.worker.mjs',
	import.meta.url
).toString();

const MIN_W = 380;
const MIN_H = 280;
const DEF_W = 900;
const DEF_H = 600;

export default function GlobalPdfPreview() {
	const dispatch = useAppDispatch();
	const { open, courseId, blobUrl, loading, error } = useAppSelector(
		s => s.pdf
	);

	const nodeRef = useRef<HTMLDivElement | null>(null);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
	const [page, setPage] = useState<number>(1);

	// размеры МОДАЛКИ
	const [size, setSize] = useState<{ width: number; height: number }>({
		width: DEF_W,
		height: DEF_H,
	});

	// служебное для ресайза
	const dragStart = useRef<{
		x: number;
		y: number;
		w: number;
		h: number;
	} | null>(null);

	const onResizeStart = (e: React.MouseEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		dragStart.current = {
			x: e.clientX,
			y: e.clientY,
			w: size.width,
			h: size.height,
		};
		document.body.style.userSelect = 'none';

		const onMove = (ev: MouseEvent) => {
			if (!dragStart.current) return;
			const dx = ev.clientX - dragStart.current.x;
			const dy = ev.clientY - dragStart.current.y;
			setSize({
				width: Math.max(MIN_W, dragStart.current.w + dx),
				height: Math.max(MIN_H, dragStart.current.h + dy),
			});
		};

		const onUp = () => {
			dragStart.current = null;
			document.body.style.userSelect = '';
			window.removeEventListener('mousemove', onMove);
			window.removeEventListener('mouseup', onUp);
		};

		window.addEventListener('mousemove', onMove);
		window.addEventListener('mouseup', onUp);
	};

	// Тянем файл один раз (thunk уже кладёт blobUrl в стор)
	useEffect(() => {
		if (open && courseId && !blobUrl && !loading) {
			void dispatch(openPdfPreview(courseId));
		}
	}, [open, courseId, blobUrl, loading, dispatch]);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			if (!open || !blobUrl) return;
			try {
				const ab = await (
					await fetch(blobUrl, { cache: 'no-store' })
				).arrayBuffer();
				const task = getDocument({ data: ab, cMapPacked: true });
				const doc = await task.promise;
				if (!cancelled) {
					setPdf(doc);
					setPage(1);
				}
			} catch (e) {
				console.error('PDF load from blobUrl failed', e);
			}
		})();
		return () => {
			cancelled = true;
			setPdf(null);
		};
	}, [open, blobUrl]);

	// Рендер текущей страницы (без текстового слоя)
	useEffect(() => {
		let cancelled = false;
		(async () => {
			if (!pdf || !canvasRef.current) return;

			const pageObj = await pdf.getPage(page);
			const viewport = pageObj.getViewport({ scale: 10 });

			const canvas = canvasRef.current;
			const ctx = canvas.getContext('2d');
			if (!ctx) return;

			canvas.width = Math.floor(viewport.width);
			canvas.height = Math.floor(viewport.height);

			const renderTask = pageObj.render({
				canvasContext: ctx,
				canvas,
				viewport,
				intent: 'display',
			});

			await renderTask.promise;
			if (cancelled) return;
		})();

		return () => {
			cancelled = true;
		};
	}, [pdf, page]);

	const total = useMemo(() => pdf?.numPages ?? 0, [pdf]);
	const prev = () => setPage(p => Math.max(1, p - 1));
	const next = () => setPage(p => Math.min(total || p, p + 1));

	return (
		<Modal
			open={open}
			onCancel={() => dispatch(closePdfPreview())}
			footer={null}
			width={size.width} // ← ширина модалки из стейта
			styles={{
				body: {
					height: Math.max(MIN_H, size.height - 120), // ← высота содержимого (минус титул/паддинги)
					overflow: 'auto',
				},
			}}
			mask={false}
			maskClosable={false}
			keyboard={false}
			destroyOnHidden={false}
			wrapClassName='pointer-events-none'
			title={<Typography.Text strong>Предпросмотр материала</Typography.Text>}
			modalRender={modal => (
				<Draggable
					nodeRef={nodeRef}
					handle='.drag-surface'
					cancel='.no-drag'
					// bounds='body'
				>
					<div
						ref={nodeRef}
						className='pointer-events-auto drag-surface cursor-move'
						style={{
							position: 'relative',
							display: 'block',
							width: size.width,
						}}
					>
						{modal}

						{/* Хэндл для ресайза — нижний правый угол */}
						<div
							className='no-drag'
							onMouseDown={onResizeStart}
							title='Изменить размер'
							style={{
								position: 'absolute',
								right: 6,
								bottom: 6,
								width: 16,
								height: 16,
								cursor: 'nwse-resize',
								borderRadius: 4,
								boxShadow: '0 0 0 1px rgba(255,255,255,0.65) inset',
								background:
									'linear-gradient(135deg, rgba(255,255,255,0.75), rgba(0,0,0,0.18))',
								opacity: 0.85,
							}}
							onDoubleClick={() => setSize({ width: DEF_W, height: DEF_H })} // сброс к дефолту
						/>
					</div>
				</Draggable>
			)}
		>
			<Space
				direction='vertical'
				size='middle'
				className='select-none'
				onContextMenu={e => e.preventDefault()}
				style={{ width: '100%' }}
			>
				<Space className='no-drag' wrap>
					<Button
						icon={<LeftOutlined />}
						onClick={prev}
						disabled={!pdf || page <= 1}
					/>
					<Typography.Text>
						{pdf ? `${page} / ${total}` : '-- / --'}
					</Typography.Text>
					<Button
						icon={<RightOutlined />}
						onClick={next}
						disabled={!pdf || page >= (total || 1)}
					/>
				</Space>

				{error && (
					<Result
						status='error'
						title='Не удалось загрузить файл'
						subTitle={error}
					/>
				)}

				<Spin
					spinning={!error && (loading || (open && !pdf))}
					tip='Загрузка файла…'
				>
					<Card styles={{ body: { padding: 0 } }}>
						{pdf && (
							<canvas
								ref={canvasRef}
								style={{ width: '100%', height: 'auto', display: 'block' }}
								onContextMenu={e => e.preventDefault()}
								draggable={false}
							/>
						)}
					</Card>
				</Spin>
			</Space>
		</Modal>
	);
}
