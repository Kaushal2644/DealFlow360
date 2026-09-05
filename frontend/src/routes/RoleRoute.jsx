import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../app/authStore';
import { ROUTE_PERMISSIONS } from '../config/permissions';

export default function RoleRoute({ routeKey }) {
  const user = useAuthStore((state) => state.user);
  const allowedRoles = ROUTE_PERMISSIONS[routeKey] || [];

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}