import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { UserState, UserPayload } from './types';
import { registerUser, loginUser, logoutUser, checkAuth } from './userThunks';
import { Role } from './types';

const initialState: UserState = {
	email: '',
	name: '',
	accessToken: '',
	isAuth: false,
	isLoading: false,
	saveError: null,
	role: Role.USER,
};

const userSlice = createSlice({
	name: 'user',
	initialState,
	reducers: {
		logout(state) {
			state.email = '';
			state.name = '';
			state.accessToken = '';
			state.isAuth = false;
			state.saveError = null;
			state.role = Role.USER;
		},
	},
	extraReducers: builder => {
		builder
			.addCase(registerUser.pending, state => {
				state.isLoading = true;
				state.saveError = null;
			})
			.addCase(
				registerUser.fulfilled,
				(state, action: PayloadAction<UserPayload>) => {
					state.isLoading = false;
					state.email = action.payload.user.email;
					state.name = action.payload.user.name;
					state.accessToken = action.payload.tokens.accessToken;
					state.isAuth = true;
					state.role = action.payload.user.role;
				}
			)
			.addCase(registerUser.rejected, (state, action) => {
				state.isLoading = false;
				state.saveError = action.payload as string;
				state.role = Role.USER;
			})
			.addCase(loginUser.pending, state => {
				state.isLoading = true;
				state.saveError = null;
			})
			.addCase(
				loginUser.fulfilled,
				(state, action: PayloadAction<UserPayload>) => {
					state.isLoading = false;
					state.email = action.payload.user.email;
					state.name = action.payload.user.name;
					state.accessToken = action.payload.tokens.accessToken;
					state.isAuth = true;
					state.role = action.payload.user.role;
				}
			)
			.addCase(loginUser.rejected, (state, action) => {
				state.isLoading = false;
				state.saveError = action.payload as string;
				state.role = Role.USER;
			})
			.addCase(logoutUser.fulfilled, state => {
				userSlice.caseReducers.logout(state); // 👈 переиспользуем
			})
			.addCase(checkAuth.pending, state => {
				state.isLoading = true;
				state.saveError = null;
			})
			.addCase(
				checkAuth.fulfilled,
				(state, action: PayloadAction<UserPayload>) => {
					console.log(action.payload);
					state.isLoading = false;
					state.email = action.payload.user.email;
					state.name = action.payload.user.name;
					state.accessToken = action.payload.tokens.accessToken;
					state.isAuth = true;
					state.role = action.payload.user.role;
				}
			)
			.addCase(checkAuth.rejected, (state, action) => {
				logout();
				state.isLoading = false;
				state.saveError = action.payload as string;
				state.role = Role.USER;
			});
	},
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;
