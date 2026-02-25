import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children, roles }) {
  const location = useLocation();
  const raw = localStorage.getItem("user");
  const access = localStorage.getItem("access");
  if (!raw || !access) return <Navigate to="/login" replace />;

  let user;
  try {
    user = JSON.parse(raw);
  } catch {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }
  if (user.must_change_password && location.pathname !== "/change-password") {
    return <Navigate to="/change-password" replace />;
  }
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}
