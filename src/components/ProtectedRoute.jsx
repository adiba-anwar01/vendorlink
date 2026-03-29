import { Navigate } from 'react-router-dom';

// Wraps any route that requires authentication.
// Redirects to /login if no token is found in localStorage.
export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}
