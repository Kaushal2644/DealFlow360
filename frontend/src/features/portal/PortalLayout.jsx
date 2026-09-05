import { Outlet, useNavigate } from 'react-router-dom';
import usePortalAuthStore from '../../app/portalAuthStore';

export default function PortalLayout() {
  const customer = usePortalAuthStore((state) => state.customer);
  const logout = usePortalAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/portal/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-slate-800 text-white px-6 py-3 flex justify-between items-center">
        <span className="font-bold">DealFlow360 — Customer Portal</span>
        <div className="flex items-center gap-4 text-sm">
          <span>{customer?.name} ({customer?.tier})</span>
          <button onClick={handleLogout} className="bg-slate-700 px-3 py-1 rounded hover:bg-slate-600">
            Log Out
          </button>
        </div>
      </nav>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}