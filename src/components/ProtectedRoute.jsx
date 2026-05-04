import { Navigate } from 'react-router-dom';
import { api } from '../services/api';

/**
 * ProtectedRoute — guards routes that require authentication.
 *
 * Props:
 *   children     — component to render when access is granted
 *   requiredRole — optional. A single role string OR an array of allowed role
 *                  strings. When supplied, the authenticated user's role must
 *                  be in the list. If it isn't, they are redirected to
 *                  /dashboard (authenticated but not authorised for this route).
 *
 * Examples:
 *   <ProtectedRoute>                                        any authenticated user
 *   <ProtectedRoute requiredRole="farmer">                  farmer only
 *   <ProtectedRoute requiredRole={['farmer','processor','transporter']}>
 *
 * Token expiry is enforced by the backend — a 401 response in api.js clears
 * the session and redirects to /login automatically.
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const user  = api.getCurrentUser();
  const token = api.getToken();

  // Not logged in at all → go to login page
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  // Normalise requiredRole to an array for uniform comparison
  const allowedRoles = requiredRole
    ? (Array.isArray(requiredRole) ? requiredRole : [requiredRole])
    : null;

  // Logged in but role not in the allowed list → bounce back to dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
