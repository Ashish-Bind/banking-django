// src/features/notifications/notificationsSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { notificationsApi } from '../api/notificationsApi';

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    list: [],           // All notifications (personal + group/system)
    unreadCount: 0,     // Total unread personal notifications
    hasNew: false,      // For bell animation
  },
  reducers: {
    clearAllNotifications: (state) => {
      state.list = [];
      state.unreadCount = 0;
      state.hasNew = false;
    },
    markAllAsRead: (state) => {
      state.list = state.list.map(n => ({ ...n, is_read: true }));
      state.unreadCount = 0;
      state.hasNew = false;
    },
    setHasNew: (state, action) => {
      state.hasNew = action.payload;
    },
  },
  extraReducers: (builder) => {
    // When API loads notifications (on page load/refresh)
    builder.addMatcher(
      notificationsApi.endpoints.getNotifications.matchFulfilled,
      (state, { payload }) => {
        const apiNotifications = payload.notifications || [];
        const apiIds = new Set(apiNotifications.map(n => n.id));

        // Keep only group notifications that are not in DB
        const preservedGroupNotifs = state.list.filter(
          n => n.is_group_notification && !apiIds.has(n.id)
        );

        state.list = [...apiNotifications, ...preservedGroupNotifs];
        state.unreadCount = payload.unread_count || 0;
        state.hasNew = false;
      }
    );

    // Custom action from WebSocket
    builder.addMatcher(
      (action) => action.type === 'notifications/addRealtime',
      (state, { payload }) => {
        const notif = payload;

        // Avoid duplicates
        const exists = state.list.some(existing =>
          existing.id === notif.id ||
          (existing.is_group_notification && existing.title === notif.title && existing.created_at === notif.created_at)
        );

        if (!exists) {
          state.list.unshift(notif);

          // Only count personal unread
          if (!notif.is_group_notification && !notif.is_read) {
            state.unreadCount += 1;
          }

          state.hasNew = true;

          // Auto-remove group notifications after 10 seconds
          if (notif.is_group_notification) {
            setTimeout(() => {
              state.list = state.list.filter(n => n.id !== notif.id);
            }, 10000);
          }
        }
      }
    );
  },
});

export const { clearAllNotifications, markAllAsRead, setHasNew } = notificationsSlice.actions;
export default notificationsSlice.reducer;