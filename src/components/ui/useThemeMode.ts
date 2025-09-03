import { useCallback, useEffect, useState } from 'react';

export type UiTheme = 'light' | 'dark';
const LS_KEY = 'ui-theme';

export function useThemeMode() {
	const getInitial = (): UiTheme => {
		const saved = localStorage.getItem(LS_KEY) as UiTheme | null;
		if (saved === 'light' || saved === 'dark') return saved;
		return window.matchMedia?.('(prefers-color-scheme: dark)').matches
			? 'dark'
			: 'light';
	};

	const [mode, setMode] = useState<UiTheme>(getInitial);

	useEffect(() => {
		localStorage.setItem(LS_KEY, mode);
		// полезно, если захочешь tailwind тёмные классы потом подключить
		document.documentElement.classList.toggle('dark', mode === 'dark');
	}, [mode]);

	const toggle = useCallback(() => {
		setMode(m => (m === 'light' ? 'dark' : 'light'));
	}, []);

	return { mode, setMode, toggle };
}
