// pages/customer/MyAccounts.jsx
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  CreditCard, IndianRupee, ArrowRight, Eye, EyeOff, Copy, Download,
  QrCode, RefreshCw, Shield, TrendingUp, CheckCircle, XCircle, Clock, Plus
} from "lucide-react";
import {
  useApplyAccountMutation,
  useGetCustomerAccountsQuery
} from "../api/customerApi";
import toast from "react-hot-toast";

export default function MyAccounts() {
  const [showBalance, setShowBalance] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [accountType, setAccountType] = useState("savings");

  const { user } = useSelector(state => state.auth);
  const {profile } = useSelector(state => state.customer)
  const { data: accountsData, refetch } = useGetCustomerAccountsQuery();
  const [applyAccount, { isLoading: applying }] = useApplyAccountMutation();

  const accounts = accountsData?.accounts || [];

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleApplyAccount = async () => {
    if (!profile.kyc_status === "verified") {
      toast.error("KYC must be verified first!");
      return;
    }

    try {
      await applyAccount({ account_type: accountType }).unwrap();
      toast.success("Account request submitted! Awaiting approval.");
      setShowApplyForm(false);
      refetch();
    } catch (err) {
      toast.error(err.data?.error || "Failed to apply");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatAccount = (acc) => `•••• •••• •••• ${acc.slice(-4)}`;

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Active</span>;
      case "pending":
        return <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold flex items-center gap-1"><Clock className="w-3 h-3" /> Pending Approval</span>;
      case "rejected":
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejected</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">{status}</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-10 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Accounts</h1>
          <p className="text-gray-600 mt-2">Manage your bank accounts and apply for new ones</p>
        </div>

        {/* Apply New Account Button */}
        <button
          onClick={() => setShowApplyForm(true)}
          className="px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 shadow-lg transition flex items-center gap-3"
        >
          <Plus className="w-5 h-5" />
          Apply for New Account
        </button>
      </div>

      {/* Accounts Grid */}
      <div className="grid lg:grid-cols-2 gap-8 mb-10">
        {accounts.length === 0 ? (
          <div className="col-span-2 text-center py-20 bg-gray-50 rounded-3xl">
            <CreditCard className="w-20 h-20 mx-auto text-gray-300 mb-4" />
            <p className="text-xl text-gray-500">No accounts yet</p>
            <p className="text-gray-400 mt-2">Apply for your first account to get started</p>
          </div>
        ) : (
          accounts.map((account) => (
            <div
              key={account.id}
              className={`relative overflow-hidden rounded-3xl shadow-xl transition-all hover:shadow-2xl ${
                account.status !== "active"
                  ? "grayscale opacity-90"
                  : account.account_type === "savings"
                  ? "bg-gradient-to-br from-teal-600 to-purple-700 text-white"
                  : "bg-gradient-to-br from-gray-800 to-gray-900 text-white"
              }`}
            >
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 right-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
                <div className="absolute bottom-10 left-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
              </div>

              <div className="relative p-8">
                {/* Status Badge */}
                {/* <div className="absolute top-6 right-6">
                  {getStatusBadge(account.status)}
                </div> */}

                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-bold capitalize">{account.account_type} Account</h3>
                    <p className="text-sm opacity-90 mt-1 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                    </p>
                  </div>
                  <CreditCard className="w-16 h-16 opacity-80" />
                </div>

                {/* Balance */}
                {account.status === "active" && (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm opacity-90">Available Balance</p>
                      <button
                        onClick={() => setShowBalance(!showBalance)}
                        className="text-sm opacity-90 hover:opacity-100 flex items-center gap-2"
                      >
                        {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {showBalance ? "Hide" : "Show"}
                      </button>
                    </div>
                    <div className="text-5xl font-bold">
                      {showBalance ? `₹${Number(account.balance).toLocaleString("en-IN")}` : "••••••"}
                    </div>
                  </div>
                )}

                {account.status === "pending" && (
                  <div className="mb-8 text-center py-8 bg-white bg-opacity-20 rounded-2xl">
                    <Clock className="w-16 h-16 mx-auto mb-4 opacity-70" />
                    <p className="text-lg font-medium">Your account is under review</p>
                    <p className="text-sm opacity-80 mt-2">We'll notify you once approved</p>
                  </div>
                )}

                {/* Account Details */}
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center rounded-xl p-4 backdrop-blur">
                    <div>
                      <p className="opacity-90">Account Number</p>
                      <p className="font-mono text-lg font-bold">
                        {account.status === "active" ? formatAccount(account.account_number) : account.account_number}
                      </p>
                    </div>
                    {account.status === "active" && (
                      <button
                        onClick={() => copyToClipboard(account.account_number)}
                        className="p-3 rounded-lg transition"
                      >
                        {copied ? <CheckCircle className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl p-4 backdrop-blur">
                      <p className="opacity-90">IFSC Code</p>
                      <p className="font-mono font-bold">FINZ00001</p>
                    </div>
                    <div className="rounded-xl p-4 backdrop-blur">
                      <p className="opacity-90">Branch</p>
                      <p className="font-bold">Mumbai Main</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Apply Form Modal */}
      {showApplyForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Apply for New Account</h2>
              <button
                onClick={() => setShowApplyForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="w-8 h-8" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Select Account Type</label>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`relative cursor-pointer border-2 rounded-2xl p-6 text-center transition-all ${accountType === "savings" ? "border-teal-600 bg-teal-50" : "border-gray-300"}`}>
                    <input
                      type="radio"
                      name="type"
                      value="savings"
                      checked={accountType === "savings"}
                      onChange={(e) => setAccountType(e.target.value)}
                      className="sr-only"
                    />
                    <div className="font-bold text-lg">Savings</div>
                    <p className="text-sm text-gray-600 mt-1">4% interest • Daily limits</p>
                  </label>

                  <label className={`relative cursor-pointer border-2 rounded-2xl p-6 text-center transition-all ${accountType === "current" ? "border-purple-600 bg-purple-50" : "border-gray-300"}`}>
                    <input
                      type="radio"
                      name="type"
                      value="current"
                      checked={accountType === "current"}
                      onChange={(e) => setAccountType(e.target.value)}
                      className="sr-only"
                    />
                    <div className="font-bold text-lg">Current</div>
                    <p className="text-sm text-gray-600 mt-1">For business • No interest</p>
                  </label>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6">
                <p className="text-sm text-gray-600">
                  Your KYC is verified. Account will be activated within 24 hours after approval.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowApplyForm(false)}
                  className="flex-1 py-4 border-2 border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyAccount}
                  disabled={applying}
                  className="flex-1 py-4 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 disabled:opacity-70 transition flex items-center justify-center gap-3"
                >
                  {applying ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rest of your info cards & buttons */}
      {accounts.some(a => a.status === "active") && (
        <>
          <div className="grid md:grid-cols-3 gap-6 mt-10">
            <InfoCard title="Interest Rate" value="4.0% p.a." desc="On Savings Account" icon={<TrendingUp className="w-8 h-8" />} color="from-green-500 to-emerald-600" />
            <InfoCard title="Free Transactions" value="Unlimited" desc="NEFT, RTGS, IMPS" icon={<IndianRupee className="w-8 h-8" />} color="from-teal-500 to-cyan-600" />
            <InfoCard title="Debit Card" value="Active" desc="Visa Platinum •••• 1234" icon={<CreditCard className="w-8 h-8" />} color="from-purple-500 to-pink-600" />
          </div>

          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <button className="px-8 py-4 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 shadow-lg transition flex items-center gap-3">
              <ArrowRight className="w-5 h-5" />
              Transfer Money
            </button>
            <button className="px-8 py-4 border-2 border-teal-600 text-teal-600 rounded-xl font-bold hover:bg-teal-50 transition">
              Request Cheque Book
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function InfoCard({ title, value, desc, icon, color }) {
  return (
    <div className={`bg-gradient-to-br ${color} text-white rounded-2xl p-6 shadow-lg`}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-white bg-opacity-20 rounded-xl">{icon}</div>
      </div>
      <h4 className="text-3xl font-bold">{value}</h4>
      <p className="text-sm opacity-90 mt-2">{title}</p>
      <p className="text-xs opacity-80 mt-1">{desc}</p>
    </div>
  );
}