// pages/employee/CashRequests.jsx
import { useEffect, useState } from "react";
import {
  useGetPendingDepositsQuery,
  useGetPendingWithdrawalsQuery,
  useGetApprovedRequestsQuery,
  useGetRejectedRequestsQuery,
  useApproveDepositMutation,
  useRejectDepositMutation,
  useApproveWithdrawalMutation,
  useRejectWithdrawalMutation,
} from "../api/employeeApi";
import {
  Download,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Wallet,
  IndianRupee,
  Loader2,
} from "lucide-react";
import { useSelector } from "react-redux";
import { currencyFormatter } from "../utils";

const TabButton = ({ active, onClick, label, icon: Icon, count = 0 }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-6 py-4 font-medium transition-colors border-b-2 ${
      active
        ? "text-teal-600 border-teal-600 bg-teal-50"
        : "text-gray-500 border-transparent hover:text-gray-700"
    }`}
  >
    <Icon className="w-5 h-5" />
    {label}
    {count > 0 && (
      <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
        {count}
      </span>
    )}
  </button>
);

const RequestCard = ({ req, type, onApprove, onReject, approving, rejecting }) => {
  const isDeposit = type === "deposit";
  const Icon = isDeposit ? Download : Upload;
  const color = isDeposit ? "text-teal-600 bg-teal-50" : "text-orange-600 bg-orange-50";

  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-800">
            {currencyFormatter(req.amount)}
          </p>
          <p className="text-sm text-gray-500">
            {new Date(req.created_at).toLocaleDateString("en-IN")}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 text-gray-700">
          <User className="w-5 h-5 text-gray-400" />
          <div>
            <p className="font-medium">{req.customer_name}</p>
            <p className="text-sm text-gray-500">Customer</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-gray-700">
          <Wallet className="w-5 h-5 text-gray-400" />
          <div>
            <p className="font-medium">••••{req.account_number?.slice(-4)}</p>
            <p className="text-sm text-gray-500">{req?.account_type}</p>
          </div>
        </div>
      </div>

      {req.status === "PENDING" && (
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => onApprove(req.id)}
            disabled={approving || rejecting}
            className="flex-1 bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {approving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
            Approve
          </button>
          <button
            onClick={() => onReject(req.id)}
            disabled={approving || rejecting}
            className="flex-1 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {rejecting ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
            Reject
          </button>
        </div>
      )}

      {req.status === "APPROVED" && (
        <div className="mt-4 text-center text-green-600 font-medium flex items-center justify-center gap-2">
          <CheckCircle className="w-5 h-5" /> Approved
        </div>
      )}
      {req.status === "REJECTED" && (
        <div className="mt-4 text-center text-red-600 font-medium flex items-center justify-center gap-2">
          <XCircle className="w-5 h-5" /> Rejected
        </div>
      )}
    </div>
  );
};

export default function CashRequests() {
  const [activeTab, setActiveTab] = useState("pending-deposits");

  const {
    pendingDeposits,
    pendingWithdrawals,
    approvedRequests,
    rejectedRequests,
    loading,
  } = useSelector((state) => state.employee);

  useGetPendingDepositsQuery();
  useGetPendingWithdrawalsQuery();
  useGetApprovedRequestsQuery();
  useGetRejectedRequestsQuery();

  const totalPending = pendingDeposits.length + pendingWithdrawals.length;
  
  const approved = approvedRequests.length > 0 && !loading ? [...approvedRequests.deposits, ...approvedRequests.withdrawals] : []
  const rejected = rejectedRequests.length > 0 && !loading ? [...rejectedRequests.deposits, ...rejectedRequests.withdrawals] : []

  const [approveDeposit, { isLoading: approvingDeposit }] = useApproveDepositMutation();
  const [rejectDeposit, { isLoading: rejectingDeposit }] = useRejectDepositMutation();
  const [approveWithdrawal, { isLoading: approvingWithdrawal }] = useApproveWithdrawalMutation();
  const [rejectWithdrawal, { isLoading: rejectingWithdrawal }] = useRejectWithdrawalMutation();

  const handleApprove = async (id, type) => {
    try {
      if (type === "deposit") await approveDeposit(id).unwrap();
      else await approveWithdrawal(id).unwrap();
      alert("Request approved successfully!");
    } catch (err) {
      alert("Failed to approve request");
    }
  };

  const handleReject = async (id, type) => {
    try {
      if (type === "deposit") await rejectDeposit(id).unwrap();
      else await rejectWithdrawal(id).unwrap();
      alert("Request rejected");
    } catch (err) {
      alert("Failed to reject request");
    }
  };

  const tabs = [
    {
      key: "pending-deposits",
      label: "Pending Deposits",
      icon: Download,
      count: pendingDeposits.length,
      data: pendingDeposits,
      type: "deposit",
    },
    {
      key: "pending-withdrawals",
      label: "Pending Withdrawals",
      icon: Upload,
      count: pendingWithdrawals.length,
      data: pendingWithdrawals,
      type: "withdrawal",
    },
    {
      key: "approved",
      label: "Approved",
      icon: CheckCircle,
      data: approved,

    },
    {
      key: "rejected",
      label: "Rejected",
      icon: XCircle,
      data: rejected,
    },
  ];

  const currentTab = tabs.find((t) => t.key === activeTab);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Cash Requests</h1>
        <p className="text-gray-600 mt-2">Manage customer deposit & withdrawal requests</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab) => (
          <TabButton
            key={tab.key}
            active={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
            label={tab.label}
            icon={tab.icon}
            count={tab.count}
          />
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-20">
          <Loader2 className="w-12 h-12 animate-spin text-teal-600 mx-auto" />
        </div>
      ) : currentTab.data.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-xl">No {currentTab.label.toLowerCase()} at the moment</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentTab?.data.map((req) => (
            <RequestCard
              key={req.id}
              req={req}
              type={currentTab.type || (req.amount > 0 ? "deposit" : "withdrawal")}
              onApprove={(id) => handleApprove(id, currentTab.type)}
              onReject={(id) => handleReject(id, currentTab.type)}
              approving={approvingDeposit || approvingWithdrawal}
              rejecting={rejectingDeposit || rejectingWithdrawal}
            />
          ))}
        </div>
      )}
    </div>
  );
}