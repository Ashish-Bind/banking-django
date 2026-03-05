// pages/employee/AllCustomers.jsx
import { useState } from "react";
import {
  useGetCustomersOverviewQuery,
  useGetPendingKYCQuery,
  useApproveKYCRequestMutation,
  useRejectKYCRequestMutation,
} from "../api/employeeApi";
import {
  Loader2,
  Users,
  UserCheck,
  IndianRupee,
  Search,
  Mail,
  Phone,
  Calendar,
  Eye,
  X,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  File,
} from "lucide-react";

export default function AllCustomers() {
  const [activeTab, setActiveTab] = useState("all"); // "all" | "kyc"
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Queries
  const { data: allData, isLoading: loadingAll } = useGetCustomersOverviewQuery();
  const { data: kycData, isLoading: loadingKYC, refetch: refetchKYC } = useGetPendingKYCQuery();
  const [approveKYC] = useApproveKYCRequestMutation();
  const [rejectKYC] = useRejectKYCRequestMutation();

  if (loadingAll && loadingKYC) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-12 h-12 animate-spin text-teal-600" />
      </div>
    );
  }

  const { summary = {}, customers = [] } = allData || {};
  const pendingKYC = kycData || [];

  // Filter logic
  const filteredAll = customers.filter(
    (c) =>
      c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone?.includes(searchTerm)
  );

  const filteredKYC = pendingKYC.filter(
    (c) =>
      c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone?.includes(searchTerm)
  );

  const handleApprove = async (id) => {
    if (window.confirm("Approve this customer's KYC?")) {
      await approveKYC(id);
      refetchKYC();
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }
    await rejectKYC({ id: rejectingId, reason: rejectionReason });
    setRejectingId(null);
    setRejectionReason("");
    refetchKYC();
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Customer Management</h1>
        <p className="text-gray-600 mt-2">
          View all customers and manage KYC verification requests
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-10 border-b border-gray-200 mb-8">
        <button
          onClick={() => {
            setActiveTab("all");
            setSearchTerm("");
          }}
          className={`pb-4 px-2 font-semibold text-lg transition-all border-b-4 -mb-px flex items-center gap-3
            ${activeTab === "all"
              ? "border-teal-600 text-teal-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
        >
          <Users className="w-6 h-6" />
          All Customers
          <span className="ml-2 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
            {summary.total_customers || 0}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab("kyc");
            setSearchTerm("");
          }}
          className={`pb-4 px-2 font-semibold text-lg transition-all border-b-4 -mb-px flex items-center gap-3
            ${activeTab === "kyc"
              ? "border-orange-500 text-orange-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
        >
          <FileText className="w-6 h-6" />
          Pending KYC
          <span className="ml-2 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-bold">
            {pendingKYC.length}
          </span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={
              activeTab === "kyc"
                ? "Search pending KYC by name, email, phone..."
                : "Search customers by name, email, phone..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 border border-gray-300 rounded-xl focus:border-teal-500 outline-none transition"
          />
        </div>
      </div>

      {/* TAB 1: All Customers */}
      {activeTab === "all" && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-2xl p-6 shadow-lg">
              <Users className="w-10 h-10 mb-3" />
              <p className="text-blue-100">Total Customers</p>
              <p className="text-3xl font-bold">{summary.total_customers || 0}</p>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-6 shadow-lg">
              <UserCheck className="w-10 h-10 mb-3" />
              <p className="text-green-100">Active</p>
              <p className="text-3xl font-bold">{summary.active_customers || 0}</p>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-2xl p-6 shadow-lg">
              <IndianRupee className="w-10 h-10 mb-3" />
              <p className="text-purple-100">Total Balance</p>
              <p className="text-2xl font-bold">
                ₹{(summary.total_balance_in_bank || 0).toLocaleString("en-IN")}
              </p>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl p-6 shadow-lg">
              <Calendar className="w-10 h-10 mb-3" />
              <p className="text-orange-100">Total Accounts</p>
              <p className="text-3xl font-bold">{summary.total_accounts || 0}</p>
            </div>
          </div>

          {/* Customer Cards */}
          <div className="grid gap-6">
            {filteredAll.length === 0 ? (
              <p className="text-center text-gray-500 py-10">No customers found</p>
            ) : (
              filteredAll.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCustomer(c)}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition p-6 border border-gray-100 cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{c.full_name}</h3>
                      <div className="flex items-center gap-4 mt-2 text-gray-600">
                        <span className="flex items-center gap-2">
                          <Mail className="w-4 h-4" /> {c.email}
                        </span>
                        {c.phone && (
                          <span className="flex items-center gap-2">
                            <Phone className="w-4 h-4" /> {c.phone}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-2">Joined: {c.joined_date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-teal-600">
                        ₹{Number(c.total_balance || 0).toLocaleString("en-IN")}
                      </p>
                      <p className="text-sm text-gray-500">
                        {c.account_count} account{c.account_count !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* TAB 2: Pending KYC */}
      {activeTab === "kyc" && (
        <div className="grid gap-8">
          {filteredKYC.length === 0 ? (
            <div className="text-center py-20">
              <File className="w-20 h-20 mx-auto mb-4 text-gray-300" />
              <p className="text-xl font-medium text-gray-600">No pending KYC requests</p>
              <p className="text-gray-500">All customers are verified</p>
            </div>
          ) : (
            filteredKYC.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl shadow-lg border-2 border-orange-200 p-8"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{c.full_name}</h3>
                    <div className="flex flex-wrap gap-4 mt-3 text-gray-600">
                      <span className="flex items-center gap-2">
                        <Mail className="w-5 h-5" /> {c.email}
                      </span>
                      {c.phone && (
                        <span className="flex items-center gap-2">
                          <Phone className="w-5 h-5" /> {c.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Submitted: {new Date(c.kyc_submitted_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <span className="px-5 py-2 bg-orange-100 text-orange-700 rounded-full font-bold text-sm">
                    AWAITING APPROVAL
                  </span>
                </div>

                {/* Documents */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Aadhaar */}
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center bg-gray-50">
                    <FileText className="w-14 h-14 mx-auto text-teal-600 mb-4" />
                    <h4 className="font-bold text-lg">Aadhaar Card</h4>
                    <p className="text-gray-600 mt-1">{c.aadhaar_number || "Not provided"}</p>
                    {c.aadhaar_doc && (
                      <button
                        onClick={() => setSelectedDoc({ type: "Aadhaar", url: c.aadhaar_doc })}
                        className="mt-4 text-teal-600 hover:text-teal-700 font-medium flex items-center gap-2 mx-auto"
                      >
                        <Eye className="w-5 h-5" /> View Document
                      </button>
                    )}
                  </div>

                  {/* PAN */}
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center bg-gray-50">
                    <FileText className="w-14 h-14 mx-auto text-purple-600 mb-4" />
                    <h4 className="font-bold text-lg">PAN Card</h4>
                    <p className="text-gray-600 mt-1">{c.pan_number || "Not provided"}</p>
                    {c.pan_doc && (
                      <button
                        onClick={() => setSelectedDoc({ type: "PAN", url: c.pan_doc })}
                        className="mt-4 text-purple-600 hover:text-purple-700 font-medium flex items-center gap-2 mx-auto"
                      >
                        <Eye className="w-5 h-5" /> View Document
                      </button>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-end">
                  <button
                    onClick={() => setRejectingId(c.id)}
                    className="px-8 py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition flex items-center gap-3 text-lg font-medium"
                  >
                    <XCircle className="w-6 h-6" /> Reject KYC
                  </button>
                  <button
                    onClick={() => handleApprove(c.id)}
                    className="px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition flex items-center gap-3 text-lg font-medium"
                  >
                    <CheckCircle className="w-6 h-6" /> Approve KYC
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-3xl font-bold">Customer Profile</h2>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-8 h-8" />
              </button>
            </div>
            <div className="space-y-4 text-lg">
              <div><strong>Name:</strong> {selectedCustomer.full_name}</div>
              <div><strong>Email:</strong> {selectedCustomer.email}</div>
              <div><strong>Phone:</strong> {selectedCustomer.phone || "Not provided"}</div>
              <div><strong>Total Balance:</strong> ₹{Number(selectedCustomer.total_balance || 0).toLocaleString("en-IN")}</div>
              <div><strong>Accounts:</strong> {selectedCustomer.account_count}</div>
              <div><strong>Status:</strong> <span className="text-green-600 font-bold">Active</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-screen overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
              <h3 className="text-2xl font-bold">{selectedDoc.type} Document</h3>
              <button onClick={() => setSelectedDoc(null)} className="text-gray-500 hover:text-gray-700">
                <X className="w-8 h-8" />
              </button>
            </div>
            <div className="p-6">
              {selectedDoc.url?.endsWith(".pdf") ? (
                <iframe src={selectedDoc.url} className="w-full h-screen min-h-96 border rounded-xl" title={selectedDoc.type} />
              ) : (
                <img src={selectedDoc.url} alt={selectedDoc.type} className="max-w-full h-auto rounded-xl shadow-lg mx-auto" />
              )}
              <div className="mt-6 text-center">
                <a
                  href={selectedDoc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-teal-600 text-white rounded-xl hover:bg-teal-700 text-lg font-medium"
                >
                  <Download className="w-6 h-6" /> Download Original
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {rejectingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-3 text-red-600">
              <AlertCircle className="w-8 h-8" />
              Reject KYC
            </h3>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter reason for rejection (required)"
              className="w-full p-4 border border-gray-300 rounded-xl focus:border-red-500 outline-none h-32 resize-none"
            />
            <div className="flex gap-4 mt-6 justify-end">
              <button
                onClick={() => {
                  setRejectingId(null);
                  setRejectionReason("");
                }}
                className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-8 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}