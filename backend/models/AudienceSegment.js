const mongoose = require('mongoose');

const RuleSchema = new mongoose.Schema({
  field: { type: String, required: true },
  operator: { type: String, required: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true }
});

const RuleGroupSchema = new mongoose.Schema({
  combinator: { type: String, enum: ['AND', 'OR'], required: true },
  rules: [RuleSchema]
});

const AudienceSegmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  ruleGroups: [RuleGroupSchema],
  estimatedSize: { type: Number },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AudienceSegment', AudienceSegmentSchema);