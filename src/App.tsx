import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { AppRouter } from './components/AppRouter';

import { Layout, Spin } from 'antd';
import { Navbar } from './components/Nav';
import { useAppDispatch, useAppSelector } from './hooks/hooks';
import { useEffect } from 'react';
import { checkAuth } from './store/reducers/user/userThunks';

// import { QuizPage } from './pages/QuizPage';

const App = () => {
	const dispatch = useAppDispatch();
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
				<Layout>
					<Navbar />
					<Layout.Content>
						<AppRouter />
					</Layout.Content>
				</Layout>
			</BrowserRouter>
		</Provider>
	);
};

export default App;
