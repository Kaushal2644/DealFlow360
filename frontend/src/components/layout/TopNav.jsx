import { NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../../app/authStore';
import { ROUTE_PERMISSIONS } from '../../config/permissions';

const navItems = [
  { key: 'dashboard', label: 'Dashboard', path: '/dashboard' },
  { key: 'quotations', label: 'Quotations', path: '/quotations' },
  { key: 'approvals', label: 'Approvals', path: '/approvals' },
  { key: 'fulfillment', label: 'Fulfillment', path: '/fulfillment' },
  { key: 'subscriptions', label: 'Subscriptions', path: '/subscriptions' },
  { key: 'invoices', label: 'Invoices', path: '/invoices' },
  { key: 'dealHealth', label: 'Deal Health', path: '/deal-health' },
  { key: 'reports', label: 'Reports', path: '/reports' },
  { key: 'discountConfig', label: 'Discount Config', path: '/admin/discount-config' },
  { key: 'products', label: 'Products', path: '/products' },
];

export default function TopNav() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const visibleItems = navItems.filter((item) =>
    ROUTE_PERMISSIONS[item.key]?.includes(user?.role)
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <span className="font-bold text-lg">DealFlow360</span>
        <div className="flex gap-4 text-sm">
          {visibleItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `hover:underline ${isActive ? 'font-semibold underline' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <span>{user?.name} ({user?.role})</span>
        <button onClick={handleLogout} className="bg-blue-800 px-3 py-1 rounded hover:bg-blue-900">
          Log Out
        </button>
      </div>
    </nav>
  );
}