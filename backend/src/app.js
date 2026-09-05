import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import productRoutes from './routes/product.routes.js';
import discountConfigRoutes from './routes/discountConfig.routes.js';
import warehouseRoutes from './routes/warehouse.routes.js';
import subscriptionPlanRoutes from './routes/subscriptionPlan.routes.js';
import customerRoutes from './routes/customer.routes.js';
import quotationRoutes from './routes/quotation.routes.js';
import approvalRoutes from './routes/approval.routes.js';
import fulfillmentRoutes from './routes/fulfillment.routes.js';
import subscriptionRoutes from './routes/subscription.routes.js';
import billingRoutes from './routes/billing.routes.js';
import invoiceRoutes from './routes/invoice.routes.js';
import portalRoutes from './routes/portal.routes.js';
import dealHealthRoutes from './routes/dealHealth.routes.js';
import upsellRoutes from './routes/upsell.routes.js';
import reportingRoutes from './routes/reporting.routes.js';
 
import authRoutes from './routes/auth.routes.js';

const app = express();

app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth',authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/discount-config', discountConfigRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/subscription-plans', subscriptionPlanRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/fulfillment', fulfillmentRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/portal', portalRoutes);
app.use('/api/deal-health', dealHealthRoutes);
app.use('/api/upsell', upsellRoutes);
app.use('/api/reporting', reportingRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;