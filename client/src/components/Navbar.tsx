import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  Diamond,
  Menu,
  User,
  Settings,
  LogOut,
  Home,
  Info,
  Phone,
  Landmark,
  Bell,
  Sun,
  Moon,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { logout } from "../store/userSlice";

export default function Navbar() {
  const user = useSelector((state) => state.auth.user);
  // const user = {
  //   avatar:'https://avatars.githubusercontent.com/u/121487855?v=4',
  //   name:'Ashish Bind'
  // }

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Theme handling
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = saved === "dark" || (!saved && prefersDark);

    setIsDark(shouldBeDark);
    if (shouldBeDark) document.documentElement.classList.add("dark");
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    setUserMenuOpen(false);
    setMobileOpen(false);
    navigate("/login");
  };

  // Sample notifications (replace with real data later)
  const notifications = [
    { id: 1, type: "success", title: "Payment received", message: "₹5,000 from Rajesh", time: "2 min ago" },
    { id: 2, type: "info", title: "New feature", message: "Budget goals are now live!", time: "1 hour ago" },
    { id: 3, type: "warning", title: "Low balance", message: "Savings account below ₹10,000", time: "3 hours ago" },
    { id: 3, type: "warning", title: "Low balance", message: "Savings account below ₹10,000", time: "3 hours ago" },
    { id: 3, type: "warning", title: "Low balance", message: "Savings account below ₹10,000", time: "3 hours ago" },
  ];

  const hasUnread = notifications.length > 0;

  return (
    <nav className="bg-white dark:bg-slate-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between font-script">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-teal-600 dark:text-teal-500 flex items-center gap-2">
          <Landmark className="h-7 w-7" />
          Finzap.
        </Link>

        {/* Desktop Right Section */}
        <div className="hidden md:flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="relative w-16 h-9 rounded-full bg-gray-200 dark:bg-gray-700 shadow-inner transition-all duration-500 hover:ring-4 hover:ring-indigo-500/20"
            aria-label="Toggle dark mode"
          >
            <div
              className={`absolute top-1 left-1 w-7 h-7 rounded-full shadow-lg transition-all duration-500 flex items-center justify-center ${
                isDark
                  ? "translate-x-7 bg-indigo-500 text-white"
                  : "translate-x-0 bg-white text-yellow-500"
              }`}
            >
              <Sun className={`w-5 h-5 transition-opacity ${isDark ? "opacity-0" : "opacity-100"}`} />
              <Moon className={`w-5 h-5 absolute transition-opacity ${isDark ? "opacity-100" : "opacity-0"}`} />
            </div>
          </button>

          {/* Notifications */}
          <div className="relative">
            {/* <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <Bell className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              {hasUnread && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              )}
            </button> */}

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-start gap-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
                      >
                        {notif.type === "success" && <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />}
                        {notif.type === "info" && <Info className="w-5 h-5 text-blue-500 mt-0.5" />}
                        {notif.type === "warning" && <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">{notif.title}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{notif.message}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{notif.time}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">No new notifications</p>
                  )}
                </div>
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                  <button className="text-sm text-teal-600 dark:text-teal-400 font-medium hover:underline">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg px-3 py-2 transition"
              >
                <img
                  src={user.avatar || "https://via.placeholder.com/40"}
                  alt="avatar"
                  className="w-9 h-9 rounded-full border border-gray-300 dark:border-gray-600 object-cover"
                />
                <span className="font-medium text-gray-800 dark:text-gray-200">{user.name}</span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                  <Link
                    to="/customer/dashboard"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Diamond className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    My Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                  <hr className="my-2 border-gray-200 dark:border-gray-700" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-teal-600 text-white px-5 py-2 rounded-lg hover:bg-teal-700 transition"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button className="md:hidden text-gray-700 dark:text-gray-300" onClick={() => setMobileOpen(!mobileOpen)}>
          <Menu className="w-7 h-7" />
        </button>
      </div>

      {/* Mobile Menu - Same as before, plus theme toggle & notifications */}
      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 py-6 space-y-6 font-script">
          {/* Theme Toggle in Mobile */}
          <div className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
            <button
              onClick={toggleTheme}
              className="relative w-16 h-9 rounded-full bg-gray-200 dark:bg-gray-700 shadow-inner"
            >
              <div
                className={`absolute top-0.5 left-0.5 w-8 h-8 rounded-full shadow-lg transition-all duration-500 flex items-center justify-center ${
                  isDark ? "translate-x-7 bg-indigo-500" : "translate-x-0 bg-white"
                }`}
              >
                {isDark ? <Moon className="w-5 h-5 text-white" /> : <Sun className="w-5 h-5 text-yellow-500" />}
              </div>
            </button>
          </div>

          {/* Mobile Notifications */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Notifications</h3>
            {notifications.slice(0, 3).map((n) => (
              <div key={n.id} className="py-2 text-sm">
                <p className="font-medium text-gray-800 dark:text-gray-200">{n.title}</p>
                <p className="text-gray-600 dark:text-gray-400">{n.message}</p>
              </div>
            ))}
          </div>

          <hr className="border-gray-200 dark:border-gray-700" />

          {/* Mobile Full-Screen Menu */}
{open && (
  <div className="md:hidden bg-white border-t border-gray-300 shadow-md px-4 py-4 space-y-4">
    {/* Main Links */}
    <Link className="block text-gray-700 hover:text-teal-600 py-2" to="/" onClick={() => setOpen(false)}>
      Home
    </Link>
    <Link className="block text-gray-700 hover:text-teal-600 py-2" to="/about" onClick={() => setOpen(false)}>
      About
    </Link>
    <Link className="block text-gray-700 hover:text-teal-600 py-2" to="/contact" onClick={() => setOpen(false)}>
      Contact
    </Link>

    <hr className="border-gray-300" />

    {/* User Section in Mobile */}
    {user ? (
      <div className="space-y-3">
        <div className="flex items-center gap-3 pb-3">
          <img
            src={user.avatar || "https://via.placeholder.com/40"}
            alt="avatar"
            className="w-10 h-10 rounded-full border border-gray-400"
          />
          <div>
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        <Link to="/customer/dashboard" className="block py-2 text-gray-700" onClick={() => setOpen(false)}>
          Dashboard
        </Link>
        <Link to="/profile" className="block py-2 text-gray-700" onClick={() => setOpen(false)}>
          My Profile
        </Link>
        <Link to="/settings" className="block py-2 text-gray-700" onClick={() => setOpen(false)}>
          Settings
        </Link>
        <button
          onClick={handleLogout}
          className="w-full text-left py-2 text-red-600 font-medium"
        >
          Logout
        </button>
      </div>
    ) : (
      <Link
        to="/login"
        className="block bg-teal-600 text-white px-6 py-3 rounded-lg text-center font-medium"
        onClick={() => setOpen(false)}
      >
        Login
      </Link>
    )}
  </div>
)}
        </div>
      )}
    </nav>
  );
}
