import mongoose from 'mongoose';

const stockLevelSchema = new mongoose.Schema(
  {
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    qtyOnHand: { type: Number, default: 0 },
    qtyReserved: { type: Number, default: 0 },
  },
  { timestamps: true }
);

stockLevelSchema.index({ warehouse: 1, product: 1 }, { unique: true });

stockLevelSchema.virtual('qtyAvailable').get(function () {
  return this.qtyOnHand - this.qtyReserved;
});

stockLevelSchema.set('toJSON', { virtuals: true });
stockLevelSchema.set('toObject', { virtuals: true });

const StockLevel = mongoose.model('StockLevel', stockLevelSchema);
export default StockLevel;