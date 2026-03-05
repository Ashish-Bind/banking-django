// src/pages/customer/MyLoans.jsx
import { useState, useEffect } from "react";
import {
  useGetMyLoansQuery,
  useGetLoanDetailQuery,
  usePayEMIMutation,
  useApplyLoanMutation,
  useGetLoanEligibilityQuery,
} from "../api/customerApi";
import {
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  IndianRupee,
  Plus,
  X,
  TrendingUp,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

export default function MyLoans() {
  const { data: loans = [], isLoading: loadingLoans } = useGetMyLoansQuery();
  const { data: eligibility, isLoading: loadingEligibility } = useGetLoanEligibilityQuery();

  const [selectedLoanId, setSelectedLoanId] = useState(null);
  const [showApplyForm, setShowApplyForm] = useState(false);

  // Apply Form
  const [loanType, setLoanType] = useState("PERSONAL");
  const [amount, setAmount] = useState("");
  const [tenure, setTenure] = useState("36");
  const [purpose, setPurpose] = useState("");
  const [estimatedEMI, setEstimatedEMI] = useState(null);

  const { data: loanDetail, isFetching: loadingDetail } = useGetLoanDetailQuery(selectedLoanId, {
    skip: !selectedLoanId,
  });

  const [payEMI, { isLoading: paying }] = usePayEMIMutation();
  const [applyLoan, { isLoading: applying }] = useApplyLoanMutation();

  const loan = loanDetail?.loan;
  const emiSchedule = loanDetail?.emi_schedule || [];

  // EMI Calculator (11% avg rate)
  useEffect(() => {
    if (amount && tenure) {
      const P = parseFloat(amount);
      const r = 0.11 / 12; // 11% annual
      const n = parseInt(tenure);
      if (P > 0 && n > 0) {
        const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        setEstimatedEMI(Math.round(emi));
      } else {
        setEstimatedEMI(null);
      }
    }
  }, [amount, tenure]);

  const handleApply = async () => {
    if (!amount || amount < 50000) return toast.error("Minimum loan amount is ₹50,000");
    if (!purpose.trim()) return toast.error("Please enter purpose of loan");

    const maxAllowed = eligibility?.max_eligible_loan || 0;
    if (parseFloat(amount) > maxAllowed) {
      return toast.error(`You can apply max ₹${maxAllowed.toLocaleString("en-IN")}`);
    }

    try {
      await applyLoan({
        loan_type: loanType,
        amount: parseFloat(amount),
        tenure_months: parseInt(tenure),
        purpose: purpose.trim(),
      }).unwrap();

      toast.success("Loan application submitted successfully!");
      setShowApplyForm(false);
      setAmount("");
      setPurpose("");
      setTenure("36");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to submit application");
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      APPROVED: "bg-green-100 text-green-800",
      PENDING: "bg-orange-100 text-orange-800",
      REJECTED: "bg-red-100 text-red-800",
      CLOSED: "bg-blue-100 text-blue-800",
    };
    return `px-4 py-2 rounded-full text-sm font-bold ${styles[status] || "bg-gray-100 text-gray-700"}`;
  };

  if (loadingLoans) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 pb-20">
      {/* Header + Eligibility Card */}
      <div className="mb-12">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">My Loans</h1>
            <p className="text-gray-600 mt-3 text-lg">Apply for a new loan or manage existing ones</p>
          </div>

          {/* Eligibility Card */}
          <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-teal-600 text-white p-8 rounded-3xl shadow-2xl w-full lg:w-96">
            {loadingEligibility ? (
              <div className="animate-pulse">
                <div className="h-8 bg-white/20 rounded w-32 mb-4"></div>
                <div className="h-16 bg-white/30 rounded"></div>
              </div>
            ) : eligibility?.credit_score ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-8 h-8" />
                  <p className="text-xl font-bold">Your Credit Profile</p>
                </div>
                <p className="text-5xl font-black mb-2">{eligibility.credit_score}</p>
                <p className="text-lg opacity-90">Credit Score</p>
                <div className="mt-6 pt-6 border-t border-white/30">
                  <p className="text-lg">Max Eligible Amount</p>
                  <p className="text-4xl font-black">
                    ₹{Number(eligibility.max_eligible_loan).toLocaleString("en-IN")}
                  </p>
                </div>
                <button
                  onClick={() => setShowApplyForm(true)}
                  className="mt-6 w-full bg-white text-teal-600 py-4 rounded-2xl font-bold text-xl hover:scale-105 transition"
                >
                  Apply Now
                </button>
              </>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-80" />
                <p>Complete KYC to unlock loans</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loans Grid */}
      {loans.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-300">
          <FileText className="w-24 h-24 mx-auto text-gray-300 mb-6" />
          <h3 className="text-2xl font-bold text-gray-600">No Loans Yet</h3>
          <p className="text-gray-500 mt-3">Your loan journey starts here</p>
          <button
            onClick={() => setShowApplyForm(true)}
            className="mt-8 px-8 py-4 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700"
          >
            Apply for Your First Loan
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loans.map((loan) => (
            <div
              key={loan.loan_id}
              onClick={() => setSelectedLoanId(loan.loan_id)}
              className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all cursor-pointer border border-gray-100 overflow-hidden"
            >
              <div className={`h-3 ${loan.status === "APPROVED" ? "bg-gradient-to-r from-green-500 to-teal-600" : loan.status === "PENDING" ? "bg-gradient-to-r from-orange-500 to-pink-600" : "bg-gradient-to-r from-red-500 to-rose-600"}`} />

              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{loan.loan_id}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(loan.applied_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span className={getStatusBadge(loan.status)}>{loan.status}</span>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount</span>
                    <span className="font-bold text-xl">₹{Number(loan.amount).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tenure</span>
                    <span className="font-semibold">{loan.tenure_months} months</span>
                  </div>
                  {loan.emi_amount && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">EMI</span>
                      <span className="font-bold text-teal-600">₹{Number(loan.emi_amount).toLocaleString("en-IN")}</span>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                  <p className="text-teal-600 font-bold">Tap to view details</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Apply Loan Modal */}
      {showApplyForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Apply for Loan</h2>
              <button onClick={() => setShowApplyForm(false)}>
                <X className="w-8 h-8 text-gray-500 hover:text-gray-700" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block font-semibold mb-2">Loan Type</label>
                <select
                  value={loanType}
                  onChange={(e) => setLoanType(e.target.value)}
                  className="w-full px-5 py-4 border-2 border-gray-300 rounded-2xl focus:border-teal-500 outline-none"
                >
                  <option value="PERSONAL">Personal Loan</option>
                  <option value="CAR">Car Loan</option>
                  <option value="EDUCATION">Education Loan</option>
                  <option value="HOME">Home Loan</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-2">Amount</label>
                <div className="relative">
                  <IndianRupee className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500" />
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="200000"
                    className="w-full pl-14 pr-5 py-5 border-2 border-gray-300 rounded-2xl text-xl focus:border-teal-500 outline-none"
                  />
                </div>
                {eligibility && amount && parseFloat(amount) > eligibility.max_eligible_loan && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                    <AlertCircle className="w-w-4 h-4" />
                    Max eligible: ₹{eligibility.max_eligible_loan.toLocaleString("en-IN")}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold mb-2">Tenure</label>
                <select
                  value={tenure}
                  onChange={(e) => setTenure(e.target.value)}
                  className="w-full px-5 py-4 border-2 border-gray-300 rounded-2xl focus:border-teal-500 outline-none"
                >
                  {[12, 24, 36, 48, 60].map((m) => (
                    <option key={m} value={m}>
                      {m} months
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-2">Purpose of Loan</label>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. Medical emergency, Education, Wedding"
                  className="w-full px-5 py-4 border-2 border-gray-300 rounded-2xl focus:border-teal-500 outline-none"
                />
              </div>

              {estimatedEMI && (
                <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-6 rounded-2xl text-center border-2 border-teal-200">
                  <p className="text-lg text-gray-700">Estimated Monthly EMI</p>
                  <p className="text-5xl font-black text-teal-600 mt-2">
                    ₹{estimatedEMI.toLocaleString("en-IN")}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">at ~11% interest rate</p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => setShowApplyForm(false)}
                  className="flex-1 py-4 border-2 border-gray-300 rounded-2xl font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  disabled={applying || !amount || !purpose || amount < 50000}
                  className="flex-1 py-4 bg-teal-600 text-white rounded-2xl font-bold hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {applying ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loan Detail Modal */}
      {selectedLoanId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-screen overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h2 className="text-3xl font-bold">Loan • {selectedLoanId}</h2>
              <button onClick={() => setSelectedLoanId(null)}>
                <X className="w-8 h-8 text-gray-500 hover:text-gray-700" />
              </button>
            </div>

            {loadingDetail ? (
              <div className="p-20 text-center">Loading loan details...</div>
            ) : (
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                  <div className="bg-teal-50 p-6 rounded-2xl text-center">
                    <p className="text-teal-700 font-semibold">Loan Amount</p>
                    <p className="text-3xl font-bold text-teal-600 mt-2">
                      ₹{Number(loan?.amount).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-6 rounded-2xl text-center">
                    <p className="text-purple-700 font-semibold">EMI</p>
                    <p className="text-3xl font-bold text-purple-600 mt-2">
                      ₹{loan?.emi_amount ? Number(loan.emi_amount).toLocaleString("en-IN") : "—"}
                    </p>
                  </div>
                  <div className="bg-pink-50 p-6 rounded-2xl text-center">
                    <p className="text-pink-700 font-semibold">Status</p>
                    <span className={`inline-block mt-2 px-6 py-3 rounded-full font-bold ${getStatusBadge(loan?.status)}`}>
                      {loan?.status}
                    </span>
                  </div>
                </div>

                {emiSchedule.length > 0 && (
                  <>
                    <div className="mb-8">
                      <p className="font-semibold mb-3">Repayment Progress</p>
                      <div className="w-full bg-gray-200 rounded-full h-10 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-teal-500 to-emerald-600 h-full flex items-center justify-end px-6 text-white font-bold text-lg transition-all"
                          style={{
                            width: `${(emiSchedule.filter((e) => e.is_paid).length / emiSchedule.length) * 100}%`,
                          }}
                        >
                          {Math.round((emiSchedule.filter((e) => e.is_paid).length / emiSchedule.length) * 100)}%
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-2xl overflow-hidden shadow-lg">
                      <div className="p-6 bg-gray-100">
                        <h3 className="text-2xl font-bold">EMI Schedule</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-6 py-4 text-left">Month</th>
                              <th className="px-6 py-4 text-left">Due Date</th>
                              <th className="px-6 py-4 text-right">EMI Amount</th>
                              <th className="px-6 py-4 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {emiSchedule.map((emi) => (
                              <tr key={emi.id} className="border-b hover:bg-gray-50">
                                <td className="px-6 py-4">Month {emi.month_number}</td>
                                <td className="px-6 py-4">
                                  {new Date(emi.due_date).toLocaleDateString("en-IN")}
                                </td>
                                <td className="px-6 py-4 text-right font-bold">
                                  ₹{Number(emi.total_emi).toLocaleString("en-IN")}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  {emi.is_paid ? (
                                    <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                                      Paid
                                    </span>
                                  ) : (
                                    <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-bold">
                                      Pending
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {emiSchedule.some((e) => !e.is_paid) && (
                      <div className="text-center mt-10">
                        <button
                          onClick={() => payEMI({ loanId: selectedLoanId })}
                          disabled={paying}
                          className="px-16 py-6 bg-teal-600 text-white text-2xl font-bold rounded-2xl hover:bg-teal-700 disabled:opacity-50 shadow-lg"
                        >
                          {paying ? "Processing..." : `Pay Next EMI • ₹${Number(loan?.emi_amount).toLocaleString("en-IN")}`}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}