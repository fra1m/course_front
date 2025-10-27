// FIXME путь файла курса лежит

import { configureStore, isPlain } from '@reduxjs/toolkit';
import { rootReducer } from './reducers/rootReducer';
import { persistStore } from 'redux-persist';

const isSerializable = (value: unknown): boolean => {
	if (typeof File !== 'undefined' && value instanceof File) return true;
	if (typeof Blob !== 'undefined' && value instanceof Blob) return true;
	if (value instanceof ArrayBuffer) return true;
	if (ArrayBuffer.isView(value)) return true;
	return isPlain(value);
};

export const store = configureStore({
	reducer: rootReducer,
	middleware: getDefault =>
		getDefault({
			serializableCheck: {
				isSerializable,
				ignoredActions: [
					'persist/PERSIST',
					'persist/REHYDRATE',
					'persist/REGISTER',
					'persist/FLUSH',
					'persist/PAUSE',
					'persist/PURGE',
				],
				ignoredPaths: [
					'course.file', // твой игнор
					// служебный ключ от redux-persist
					'_persist',
				],
			},
		}),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
