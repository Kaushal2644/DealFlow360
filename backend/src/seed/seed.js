import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { env } from '../config/env.js';

import User from '../models/User.js';
import Customer from '../models/Customer.js';
import Product from '../models/Product.js';
import Warehouse from '../models/Warehouse.js';
import StockLevel from '../models/StockLevel.js';
import DiscountTier from '../models/DiscountTier.js';
import CategoryDiscountCeiling from '../models/CategoryDiscountCeiling.js';
import ApprovalChainRule from '../models/ApprovalChainRule.js';
import SubscriptionPlan from '../models/SubscriptionPlan.js';
import UpsellRule from '../models/UpsellRule.js';
import Quotation from '../models/Quotation.js';
import FulfillmentOrder from '../models/FulfillmentOrder.js';
import Subscription from '../models/Subscription.js';
import BillingSchedule from '../models/BillingSchedule.js';
import Invoice from '../models/Invoice.js';
import Payment from '../models/Payment.js';
import NegotiationMessage from '../models/NegotiationMessage.js';
import DealHealthFlag from '../models/DealHealthFlag.js';

import { evaluateQuotationRisk } from '../services/discountRiskEngine.js';
import { buildApprovalChain } from '../services/approvalRouter.js';
import { calculateWarehouseSplit } from '../services/warehouseSplitEngine.js';
import { activateBillingForQuotation } from '../services/billingActivation.js';

// ---------- helpers ----------
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randChoice = (arr) => arr[randInt(0, arr.length - 1)];
const randSubset = (arr, count) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);
const daysFromNow = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

// ---------- static reference data ----------
const COMPANY_NAMES = [
  'Meridian Logistics', 'Cascade Manufacturing', 'Blue Ridge Textiles', 'Sunrise Health Group',
  'Falcon Aerospace Systems', 'Harborview Financial', 'Greenfield Agritech', 'NorthStar Retail Group',
  'Pinnacle Construction Co', 'Redwood Media Partners', 'Lakeside Insurance Group', 'Summit Legal Associates',
  'Riverside Energy Corp', 'Ironclad Security Solutions', 'Brightpath Education Services',
  'Coastal Shipping Lines', 'Silverline Telecom', 'Golden Gate Hospitality Group', 'Vantage Point Consulting',
  'Everwood Furniture Co', 'Apex Robotics', 'Bluebird Airlines Cargo', 'Crestview Realty Group',
  'Highland Dairy Co-op', 'Stellar Biotech Labs',
];

const HARDWARE_PRODUCTS = [
  { name: 'Laptop Pro 14', price: 1200, cost: 900 },
  { name: 'Laptop Air 13', price: 950, cost: 700 },
  { name: 'Business Desktop X1', price: 1100, cost: 800 },
  { name: '27-inch 4K Monitor', price: 380, cost: 260 },
  { name: 'Wireless Mouse', price: 35, cost: 15 },
  { name: 'Mechanical Keyboard', price: 90, cost: 45 },
  { name: 'Docking Station', price: 150, cost: 90 },
  { name: 'Laser Printer LP200', price: 320, cost: 220 },
  { name: 'Network Switch 24-Port', price: 410, cost: 280 },
  { name: 'Rack Server R510', price: 3200, cost: 2400 },
  { name: 'External SSD 1TB', price: 110, cost: 60 },
  { name: 'Webcam HD Pro', price: 60, cost: 30 },
  { name: 'Noise Cancelling Headset', price: 140, cost: 75 },
  { name: 'Tablet Rugged 10', price: 480, cost: 320 },
  { name: 'UPS Battery Backup', price: 220, cost: 140 },
];

const SERVICE_PRODUCTS = [
  { name: 'Standard Setup Service', price: 150, cost: 60 },
  { name: 'Premium Onboarding', price: 400, cost: 250 },
  { name: 'Network Configuration Service', price: 350, cost: 200 },
  { name: 'Data Migration Service', price: 500, cost: 300 },
  { name: 'On-site Installation', price: 280, cost: 150 },
  { name: 'Security Audit Service', price: 600, cost: 350 },
  { name: 'Custom Training Session', price: 220, cost: 100 },
  { name: 'Hardware Refresh Service', price: 180, cost: 90 },
  { name: 'Server Deployment Service', price: 750, cost: 450 },
  { name: 'Priority Support Package', price: 300, cost: 150 },
];

