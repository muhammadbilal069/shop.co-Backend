const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');

// Multer Setup for Image Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Ensure 'uploads' folder exists in your backend root
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// 1. Get All Products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products data from database' });
  }
});

// 2. Get New Arrivals Only
router.get('/new-arrivals', async (req, res) => {
  try {
    const newArrivals = await Product.find({ isNewArrival: true });
    res.json(newArrivals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching new arrivals' });
  }
});

// 3. Get Top Selling Products Only
router.get('/top-selling', async (req, res) => {
  try {
    let topSelling = await Product.find({ isTopSelling: true });
    if (topSelling.length === 0) {
      topSelling = await Product.find().limit(4);
    }
    res.json(topSelling);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching top selling products' });
  }
});

// 4. ADD NEW PRODUCT (POST Route)
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, price, oldPrice, category, description, isNewArrival, isTopSelling } = req.body;
    const imagePath = req.file ? `uploads/${req.file.filename}` : '';

    const newProduct = new Product({
      name,
      price: Number(price),
      oldPrice: oldPrice ? Number(oldPrice) : undefined,
      category,
      description,
      image: imagePath,
      isNewArrival: isNewArrival === 'true' || isNewArrival === true,
      isTopSelling: isTopSelling === 'true' || isTopSelling === true
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ message: 'Error adding product', error: error.message });
  }
});

// 5. UPDATE PRODUCT (PUT Route)
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const paramId = req.params.id;
    const { name, price, oldPrice, category, description, isNewArrival, isTopSelling } = req.body;

    const updateData = {
      name,
      price: Number(price),
      oldPrice: oldPrice ? Number(oldPrice) : undefined,
      category,
      description,
      isNewArrival: isNewArrival === 'true' || isNewArrival === true,
      isTopSelling: isTopSelling === 'true' || isTopSelling === true
    };

    if (req.file) {
      updateData.image = `uploads/${req.file.filename}`;
    }

    const updatedProduct = await Product.findOneAndUpdate(
      { $or: [{ _id: paramId }, { id: paramId }] },
      updateData,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found for update' });
    }

    res.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
});

// 6. DELETE PRODUCT (DELETE Route)
router.delete('/:id', async (req, res) => {
  try {
    const paramId = req.params.id;
    const deletedProduct = await Product.findOneAndDelete({
      $or: [{ _id: paramId }, { id: paramId }]
    });

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found for deletion' });
    }

    res.json({ message: 'Product deleted successfully', id: paramId });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: 'Error deleting product' });
  }
});

// 7. Get Single Product by ID
router.get('/:id', async (req, res) => {
  try {
    const paramId = req.params.id;
    const product = await Product.findOne({
      $or: [{ _id: paramId }, { id: paramId }]
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product details' });
  }
});

// 8. Get Reviews for a Specific Product
router.get('/:id/reviews', async (req, res) => {
  try {
    const paramId = req.params.id;
    const product = await Product.findOne({
      $or: [{ _id: paramId }, { id: paramId }]
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product.reviews || []);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

module.exports = router;