import { Navigate } from 'react-router-dom';
import { api } from '../services/api';

/**
 * ProtectedRoute — guards routes that require authentication.
 *
 * Props:
 *   children     — component to render when access is granted
 *   requiredRole — (optional) if supplied, the user's role must match exactly.
 *                  If it doesn't, the user is redirected to /dashboard with a
 *                  message rather than to /login (they are authenticated, just
 *                  not authorised for this specific route).
 *
 * Token presence is checked from localStorage.  Expiry is enforced by the
 * backend — a 401 response in api.js clears the session and redirects to
 * /login automatically.
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const user  = api.getCurrentUser();
  const token = api.getToken();

  // Not logged in at all → go to login page
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but wrong role → bounce back to dashboard
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
