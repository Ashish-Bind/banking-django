// src/features/customer/customerSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { customerApi } from '../api/customerApi';

const initialState = {
  profile: null,
  accounts: [],
  totalBalance: 0,
  totalAccounts: 0,
  transactions: [],
  activeLoans: 0,
  nextEmi: null,
  thisMonthNet: 0,
  recentTransactions: [],
};

const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addMatcher(customerApi.endpoints.getCustomerDashboard.matchFulfilled, (state, { payload }) => {
        state.profile = payload.profile;
        state.accounts = payload.accounts;
        state.totalBalance = payload.total_balance;
        state.totalAccounts = payload.total_accounts;

        // New fields
        state.activeLoans = payload.active_loans;
        state.nextEmi = payload.next_emi;
        state.thisMonthNet = payload.this_month_net;
        state.recentTransactions = payload.recent_transactions;
      })
      .addMatcher(customerApi.endpoints.getCustomerDashboard.matchRejected, (state) => {
        Object.assign(state, initialState); // reset slice to default values
      })
      .addMatcher(customerApi.endpoints.getAllTransactions.matchFulfilled, (state, { payload }) => {
        state.transactions = payload.transactions;
      });
  },
});

export default customerSlice.reducer;
