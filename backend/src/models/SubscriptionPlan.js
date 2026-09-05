import mongoose from 'mongoose';

const subscriptionPlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    cycle: { type: String, enum: ['monthly', 'quarterly', 'yearly'], required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
    prorationRule: {
      type: String,
      enum: ['daily_prorate', 'full_cycle_charge', 'no_prorate'],
      default: 'daily_prorate',
    },
    cancellationRule: {
      type: String,
      enum: ['immediate_no_refund', 'immediate_partial_refund', 'end_of_cycle'],
      default: 'immediate_partial_refund',
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const SubscriptionPlan = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
export default SubscriptionPlan;