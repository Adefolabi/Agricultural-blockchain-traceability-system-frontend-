import { Navigate } from 'react-router-dom';
import { api } from '../services/api';

const ProtectedRoute = ({ children }) => {
  const user = api.getCurrentUser();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
