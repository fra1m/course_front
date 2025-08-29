// src/store/rootReducer.ts
import { combineReducers } from '@reduxjs/toolkit';
import reducers from './reducers';

export const rootReducer = combineReducers(reducers);

// (опционально) тип корневого редьюсера, если где-то нужен
export type RootReducer = typeof rootReducer;
