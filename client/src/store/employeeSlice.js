// src/features/employee/employeeSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { employeeApi } from "../api/employeeApi";

const initialState = {
  // Cash Requests State
  pendingDeposits: [],
  pendingWithdrawals: [],
  approvedRequests: {
    deposits: [],
    withdrawals: [],
  },
  rejectedRequests: {
    deposits: [],
    withdrawals: [],
  },
  dashboard: {
    stats: {
      total_customers: 0,
      today_deposits: 0,
      today_withdrawals: 0,
      pending_cash_requests: 0,
      pending_loans: 0,
      pending_account_requests: 0,
      total_pending_actions: 0,
    },
    recent_activity: [],
  },
  // Optional: Employee profile & stats
  profile: null,
  stats: {
    totalPending: 0,
    todayApproved: 0,
    totalProcessed: 0,
  },

  loading: false,
  error: null,
};

const employeeSlice = createSlice({
  name: "employee",
  initialState,
  reducers: {
    clearEmployeeData: (state) => {
      state.pendingDeposits = [];
      state.pendingWithdrawals = [];
      state.approvedRequests = { deposits: [], withdrawals: [] };
      state.rejectedRequests = { deposits: [], withdrawals: [] };
      state.profile = null;
      state.stats = { totalPending: 0, todayApproved: 0, totalProcessed: 0 };
    },
  },
  extraReducers: (builder) => {
    builder
      // === Pending Deposits ===
      .addMatcher(
        employeeApi.endpoints.getPendingDeposits.matchFulfilled,
        (state, { payload }) => {
          state.pendingDeposits = payload;
          state.stats.totalPending = payload.length + state.pendingWithdrawals.length;
          state.loading = false;
        }
      )
      .addMatcher(
        employeeApi.endpoints.getPendingDeposits.matchPending,
        (state) => {
          state.loading = true;
        }
      )
      .addMatcher(
        employeeApi.endpoints.getPendingDeposits.matchRejected,
        (state) => {
          state.loading = false;
          state.error = "Failed to load pending deposits";
        }
      )

      // === Pending Withdrawals ===
      .addMatcher(
        employeeApi.endpoints.getPendingWithdrawals.matchFulfilled,
        (state, { payload }) => {
          state.pendingWithdrawals = payload;
          state.stats.totalPending = state.pendingDeposits.length + payload.length;
          state.loading = false;
        }
      )

      // === Approved Requests ===
      .addMatcher(
        employeeApi.endpoints.getApprovedRequests.matchFulfilled,
        (state, { payload }) => {
          state.approvedRequests.deposits = payload.deposits || [];
          state.approvedRequests.withdrawals = payload.withdrawals || [];
          state.loading = false;

        }
      )

      // === Rejected Requests ===
      .addMatcher(
        employeeApi.endpoints.getRejectedRequests.matchFulfilled,
        (state, { payload }) => {
          state.rejectedRequests.deposits = payload.deposits || [];
          state.rejectedRequests.withdrawals = payload.withdrawals || [];
          state.loading = false;

        }
      )

      .addMatcher(
        employeeApi.endpoints.getEmployeeDashboard.matchPending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        employeeApi.endpoints.getEmployeeDashboard.matchFulfilled,
        (state, { payload }) => {
          state.dashboard.stats = payload.stats;
          state.dashboard.recent_activity = payload.recent_activity || [];
          state.loading = false;
        }
      )
      .addMatcher(
        employeeApi.endpoints.getEmployeeDashboard.matchRejected,
        (state, action) => {
          state.loading = false;
          state.error = action.error?.message || "Failed to load dashboard";
        }
      )

      // === Any Approval/Rejection Success → Remove from pending ===
      .addMatcher(
        (action) =>
          [
            employeeApi.endpoints.approveDeposit.matchFulfilled,
            employeeApi.endpoints.rejectDeposit.matchFulfilled,
            employeeApi.endpoints.approveWithdrawal.matchFulfilled,
            employeeApi.endpoints.rejectWithdrawal.matchFulfilled,
          ].some((matcher) => matcher(action)),
        (state, action) => {
          const id = action.meta.arg.originalArgs; // the request ID

          state.pendingDeposits = state.pendingDeposits.filter((r) => r.id !== id);
          state.pendingWithdrawals = state.pendingWithdrawals.filter((r) => r.id !== id);

          state.stats.totalPending = state.pendingDeposits.length + state.pendingWithdrawals.length;
          state.loading = false;

        }
      )
  },
});

export const { clearEmployeeData } = employeeSlice.actions;

export default employeeSlice.reducer;