import { Navigate, Outlet } from 'react-router-dom';
import usePortalAuthStore from '../app/portalAuthStore';

export default function PortalRoute() {
  const token = usePortalAuthStore((state) => state.token);

  if (!token) {
    return <Navigate to="/portal/login" replace />;
  }

  return <Outlet />;
}