import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { isAuthenticated, token } = useAuth();
  const hasAccess = Boolean(isAuthenticated || token);

  return hasAccess ? children : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
