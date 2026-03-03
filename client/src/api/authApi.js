// src/features/api/authApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:8000/api', // your Django URL
  credentials: 'include', // This sends cookies automatically
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // If access token expired → try refresh
  if (result.error?.status === 401) {
    const refreshResult = await baseQuery(
      { url: 'token/refresh/', method: 'POST' },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      // Retry original request
      result = await baseQuery(args, api, extraOptions);
    } else {
      // Refresh failed → logout
      // api.dispatch(logout());
      // window.location.href = '/login';
    }
  }

  return result;
};

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: 'auth/login/',
        method: 'POST',
        body: credentials,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: 'auth/logout/',
        method: 'POST',
      }),
    }),
    getUser: builder.query({
      query: () => 'auth/user/', // endpoint that returns current user
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: 'auth/register/',  // ← Your Django endpoint
        method: 'POST',
        body: userData,
      }),
    }),
  }),
});

export const { useLoginMutation, useGetUserQuery, useLogoutMutation, useRegisterMutation } = authApi;