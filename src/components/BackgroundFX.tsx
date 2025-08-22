// src/components/BackgroundFX.tsx
import React, { useEffect, useRef } from 'react';
import type { UiTheme } from '../hooks/useThemeMode';

type CSSVars<T extends string> = React.CSSProperties & Record<T, string>;
const v = <T extends string>(vars: Record<T, string>) => vars as CSSVars<T>;

export default function BackgroundFX({ mode }: { mode: UiTheme }) {
	const isDark = mode === 'dark';
	const rootRef = useRef<HTMLDivElement | null>(null);
	const rafRef = useRef<number | null>(null);

	useEffect(() => {
		const el = rootRef.current;
		if (!el) return;
		const reduce = window.matchMedia(
			'(prefers-reduced-motion: reduce)'
		).matches;
		if (reduce) return;

		let stop = false;
		const start = performance.now();
		const loop = (t: number) => {
			if (stop) return;
			const dt = (t - start) * 0.001;
			const rx = Math.sin(dt * 0.33) * 6;
			const ry = Math.cos(dt * 0.27) * 8;
			const lx = Math.sin(dt * 0.23) * 0.22;
			const ly = Math.cos(dt * 0.17) * 0.22;
			el.style.setProperty('--rx', rx.toFixed(3));
			el.style.setProperty('--ry', ry.toFixed(3));
			el.style.setProperty('--lx', lx.toFixed(3));
			el.style.setProperty('--ly', ly.toFixed(3));
			rafRef.current = requestAnimationFrame(loop);
		};
		rafRef.current = requestAnimationFrame(loop);
		return () => {
			stop = true;
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
		};
	}, []);

	return (
		<div
			ref={rootRef}
			className='pointer-events-none fixed inset-0 -z-10'
			style={v<'--rx' | '--ry' | '--lx' | '--ly'>({
				'--rx': '0',
				'--ry': '0',
				'--lx': '0',
				'--ly': '0',
			})}
		>
			{/* фон: dark — как был; light — улучшенная видимость */}
			<div
				className='absolute inset-0'
				style={{
					background: isDark
						? 'radial-gradient(1100px 800px at 18% 12%, rgba(99,102,241,0.10), transparent 55%), radial-gradient(1100px 800px at 84% 28%, rgba(34,197,94,0.12), transparent 60%), linear-gradient(180deg,#0a0f1a 0%,#0b1220 65%,#0a0f1a 100%)'
						: [
								'radial-gradient(900px 700px at 16% 14%, rgba(56,189,248,0.20), transparent 55%)',
								'radial-gradient(900px 700px at 86% 24%, rgba(167,139,250,0.18), transparent 55%)',
								'linear-gradient(180deg,#f7f9fd 0%,#eef2f9 55%,#fafcff 100%)',
						  ].join(','),
				}}
			/>

			<div
				className='absolute inset-0'
				style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
			>
				<Orbit r='120px' x='22%' y='28%' kind='A'>
					<Orb size={220} hueDark={225} hueLight={210} isDark={isDark} />
				</Orbit>
				<Orbit r='90px' x='78%' y='24%' kind='B'>
					<Orb size={170} hueDark={150} hueLight={265} isDark={isDark} />
				</Orbit>
				<Orbit r='150px' x='28%' y='76%' kind='A'>
					<Orb size={160} hueDark={280} hueLight={190} isDark={isDark} />
				</Orbit>
				<Orbit r='60px' x='64%' y='68%' kind='B'>
					<Orb size={120} hueDark={195} hueLight={180} isDark={isDark} />
				</Orbit>
				<Orbit r='105px' x='50%' y='46%' kind='A'>
					<Orb size={140} hueDark={205} hueLight={235} isDark={isDark} />
				</Orbit>
			</div>

			<div
				className={
					isDark
						? 'absolute inset-0 bg-black/40'
						: 'absolute inset-0 bg-black/6'
				}
				style={{
					maskImage:
						'radial-gradient(75% 65% at 50% 45%, transparent 55%, black)',
					WebkitMaskImage:
						'radial-gradient(75% 65% at 50% 45%, transparent 55%, black)',
				}}
			/>

			<style>
				{`
          @keyframes orbitA { to { transform: rotate(360deg); } }
          @keyframes orbitB { to { transform: rotate(-360deg); } }

          .fx-orbit {
            position:absolute;
            width:0; height:0;
            transform-origin: 0 0;
            will-change: transform;
          }
          .fx-orb {
            position:absolute;
            left:0; top:0;
            transform:
              translateX(var(--r))
              rotateX(calc(var(--rx) * 1deg))
              rotateY(calc(var(--ry) * 1deg));
            border-radius:9999px;
            pointer-events:none;
          }

          /* блик — оставляем для обеих тем */
          .fx-orb::after {
            content:""; position:absolute; inset:-10%;
            border-radius:inherit; pointer-events:none;
            background:
              radial-gradient(
                circle at calc(50% + (var(--lx) * 28%)) calc(50% + (var(--ly) * 28%)),
                rgba(255,255,255,0.60) 0%,
                rgba(255,255,255,0.22) 12%,
                rgba(255,255,255,0.10) 18%,
                transparent 38%
              );
            filter: blur(8px);
            mix-blend-mode: screen;
          }

          /* контур только для светлой темы */
          .fx-orb--light::before {
            content:""; position:absolute; inset:0;
            border-radius:inherit; pointer-events:none;
            box-shadow: 0 0 0 1px rgba(0,0,0,0.05), inset 0 0 0 1px rgba(255,255,255,0.08);
          }

          @media (prefers-reduced-motion: reduce) {
            .fx-orbit { animation: none !important; }
          }
        `}
			</style>
		</div>
	);
}

