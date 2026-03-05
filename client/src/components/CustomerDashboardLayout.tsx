// layouts/customer/DashboardLayout.jsx
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Home,
  User,
  CreditCard,
  History,
  FileText,
  DollarSign,
  Menu,
  X,
  LogOut,
  Settings,
  Landmark,
  Bell,
  ArrowRightLeft,
  Download,
  Upload,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { logout } from "../store/userSlice";
import { useGetCustomerDashboardQuery } from "../api/customerApi";
import { useLogoutMutation } from "../api/authApi";
import { useGetNotificationsQuery, useMarkAllAsReadMutation } from "../api/notificationsApi";

export default function CustomerDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const user = useSelector((state) => state?.auth?.user);

  // Real-time notification state from Redux
  const notifications = useSelector((state) => state.notifications.list.slice(0, 8)); // latest 8
  const unreadCount = useSelector((state) => state.notifications.unreadCount);
  const kycStatus = useSelector(state => state.customer.profile?.kyc_status);
  const restricted = kycStatus !== "verified";
  console.log(kycStatus)
  console.log(restricted)

  // Keep these — they fetch + enable real-time
  useGetCustomerDashboardQuery();
  useGetNotificationsQuery();

  const [logoutMutation] = useLogoutMutation();
  const [markAllRead, {isLoading:markingRead} ] = useMarkAllAsReadMutation()

  const handleLogout = async () => {
    await logoutMutation().unwrap();
    navigate("/");
  };

  const navItems = [
    { to: "/customer/dashboard", label: "Overview", icon: Home },
    { to: "/customer/accounts", label: "My Accounts", icon: CreditCard },
    { to: "/customer/transactions", label: "Transactions", icon: History },
    { to: "/customer/loans", label: "My Loans", icon: FileText },
    { to: "/customer/transfer", label: "Transfer Money", icon: ArrowRightLeft },
    { to: "/customer/profile", label: "Profile & KYC", icon: User },
    { to: "/customer/notifications", label: "Notifications", icon: Bell },
    // { to: "/customer/settings", label: "Settings", icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;

  // Icon mapping notification type → icon
  const getNotifIcon = (type) => {
    switch (type) {
      case "ACCOUNT_CREDITED":
      case "DEPOSIT_APPROVED":
        return <ArrowDownLeft className="w-5 h-5 text-teal-600" />;
      case "ACCOUNT_DEBITED":
      case "WITHDRAWAL_APPROVED":
        return <ArrowUpRight className="w-5 h-5 text-orange-600" />;
      case "DEPOSIT_REQUEST":
        return <Download className="w-5 h-5 text-teal-600" />;
      case "WITHDRAWAL_REQUEST":
        return <Upload className="w-5 h-5 text-orange-600" />;
      case "LOAN_APPROVED":
        return <CheckCircle className="w-5 h-5 text-teal-600" />;
      case "REQUEST_REJECTED":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-script">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-teal-600">
              <Landmark className="w-8 h-8" />
              Finzap
            </Link>
          </div>

          {/* User Info */}
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <img
                src={user?.avatar || "https://via.placeholder.com/40"}
                alt="avatar"
                className="w-12 h-12 rounded-full border-2 border-teal-500 object-cover"
              />
              <div>
                <p className="font-semibold text-gray-800">{user?.username || "Customer"}</p>
                <p className="text-sm text-gray-500">Customer</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isNotifItem = item.label === "Notifications";

              return (
                <Link
                  key={item.to}
                  to={!restricted || item.label === "Profile & KYC" ? item.to : "#"}
                  className={`flex items-center justify-between px-4 py-3 rounded-sm transition relative ${
                    isActive(item.to)
                      ? "bg-teal-50 text-teal-600 font-medium border-r-4 border-teal-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </div>

                  {/* Live badge in sidebar */}
                  {isNotifItem && unreadCount > 0 && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
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
        {/* Top Navbar */}
        <header className="bg-white border-b border-gray-200 z-40">
          <div className="px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
            {/* Mobile Menu */}
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-700">
              <Menu className="w-7 h-7" />
            </button>

            <h1 className="text-2xl font-bold text-gray-800">
              {navItems.find((i) => i.to === location.pathname)?.label || "Dashboard"}
            </h1>

            <div className="flex items-center gap-5">
              {/* Notification Bell + Dropdown */}
              <div className="relative">
                <button
                  onClick={async () => {
                    setNotificationsOpen(!notificationsOpen);
                    
                    // When opening and there are unread → mark all as read
                    if (!notificationsOpen && unreadCount > 0) {
                      try {
                        await markAllRead().unwrap();
                        // No need to do anything else — invalidatesTags will refetch automatically
                      } catch (err) {
                        console.error("Failed to mark as read", err);
                      }
                    }
                  }}
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
                {notificationsOpen && (
                  <div
                    className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl border-2 border-gray-200 z-50 overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-teal-50 to-blue-50">
                      <h3 className="text-xl font-bold text-gray-800">Notifications</h3>
                      {unreadCount > 0 && (
                        <p className="text-sm text-teal-600 font-medium mt-1">{unreadCount} unread</p>
                      )}
                    </div>

                    {/* List */}
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-10 text-center text-gray-500">
                          <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p>No new notifications</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`px-6 py-4 flex items-start gap-4 border-b border-gray-100 last:border-0 transition-all hover:bg-gray-50 ${
                              !notif.is_read ? "bg-teal-50/30" : ""
                            }`}
                          >
                            {/* Icon */}
                            <div className={!notif.is_read ? "animate-pulse" : ""}>
                              {getNotifIcon(notif.notification_type)}
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                              <p className={`font-medium ${!notif.is_read ? "text-gray-900" : "text-gray-700"}`}>
                                {notif.title}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                              </p>
                            </div>

                            {/* Unread dot */}
                            {!notif.is_read && (
                              <div className="w-3 h-3 bg-teal-500 rounded-full animate-pulse flex-shrink-0" />
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                      <Link
                        to="/customer/notifications"
                        onClick={() => setNotificationsOpen(false)}
                        className="text-teal-600 font-medium hover:underline text-sm"
                      >
                        View all notifications →
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Welcome Text */}
              <span className="hidden sm:block text-sm text-gray-600">
                Welcome back, <strong>{user?.first_name?.split(" ")[0] || "Customer"}!</strong>
              </span>

              {/* Avatar */}
              <img
                src={user?.avatar || "https://via.placeholder.com/40"}
                alt="avatar"
                className="w-10 h-10 rounded-full border border-gray-300 object-cover"
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8">
          {restricted && (
            <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg mb-4 flex justify-between items-center">
              <span>Your KYC is pending. Complete verification to unlock full features.</span>
              <Link to="/customer/profile" className="text-teal-700 underline font-medium">
                Complete KYC
              </Link>
            </div>
          )}
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Click outside to close dropdown */}
      {notificationsOpen && (
        <div
          className=""
          onClick={() => setNotificationsOpen(false)}
        />
      )}
    </div>
  );
}