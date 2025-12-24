import mongoose from "mongoose";

const PurchaseSchema = new mongoose.Schema({
  studentId: { type: String, required: true }, // or rollNo
  items: [{
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  paymentTime: { type: Date, default: Date.now },
  month: { type: String, required: true }, // e.g., "2025-12"
});

export default mongoose.model("Purchase", PurchaseSchema);