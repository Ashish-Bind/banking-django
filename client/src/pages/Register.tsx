// src/pages/auth/RegisterPage.jsx
import { Mail, Lock, User, Phone, Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useRegisterMutation, authApi } from "../api/authApi";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    password2: "",
  });

  const [errors, setErrors] = useState({});
  const [register, { isLoading }] = useRegisterMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
    if (name === "password2" && errors.passwordMatch) {
      setErrors({ ...errors, passwordMatch: "" });
    }
  };

  // Validation functions
  const validatePhone = (phone) => {
    const phoneRegex = /^\+?\d{10,15}$/; // Allows +91 or just 10 digits
    return phoneRegex.test(phone.replace(/\s+/g, ""));
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name.trim()) newErrors.first_name = "First name is required";
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email address";
    if (!formData.email) newErrors.email = "Email is required";

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = "Enter a valid phone number (10-15 digits, e.g. +919876543210)";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!validatePassword(formData.password)) {
      newErrors.password =
        "Password must be 8+ chars with uppercase, lowercase, number & special char";
    }

    if (formData.password !== formData.password2) {
      newErrors.passwordMatch = "Passwords do not match";
    }
    if (!formData.password2) newErrors.password2 = "Please confirm your password";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await register({
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim() || "",
        email: formData.email.trim(),
        phone: formData.phone.replace(/\s+/g, ""),
        password: formData.password,
      }).unwrap();

      dispatch(authApi.endpoints.getUser.initiate());
      alert("Registration successful! Welcome to Finzap Bank");
      navigate("/customer/dashboard");
    } catch (err) {
      console.error("Register failed:", err);
      alert(err.data?.error || "Registration failed. This email/phone may already be registered.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 font-script">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8 my-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-teal-600">Create Account</h2>
          <p className="text-gray-600 mt-2">Join Finzap Bank today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <div className="flex items-center gap-3 border rounded-xl px-4 py-3 bg-white focus-within:border-teal-500 transition 
              ${errors.first_name ? 'border-red-500' : 'border-gray-300'}">
              <User size={20} className="text-gray-500" />
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="John"
                className="w-full outline-none text-gray-800"
              />
            </div>
            {errors.first_name && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.first_name}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name (Optional)</label>
            <div className="flex items-center gap-3 border border-gray-300 rounded-xl px-4 py-3 bg-white focus-within:border-teal-500 transition">
              <User size={20} className="text-gray-500" />
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Doe"
                className="w-full outline-none text-gray-800"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className={`flex items-center gap-3 border rounded-xl px-4 py-3 bg-white focus-within:border-teal-500 transition ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}>
              <Mail size={20} className="text-gray-500" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full outline-none text-gray-800"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.email}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <div className={`flex items-center gap-3 border rounded-xl px-4 py-3 bg-white focus-within:border-teal-500 transition ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}>
              <Phone size={20} className="text-gray-500" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="w-full outline-none text-gray-800"
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.phone}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className={`flex items-center gap-3 border rounded-xl px-4 py-3 bg-white focus-within:border-teal-500 transition ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}>
              <Lock size={20} className="text-gray-500" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full outline-none text-gray-800"
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.password}
              </p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Must contain: 8+ characters, uppercase, lowercase, number, special char (@$!%*?&)
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <div className={`flex items-center gap-3 border rounded-xl px-4 py-3 bg-white focus-within:border-teal-500 transition ${
              errors.passwordMatch || errors.password2 ? 'border-red-500' : 'border-gray-300'
            }`}>
              <Lock size={20} className="text-gray-500" />
              <input
                type="password"
                name="password2"
                value={formData.password2}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full outline-none text-gray-800"
              />
            </div>
            {(errors.passwordMatch || errors.password2) && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.passwordMatch || errors.password2}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-semibold py-4 rounded-xl transition flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={22} />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-teal-600 font-semibold hover:underline">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
}