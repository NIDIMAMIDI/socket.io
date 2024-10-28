// import { boolean } from 'joi';
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true // Ensure that every message has a sender
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true // Ensure that every message has a receiver
  },
  message: {
    type: String,
    required: true, // Ensure that every message has content
    trim: true // Trim leading/trailing whitespace from the message
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now // Automatically set the timestamp when the message is created
  }
});

export const Message = mongoose.model('Message', messageSchema);
