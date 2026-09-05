import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema(
  {
    quotation: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    cycle: { type: String, enum: ['monthly', 'quarterly', 'yearly'], required: true },

    qty: { type: Number, required: true, default: 1 },
    unitPrice: { type: Number, required: true }, // post-discount price per unit, snapshotted

    status: { type: String, enum: ['active', 'paused', 'cancelled'], default: 'active' },

    cycleStartDate: { type: Date, required: true }, // start of the CURRENT billing cycle
    nextBillDate: { type: Date, required: true },
  },
  { timestamps: true }
);

subscriptionSchema.methods.currentCycleAmount = function () {
  return this.qty * this.unitPrice;
};

const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;