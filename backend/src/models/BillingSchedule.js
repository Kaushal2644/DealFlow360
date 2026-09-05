import mongoose from 'mongoose';

const billingScheduleSchema = new mongoose.Schema(
  {
    subscription: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription', required: true },
    cycleStartDate: { type: Date, required: true },
    cycleEndDate: { type: Date, required: true },
    amount: { type: Number, required: true },
    prorationNote: { type: String, default: '' }, // e.g. "Prorated for qty change on day 12"
    status: { type: String, enum: ['pending', 'invoiced'], default: 'pending' },
  },
  { timestamps: true }
);

const BillingSchedule = mongoose.model('BillingSchedule', billingScheduleSchema);
export default BillingSchedule