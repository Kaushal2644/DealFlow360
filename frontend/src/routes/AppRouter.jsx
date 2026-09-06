import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../features/auth/LoginPage";
import SignupPage from "../features/auth/SignupPage";
import DashboardPage from "../features/dashboard/DashboardPage";
import AppShell from "../components/layout/AppShell";
import PrivateRoute from "./PrivateRoute";

import QuotationsListPage from "../features/quotations/QuotationsListPage";
import QuotationBuilderPage from "../features/quotations/QuotationBuilderPage";
import ApprovalsListPage from "../features/approvals/ApprovalsListPage";
import ApprovalDetailPage from "../features/approvals/ApprovalDetailPage";
import FulfillmentListPage from "../features/fulfillment/FulfillmentListPage";
import FulfillmentDetailPage from "../features/fulfillment/FulfillmentDetailPage";
import SubscriptionsListPage from "../features/subscriptions/SubscriptionsListPage";
import SubscriptionDetailPage from "../features/subscriptions/SubscriptionDetailPage";
import InvoicesListPage from "../features/invoices/InvoicesListPage";
import InvoiceDetailPage from "../features/invoices/InvoiceDetailPage";
import DealHealthDashboardPage from "../features/dealHealth/DealHealthDashboardPage";
import ReportingDashboardPage from "../features/admin/ReportingDashboardPage";
import DiscountConfigPage from "../features/admin/DiscountConfigPage";
import ProductCatalogPage from "../features/products/ProductCatalogPage";
import ProductDetailPage from "../features/products/ProductDetailPage";

import PortalLoginPage from "../features/portal/PortalLoginPage";
import PortalLayout from "../features/portal/PortalLayout";
import PortalRoute from "./PortalRoute";
import MyQuotationsPage from "../features/portal/MyQuotationsPage";
import NegotiationPage from "../features/portal/NegotiationPage";
import RoleRoute from "./RoleRoute";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route element={<PrivateRoute />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/quotations" element={<QuotationsListPage />} />
            <Route path="/quotations/:id" element={<QuotationBuilderPage />} />
            <Route path="/fulfillment" element={<FulfillmentListPage />} />
            <Route
              path="/fulfillment/:id"
              element={<FulfillmentDetailPage />}
            />
            <Route path="/subscriptions" element={<SubscriptionsListPage />} />
            <Route
              path="/subscriptions/:id"
              element={<SubscriptionDetailPage />}
            />
            <Route path="/invoices" element={<InvoicesListPage />} />
            <Route path="/invoices/:id" element={<InvoiceDetailPage />} />

            <Route element={<RoleRoute routeKey="approvals" />}>
              <Route path="/approvals" element={<ApprovalsListPage />} />
              <Route path="/approvals/:id" element={<ApprovalDetailPage />} />
            </Route>

            <Route element={<RoleRoute routeKey="dealHealth" />}>
              <Route
                path="/deal-health"
                element={<DealHealthDashboardPage />}
              />
            </Route>

            <Route element={<RoleRoute routeKey="reports" />}>
              <Route path="/reports" element={<ReportingDashboardPage />} />
            </Route>

            <Route element={<RoleRoute routeKey="discountConfig" />}>
              <Route
                path="/admin/discount-config"
                element={<DiscountConfigPage />}
              />
            </Route>

            <Route element={<RoleRoute routeKey="products" />}>
              <Route path="/products" element={<ProductCatalogPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="/portal/login" element={<PortalLoginPage />} />

        <Route element={<PortalRoute />}>
          <Route element={<PortalLayout />}>
            <Route path="/portal/quotations" element={<MyQuotationsPage />} />

            <Route path="/portal/negotiation" element={<NegotiationPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