const SUBSCRIPTION_PRODUCTS = [
  { name: 'Care Plan 1yr', price: 30, cost: 8, cycle: 'monthly' },
  { name: 'Care Plan 2yr', price: 50, cost: 12, cycle: 'monthly' },
  { name: 'Care Plan 3yr', price: 65, cost: 15, cycle: 'monthly' },
  { name: 'Premium Support SLA', price: 120, cost: 40, cycle: 'quarterly' },
  { name: 'Software License - Standard', price: 25, cost: 5, cycle: 'monthly' },
  { name: 'Software License - Enterprise', price: 90, cost: 20, cycle: 'monthly' },
  { name: 'Cloud Backup Subscription', price: 40, cost: 10, cycle: 'monthly' },
  { name: 'Extended Warranty Plan', price: 55, cost: 18, cycle: 'yearly' },
  { name: 'Managed IT Services', price: 500, cost: 300, cycle: 'monthly' },
  { name: 'Helpdesk Subscription', price: 200, cost: 90, cycle: 'monthly' },
];

const WAREHOUSE_NAMES = [
  { name: 'Main Warehouse', shippingWeight: 1 },
  { name: 'East Depot', shippingWeight: 2 },
  { name: 'West Coast Hub', shippingWeight: 2 },
  { name: 'Central Distribution Center', shippingWeight: 3 },
];

const TIER_LIMITS = { bronze: 5, silver: 10, gold: 15 };
const CATEGORY_LIMITS = { hardware: 15, services: 10, subscription: 12 };

