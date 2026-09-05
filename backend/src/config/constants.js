export const ROLES = {
    REP: "rep",
    SALES_MANAGER: 'sales_manager',
    FINANCE: 'finance',
    ADMIN: 'admin'
}

export const CUSTOMER_TIER = {
    BRONZE: 'bronze',
    SILVER: 'silver',
    GOLD: 'gold'
};

export const PRODUCT_CATEGORIES = {
    HARDWARE: 'hardware',
    SOFTWARE: 'software',
    SUBSCRIPTION: 'subscription'
}

export const QUOTATION_STATUS = {
    DRAFT: 'draft',
    PENDING_APPROVAL: 'pending_approval',
    APPROVED: 'approved',
    NEGOTIATION: 'negotiation',
    CONFIRMED: 'confirmed',
    REJECTED: 'rejected'
}

export const APPROVAL_ACTIONS = {
  APPROVED: 'approved',
  REJECTED: 'rejected',
  RETURNED: 'returned_for_revision',
};

export const RISK_BANDS = {
  NONE: 'none',
  SALES_MANAGER: 'sales_manager',
  SALES_MANAGER_FINANCE: 'sales_manager_finance',
};

export const FULFILLMENT_STATUS = {
  SUGGESTED: 'suggested',
  ACCEPTED: 'accepted',
  MANUAL_OVERRIDE: 'manual_override',
  BACKORDERED: 'backordered',
  CONSOLIDATED: 'consolidated',
};

export const INVOICE_STATUS = {
  UNPAID: 'unpaid',
  PAID: 'paid',
  OVERDUE: 'overdue',
};