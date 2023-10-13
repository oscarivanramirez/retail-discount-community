import mongoose from "mongoose";
import User from "../models/User.js";

const orderSchema = new mongoose.Schema({
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    codeDetails: { type: String, required: true }, // This can be expanded to another schema if more details are needed
    price: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Completed', 'Cancelled'], default: 'Pending' },
    timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Order', orderSchema);
