import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from './ui/Spinner.jsx';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <Spinner className="h-6 w-6 text-sky-600" />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
