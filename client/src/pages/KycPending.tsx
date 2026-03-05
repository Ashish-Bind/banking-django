import { AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

export default function KycPending() {
  return (
    <div className="max-w-xl mx-auto text-center py-14">
      <AlertTriangle className="w-20 h-20 mx-auto text-yellow-500" />

      <h2 className="text-3xl font-bold mt-6 text-gray-800">
        KYC Verification Pending
      </h2>

      <p className="text-gray-600 mt-4 leading-relaxed">
        Your KYC is under review.  
        Until verification is complete, you won't be able to create bank accounts, request loans, or make transactions.
      </p>

      <Link
        to="/customer/profile"
        className="mt-8 inline-block bg-teal-600 text-white px-6 py-3 rounded-xl hover:bg-teal-700 transition"
      >
        Update KYC Details →
      </Link>
    </div>
  );
}
