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
 
import authRoutes from './routes/auth.routes.js';

const app = express();

app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
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

app.use(notFound);
app.use(errorHandler);

export default app;