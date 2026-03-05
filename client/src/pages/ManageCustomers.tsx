// pages/employee/ManageAccounts.jsx
import { useState } from "react";
import {
  useGetAllAccountsQuery,
  useGetPendingAccountsQuery,
  useApproveAccountMutation,
  useRejectAccountMutation,
} from "../api/employeeApi";
import {
  Loader2, IndianRupee, User, Calendar, Search,
  CheckCircle, XCircle, AlertCircle, FileText, Eye, X
} from "lucide-react";

export default function ManageAccounts() {
  const [activeTab, setActiveTab] = useState("all"); // "all" or "pending"
  const [searchTerm, setSearchTerm] = useState("");
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const { data: allAccounts = [], isLoading: loadingAll } = useGetAllAccountsQuery();
  const { data: pendingAccounts = [], isLoading: loadingPending, refetch: refetchPending } = useGetPendingAccountsQuery();
  const [approveAccount] = useApproveAccountMutation();
  const [rejectAccount] = useRejectAccountMutation();

  if (loadingAll || loadingPending) {
    return <div className="flex justify-center py-20"><Loader2 className="w-12 h-12 animate-spin text-teal-600" /></div>;
  }

  const filteredAll = allAccounts.filter(acc =>
    acc.account_number.includes(searchTerm) ||
    acc.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPending = pendingAccounts.filter(acc =>
    acc.account_number.includes(searchTerm) ||
    acc.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApprove = async (id) => {
    if (confirm("Approve this account request?")) {
      await approveAccount(id);
      refetchPending();
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return alert("Reason required");
    await rejectAccount({ id: rejectingId, reason: rejectionReason });
    setRejectingId(null);
    setRejectionReason("");
    refetchPending();
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Manage Accounts</h1>
        <p className="text-gray-600 mt-2">View all accounts and approve pending requests</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-gray-200 mb-8">
        <button
          onClick={() => setActiveTab("all")}
          className={`pb-4 px-2 font-semibold text-lg border-b-4 -mb-px ${activeTab === "all" ? "border-teal-600 text-teal-600" : "border-transparent text-gray-500"}`}
        >
          All Accounts ({allAccounts.length})
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`pb-4 px-2 font-semibold text-lg border-b-4 -mb-px ${activeTab === "pending" ? "border-orange-500 text-orange-600" : "border-transparent text-gray-500"}`}
        >
          Pending Requests ({pendingAccounts.length})
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by account number or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 border border-gray-300 rounded-xl focus:border-teal-500 outline-none"
          />
        </div>
      </div>

      {/* All Accounts Tab */}
      {activeTab === "all" && (
        <div className="grid gap-6">
          {filteredAll.map((acc) => (
            <div key={acc.id} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-bold text-teal-600 font-mono">{acc.account_number}</h3>
                    <span className="px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-bold">
                      {acc.account_type}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-2 flex items-center gap-2">
                    <User className="w-5 h-5" /> {acc.customer_name}
                  </p>
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                    <Calendar className="w-5 h-5" /> Opened: {new Date(acc.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold text-gray-800">₹{Number(acc.balance).toLocaleString("en-IN")}</p>
                  <p className="text-sm text-gray-500">Current Balance</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pending Requests Tab */}
      {activeTab === "pending" && (
        <div className="grid gap-6">
          {filteredPending.map((acc) => (
            <div key={acc.id} className="bg-white rounded-2xl shadow-lg p-6 border border-orange-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 font-mono">{acc.account_number}</h3>
                  <p className="text-gray-600 mt-2 flex items-center gap-2">
                    <User className="w-5 h-5" /> {acc.customer_name} ({acc.customer_email})
                  </p>
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                    <Calendar className="w-5 h-5" /> Requested: {new Date(acc.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-bold">
                  {acc.account_type}
                </span>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 p-4 rounded-xl mt-4">
                <p className="font-medium">Customer KYC: <span className="text-green-600">{acc.kyc_status}</span></p>
                <button 
                  onClick={() => setSelectedCustomer(acc)} 
                  className="mt-2 text-teal-600 hover:underline flex items-center gap-1"
                >
                  <Eye className="w-4 h-4" /> View Customer Profile
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-4 mt-6 justify-end">
                <button
                  onClick={() => setRejectingId(acc.id)}
                  className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 flex items-center gap-2"
                >
                  <XCircle className="w-5 h-5" /> Reject
                </button>
                <button
                  onClick={() => handleApprove(acc.id)}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 flex items-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" /> Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rejection Modal */}
      {rejectingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <AlertCircle className="w-7 h-7 text-red-600" />
              Reject Account
            </h3>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter reason for rejection (required)"
              className="w-full p-4 border border-gray-300 rounded-xl focus:border-red-500 outline-none h-32 resize-none"
            />
            <div className="flex gap-4 mt-6 justify-end">
              <button
                onClick={() => setRejectingId(null)}
                className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Profile Modal (simple for now) */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-3xl font-bold">Customer Profile</h2>
              <button onClick={() => setSelectedCustomer(null)} className="text-gray-500 hover:text-gray-700">
                <X className="w-8 h-8" />
              </button>
            </div>
            <div className="space-y-4 text-lg">
              <div><strong>Name:</strong> {selectedCustomer.customer_name}</div>
              <div><strong>Email:</strong> {selectedCustomer.customer_email}</div>
              <div><strong>Phone:</strong> {selectedCustomer.customer_phone || "N/A"}</div>
              <div><strong>KYC Status:</strong> {selectedCustomer.kyc_status}</div>
              {/* Add more if needed */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}