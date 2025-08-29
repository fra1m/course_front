import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { persistor, store } from './store/store';
import { setupApiInterceptors } from './api';
import App from './App';
import './index.css';
import './antd-transparent.css';
import { StrictMode } from 'react';
import { PersistGate } from 'redux-persist/integration/react';
import { Spin } from 'antd';

setupApiInterceptors(store);

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<Provider store={store}>
			<PersistGate loading={<Spin fullscreen />} persistor={persistor}>
				<App />
			</PersistGate>
		</Provider>
	</StrictMode>
);
