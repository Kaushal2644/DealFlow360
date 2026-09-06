export const ROUTE_PERMISSIONS = {
  dashboard: ['rep', 'sales_manager', 'finance', 'admin'],
  quotations: ['rep', 'sales_manager', 'finance', 'admin'],
  approvals: ['sales_manager', 'finance', 'admin'],
  fulfillment: ['rep', 'sales_manager', 'finance', 'admin'],
  subscriptions: ['rep', 'sales_manager', 'finance', 'admin'],
  invoices: ['rep', 'sales_manager', 'finance', 'admin'],
  dealHealth: ['sales_manager', 'finance', 'admin'],
  reports: ['sales_manager', 'finance', 'admin'],
  discountConfig: ['admin'],
  products: ['admin'],
  inventory: ['admin'],
};

// Admin always passes, regardless of whether a route was explicitly
// added to its permission list. This guarantees new features never
// accidentally lock the admin out just because someone forgot to add
// 'admin' to a new array.
export const canAccess = (routeKey, role) => {
  if (role === 'admin') return true;
  return ROUTE_PERMISSIONS[routeKey]?.includes(role) || false;
};