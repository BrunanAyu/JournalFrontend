import { Navigate } from "react-router";

// Redirects to /login if no token found in localStorage
export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}
