// pages/customer/TransferMoney.jsx
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  useTransferMutation,
  useGetBeneficiariesQuery,
  useAddBeneficiaryMutation,
  useGetRecentTransfersQuery,
  useRequestDepositMutation,
  useRequestWithdrawalMutation,
} from "../api/customerApi";
import {
  ArrowRight,
  UserPlus,
  CheckCircle,
  Loader2,
  ArrowLeft,
  History,
  ArrowUpRight,
  Download,
  Upload,
  SendToBack,
} from "lucide-react";
import { currencyFormatter } from "../utils";
import toast from "react-hot-toast";

export default function TransferMoney() {
  const [activeSection, setActiveSection] = useState("beneficiary"); // beneficiary | account | deposit | withdraw
  const [amount, setAmount] = useState("");
  const [remark, setRemark] = useState("");
  const [toAccountNumber, setToAccountNumber] = useState("");
  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [saveAsBeneficiary, setSaveAsBeneficiary] = useState(true);
  const [selectedFromAccount, setSelectedFromAccount] = useState(null);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const { accounts } = useSelector((state) => state.customer);
  const { data: beneficiariesData } = useGetBeneficiariesQuery();
  const beneficiaries = beneficiariesData?.beneficiaries || [];

  const [transfer, { isLoading: transferring }] = useTransferMutation();
  const [addBeneficiary, { isLoading: adding }] = useAddBeneficiaryMutation();
  const [requestDeposit, { isLoading: depositing }] = useRequestDepositMutation();
  const [requestWithdrawal, { isLoading: withdrawing }] = useRequestWithdrawalMutation();

  const { data: recentTransfersData } = useGetRecentTransfersQuery();
  const recentTransfers = recentTransfersData?.recent_transfers || [];

  useEffect(() => {
    if (accounts?.length > 0 && !selectedFromAccount) {
      setSelectedFromAccount(accounts[0]);
    }
  }, [accounts]);

  const handleTransfer = async () => {
    try {
      if(amount < 0){
        toast('Amount cannot be negative',{icon:"❌"})
        return
      }

      const payload = {
        from_account: selectedFromAccount.id,
        amount: parseFloat(amount),
        remark: remark || "Transfer",
        to_account_number:
          activeSection === "beneficiary"
            ? selectedBeneficiary.account_number
            : toAccountNumber,
      };

      await transfer(payload).unwrap();

      if (activeSection === "account" && saveAsBeneficiary && beneficiaryName) {
        await addBeneficiary({
          name: beneficiaryName,
          account_number: toAccountNumber,
        }).unwrap();
      }

      setSuccessMessage(`₹${amount} sent successfully!`);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        resetTransferForm();
      }, 3000);
    } catch (err) {
      alert(err.data?.error || "Transfer failed.");
    }
  };

  const handleDeposit = async () => {
    try {
      if(amount < 0){
        toast('Amount cannot be negative',{icon:"❌"})
        return
      }

      await requestDeposit({
        account: selectedFromAccount.id,
        amount: parseFloat(amount),
      }).unwrap();
      setSuccessMessage("Deposit request submitted!");
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setAmount("");
      }, 3000);
    } catch (err) {
      alert(err.data?.error || "Deposit request failed.");
    }
  };

  const handleWithdraw = async () => {
    try {
      if(amount < 0){
        toast('Amount cannot be negative',{icon:"❌"})
        return
      }

      await requestWithdrawal({
        account: selectedFromAccount.id,
        amount: parseFloat(amount),
      }).unwrap();
      setSuccessMessage("Withdrawal request submitted!");
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setAmount("");
      }, 3000);
    } catch (err) {
      alert(err.data?.error || "Withdrawal request failed.");
    }
  };

  const resetTransferForm = () => {
    setAmount("");
    setRemark("");
    setToAccountNumber("");
    setBeneficiaryName("");
    setSelectedBeneficiary(null);
  };

  return (
    <div className="max-w-6xl mx-auto py-4">
      {/* Success Animation */}
      {showSuccess && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-10 shadow-2xl text-center animate-pulse">
            <CheckCircle className="w-20 h-20 text-teal-600 mx-auto mb-4" />
            <h3 className="text-3xl font-bold text-gray-800">{successMessage}</h3>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-800">Money Movement</h1>
        <p className="text-gray-600 mt-2">Transfer, deposit or withdraw instantly</p>
      </div>

      {/* 4 Tabs */}
      <div className="flex gap-1 mb-8 border-b border-gray-200">
        {[
          { key: "beneficiary", label: "Saved Beneficiaries", icon: UserPlus  },
          { key: "account", label: "New Transfer", icon: SendToBack },
          { key: "deposit", label: "Request Deposit", icon: Download },
          { key: "withdraw", label: "Request Withdrawal", icon: Upload },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => {
              setActiveSection(key);
              resetTransferForm();
            }}
            className={`flex items-center gap-2 pb-4 px-6 font-medium transition ${
              activeSection === key
                ? "text-teal-600 border-b-4 border-teal-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {Icon && <Icon className="w-5 h-5" />}
            {label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* === TRANSFER SECTIONS === */}
            {(activeSection === "beneficiary" || activeSection === "account") && (
              <>
                {/* From Account */}
                <div className="mb-8">
                  <label className="text-lg font-semibold text-gray-700">From Account</label>
                  <select
                    value={selectedFromAccount?.id || ""}
                    onChange={(e) =>
                      setSelectedFromAccount(accounts.find((a) => a.id === parseInt(e.target.value)))
                    }
                    className="mt-3 w-full px-6 py-5 border-2 border-gray-300 rounded-xl text-lg focus:border-teal-500"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.account_type} ••••{acc.account_number.slice(-4)} — ₹{acc.balance.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Saved Beneficiary */}
                {activeSection === "beneficiary" && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-semibold">Select Beneficiary</h3>
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="text-teal-600 flex items-center gap-2 hover:underline"
                      >
                        <UserPlus className="w-5 h-5" /> Add New
                      </button>
                    </div>
                    <div className="space-y-3">
                      {beneficiaries.length === 0 ? (
                        <p className="text-center text-gray-500 py-10">No saved beneficiaries</p>
                      ) : (
                        beneficiaries.map((b) => (
                          <div
                            key={b.id}
                            onClick={() => {
                              setSelectedBeneficiary(b);
                              setAmount("");
                              setRemark("");
                            }}
                            className={`p-5 border-2 rounded-xl cursor-pointer transition ${
                              selectedBeneficiary?.id === b.id
                                ? "border-teal-500 bg-teal-50"
                                : "border-gray-200 hover:border-teal-500"
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 bg-teal-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                                {b.name[0]}
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-lg">{b.name}</p>
                                <p className="text-gray-500">••••{b.account_number.slice(-4)}</p>
                              </div>
                              <ArrowRight className="w-6 h-6 text-gray-400" />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* New Transfer */}
                {activeSection === "account" && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold">Recipient Details</h3>
                    <input
                      type="text"
                      placeholder="Account Number"
                      value={toAccountNumber}
                      onChange={(e) => setToAccountNumber(e.target.value)}
                      className="w-full px-6 py-5 border-2 rounded-xl text-lg focus:border-teal-500"
                    />
                    <input
                      type="text"
                      placeholder="Recipient Name (optional)"
                      value={beneficiaryName}
                      onChange={(e) => setBeneficiaryName(e.target.value)}
                      className="w-full px-6 py-5 border rounded-xl"
                    />
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={saveAsBeneficiary}
                        onChange={(e) => setSaveAsBeneficiary(e.target.checked)}
                      />
                      <span>Save as beneficiary</span>
                    </label>
                  </div>
                )}

                {/* Amount & Remark (shared for both transfer types) */}
                {(selectedBeneficiary || toAccountNumber) && (
                  <div className="mt-10 space-y-8">
                    <div className="text-center py-6 bg-gray-50 rounded-2xl">
                      <p className="text-gray-600">Sending to</p>
                      <p className="text-2xl font-bold">
                        {selectedBeneficiary?.name || beneficiaryName || toAccountNumber}
                      </p>
                    </div>

                    <div>
                      <label className="text-lg font-medium">Amount</label>
                      <div className="relative mt-3">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-4xl font-bold">₹</span>
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-20 py-8 text-5xl font-bold text-center border-2 rounded-2xl focus:border-teal-500"
                        />
                      </div>
                    </div>

                    <input
                      type="text"
                      placeholder="Add a note (optional)"
                      value={remark}
                      onChange={(e) => setRemark(e.target.value)}
                      className="w-full px-6 py-5 border rounded-xl"
                    />

                    <button
                      onClick={handleTransfer}
                      disabled={transferring || !amount}
                      className="w-full bg-teal-600 text-white py-6 rounded-xl font-bold hover:bg-teal-700 disabled:opacity-70 flex items-center justify-center gap-3"
                    >
                      {transferring ? (
                        <>
                          <Loader2 className="animate-spin" /> Sending...
                        </>
                      ) : (
                        "Send Money"
                      )}
                    </button>
                  </div>
                )}
              </>
            )}

            {/* === REQUEST DEPOSIT SECTION === */}
            {activeSection === "deposit" && (
              <div className="space-y-8">
                <div className="text-center py-10">
                  <Download className="w-20 h-20 text-teal-600 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold">Request Deposit</h2>
                  <p className="text-gray-600 mt-2">Admin will add money to your account after verification</p>
                </div>

                <div>
                  <label className="text-lg font-semibold">To Account</label>
                  <select
                    value={selectedFromAccount?.id || ""}
                    onChange={(e) => setSelectedFromAccount(accounts.find(a => a.id === parseInt(e.target.value)))}
                    className="mt-3 w-full px-6 py-5 border-2 rounded-xl text-lg"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.account_type} ••••{acc.account_number.slice(-4)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-lg font-semibold">Amount</label>
                  <div className="relative mt-3">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-4xl font-bold">₹</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-20 py-8 text-5xl font-bold text-center border-2 rounded-2xl focus:border-teal-500"
                    />
                  </div>
                </div>

                <button
                  onClick={handleDeposit}
                  disabled={depositing || !amount}
                  className="w-full bg-teal-600 text-white py-6 rounded-xl font-bold hover:bg-teal-700 disabled:opacity-70 flex items-center justify-center gap-3"
                >
                  {depositing ? (
                    <>
                      <Loader2 className="animate-spin" /> Submitting...
                    </>
                  ) : (
                    "Submit Deposit Request"
                  )}
                </button>
              </div>
            )}

            {/* === REQUEST WITHDRAWAL SECTION === */}
            {activeSection === "withdraw" && (
              <div className="space-y-8">
                <div className="text-center py-10">
                  <Upload className="w-20 h-20 text-orange-600 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold">Request Withdrawal</h2>
                  <p className="text-gray-600 mt-2">Request cash pickup or bank transfer</p>
                </div>

                <div>
                  <label className="text-lg font-semibold">From Account</label>
                  <select
                    value={selectedFromAccount?.id || ""}
                    onChange={(e) => setSelectedFromAccount(accounts.find(a => a.id === parseInt(e.target.value)))}
                    className="mt-3 w-full px-6 py-5 border-2 rounded-xl text-lg"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.account_type} ••••{acc.account_number.slice(-4)} — ₹{acc.balance.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-lg font-semibold">Amount to Withdraw</label>
                  <div className="relative mt-3">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-4xl font-bold">₹</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-20 py-8 text-5xl font-bold text-center border-2 rounded-2xl focus:border-orange-500"
                    />
                  </div>
                </div>

                <button
                  onClick={handleWithdraw}
                  disabled={withdrawing || !amount || parseFloat(amount) > (selectedFromAccount?.balance || 0)}
                  className="w-full bg-orange-600 text-white py-6 rounded-xl font-bold hover:bg-orange-700 disabled:opacity-70 flex items-center justify-center gap-3"
                >
                  {withdrawing ? (
                    <>
                      <Loader2 className="animate-spin" /> Submitting...
                    </>
                  ) : (
                    "Submit Withdrawal Request"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Transfers Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-6">
            <h3 className="text-xl font-bold flex items-center gap-3 mb-6">
              <History className="w-6 h-6" /> Recent Transfer
            </h3>
            {recentTransfers.length > 0 ? (
              recentTransfers.map((t) => (
                <div key={t.id} className="flex items-center gap-4 py-3 border-b border-gray-200 last:border-0">
                  <div className={`p-3 rounded-full ${t.type === 'credit' ? 'bg-teal-100' : 'bg-red-100'}`}>
                    {t.type === 'credit' ? <ArrowDownLeft className="w-5 h-5 text-teal-600" /> : <ArrowUpRight className="w-5 h-5 text-red-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{t.description || "Transaction"}</p>
                    <p className="text-xs text-gray-500">••••{t.account_number?.slice(-4) || "N/A"}</p>
                  </div>
                  <span className={`font-bold ${t.type === 'credit' ? 'text-teal-600' : 'text-red-600'}`}>
                    {t.type === 'credit' ? '+' : '-'} {currencyFormatter(t.amount)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-10">No recent activity</p>
            )}
          </div>
        </div>
      </div>

      {/* Add Beneficiary Modal (kept from your original) */}
      {showAddModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold mb-6">Add Beneficiary</h3>
            <input
              type="text"
              placeholder="Name"
              className="w-full px-5 py-4 border rounded-xl mb-4"
              onChange={(e) => setBeneficiaryName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Account Number"
              className="w-full px-5 py-4 border rounded-xl mb-6"
              onChange={(e) => setToAccountNumber(e.target.value)}
            />
            <div className="flex gap-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-4 border rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await addBeneficiary({ name: beneficiaryName, account_number: toAccountNumber });
                  setShowAddModal(false);
                }}
                disabled={adding}
                className="flex-1 bg-teal-600 text-white py-4 rounded-xl font-bold"
              >
                {adding ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}