import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Shield, Users, User, Loader2 } from "lucide-react";
import RoleSelector from "../components/RoleSelector";
import { useLoginMutation } from "../api/authApi";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [role, setRole] = useState("customer");
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [login, { isLoading, error }] = useLoginMutation();
  const navigate = useNavigate();

  const roles = [
    { id: "admin", label: "Admin", icon: Shield },
    { id: "employee", label: "Employee", icon: Users },
    { id: "customer", label: "Customer", icon: User },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({ email, password, role }).unwrap().then((payload) => {
        toast(`Welcome Back, ${payload?.user?.first_name}`, {icon:"😀"})
        navigate(`/${payload?.user?.role}/dashboard`)})
    } catch (err) {
      const errorMsg =
      err?.data?.error || 
      err?.data?.detail || 
      "Invalid credentials. Please try again.";

    toast(errorMsg, { icon: "❌" });
    console.error("Login failed:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 font-script">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border
      rounded-2xl border-gray-100 shadow-lg p-8">

        <h2 className="text-3xl font-bold text-center mb-6 text-teal-600">
          Welcome Back
        </h2>
      <form onSubmit={handleSubmit}>
        {/* Role Selector */}
        <div className="mb-4 flex items-center justify-center">
        <RoleSelector selectedRole={role} setSelectedRole={setRole} />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="text-sm text-gray-700">Email / Username</label>
          <div className="flex items-center gap-2 mt-1 border border-gray-300 rounded-xl px-3 py-2 bg-white">
            <Mail size={18} className="text-gray-600" />
            <input
            onChange={e => setEmail(e.target.value)}
              type="text"
              placeholder="you@example.com"
              className="w-full outline-none"
              value={email}
            />
          </div>
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="text-sm text-gray-700">Password</label>
          <div className="flex items-center gap-2 mt-1 border border-gray-300 rounded-xl px-3 py-2 bg-white">
            <Lock size={18} className="text-gray-600" />
            <input
              onChange={e => setPassword(e.target.value)}
              type="password"
              placeholder="••••••••"
              className="w-full outline-none"
              value={password}
            />
          </div>
        </div>

        {/* Login Button */}
        <button
          className="w-full bg-teal-600 text-white py-3 rounded-xl hover:bg-teal-700 transition text-center flex items-center justify-center"
          type="submit"
          disabled={isLoading}
        >
          {!isLoading ? "Login" : <Loader2 className="w-5 h-5 text-teal-200 animate-spin"/>}
        </button>

        </form>

        <p className="text-center mt-4 text-gray-700 text-sm">
          Don’t have an account?
          <a href="/register" className="text-teal-600 font-medium ml-1 hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
