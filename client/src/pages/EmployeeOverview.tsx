// pages/employee/EmployeeDashboard.jsx
import { useGetEmployeeDashboardQuery } from "../api/employeeApi";
import { Users, ArrowDownRight, ArrowUpRight, FileText, DollarSign, HandCoins } from "lucide-react";
import { format } from "date-fns";

const iconMap = {
  HandCoins: HandCoins,
  ArrowDownRight: ArrowDownRight,
  ArrowUpRight: ArrowUpRight,
  DollarSign: DollarSign,
};

const colorMap = {
  purple: "bg-purple-100 text-purple-600",
  green: "bg-green-100 text-green-600",
  red: "bg-red-100 text-red-600",
  blue: "bg-blue-100 text-blue-600",
};

export default function EmployeeDashboard() {
  const {
    data: dashboardData,
    isLoading,
    isError,
  } = useGetEmployeeDashboardQuery();

  const stats = dashboardData?.stats || {
    total_customers: 0,
    today_deposits: 0,
    today_withdrawals: 0,
    pending_cash_requests: 0,
    pending_loans: 0,
    total_pending_actions: 0,
  };

  const recentActivity = dashboardData?.recent_activity || [];

  if (isLoading) {
    return <div className="p-8 text-center">Loading dashboard...</div>;
  }

  if (isError) {
    return <div className="p-8 text-center text-red-600">Failed to load dashboard</div>;
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100">Total Customers</p>
              <p className="text-3xl font-bold mt-2">{stats.total_customers.toLocaleString()}</p>
            </div>
            <Users className="w-12 h-12 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p classNameale="text-green-100">Today's Deposits</p>
              <p className="text-3xl font-bold mt-2">
                ₹{(stats.today_deposits / 100000).toFixed(1)}L
              </p>
            </div>
            <ArrowDownRight className="w-12 h-12 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100">Today's Withdrawals</p>
              <p className="text-3xl font-bold mt-2">
                ₹{(stats.today_withdrawals / 100000).toFixed(1)}L
              </p>
            </div>
            <ArrowUpRight className="w-12 h-12 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Pending Actions</p>
              <p className="text-3xl font-bold mt-2">{stats.total_pending_actions}</p>
              <p className="text-sm opacity-90 mt-1">
                {stats.pending_cash_requests} Cash • {stats.pending_loans} Loans
              </p>
            </div>
            <FileText className="w-12 h-12 opacity-80" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivity.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No activity yet today</p>
          ) : (
            recentActivity.map((act) => {
              const Icon = iconMap[act.icon] || DollarSign;
              const colorClass = colorMap[act.color] || "bg-gray-100 text-gray-600";

              return (
                <div
                  key={act.id || act.message}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition rounded-lg px-2 -mx-2"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{act.title}</p>
                      <p className="text-sm text-gray-500">{act.message}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {act.amount && (
                      <p className="font-bold text-gray-800">{act.amount}</p>
                    )}
                    <p className="text-xs text-gray-500">{act.time}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className="mt-6 text-center">
          <button
            className="text-teal-600 font-medium hover:underline"
          >
            Refresh Activity →
          </button>
        </div>
      </div>
    </div>
  );
}