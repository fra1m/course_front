import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface AppState {
	bootstrapped: boolean;
	lastBootstrapAt?: number;
	sessionKey?: string; // ← добавили
}

const initialState: AppState = {
	bootstrapped: false,
};

const appSlice = createSlice({
	name: 'app',
	initialState,
	reducers: {
		markBootstrapped(state, action: PayloadAction<number | undefined>) {
			state.bootstrapped = true;
			state.lastBootstrapAt = action.payload;
		},
		resetBootstrap(state) {
			state.bootstrapped = false;
			state.lastBootstrapAt = undefined;
		},
		setSessionKey(state, action: PayloadAction<string | undefined>) {
			state.sessionKey = action.payload;
		},
	},
});

export const { markBootstrapped, resetBootstrap, setSessionKey } =
	appSlice.actions;
export default appSlice.reducer;