const seed = async () => {
  await connectDB();
  console.log('Connected. Clearing existing collections...');

  await Promise.all([
    User.deleteMany({}), Customer.deleteMany({}), Product.deleteMany({}),
    Warehouse.deleteMany({}), StockLevel.deleteMany({}), DiscountTier.deleteMany({}),
    CategoryDiscountCeiling.deleteMany({}), ApprovalChainRule.deleteMany({}),
    SubscriptionPlan.deleteMany({}), UpsellRule.deleteMany({}), Quotation.deleteMany({}),
    FulfillmentOrder.deleteMany({}), Subscription.deleteMany({}), BillingSchedule.deleteMany({}),
    Invoice.deleteMany({}), Payment.deleteMany({}), NegotiationMessage.deleteMany({}),
    DealHealthFlag.deleteMany({}),
  ]);

  // ---------- USERS ----------
  console.log('Seeding users...');
  const userDefs = [
    { name: 'Admin User', email: 'admin@dealflow360.com', role: 'admin' },
    { name: 'Manager Rai', email: 'manager1@dealflow360.com', role: 'sales_manager' },
    { name: 'Manager Osei', email: 'manager2@dealflow360.com', role: 'sales_manager' },
    { name: 'Finance Iyer', email: 'finance1@dealflow360.com', role: 'finance' },
    { name: 'Finance Novak', email: 'finance2@dealflow360.com', role: 'finance' },
    { name: 'Rep Sharma', email: 'rep1@dealflow360.com', role: 'rep', team: 'Team Alpha' },
    { name: 'Rep Delgado', email: 'rep2@dealflow360.com', role: 'rep', team: 'Team Alpha' },
    { name: 'Rep Kowalski', email: 'rep3@dealflow360.com', role: 'rep', team: 'Team Bravo' },
    { name: 'Rep Tanaka', email: 'rep4@dealflow360.com', role: 'rep', team: 'Team Bravo' },
    { name: 'Rep Mensah', email: 'rep5@dealflow360.com', role: 'rep', team: 'Team Alpha' },
  ];
  const passwordHash = await User.hashPassword('Test1234');
  const users = await User.insertMany(userDefs.map((u) => ({ ...u, passwordHash })));
  const admin = users.find((u) => u.role === 'admin');
  const managers = users.filter((u) => u.role === 'sales_manager');
  const financeUsers = users.filter((u) => u.role === 'finance');
  const reps = users.filter((u) => u.role === 'rep');

  // ---------- CUSTOMERS ----------
  console.log('Seeding customers...');
  const tiers = ['bronze', 'silver', 'gold'];
  const customers = await Customer.insertMany(
    COMPANY_NAMES.map((name, i) => ({
      name,
      email: `${name.toLowerCase().replace(/[^a-z0-9]+/g, '.')}@example.com`,
      tier: tiers[i % 3],
      historicalAvgDiscountPercent: randInt(4, 12),
    }))
  );

  // ---------- PRODUCTS ----------
  console.log('Seeding products...');
  const hardware = await Product.insertMany(
    HARDWARE_PRODUCTS.map((p) => ({ ...p, category: 'hardware', taxPercent: 5, quantityOnHand: 0 }))
  );
  const services = await Product.insertMany(
    SERVICE_PRODUCTS.map((p) => ({ ...p, category: 'services', taxPercent: 5, quantityOnHand: 0 }))
  );
  const subscriptionProducts = await Product.insertMany(
    SUBSCRIPTION_PRODUCTS.map((p) => ({
      name: p.name, price: p.price, cost: p.cost, category: 'subscription',
      isSubscription: true, subscriptionCycle: p.cycle, taxPercent: 0, quantityOnHand: 0,
    }))
  );
  const allProducts = [...hardware, ...services, ...subscriptionProducts];

  // ---------- WAREHOUSES ----------
  console.log('Seeding warehouses...');
  const warehouses = await Warehouse.insertMany(WAREHOUSE_NAMES);

  // ---------- STOCK LEVELS (hardware only) ----------
  console.log('Seeding stock levels...');
  const stockDocs = [];
  for (const product of hardware) {
    const chosenWarehouses = randSubset(warehouses, 2);
    for (const wh of chosenWarehouses) {
      stockDocs.push({
        warehouse: wh._id,
        product: product._id,
        qtyOnHand: randInt(5, 60),
        qtyReserved: 0,
      });
    }
  }
  await StockLevel.insertMany(stockDocs);

  // ---------- DISCOUNT CONFIG ----------
  console.log('Seeding discount config...');
  await DiscountTier.insertMany([
    { tier: 'bronze', maxDiscountPercent: TIER_LIMITS.bronze },
    { tier: 'silver', maxDiscountPercent: TIER_LIMITS.silver },
    { tier: 'gold', maxDiscountPercent: TIER_LIMITS.gold },
  ]);
  await CategoryDiscountCeiling.insertMany([
    { category: 'hardware', maxDiscountPercent: CATEGORY_LIMITS.hardware },
    { category: 'services', maxDiscountPercent: CATEGORY_LIMITS.services },
    { category: 'subscription', maxDiscountPercent: CATEGORY_LIMITS.subscription },
  ]);
  await ApprovalChainRule.insertMany([
    { label: 'Minor overage', minOverPercent: 0.1, maxOverPercent: 5, requiredBand: 'sales_manager' },
    { label: 'Major overage', minOverPercent: 5.01, maxOverPercent: null, requiredBand: 'sales_manager_finance' },
  ]);

  // ---------- SUBSCRIPTION PLANS (linked to first 4 subscription products) ----------
  console.log('Seeding subscription plans...');
  const planCycles = ['monthly', 'monthly', 'monthly', 'quarterly'];
  const subscriptionPlans = await SubscriptionPlan.insertMany(
    subscriptionProducts.slice(0, 4).map((p, i) => ({
      name: `${p.name} Plan`,
      cycle: planCycles[i],
      product: p._id,
      prorationRule: 'daily_prorate',
      cancellationRule: 'immediate_partial_refund',
    }))
  );

  // ---------- UPSELL RULES ----------
  console.log('Seeding upsell rules...');
  const upsellDocs = [];
  for (let i = 0; i < 12; i++) {
    const base = randChoice(hardware);
    const suggested = randChoice([...hardware, ...services].filter((p) => p._id.toString() !== base._id.toString()));
    upsellDocs.push({
      baseProduct: base._id,
      suggestedProduct: suggested._id,
      coPurchaseScore: randInt(40, 90),
      promoted: Math.random() < 0.3,
      minMarginThreshold: randInt(0, 15),
    });
  }
  try {
    await UpsellRule.insertMany(upsellDocs, { ordered: false });
  } catch (e) {
    // duplicate base/suggested pairs are skipped silently, fine for seed data
  }

  // ---------- QUOTATIONS (the core, realistic part) ----------
  console.log('Seeding quotations with real risk-engine calculations...');
  const statusPlan = [
    ...Array(10).fill('draft'),
    ...Array(10).fill('pending_approval'),
    ...Array(10).fill('approved'),
    ...Array(7).fill('confirmed'),
    ...Array(3).fill('rejected'),
  ];

  const quotations = [];

  for (let i = 0; i < statusPlan.length; i++) {
    const targetStatus = statusPlan[i];
    const customer = randChoice(customers);
    const rep = randChoice(reps);

    const numLines = randInt(1, 4);
    const chosenProducts = randSubset(allProducts, numLines);

    const lines = chosenProducts.map((product) => {
      const categoryLimit = CATEGORY_LIMITS[product.category];
      const tierLimit = TIER_LIMITS[customer.tier];
      const effectiveLimit = Math.min(categoryLimit, tierLimit);
      // 60% chance discount stays within limit, 40% chance it goes over (for realistic variety)
      const discountPercent = Math.random() < 0.6
        ? randInt(0, Math.max(0, effectiveLimit - 1))
        : randInt(effectiveLimit + 1, effectiveLimit + 12);

      return {
        product: product._id,
        productName: product.name,
        category: product.category,
        qty: randInt(1, product.category === 'hardware' ? 8 : 3),
        unitPrice: product.price,
        unitCost: product.cost,
        discountPercent,
      };
    });

    const quotation = new Quotation({
      customer: customer._id,
      rep: rep._id,
      lines,
      status: 'draft',
      lastActivityAt: daysAgo(randInt(0, 20)),
    });

    const { blendedRiskScore, riskBand, orderTotal } = await evaluateQuotationRisk(quotation, customer);
    quotation.blendedRiskScore = blendedRiskScore;
    quotation.riskBand = riskBand;
    quotation.orderTotal = orderTotal;

    const { approvalSteps, status: naturalStatus } = buildApprovalChain(riskBand);
    quotation.approvalSteps = approvalSteps;

    // Now force the quotation into the target status for this slot, adjusting approval steps to match
    if (targetStatus === 'draft') {
      quotation.status = 'draft';
      quotation.approvalSteps = [];
    } else if (targetStatus === 'pending_approval') {
      quotation.status = 'pending_approval';
      if (quotation.approvalSteps.length === 0) {
        quotation.approvalSteps = [{ role: 'sales_manager', status: 'pending' }];
      }
    } else if (targetStatus === 'approved' || targetStatus === 'confirmed') {
      quotation.approvalSteps = quotation.approvalSteps.map((step) => ({
        ...step,
        status: 'approved',
        actedBy: randChoice(step.role === 'finance' ? financeUsers : managers)._id,
        reason: 'Approved during seed generation',
        actedAt: daysAgo(randInt(1, 15)),
      }));
      quotation.currentApprovalStepIndex = Math.max(0, quotation.approvalSteps.length - 1);
      quotation.status = targetStatus;
    } else if (targetStatus === 'rejected') {
      if (quotation.approvalSteps.length === 0) {
        quotation.approvalSteps = [{ role: 'sales_manager', status: 'pending' }];
      }
      quotation.approvalSteps[0].status = 'rejected';
      quotation.approvalSteps[0].actedBy = randChoice(managers)._id;
      quotation.approvalSteps[0].reason = 'Discount not justified for this account';
      quotation.approvalSteps[0].actedAt = daysAgo(randInt(1, 10));
      quotation.status = 'rejected';
    }

    quotation.createdAt = daysAgo(randInt(5, 25));
    await quotation.save();
    quotations.push(quotation);
  }

  // ---------- FULFILLMENT ORDERS (for approved + confirmed quotations) ----------
  console.log('Seeding fulfillment orders...');
  const fulfillableQuotations = quotations.filter((q) => ['approved', 'confirmed'].includes(q.status));
  const fulfillmentOrders = [];

  for (const quotation of fulfillableQuotations) {
    const neededLines = quotation.lines
      .filter((l) => l.category === 'hardware')
      .map((l) => ({ productId: l.product, productName: l.productName, qty: l.qty }));

    if (neededLines.length === 0) continue;

    const { splits, estimatedShipments, hasBackorder } = await calculateWarehouseSplit(neededLines);
    const order = await FulfillmentOrder.create({
      quotation: quotation._id,
      customer: quotation.customer,
      splits,
      estimatedShipments,
      hasBackorder,
      status: randChoice(['suggested', 'accepted', 'accepted', 'manual_override']),
    });
    fulfillmentOrders.push(order);
  }

  // ---------- BILLING (invoices + subscriptions for confirmed quotations) ----------
  console.log('Seeding billing, invoices, and subscriptions...');
  const confirmedQuotations = quotations.filter((q) => q.status === 'confirmed');
  const createdInvoices = [];

  for (const quotation of confirmedQuotations) {
    const { invoice } = await activateBillingForQuotation(quotation);
    if (invoice) createdInvoices.push(invoice);
  }

  // ---------- PAYMENTS (partial and full, on some invoices) ----------
  console.log('Seeding payments...');
  for (const invoice of createdInvoices) {
    if (Math.random() < 0.7) {
      const payer = randChoice(financeUsers);
      const isFullPayment = Math.random() < 0.6;
      const amount = isFullPayment ? invoice.amount : Number((invoice.amount * 0.4).toFixed(2));

      await Payment.create({
        invoice: invoice._id,
        amount,
        method: randChoice(['card', 'bank_transfer', 'cash']),
        paidAt: daysAgo(randInt(1, 10)),
        recordedBy: payer._id,
      });

      if (isFullPayment) {
        invoice.status = 'paid';
        invoice.stage = 'paid';
        await invoice.save();
      } else {
        invoice.stage = 'invoiced';
        await invoice.save();
      }
    }
  }

  // ---------- NEGOTIATION MESSAGES (on a few pending/approved quotations) ----------
  console.log('Seeding negotiation messages...');
  const negotiationCandidates = randSubset(
    quotations.filter((q) => ['pending_approval', 'approved'].includes(q.status)),
    6
  );
  for (const quotation of negotiationCandidates) {
    await NegotiationMessage.create({
      quotation: quotation._id,
      author: 'customer',
      comment: randChoice([
        'Can we get a better rate on the hardware line?',
        'Is there flexibility on the service fee?',
        'We would like to discuss the delivery timeline.',
        'Requesting a small additional discount given order size.',
      ]),
      counterDiscountPercent: randInt(10, 25),
      status: 'open',
    });
  }

  // ---------- DEAL HEALTH FLAGS (a realistic sample) ----------
  console.log('Seeding deal health flags...');
  const staleCandidates = randSubset(quotations.filter((q) => q.status !== 'confirmed' && q.status !== 'rejected'), 6);
  for (const quotation of staleCandidates) {
    const daysStalled = randInt(8, 20);
    await DealHealthFlag.create({
      quotation: quotation._id,
      type: randChoice(['stalled', 'discount_anomaly', 'delivery_slippage']),
      detail: `Auto-flagged during seed generation (${daysStalled} days involved)`,
      severity: daysStalled > 14 ? 'high' : 'medium',
      status: 'open',
      daysInvolved: daysStalled,
    });
  }

  // ---------- SUMMARY ----------
  console.log('\n--- SEED COMPLETE ---');
  const counts = await Promise.all([
    User.countDocuments(), Customer.countDocuments(), Product.countDocuments(),
    Warehouse.countDocuments(), StockLevel.countDocuments(), DiscountTier.countDocuments(),
    CategoryDiscountCeiling.countDocuments(), ApprovalChainRule.countDocuments(),
    SubscriptionPlan.countDocuments(), UpsellRule.countDocuments(), Quotation.countDocuments(),
    FulfillmentOrder.countDocuments(), Subscription.countDocuments(), Invoice.countDocuments(),
    Payment.countDocuments(), NegotiationMessage.countDocuments(), DealHealthFlag.countDocuments(),
  ]);
  const labels = [
    'Users', 'Customers', 'Products', 'Warehouses', 'StockLevels', 'DiscountTiers',
    'CategoryDiscountCeilings', 'ApprovalChainRules', 'SubscriptionPlans', 'UpsellRules',
    'Quotations', 'FulfillmentOrders', 'Subscriptions', 'Invoices', 'Payments',
    'NegotiationMessages', 'DealHealthFlags',
  ];
  let total = 0;
  labels.forEach((label, i) => {
    console.log(`${label}: ${counts[i]}`);
    total += counts[i];
  });
  console.log(`\nTOTAL DOCUMENTS: ${total}`);
  console.log('\nLogin with any of these (password for all: Test1234):');
  console.log('  admin@dealflow360.com (admin)');
  console.log('  manager1@dealflow360.com (sales_manager)');
  console.log('  finance1@dealflow360.com (finance)');
  console.log('  rep1@dealflow360.com (rep)');

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});