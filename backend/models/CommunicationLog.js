const mongoose = require('mongoose');

const CommunicationLogSchema = new mongoose.Schema({
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  customerId: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['pending', 'sent', 'delivered', 'failed'], default: 'pending' },
  statusDetails: { type: String },
  sentAt: { type: Date },
  deliveredAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CommunicationLog', CommunicationLogSchema);