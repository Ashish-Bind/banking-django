// pages/employee/LoanApplications.jsx
import { useState } from "react";
import { useGetPendingLoansQuery, useProcessLoanMutation } from "../api/employeeApi";
import { Loader2, IndianRupee, Clock, User, Calendar, AlertCircle, CheckCircle, XCircle, Briefcase, TrendingUp, FileText, CreditCard, Building } from "lucide-react";

export default function LoanApplications() {
  const { data: loans = [], isLoading } = useGetPendingLoansQuery();
  const [processLoan, { isLoading: processing }] = useProcessLoanMutation();
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [interestRate, setInterestRate] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const handleProcess = async (action) => {
    if (action === "APPROVE" && (!interestRate || interestRate < 8 || interestRate > 18)) {
      alert("Interest rate must be between 8% and 18%");
      return;
    }

    try {
      await processLoan({
        loan_id: selectedLoan.loan_id,
        action,
        interest_rate: action === "APPROVE" ? interestRate : null,
        reason: action === "REJECT" ? rejectionReason : null,
      }).unwrap();

      alert(action === "APPROVE" ? "Loan Approved!" : "Loan Rejected");
      setSelectedLoan(null);
      setInterestRate("");
      setRejectionReason("");
    } catch (err) {
      alert("Failed to process loan");
    }
  }

  const getCreditScoreColor = (score) => {
    if (!score) return "bg-gray-100 text-gray-600";
    if (score >= 750) return "bg-green-100 text-green-700";
    if (score >= 650) return "bg-blue-100 text-blue-700";
    if (score >= 550) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  const getCreditScoreLabel = (score) => {
    if (!score) return "N/A";
    if (score >= 750) return "Excellent";
    if (score >= 650) return "Good";
    if (score >= 550) return "Fair";
    return "Poor";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-12 h-12 animate-spin text-teal-600" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-800">Loan Applications</h1>
        <p className="text-gray-600 mt-2">Review and process customer loan requests</p>
      </div>

      {loans.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl">
          <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600">No pending loan applications</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {loans.map((loan) => {
            const customer = loan.account?.customer;
            const user = customer?.user;
            
            return (
              <div
                key={loan.loan_id}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition border border-gray-100"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-xl font-bold text-gray-800">{loan.loan_id}</h3>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                        PENDING
                      </span>
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                        {loan.loan_type}
                      </span>
                    </div>
                    
                    {/* Customer Quick Info */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span className="font-medium">{user?.first_name} {user?.last_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        <span>{customer?.company_name || "N/A"}</span>
                      </div>
                    </div>

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="bg-teal-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Loan Amount</p>
                        <p className="font-bold text-lg text-teal-700">₹{Number(loan.principal_amount).toLocaleString("en-IN")}</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Tenure</p>
                        <p className="font-bold text-blue-700">{loan.tenure_months} months</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Credit Score</p>
                        <p className="font-bold text-green-700">{customer?.credit_score || "N/A"}</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Monthly Salary</p>
                        <p className="font-bold text-purple-700">₹{Number(customer?.monthly_salary || 0).toLocaleString("en-IN")}</p>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Account Balance</p>
                        <p className="font-bold text-orange-700">₹{Number(loan.account?.balance || 0).toLocaleString("en-IN")}</p>
                      </div>
                    </div>
                  </div>

                  <button 
                    className="px-6 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition whitespace-nowrap ml-4"
                    onClick={() => setSelectedLoan(loan)}
                  >
                    Review Application
                  </button>
                </div>

                {/* Purpose */}
                {loan.purpose && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600">Purpose: <span className="font-medium text-gray-800">{loan.purpose}</span></p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      

      {/* Enhanced Detail Modal */}
      {selectedLoan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-3xl font-bold">Loan Application Review</h2>
                  <p className="text-gray-600 mt-2">Loan ID: {selectedLoan.loan_id}</p>
                  <div className="flex gap-2 mt-3">
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                      {selectedLoan.loan_type}
                    </span>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                      PENDING REVIEW
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLoan(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="w-8 h-8" />
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {/* Customer Profile */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" /> Customer Profile
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-600 block text-xs">Full Name</span>
                      <span className="font-semibold text-base">
                        {selectedLoan.account.customer.user.first_name} {selectedLoan.account.customer.user.last_name}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 block text-xs">Email</span>
                      <span className="font-medium">{selectedLoan.account.customer.user.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 block text-xs">Phone</span>
                      <span className="font-medium">{selectedLoan.account.customer.phone || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 block text-xs">Date of Birth</span>
                      <span className="font-medium">
                        {selectedLoan.account.customer.date_of_birth 
                          ? new Date(selectedLoan.account.customer.date_of_birth).toLocaleDateString("en-IN")
                          : "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 block text-xs">Address</span>
                      <span className="font-medium">{selectedLoan.account.customer.address || "N/A"}</span>
                    </div>
                  </div>
                </div>

                {/* Employment & Financial */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-purple-600" /> Employment & Income
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-600 block text-xs">Employment Type</span>
                      <span className="font-semibold">{selectedLoan.account.customer.employment_type || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 block text-xs">Company Name</span>
                      <span className="font-medium">{selectedLoan.account.customer.company_name || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 block text-xs">Monthly Salary</span>
                      <span className="font-bold text-lg text-purple-700">
                        ₹{Number(selectedLoan.account.customer.monthly_salary).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 block text-xs">Account Balance</span>
                      <span className="font-bold text-green-600">
                        ₹{Number(selectedLoan.account.balance).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 block text-xs">Account Number</span>
                      <span className="font-mono text-xs">{selectedLoan.account.account_number}</span>
                    </div>
                  </div>
                </div>

                {/* Credit & KYC */}
                <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" /> Credit & KYC
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <span className="text-gray-600 block text-xs mb-2">Credit Score</span>
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-2xl ${getCreditScoreColor(selectedLoan.account.customer.credit_score)}`}>
                        {selectedLoan.account.customer.credit_score || "N/A"}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {getCreditScoreLabel(selectedLoan.account.customer.credit_score)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 block text-xs">Max Eligible Loan</span>
                      <span className="font-bold text-lg text-green-700">
                        ₹{Number(selectedLoan.account.customer.max_eligible_loan || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 block text-xs">KYC Status</span>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        selectedLoan.account.customer.kyc_status === "verified" 
                          ? "bg-green-100 text-green-700" 
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {selectedLoan.account.customer.kyc_status?.toUpperCase()}
                      </span>
                    </div>
                    {selectedLoan.account.customer.aadhaar_number && (
                      <div>
                        <span className="text-gray-600 block text-xs">Aadhaar</span>
                        <span className="font-mono text-xs">
                          {selectedLoan.account.customer.aadhaar_number}
                        </span>
                      </div>
                    )}
                    {selectedLoan.account.customer.pan_number && (
                      <div>
                        <span className="text-gray-600 block text-xs">PAN</span>
                        <span className="font-mono text-xs">
                          {selectedLoan.account.customer.pan_number}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Loan Request Details */}
              <div className="bg-teal-50 rounded-2xl p-6 mb-8">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <IndianRupee className="w-5 h-5" /> Loan Request Details
                </h3>
                <div className="grid md:grid-cols-4 gap-6">
                  <div>
                    <span className="text-gray-600 text-sm block mb-1">Requested Amount</span>
                    <span className="font-bold text-2xl text-teal-700">
                      ₹{Number(selectedLoan.principal_amount).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm block mb-1">Tenure</span>
                    <span className="font-bold text-xl">{selectedLoan.tenure_months} months</span>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm block mb-1">Applied On</span>
                    <span className="font-medium">{new Date(selectedLoan.created_at).toLocaleDateString("en-IN")}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm block mb-1">Loan Type</span>
                    <span className="font-bold">{selectedLoan.loan_type}</span>
                  </div>
                </div>
                {selectedLoan.purpose && (
                  <div className="mt-4 pt-4 border-t border-teal-200">
                    <span className="text-gray-600 text-sm block mb-1">Purpose</span>
                    <p className="font-medium text-gray-800">{selectedLoan.purpose}</p>
                  </div>
                )}
              </div>

              {/* Risk Assessment */}
              <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" /> Quick Assessment
                </h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      Number(selectedLoan.principal_amount) <= Number(selectedLoan.account.customer.max_eligible_loan)
                        ? "bg-green-500" : "bg-red-500"
                    }`} />
                    <span>Loan vs Eligibility: {
                      ((Number(selectedLoan.principal_amount) / Number(selectedLoan.account.customer.max_eligible_loan)) * 100).toFixed(0)
                    }%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      Number(selectedLoan.account.balance) >= Number(selectedLoan.account.customer.monthly_salary) * 0.5
                        ? "bg-green-500" : "bg-yellow-500"
                    }`} />
                    <span>Savings Ratio: {
                      ((Number(selectedLoan.account.balance) / Number(selectedLoan.account.customer.monthly_salary)) * 100).toFixed(0)
                    }%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      selectedLoan.account.customer.kyc_status === "verified" ? "bg-green-500" : "bg-red-500"
                    }`} />
                    <span>KYC Verified: {selectedLoan.account.customer.kyc_status === "verified" ? "Yes" : "No"}</span>
                  </div>
                </div>
              </div>

              {/* Action Section */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Approve */}
                <div className="border-2 border-green-200 rounded-2xl p-6">
                  <h4 className="font-bold text-lg mb-4 text-green-700 flex items-center gap-2">
                    <CheckCircle className="w-6 h-6" /> Approve Loan
                  </h4>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Set Interest Rate (% p.a.)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="8"
                      max="18"
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:border-green-500 outline-none"
                      placeholder="e.g., 10.5"
                    />
                    <p className="text-xs text-gray-500 mt-1">Range: 8% - 18%</p>
                  </div>
                  {interestRate && (
                    <div className="bg-green-50 rounded-lg p-3 mb-4">
                      <p className="text-xs text-gray-600">Estimated EMI</p>
                      <p className="font-bold text-green-700">
                        ₹{(
                          (Number(selectedLoan.principal_amount) * (Number(interestRate)/1200) * 
                          Math.pow(1 + Number(interestRate)/1200, selectedLoan.tenure_months)) / 
                          (Math.pow(1 + Number(interestRate)/1200, selectedLoan.tenure_months) - 1)
                        ).toFixed(2).toLocaleString("en-IN")}/month
                      </p>
                    </div>
                  )}
                  <button
                    onClick={() => handleProcess("APPROVE")}
                    disabled={processing || !interestRate}
                    className="w-full py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {processing ? "Processing..." : "Approve Loan"}
                  </button>
                </div>

                {/* Reject */}
                <div className="border-2 border-red-200 rounded-2xl p-6">
                  <h4 className="font-bold text-lg mb-4 text-red-700 flex items-center gap-2">
                    <XCircle className="w-6 h-6" /> Reject Loan
                  </h4>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Reason for rejection (optional)"
                    className="w-full px-4 py-3 border-2 border-red-300 rounded-xl focus:border-red-500 outline-none mb-4"
                    rows="5"
                  />
                  <button
                    onClick={() => handleProcess("REJECT")}
                    disabled={processing}
                    className="w-full py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition"
                  >
                    Reject Application
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}