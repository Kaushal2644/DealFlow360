import mongoose from 'mongoose';

const warehouseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    location: { type: String, default: '' },
    shippingWeight: { type: Number, default: 1 }, // used by split engine — lower = preferred/cheaper
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Warehouse = mongoose.model('Warehouse', warehouseSchema);
export default Warehouse;