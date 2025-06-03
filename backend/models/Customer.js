const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  customerId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  totalSpend: { type: Number, default: 0 },
  visitCount: { type: Number, default: 0 },
  lastPurchaseDate: { type: Date },
  customTags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Customer', CustomerSchema);