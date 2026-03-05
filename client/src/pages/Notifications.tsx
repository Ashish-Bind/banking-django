// pages/customer/NotificationsPage.jsx
import { useSelector } from "react-redux";
import { formatDistanceToNow } from "date-fns";
import {
  Download,
  Upload,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle,
  XCircle,
  Bell,
  Clock,
} from "lucide-react";

const getIcon = (type) => {
  switch (type) {
    case "ACCOUNT_CREDITED":
    case "DEPOSIT_APPROVED":
      return <ArrowDownLeft className="w-6 h-6 text-teal-600" />;
    case "ACCOUNT_DEBITED":
    case "WITHDRAWAL_APPROVED":
      return <ArrowUpRight className="w-6 h-6 text-orange-600" />;
    case "DEPOSIT_REQUEST":
      return <Download className="w-6 h-6 text-teal-600" />;
    case "WITHDRAWAL_REQUEST":
      return <Upload className="w-6 h-6 text-orange-600" />;
    case "LOAN_APPROVED":
      return <CheckCircle className="w-6 h-6 text-teal-600" />;
    case "REQUEST_REJECTED":
      return <XCircle className="w-6 h-6 text-red-600" />;
    default:
      return <Bell className="w-6 h-6 text-gray-600" />;
  }
};

export default function NotificationsPage() {
  const { list = [], unreadCount = 0 } = useSelector((state) => state.notifications);

  if (list.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <Bell className="w-20 h-20 text-gray-300 mx-auto mb-6" />
        <p className="text-xl text-gray-500">No notifications yet</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-4">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-800">Notifications</h1>
        {unreadCount > 0 && (
          <p className="text-lg text-teal-600 font-medium mt-3">
            {unreadCount} unread
          </p>
        )}
      </div>

      {/* List */}
      <div className="space-y-4">
        {list.map((notif) => (
          <div
            key={notif.id}
            className={`bg-white rounded-md border-2 border-gray-200 p-6 flex items-center gap-5 transition-all hover:shadow-xl ${
              !notif.is_read
                ? "border-l-2 border-l-teal-500"
                : ""
            }`}
          >
            {/* Icon - No circle, just bold icon */}
            <div className={notif.is_read ? "opacity-60" : ""}>
              {getIcon(notif.notification_type)}
            </div>

            {/* Content */}
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-800">{notif.title}</h3>
              <p className="text-gray-600 mt-1">{notif.message}</p>
            </div>

            {/* Time */}
            <div className="text-right">
              <p className="text-sm text-gray-500 flex items-center gap-1 justify-end">
                <Clock className="w-4 h-4" />
                {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}