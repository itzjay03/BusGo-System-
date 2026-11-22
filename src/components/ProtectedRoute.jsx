import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ account, allowedRoles, children }) {
  const location = useLocation();

  if (!account) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(account.role)) {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
}

export default ProtectedRoute;