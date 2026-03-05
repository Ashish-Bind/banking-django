// pages/customer/Transactions.jsx
import { useState } from "react";
import { 
  Search, Filter, Download, Calendar, ArrowUpRight, 
  ArrowDownRight, CreditCard, IndianRupee, Clock, ChevronLeft, ChevronRight 
} from "lucide-react";
import Loader from '../components/Loader'
import { useGetAllTransactionsQuery } from "../api/customerApi";
import { useSelector } from "react-redux";
import { dateFormatter } from "../utils";

export default function CustomerTransactions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [dateRange, setDateRange] = useState("last30days");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data, isLoading, error } = useGetAllTransactionsQuery();
  const { transactions:allTransactions } = useSelector((state) => state.customer);

  /*
  {
    "id": 1,
    "transaction_type": "DEPOSIT",
    "amount": "500.00",
    "balance_after": "2500.00",
    "description": "Deposit via API",
    "account_number": "169489633812",
    "account_type": "savings",
    "from_account": null,
    "to_account": null
  }
  */

  // Mock transaction data (replace with API later)
  // const allTransactions = [
  //   { id: "TXN849201", date: "19 Nov 2025", desc: "Salary Credit - ABC Corp", type: "credit", amount: 85000, status: "completed", category: "salary" },
  //   { id: "TXN849200", date: "18 Nov 2025", desc: "EMI - Personal Loan", type: "debit", amount: 16188, status: "completed", category: "loan" },
  //   { id: "TXN849199", date: "17 Nov 2025", desc: "Transfer to Rajesh Kumar", type: "debit", amount: 5000, status: "completed", category: "transfer" },
  //   { id: "TXN849198", date: "15 Nov 2025", desc: "Amazon India", type: "debit", amount: 2899, status: "completed", category: "shopping" },
  //   { id: "TXN849197", date: "14 Nov 2025", desc: "Zomato Payment", type: "debit", amount: 620, status: "completed", category: "food" },
  //   { id: "TXN849196", date: "12 Nov 2025", desc: "Interest Credit - Savings", type: "credit", amount: 342, status: "completed", category: "interest" },
  //   { id: "TXN849195", date: "10 Nov 2025", desc: "Cash Deposit - Branch", type: "credit", amount: 20000, status: "completed", category: "deposit" },
  //   { id: "TXN849194", date: "08 Nov 2025", desc: "Netflix Subscription", type: "debit", amount: 499, status: "completed", category: "entertainment" },
  //   { id: "TXN849193", date: "05 Nov 2025", desc: "Electricity Bill", type: "debit", amount: 1840, status: "completed", category: "bills" },
  //   { id: "TXN849192", date: "03 Nov 2025", desc: "Freelance Payment", type: "credit", amount: 15000, status: "completed", category: "income" },
  // ];

  if (isLoading) return <Loader/>;

  // Filter logic
  const filteredTransactions = allTransactions
    .filter(t => {
      if (filterType !== "all" && t.transaction_type !== filterType) return false;
      if (searchTerm && !t.desc.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginated = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Transaction History</h1>
        <p className="text-gray-600 mt-2">View all your account transactions in one place</p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="grid md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Filter by Type */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Transactions</option>
            <option value="DEPOSIT">Deposits</option>
            <option value="TRANSFER">Transfers</option>
            <option value="WITHDRAW">Withdraws</option>
          </select>

          {/* Date Range */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 flex items-center gap-2"
          >
            <option value="last30days">Last 30 Days</option>
            <option value="last3months">Last 3 Months</option>
            <option value="last6months">Last 6 Months</option>
            <option value="thisyear">This Year</option>
            <option value="custom">Custom Range</option>
          </select>

          {/* Download Statement */}
          <button className="bg-teal-600 text-white px-6 py-4 rounded-xl font-medium hover:bg-teal-700 flex items-center justify-center gap-3 shadow-lg transition">
            <Download className="w-5 h-5" />
            Download Statement
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold text-gray-800">
              {filteredTransactions.length} Transactions Found
            </p>
            <p className="text-sm text-gray-500">
              Showing {((currentPage - 1) * itemsPerPage) + 1}–{Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length}
            </p>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {paginated.map((txn) => (
            <div key={txn.id} className="p-6 hover:bg-gray-50 transition cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                    txn.transaction_type === "DEPOSIT" 
                      ? "bg-green-100 text-green-600" 
                      : "bg-red-100 text-red-600"
                  }`}>
                    {txn.transaction_type === "DEPOSIT" ? 
                      <ArrowDownRight className="w-7 h-7" /> : 
                      <ArrowUpRight className="w-7 h-7" />
                    }
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800">{txn.description}</h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {dateFormatter(txn.created_at)}
                      </span>
                      <span className="font-mono text-teal-600 font-bold">TXN00{txn.id}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`text-2xl font-bold ${
                    txn.transaction_type === "DEPOSIT" ? "text-green-600" : "text-red-600"
                  }`}>
                    {txn.transaction_type === "DEPOSIT" ? "+" : "-"}₹{txn.amount.toLocaleString("en-IN")}
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 mt-1">
                    <Clock className="w-3 h-3" />
                    Completed
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-5 py-3 rounded-xl border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            <div className="flex gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-lg font-medium transition ${
                    currentPage === i + 1
                      ? "bg-teal-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-5 py-3 rounded-xl border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}