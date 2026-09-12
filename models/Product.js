const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: { type: String },
  name: { type: String, required: true },
  image: { type: String },
  gallery: [String],
  rating: { type: Number },
  price: { type: Number, required: true },
  oldPrice: { type: Number },
  discount: { type: String },
  category: { type: String },
  sizes: [String],
  colors: [String],
  isNewArrival: { type: Boolean, default: false },
  isTopSelling: { type: Boolean, default: false }
});

module.exports = mongoose.model('Product', productSchema);