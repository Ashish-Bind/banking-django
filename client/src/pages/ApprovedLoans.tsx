// pages/employee/ApprovedLoans.jsx
import { useState } from "react";
import { useGetApprovedLoansQuery } from "../api/employeeApi";
import {
  Loader2, IndianRupee, Calendar, CheckCircle, AlertCircle,
  Clock, User, TrendingUp, Search, Filter, X
} from "lucide-react";

const STATUS_BADGE = {
  APPROVED: "bg-teal-100 text-teal-700",
  CLOSED: "bg-gray-100 text-gray-700",
  OVERDUE: "bg-red-100 text-red-700",
};

export default function ApprovedLoans() {
  const { data: loans = [], isLoading } = useGetApprovedLoansQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [selectedLoan, setSelectedLoan] = useState(null);

  const filteredLoans = loans.filter(loan => {
    const matchesSearch = 
      loan.loan_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.customer_name.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === "ALL") return matchesSearch;
    if (filter === "OVERDUE") return matchesSearch && loan.overdue_emis > 0;
    if (filter === "CLOSED") return matchesSearch && loan.status === "CLOSED";
    return matchesSearch && loan.status === "APPROVED";
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-16 h-16 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Approved Loans Dashboard</h1>
        <p className="text-gray-600 mt-2">Monitor all disbursed loans • Track repayments & overdue EMIs</p>
      </div>

      {/* Search + Filter */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Loan ID or Customer Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:border-teal-500 outline-none"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-6 py-4 border border-gray-300 rounded-xl focus:border-teal-500 outline-none"
          >
            <option value="ALL">All Loans</option>
            <option value="APPROVED">Active Only</option>
            <option value="CLOSED">Closed Loans</option>
            <option value="OVERDUE">Overdue Loans</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="Active Loans"
          value={loans.filter(l => l.status === "APPROVED").length}
          color="from-teal-500 to-cyan-600"
          icon={<TrendingUp className="w-10 h-10" />}
        />
        <StatCard
          label="Closed Loans"
          value={loans.filter(l => l.status === "CLOSED").length}
          color="from-green-500 to-emerald-600"
          icon={<CheckCircle className="w-10 h-10" />}
        />
        <StatCard
          label="Overdue Loans"
          value={loans.filter(l => l.overdue_emis > 0).length}
          color="from-red-500 to-pink-600"
          icon={<AlertCircle className="w-10 h-10" />}
        />
        <StatCard
          label="Total Disbursed"
          value={`₹${loans.reduce((sum, l) => sum + Number(l.principal_amount), 0).toLocaleString("en-IN")}`}
          color="from-purple-500 to-indigo-600"
          icon={<IndianRupee className="w-10 h-10" />}
        />
      </div>

      {/* Loans List */}
      <div className="space-y-6">
        {filteredLoans.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600">No loans found</p>
          </div>
        ) : (
          filteredLoans.map((loan) => {
            const paid = loan.emi_schedule.filter(e => e.is_paid).length;
            const total = loan.emi_schedule.length;
            const progress = total > 0 ? (paid / total) * 100 : 0;
            const isOverdue = loan.overdue_emis > 0;

            return (
              <div
                key={loan.loan_id}
                onClick={() => setSelectedLoan(loan)}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition cursor-pointer border border-gray-100 p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-4">
                      <h3 className="text-2xl font-bold text-gray-800">{loan.loan_id}</h3>
                      <span className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 ${
                        isOverdue ? STATUS_BADGE.OVERDUE : STATUS_BADGE[loan.status]
                      }`}>
                        {isOverdue && <AlertCircle className="w-4 h-4" />}
                        {isOverdue ? "OVERDUE" : loan.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-2 flex items-center gap-2">
                      <User className="w-5 h-5" /> {loan.customer_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-teal-600">
                      ₹{Number(loan.principal_amount).toLocaleString("en-IN")}
                    </p>
                    <p className="text-sm text-gray-500">Disbursed Amount</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center mt-6">
                  <div>
                    <p className="text-gray-500 text-sm">EMI</p>
                    <p className="font-bold text-lg">₹{Number(loan.emi_amount).toLocaleString("en-IN")}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Paid</p>
                    <p className="font-bold text-green-600">{paid}/{total}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Rate</p>
                    <p className="font-bold">{loan.interest_rate}% p.a.</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Tenure</p>
                    <p className="font-bold">{loan.tenure_months} mo</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Overdue</p>
                    <p className="font-bold text-red-600">{loan.overdue_emis}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Repayment Progress</span>
                    <span>{progress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className={`h-full rounded-full transition-all ${isOverdue ? "bg-red-500" : "bg-teal-500"}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detailed Modal */}
      {selectedLoan && <LoanDetailModal loan={selectedLoan} onClose={() => setSelectedLoan(null)} />}
    </div>
  );
}

// Reusable Stat Card
function StatCard({ label, value, color, icon }) {
  return (
    <div className={`bg-gradient-to-r ${color} text-white rounded-2xl p-6 shadow-lg`}>
      {icon}
      <p className="text-white/90 text-sm mt-3">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}

// Modal with full EMI schedule
function LoanDetailModal({ loan, onClose }) {
  const nextEMI = loan.emi_schedule.find(e => !e.is_paid);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-screen overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-bold">Loan {loan.loan_id}</h2>
              <p className="text-xl text-gray-600 mt-2">{loan.customer_name}</p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-8 h-8" />
            </button>
          </div>

          {nextEMI && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-2xl p-6 mb-8">
              <p className="text-yellow-800 font-bold text-xl">Next EMI Due</p>
              <div className="flex justify-between items-center mt-4">
                <p className="text-4xl font-bold text-orange-600">
                  ₹{Number(nextEMI.total_emi).toLocaleString("en-IN")}
                </p>
                <p className="text-2xl font-medium">
                  <Calendar className="inline w-6 h-6 mr-2" />
                  {new Date(nextEMI.due_date).toLocaleDateString("en-IN")}
                </p>
              </div>
            </div>
          )}

          <h3 className="text-2xl font-bold mb-6">Complete EMI Schedule</h3>
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left font-bold">Month</th>
                  <th className="px-6 py-4 text-left font-bold">Due Date</th>
                  <th className="px-6 py-4 text-right font-bold">EMI</th>
                  <th className="px-6 py-4 text-right font-bold">Principal</th>
                  <th className="px-6 py-4 text-right font-bold">Interest</th>
                  <th className="px-6 py-4 text-center font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {loan.emi_schedule.map((emi) => {
                  const isOverdue = !emi.is_paid && new Date(emi.due_date) < new Date();
                  return (
                    <tr key={emi.id} className="border-t hover:bg-gray-50">
                      <td className="px-6 py-4">Month {emi.month_number}</td>
                      <td className="px-6 py-4">{new Date(emi.due_date).toLocaleDateString("en-IN")}</td>
                      <td className="px-6 py-4 text-right font-medium">₹{Number(emi.total_emi).toLocaleString("en-IN")}</td>
                      <td className="px-6 py-4 text-right">₹{Number(emi.principal_component).toLocaleString("en-IN")}</td>
                      <td className="px-6 py-4 text-right">₹{Number(emi.interest_component).toLocaleString("en-IN")}</td>
                      <td className="px-6 py-4 text-center">
                        {emi.is_paid ? (
                          <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-bold">Paid</span>
                        ) : isOverdue ? (
                          <span className="px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-bold">Overdue</span>
                        ) : (
                          <span className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-bold">Pending</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}