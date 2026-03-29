import { Navigate } from 'react-router-dom';

// Wraps public-only routes (login, register).
// If you are already logged in, you get sent to the dashboard instead.
export default function PublicRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/dashboard" replace /> : children;
}