function Orbit(props: {
	r: string;
	x: string;
	y: string;
	kind: 'A' | 'B';
	children: React.ReactNode;
}) {
	const { r, x, y, kind, children } = props;
	return (
		<div
			className='fx-orbit'
			style={{
				left: x,
				top: y,
				animation:
					kind === 'A'
						? 'orbitA 54s linear infinite'
						: 'orbitB 62s linear infinite',
				...v<'--r'>({ '--r': r }),
			}}
		>
			{children}
		</div>
	);
}

function Orb(props: {
	size: number;
	hueDark: number;
	hueLight: number;
	isDark: boolean;
}) {
	const { size, hueDark, hueLight, isDark } = props;
	const hue = isDark ? hueDark : hueLight;

	// тёмная — всё как раньше: screen, без контура, мягче тени
	// светлая — усиленные тени/контур и обычный blend
	const mix: React.CSSProperties['mixBlendMode'] = isDark ? 'screen' : 'normal';
	const shadow = isDark
		? '0 16px 44px rgba(0,0,0,0.18), inset 0 -14px 28px rgba(0,0,0,0.22)'
		: '0 18px 60px rgba(0,0,0,0.16), 0 8px 24px rgba(0,0,0,0.08), inset 0 -18px 40px rgba(0,0,0,0.10)';

	const lightShading = `
    radial-gradient(circle at 40% 35%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.50) 10%, rgba(255,255,255,0.24) 18%, rgba(255,255,255,0.12) 26%, transparent 40%),
    radial-gradient(circle at 65% 70%, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.10) 24%, transparent 55%),
    radial-gradient(circle at 50% 50%, hsla(${hue}, 82%, 56%, 0.55), hsla(${hue}, 78%, 52%, 0.38) 38%, hsla(${hue}, 70%, 48%, 0.22) 60%, hsla(${hue}, 68%, 46%, 0.12) 75%, transparent 90%)
  `;
	const darkShading = `
    radial-gradient(circle at 40% 35%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.22) 12%, rgba(255,255,255,0.10) 20%, transparent 36%),
    radial-gradient(circle at 62% 72%, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.12) 26%, transparent 56%),
    radial-gradient(circle at 50% 50%, hsla(${hue}, 85%, 65%, 0.35), hsla(${hue}, 75%, 58%, 0.20) 35%, hsla(${hue}, 70%, 50%, 0.10) 60%, transparent 75%)
  `;

	return (
		<div
			className={`fx-orb ${isDark ? '' : 'fx-orb--light'}`}
			style={{
				width: `${size}px`,
				height: `${size}px`,
				background: isDark ? darkShading : lightShading,
				mixBlendMode: mix,
				boxShadow: shadow,
				outline: isDark ? 'none' : `1px solid hsla(${hue}, 65%, 50%, 0.2)`,
				outlineOffset: isDark ? undefined : '-1px',
			}}
		/>
	);
}
