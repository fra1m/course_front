import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
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
import { useEffect } from 'react';
import { checkAuth } from './store/reducers/user/userThunks';
import GlobalPdfPreview from './components/GlobalPdfPreview';
import BackgroundFX from './components/BackgroundFX';
import { useThemeMode } from './hooks/useThemeMode';

const App = () => {
	const dispatch = useAppDispatch();
	const { mode, toggle } = useThemeMode(); // <= хук из примера

	const { isLoading } = useAppSelector(state => state.user);

	useEffect(() => {
		dispatch(checkAuth());
	}, [dispatch]);

	if (isLoading) {
		return <Spin fullscreen={true}>Загрузка...</Spin>; // или спиннер
	}

	return (
		<Provider store={store}>
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
		</Provider>
	);
};

export default App;
