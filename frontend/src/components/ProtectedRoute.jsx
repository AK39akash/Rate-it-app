import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  if (!token) return <Navigate to="/login" replace />;

  if (role && user?.role?.toUpperCase() !== role.toUpperCase()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
