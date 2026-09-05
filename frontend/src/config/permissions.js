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
};

export const canAccess = (routeKey, role) => ROUTE_PERMISSIONS[routeKey]?.includes(role);