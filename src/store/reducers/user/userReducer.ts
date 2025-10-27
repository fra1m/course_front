import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {
	UserState,
	UserPayload,
	UserRegPayload,
	IUserListItem,
} from './types';
import {
	registerUser,
	loginUser,
	logoutUser,
	checkAuth,
	getAllUsers,
	deleteUser,
	updateUser,
	getMyStats,
	changeMyPassword,
} from './userThunks';
import { Role } from './types';
import type { IUser } from '../../../models/user/IUser';
import { applyAuthHeader } from '../../../api';

const initialState: UserState = {
	email: '',
	name: '',
	accessToken: '',
	saveError: null,
	role: Role.USER,
	specialization: null,
	users: [],
	isAuth: false,
	isLoading: false,
	isStatsLoading: false,
	authReady: false, // ← добавили
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
			applyAuthHeader(undefined);
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
				(state, action: PayloadAction<UserRegPayload>) => {
					state.isLoading = false;
					state.saveError = null;

					const u = action.payload.user as IUserListItem;
					const idx = state.users.findIndex(x => x.id === u.id);
					if (idx >= 0) {
						state.users[idx] = { ...state.users[idx], ...u };
					} else {
						state.users.push(u);
					}
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
					state.myStats = action.payload.user.myStats;
					state.authReady = true; // опционально
					state.specialization = action.payload.user.specialization;
					applyAuthHeader(action.payload.tokens.accessToken);
				}
			)
			.addCase(loginUser.rejected, (state, action) => {
				state.isLoading = false;
				state.saveError = action.payload as string;
				state.isAuth = false;
				state.role = Role.USER;
			})

			.addCase(logoutUser.fulfilled, state => {
				userSlice.caseReducers.logout(state);
				applyAuthHeader(); // ❌ удалит Authorization
			})

			.addCase(checkAuth.pending, state => {
				state.isLoading = true;
				state.saveError = null;
			})
			.addCase(
				checkAuth.fulfilled,
				(state, action: PayloadAction<UserPayload>) => {
					state.isLoading = false;
					state.email = action.payload.user.email;
					state.name = action.payload.user.name;
					state.accessToken = action.payload.tokens.accessToken;
					state.isAuth = true;
					state.role = action.payload.user.role;
					state.myStats = action.payload.user.myStats;
					state.authReady = true; // опционально
					state.specialization = action.payload.user.specialization;
					applyAuthHeader(action.payload.tokens.accessToken);
				}
			)
			.addCase(checkAuth.rejected, (state, action) => {
				userSlice.caseReducers.logout(state); // ✅ безопасно
				state.isLoading = false;
				state.saveError = action.payload as string;
				state.authReady = true; // важно!
			})

			.addCase(getAllUsers.pending, state => {
				state.isLoading = true;
				state.saveError = null;
			})
			.addCase(
				getAllUsers.fulfilled,
				(state, action: PayloadAction<IUserListItem[]>) => {
					state.isLoading = false;
					state.saveError = null;
					state.users = Array.isArray(action.payload) ? action.payload : [];
				}
			)
			.addCase(getAllUsers.rejected, (state, action) => {
				state.isLoading = false;
				state.saveError =
					(action.payload as string) ?? 'Не удалось загрузить пользователей';
			})

			.addCase(deleteUser.pending, state => {
				state.isLoading = true;
				state.saveError = null;
			})
			.addCase(deleteUser.fulfilled, (state, action) => {
				state.isLoading = false;
				state.saveError = null;

				const deletedId = action.meta.arg.id;

				state.users = (state.users ?? []).filter(
					(u: IUser) => u.id !== deletedId
				);
			})
			.addCase(deleteUser.rejected, (state, action) => {
				state.isLoading = false;
				state.saveError =
					(action.payload as string) ?? 'Не удалось удалить пользователя';
			})

			.addCase(updateUser.pending, state => {
				state.isLoading = true;
				state.saveError = null;
			})
			.addCase(
				updateUser.fulfilled,
				(state, action: PayloadAction<IUserListItem>) => {
					state.isLoading = false;
					state.saveError = null;

					const updated = action.payload;
					const i = state.users.findIndex(u => u.id === updated.id);
					if (i >= 0) state.users[i] = { ...state.users[i], ...updated };
					else state.users.push(updated);
				}
			)
			.addCase(updateUser.rejected, (state, action) => {
				state.isLoading = false;
				state.saveError = action.payload ?? 'Не удалось обновить пользователя';
			})

			.addCase(getMyStats.pending, state => {
				state.isStatsLoading = true; // <-- только stats
				state.saveError = null;
			})
			.addCase(getMyStats.fulfilled, (state, action) => {
				state.isStatsLoading = false; // <-- только stats
				state.myStats = action.payload;
			})
			.addCase(getMyStats.rejected, (state, action) => {
				state.isStatsLoading = false; // <-- только stats
				state.saveError = action.payload ?? 'Не удалось получить статистику';
			})

			.addCase(changeMyPassword.pending, state => {
				state.isLoading = true;
				state.saveError = null;
			})
			.addCase(changeMyPassword.fulfilled, state => {
				state.isLoading = false;
				// сразу разлогиниваем локально — refresh уже очищен на бэке
				// можно показать тост/уведомление в компоненте, используя action.payload.message
				// локальный логаут:
				state.email = '';
				state.name = '';
				state.accessToken = '';
				state.isAuth = false;
				state.role = 'user';
				applyAuthHeader(undefined);
			})
			.addCase(changeMyPassword.rejected, (state, action) => {
				state.isLoading = false;
				state.saveError = action.payload ?? 'Не удалось изменить пароль/роль';
			});
	},
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;
