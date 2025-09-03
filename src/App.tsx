import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './routes/AppRouter';
import {
	ConfigProvider,
	Layout,
	Spin,
	theme as antdTheme,
	App as AntdApp,
} from 'antd';
import { useEffect, useRef } from 'react';
import { applyAuthHeader } from './api';
import GlobalPdfPreview from './components/Modals/GlobalPdfPreview';
import BackgroundFX from './components/ui/BackgroundFX';
import { Navbar } from './components/ui/Nav';
import { useThemeMode } from './components/ui/useThemeMode';
import { useAppDispatch, useAppSelector } from './hooks/hooks';
import { appBootstrap } from './store/appBootstrap';
import { resetBootstrap, setSessionKey } from './store/appSlice';
import { clearCourses } from './store/reducers/courses/courseReducer';
import { clearLessons } from './store/reducers/lessons/lessonReducer';
import { clearQuizzes } from './store/reducers/quiz/quizReducer';
import { checkAuth } from './store/reducers/user/userThunks';

const App = () => {
	const dispatch = useAppDispatch();
	const { mode, toggle } = useThemeMode();

	const { isLoading, isAuth, authReady, accessToken, email, specialization } =
		useAppSelector(s => s.user);
	const { bootstrapped, sessionKey } = useAppSelector(s => s.app);

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

	// 3) следим за «сессионным ключом» (email + specializationId)
	//    если он изменился (например, админ сменил студенту специализацию),
	//    очищаем каталожные кэши и перезапускаем бутстрап
	useEffect(() => {
		if (!authReady || !isAuth) return;

		const identity = (email ?? 'anon').toLowerCase();
		const spec = Number.isFinite(specialization?.id)
			? String(specialization?.id)
			: 'none';
		const currentSessionKey = `${identity}:${spec}`;

		if (sessionKey && sessionKey !== currentSessionKey) {
			// чистим зависящие от специализации / роли кэши
			dispatch(clearCourses());
			dispatch(clearLessons());
			dispatch(clearQuizzes());

			// сбрасываем флаг бутстрапа — чтобы ниже он запустился заново
			dispatch(resetBootstrap());
		}

		// обновляем сохранённый ключ (в т.ч. на первый раз)
		if (sessionKey !== currentSessionKey) {
			dispatch(setSessionKey(currentSessionKey));
		}
	}, [authReady, isAuth, email, specialization, sessionKey, dispatch]);

	// 4) глобальный бутстрап: запускаем каждый раз, когда auth готов и он ещё не выполнен
	useEffect(() => {
		if (!authReady || !isAuth) return;
		if (!bootstrapped) {
			dispatch(appBootstrap());
		}
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
