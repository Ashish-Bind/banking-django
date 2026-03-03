// api/employeeApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const employeeApi = createApi({
  reducerPath: "employeeApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8000/api/",
    credentials: 'include'
  }),
  tagTypes: ["CashRequest"],
  endpoints: (builder) => ({
    getPendingDeposits: builder.query({
      query: () => "transactions/pending-deposits/",
      providesTags: ["CashRequest"],
    }),
    getPendingWithdrawals: builder.query({
      query: () => "transactions/pending-withdrawals/",
      providesTags: ["CashRequest"],
    }),
    getApprovedRequests: builder.query({
      query: () => "transactions/approved-requests/",
      providesTags: ["CashRequest"],
    }),
    getRejectedRequests: builder.query({
      query: () => "transactions/rejected-requests/",
      providesTags: ["CashRequest"],
    }),

    approveDeposit: builder.mutation({
      query: (id) => ({
        url: `transactions/approve-deposit/${id}/`,
        method: "POST",
      }),
      invalidatesTags: ["CashRequest"],
    }),
    rejectDeposit: builder.mutation({
      query: (id) => ({
        url: `transactions/reject-deposit/${id}/`,
        method: "POST",
      }),
      invalidatesTags: ["CashRequest"],
    }),
    approveWithdrawal: builder.mutation({
      query: (id) => ({
        url: `transactions/approve-withdrawal/${id}/`,
        method: "POST",
      }),
      invalidatesTags: ["CashRequest"],
    }),
    rejectWithdrawal: builder.mutation({
      query: (id) => ({
        url: `transactions/reject-withdrawal/${id}/`,
        method: "POST",
      }),
      invalidatesTags: ["CashRequest"],
    }),
    getPendingLoans: builder.query({
      query: () => "loans/pending/",
      providesTags: ["PendingLoans"],
    }),
    processLoan: builder.mutation({
      query: ({ loan_id, ...data }) => ({
        url: `loans/process/${loan_id}/`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["PendingLoans"],
    }),
    getApprovedLoans: builder.query({
      query: () => "/loans/approved/",
      providesTags: ["ApprovedLoans"],
    }),
    getCustomersOverview: builder.query({
      query: () => "/customers/overview/",
      providesTags: ["Customers"],
    }),
    getPendingKYC: builder.query({
      query: () => "/customers/kyc/pending/",
      transformResponse: (response) => response,
    }),

    approveKYCRequest: builder.mutation({
      query: (customerId) => ({
        url: `/customers/kyc/${customerId}/approve/`,
        method: "POST",
      }),
    }),

    rejectKYCRequest: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/customers/kyc/${id}/reject/`,
        method: "POST",
        body: { reason },
      }),
    }),
    getAllAccounts: builder.query({
      query: () => '/customers/accounts/all/',
    }),

    getPendingAccounts: builder.query({
      query: () => '/customers/accounts/pending/',
    }),

    approveAccount: builder.mutation({
      query: (id) => ({
        url: `/customers/accounts/${id}/approve/`,
        method: 'POST',
      }),
      invalidatesTags: ['Accounts'], // Add tag if needed
    }),

    rejectAccount: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/customers/accounts/${id}/reject/`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['Accounts'],
    }),
    getEmployeeDashboard: builder.query({
      query: () => "/customers/employee/dashboard/",
      providesTags: ["Dashboard"],
    }),
  }),
});

export const {
  useGetPendingDepositsQuery,
  useGetPendingWithdrawalsQuery,
  useGetApprovedRequestsQuery,
  useGetRejectedRequestsQuery,
  useApproveDepositMutation,
  useRejectDepositMutation,
  useApproveWithdrawalMutation,
  useRejectWithdrawalMutation,
  useGetPendingLoansQuery,
  useProcessLoanMutation,
  useGetApprovedLoansQuery,
  useGetCustomersOverviewQuery,
  useGetPendingKYCQuery,
  useApproveKYCRequestMutation,
  useRejectKYCRequestMutation,
  useGetAllAccountsQuery,
  useGetPendingAccountsQuery,
  useApproveAccountMutation,
  useRejectAccountMutation,
  useGetEmployeeDashboardQuery,
} = employeeApi;