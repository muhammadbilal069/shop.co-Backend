const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// 1. Create New Order (Customer Checkout)
router.post('/', async (req, res) => {
  try {
    const { customerName, email, phone, address, orderItems, totalAmount } = req.body;

    const newOrder = new Order({
      customerName,
      email,
      phone,
      address,
      orderItems,
      totalAmount
    });

    const savedOrder = await newOrder.save();
    res.status(201).json({ message: 'Order placed successfully!', order: savedOrder });
  } catch (error) {
    console.error("Error saving order:", error);
    res.status(500).json({ message: 'Failed to place order', error: error.message });
  }
});

// 2. Get All Orders (For Admin Panel)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// 3. Update Order Status (For Admin Panel)
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: 'Failed to update order status' });
  }
});

module.exports = router;