// layouts/EmployeeDashboardLayout.jsx
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Home,
  Users,
  Landmark,
  FileText,
  DollarSign,
  HandCoins,
  CheckCircle,
  Bell,
  LogOut,
  Menu,
  Wallet,
  Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useLogoutMutation } from "../api/authApi";
import { useGetNotificationsQuery, useMarkAllAsReadMutation } from "../api/notificationsApi";

export default function EmployeeDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const notifications = useSelector((state) => state.notifications.list.slice(0, 8));
  const unreadCount = useSelector((state) => state.notifications.unreadCount);

  const [logout] = useLogoutMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();

  const handleLogout = async () => {
    await logout().unwrap();
    navigate("/login");
  };

  useGetNotificationsQuery();
  const openNotifications = async () => {
    setNotifOpen(true);
    if (unreadCount > 0) {
      try {
        await markAllAsRead().unwrap();
      } catch (err) {
        console.warn("Failed to mark as read");
      }
    }
  };

  const navItems = [
    { to: "/employee/dashboard", label: "Overview", icon: Home },
    { to: "/employee/cash-requests", label: "Cash Requests", icon: HandCoins, badge: true },
    { to: "/employee/loan-applications", label: "Loan Applications", icon: FileText, badge: true },
    { to: "/employee/approved-loans", label: "Active Loans", icon: CheckCircle },
    { to: "/employee/customers", label: "All Customers", icon: Users },
    { to: "/employee/accounts", label: "Manage Accounts", icon: Wallet },
    // { to: "/employee/reports", label: "Reports", icon: DollarSign },
    { to: "/employee/notifications", label: "Notifications", icon: Bell },
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-gray-50 flex font-script">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-gray-200">
            <Link to="/employee/dashboard" className="flex items-center gap-2 text-2xl font-bold text-teal-600">
              <Landmark className="w-8 h-8" />
              Finzap Bank
            </Link>
            <p className="text-xs text-gray-500 mt-1">Employee Portal</p>
          </div>

          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-teal-600 text-white rounded-full flex items-center justify-center text-xl font-bold shadow">
                {user?.username?.[0]?.toUpperCase() || "E"}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{user?.username || "Employee"}</p>
                <p className="text-sm text-gray-500">Bank Staff</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between gap-3 px-4 py-3 rounded-sm transition ${
                    active
                      ? "bg-teal-50 text-teal-600 font-medium border-r-4 border-teal-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg w-full transition"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 z-40">
          <div className="px-6 lg:px-8 py-6 flex items-center justify-between">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-700">
              <Menu className="w-7 h-7" />
            </button>

            <h1 className="text-2xl font-bold text-gray-800">
              {navItems.find((i) => isActive(i.to))?.label || "Employee Dashboard"}
            </h1>

            <div className="flex items-center gap-6 relative">
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={openNotifications}
                  className="relative p-2 hover:bg-gray-100 rounded-xl transition"
                >
                  <Bell className="w-7 h-7 text-gray-700" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse shadow-lg">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Dropdown */}
                {notifOpen && (
                  <div
                    className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl border-2 border-gray-200 z-50 overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-6 py-4 border-b border-gray-200 bg-slate-900 text-white">
                      <h3 className="text-xl font-bold">Notifications</h3>
                      {unreadCount === 0 && <p className="text-sm opacity-90 mt-1">You're all caught up</p>}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                          <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p>No notifications</p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`px-6 py-4 flex items-start gap-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition ${
                              !n.is_read ? "bg-blue-50" : ""
                            }`}
                          >
                            <div className="flex items-center justify-center flex-shrink-0">
                              <Bell className="text-teal-600"/>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900">{n.title}</p>
                              <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-center">
                      <Link
                        to="/employee/notifications"
                        onClick={() => setNotifOpen(false)}
                        className="text-teal-600 font-medium hover:underline text-sm"
                      >
                        View all notifications
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Avatar */}
              <div className="w-10 h-10 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                {user?.username?.[0]?.toUpperCase() || "E"}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Overlays */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {notifOpen && (
        <div className="" onClick={() => setNotifOpen(false)} />
      )}
    </div>
  );
}