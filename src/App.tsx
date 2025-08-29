import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './components/AppRouter';
import {
	ConfigProvider,
	Layout,
	Spin,
	theme as antdTheme,
	App as AntdApp,
} from 'antd';
import { Navbar } from './components/Nav';
import { useAppDispatch, useAppSelector } from './hooks/hooks';
import { useEffect, useRef } from 'react';
import { checkAuth } from './store/reducers/user/userThunks';
import GlobalPdfPreview from './components/GlobalPdfPreview';
import BackgroundFX from './components/BackgroundFX';
import { useThemeMode } from './hooks/useThemeMode';
import { appBootstrap } from './store/appBootstrap';
import { applyAuthHeader } from './api';

const App = () => {
	const dispatch = useAppDispatch();
	const { mode, toggle } = useThemeMode();

	const { isLoading, isAuth, authReady, accessToken } = useAppSelector(
		s => s.user
	);
	const bootstrapped = useAppSelector(s => s.app.bootstrapped);

	// 1) сразу ставим Authorization из ре-гидрированного стора
	useEffect(() => {
		applyAuthHeader(accessToken || undefined);
	}, [accessToken]);

	// 2) один раз дергаем refresh (/user/refresh)
	const didCheck = useRef(false);
	useEffect(() => {
		if (didCheck.current) return;
		didCheck.current = true;
		dispatch(checkAuth());
	}, [dispatch]);

	// 3) глобальный бутстрап после авторизации
	const didBootstrap = useRef(false);
	useEffect(() => {
		if (!authReady || !isAuth) return;
		if (bootstrapped || didBootstrap.current) return;
		didBootstrap.current = true;
		dispatch(appBootstrap());
	}, [dispatch, authReady, isAuth, bootstrapped]);

	if (isLoading && !authReady) {
		return <Spin fullscreen>Загрузка…</Spin>;
	}

	return (
		<BrowserRouter>
			<ConfigProvider
				theme={{
					algorithm:
						mode === 'dark'
							? antdTheme.darkAlgorithm
							: antdTheme.defaultAlgorithm,
					token: { colorBgLayout: 'transparent' },
				}}
			>
				<AntdApp>
					<BackgroundFX mode={mode} />
					<Layout style={{ background: 'transparent', minHeight: '100vh' }}>
						<Navbar onToggleTheme={toggle} themeMode={mode} />
						<Layout.Content style={{ background: 'transparent' }}>
							<GlobalPdfPreview />
							<AppRouter />
						</Layout.Content>
						<Layout.Footer
							className='!bg-transparent !p-0 fixed bottom-3 right-4 z-[1000] pointer-events-none'
							style={{ width: 'auto' }}
						>
							<span className='text-gray-500 text-xs opacity-80'>
								© 2025 Gerion Courses. Все права защищены.
							</span>
						</Layout.Footer>
					</Layout>
				</AntdApp>
			</ConfigProvider>
		</BrowserRouter>
	);
};

export default App;
