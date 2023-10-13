import mongoose from "mongoose";
import User from "../models/User.js";

const messageSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    status: { type: String, enum: ['Sent', 'Delivered', 'Read'], default: 'Sent' }
});

const Message = mongoose.model('Message', messageSchema);
export default Message;
