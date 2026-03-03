// src/api/notificationsApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const notificationsApi = createApi({
  reducerPath: "notificationsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8000/api/",
    credentials: "include",
  }),
  tagTypes: ["Notifications"],

  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: () => "notifications/",
      transformResponse: (response) => ({
        notifications: response.notifications || [],
        unread_count: response.unread_count || 0,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.notifications.map(({ id }) => ({ type: "Notifications", id })),
              { type: "Notifications", id: "LIST" },
            ]
          : [{ type: "Notifications", id: "LIST" }],
    }),

    // NEW: Mark all as read in one request
    markAllAsRead: builder.mutation({
      query: () => ({
        url: "notifications/mark-all-read/",
        method: "POST",
      }),
      // This invalidates the cache → triggers refetch → updates UI + unread_count
      invalidatesTags: [{ type: "Notifications", id: "LIST" }],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkAllAsReadMutation, // ← This is what we'll use
} = notificationsApi;