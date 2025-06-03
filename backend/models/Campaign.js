const mongoose = require('mongoose');

const CampaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  segmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'AudienceSegment', required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['draft', 'scheduled', 'running', 'completed', 'failed'], default: 'draft' },
  scheduledAt: { type: Date },
  startedAt: { type: Date },
  completedAt: { type: Date },
  totalRecipients: { type: Number, default: 0 },
  sentCount: { type: Number, default: 0 },
  failedCount: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Campaign', CampaignSchema);