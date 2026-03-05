// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRoute({ 
  roles,           // string or array: "admin" or ["admin", "employee"]
  fallback = "/login", 
  children 
}) {
  const { user, customer, isAuthenticated } = useSelector((state) => state.auth);

  // Not logged in → go to login
  if (!isAuthenticated || !user) {
    return <Navigate to={fallback} replace />;
  }

  // No role required → just need to be logged in
  if (!roles) {
    return children ? <>{children}</> : <Outlet />;
  }

  // Convert single role string to array
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  // Check if user has required role
  const hasAccess = allowedRoles.includes(user.role);

  if (!hasAccess) {
    return <Navigate to="/unauthorized" replace />;
  }

  // All good → show the page
  return children ? <>{children}</> : <Outlet />;
}