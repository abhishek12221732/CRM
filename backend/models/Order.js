const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  customerId: { type: String, required: true },
  amount: { type: Number, required: true },
  items: [{
    productId: String,
    name: String,
    quantity: Number,
    price: Number
  }],
  status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
  orderDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);