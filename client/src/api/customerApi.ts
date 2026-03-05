import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const customerApi = createApi({
  reducerPath: 'customerApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8000/api/',  // your Django URL
    credentials: 'include', // sends httpOnly cookies
  }),
  endpoints: (builder) => ({
    // Get logged-in customer's full profile + accounts
    getCustomerDashboard: builder.query({
      query: () => 'customers/dashboard/',
      providesTags:['Dashboard'],  // we'll create this endpoint
    }),
    getAllTransactions: builder.query({
      query: () => 'transactions/customer/',
      providesTags:['Transactions']
    }),
    getBeneficiaries: builder.query({
      query: () => 'transactions/beneficiaries/',
      providesTags: ['Beneficiaries'],
    }),
    getRecentTransfers: builder.query({
      query: () => 'transactions/recent-transfers/',
      providesTags: ['Recent'],
    }),

    addBeneficiary: builder.mutation({
      query: (data) => ({
        url: 'transactions/beneficiaries/add/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Beneficiaries'],
    }),

    // 4. Transfer Money
    transfer: builder.mutation({
      query: (data) => ({
        url: 'transactions/transfer/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Transactions', 'Dashboard', 'Recent'], // Refetch balance & transactions
    }),
    getMyLoans: builder.query({
      query: () => 'loans/my/',
      providesTags: ['Loans'],
    }),

    getLoanDetail: builder.query({
      query: (loanId) => `loans/${loanId}/`,
      providesTags: (result, error, loanId) => [{ type: 'Loans', id: loanId }],
    }),

    payEMI: builder.mutation({
      query: ({ loanId }) => ({
        url: `loans/${loanId}/pay-emi/`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, { loanId }) => [
        'Loans',
        { type: 'Loans', id: loanId },
        'Transactions',
        'Dashboard',
      ],
    }),

    applyLoan: builder.mutation({
      query: (data) => ({
        url: 'loans/apply/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Loans'],
    }),

    getLoanEligibility: builder.query({
      query: () => 'loans/eligibility/',
      providesTags: ['Eligibility'],
    }),

    requestDeposit: builder.mutation({
      query: (data) => ({
        url: "/transactions/requests/deposit/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Transfer"],
    }),

    requestWithdrawal: builder.mutation({
      query: (data) => ({
        url: "/transactions/requests/withdraw/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Transfer"],
    }),
    updateProfile: builder.mutation({
      query: (data) => ({
        url: '/customers/profile/',
        method: 'PATCH',
        body: data,
      }),
    }),
    uploadKYC: builder.mutation({
      query: (formData) => ({
        url: '/customers/kyc/upload/',
        method: 'POST',
        body: formData,
      }),
    }),
    getCustomerAccounts: builder.query({
      query: () => 'customers/accounts/',  // We'll create this endpoint
      providesTags: ['CustomerAccounts'],
    }),

    // Apply for new account
    applyAccount: builder.mutation({
      query: (data) => ({
        url: 'customers/apply-account/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['CustomerAccounts', 'Dashboard'], // Refreshes both
    }),
    }),
});

export const {
  useGetCustomerDashboardQuery,
  useGetAllTransactionsQuery,
  useGetRecentTransfersQuery,
  useGetBeneficiariesQuery,
  useAddBeneficiaryMutation,
  useTransferMutation,
  useApplyLoanMutation,
  usePayEMIMutation,
  useGetLoanDetailQuery,
  useGetMyLoansQuery,
  useRequestDepositMutation,
  useRequestWithdrawalMutation,
  useUpdateProfileMutation,
  useUploadKYCMutation,
  useGetCustomerAccountsQuery,
  useApplyAccountMutation,
  useGetLoanEligibilityQuery,
} = customerApi;