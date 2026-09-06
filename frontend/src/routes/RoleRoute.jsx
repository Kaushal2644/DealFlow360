import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../app/authStore';
import { canAccess } from '../config/permissions';

export default function RoleRoute({ routeKey }) {
  const user = useAuthStore((state) => state.user);

  if (!canAccess(routeKey, user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}