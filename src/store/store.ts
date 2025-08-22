import { configureStore, isPlain } from '@reduxjs/toolkit';
import { rootReducer } from './reducers/rootReducer';

const isSerializable = (value: unknown): boolean => {
	// Разрешаем File/Blob, всё остальное — как обычно
	if (typeof File !== 'undefined' && value instanceof File) return true;
	if (typeof Blob !== 'undefined' && value instanceof Blob) return true;
	if (value instanceof ArrayBuffer) return true;
	if (ArrayBuffer.isView(value)) return true; // Uint8Array и пр.

	return isPlain(value);
};

export const store = configureStore({
	reducer: rootReducer,
	middleware: getDefaultMiddleware =>
		getDefaultMiddleware({
			serializableCheck: {
				isSerializable, // ← ключевая строчка
				ignoredPaths: ['course.file'], // чтобы не пытался копать внутрь
				// опционально: если хочешь убрать предупреждение именно для payload.value:
				// ignoredActionPaths: ['payload.value', 'meta.arg'],
			},
		}),
});

// Типы для использования в хуках
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
