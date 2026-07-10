import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Guard for auth pages (/login, /signup). A signed-in user is redirected to the
 * dashboard; a guest sees the forms as usual. While auth is resolving we render
 * a spinner to avoid flashing the form before a redirect.
 */
export function PublicOnlyRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-primary-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue" />
      </div>
    );
  }

  if (user) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}
