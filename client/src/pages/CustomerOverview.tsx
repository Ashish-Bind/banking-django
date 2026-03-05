// pages/customer/DashboardHome.jsx
import { CreditCard, DollarSign, TrendingUp, FileText } from "lucide-react";
import { useSelector } from "react-redux";
import { currencyFormatter } from "../utils";

export default function CustomerOverview() {
  const {profile, accounts, totalBalance, recentTransactions, totalAccounts, nextEmi, thisMonthNet} = useSelector(state => state.customer)

  return (
    <div className="space-y-8 font-script">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100">Total Balance</p>
              <p className="text-3xl font-bold mt-2">{currencyFormatter(totalBalance)}</p>
            </div>
            <CreditCard className="w-12 h-12 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">No. of Accounts</p>
              <p className="text-3xl font-bold mt-2">{totalAccounts}</p>
            </div>
            <FileText className="w-12 h-12 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-emerald-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Total Loans</p>
              <p className="text-3xl font-bold mt-2">1</p>
              {/* <p className="text-sm opacity-90 mt-1">{nextEmi || "Completed"}</p> */}
            </div>
            <DollarSign className="w-12 h-12 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">This Month</p>
              <p className="text-3xl font-bold mt-2">+₹{thisMonthNet}</p>
              <p className="text-sm opacity-90">Net Income</p>
            </div>
            <TrendingUp className="w-12 h-12 opacity-80" />
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Transactions</h2>
        <div className="space-y-4">
          {recentTransactions?.map((t, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === "Credit" ? "bg-green-100" : "bg-red-100"}`}>
                  <DollarSign className={`w-5 h-5 ${t.type === "Credit" ? "text-green-600" : "text-red-600"}`} />
                </div>
                <div>
                  <p className="font-medium text-gray-800">{t.desc}</p>
                  <p className="text-sm text-gray-500">{t.date}</p>
                </div>
              </div>
              <p className={`font-bold ${t.type === "Credit" ? "text-green-600" : "text-red-600"}`}>
                {t.amount}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}