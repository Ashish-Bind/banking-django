// pages/customer/Settings.jsx
import { useState } from "react";
import { 
  Bell, Shield, Lock, Smartphone, Mail, Eye, EyeOff, 
  Globe, Moon, Sun, CreditCard, User, ChevronRight,
  Check, X
} from "lucide-react";

export default function CustomerSettings() {
  const [notifications, setNotifications] = useState({
    transaction: true,
    offers: false,
    security: true,
    monthly: true,
  });

  const [twoFactor, setTwoFactor] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account preferences and security</p>
      </div>

      <div className="space-y-6">
        {/* Account & Profile */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-4">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <User className="w-6 h-6" />
              Account & Profile
            </h2>
          </div>
          <div className="p-6 space-y-5">
            <SettingItem
              icon={<User className="w-5 h-5" />}
              title="Personal Information"
              desc="Update your name, email, phone, and address"
              link="/customer/profile"
            />
            <SettingItem
              icon={<CreditCard className="w-5 h-5" />}
              title="Manage Beneficiaries"
              desc="Add, edit or remove saved payees"
            />
            <SettingItem
              icon={<Lock className="w-5 h-5" />}
              title="Change Password"
              desc="Update your account password"
            />
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-4">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <Shield className="w-6 h-6" />
              Security
            </h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <Lock className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-500">Add an extra layer of security</p>
                </div>
              </div>
              <button
                onClick={() => setTwoFactor(!twoFactor)}
                className={`w-14 h-8 rounded-full relative transition ${twoFactor ? "bg-green-500" : "bg-gray-300"}`}
              >
                <span className={`absolute top-1 left-0 w-6 h-6 bg-white rounded-full shadow transition ${twoFactor ? "translate-x-7" : "translate-x-1"}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Login Alerts</p>
                  <p className="text-sm text-gray-500">Get notified on new device login</p>
                </div>
              </div>
              <div className="text-green-600 flex items-center gap-2">
                <Check className="w-5 h-5" />
                <span className="text-sm font-medium">Enabled</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-4">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <Bell className="w-6 h-6" />
              Notifications
            </h2>
          </div>
          <div className="p-6 space-y-5">
            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800 capitalize">
                    {key === "transaction" ? "Transaction Alerts" :
                     key === "offers" ? "Offers & Promotions" :
                     key === "security" ? "Security Alerts" : "Monthly Statements"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {key === "transaction" ? "Deposits, withdrawals, transfers" :
                     key === "offers" ? "Exclusive deals and cashbacks" :
                     key === "security" ? "Login and account changes" : "E-statements every month"}
                  </p>
                </div>
                <button
                  onClick={() => setNotifications(prev => ({ ...prev, [key]: !value }))}
                  className={`w-14 h-8 rounded-full relative transition ${value ? "bg-teal-500" : "bg-gray-300"}`}
                >
                  <span className={`absolute top-1 left-0 w-6 h-6 bg-white rounded-full shadow transition ${value ? "translate-x-7" : "translate-x-1"}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Appearance & Preferences */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-emerald-600 text-white px-6 py-4">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <Globe className="w-6 h-6" />
              Preferences
            </h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  {darkMode ? <Moon className="w-6 h-6 text-emerald-600" /> : <Sun className="w-6 h-6 text-yellow-600" />}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Dark Mode</p>
                  <p className="text-sm text-gray-500">Reduce eye strain in low light</p>
                </div>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`w-14 h-8 rounded-full relative transition ${darkMode ? "bg-emerald-600" : "bg-gray-300"}`}
              >
                <span className={`absolute w-6 h-6 top-1 left-0 bg-white rounded-full shadow  transition  ${darkMode ? "translate-x-7" : "translate-x-1"}`} />
              </button>
            </div>

            <SettingItem
              icon={<Mail className="w-5 h-5" />}
              title="Email Preferences"
              desc="Manage email notifications and statements"
            />
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-red-800 mb-3">Danger Zone</h3>
          <p className="text-red-700 mb-5">These actions are permanent and cannot be undone</p>
          <div className="space-y-4">
            <button className="w-full py-3 border-2 border-red-300 text-red-700 rounded-xl font-medium hover:bg-red-100 transition">
              Freeze Account
            </button>
            <button className="w-full py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition">
              Close Account Permanently
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Setting Item Component
function SettingItem({ icon, title, desc, link }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 -mx-6 px-6 transition rounded-lg cursor-pointer">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600">
          {icon}
        </div>
        <div>
          <p className="font-semibold text-gray-800">{title}</p>
          <p className="text-sm text-gray-500">{desc}</p>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </div>
  );
}