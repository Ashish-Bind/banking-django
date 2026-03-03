import { createSlice } from '@reduxjs/toolkit';
import { authApi } from '../api/authApi';

const initialState = {
  user: null,
  isAuthenticated: false,
};


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // When login succeeds → store user
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, { payload }) => {
        state.user = payload.user;
        state.isAuthenticated = true;
      })
      // Auto-fill user on app load
      .addMatcher(authApi.endpoints.getUser.matchFulfilled, (state, { payload }) => {
        state.user = payload.user;
        state.isAuthenticated = true;
      })
      .addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;