const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const multer = require('multer');

// Multer Setup using Memory Storage (Best for Vercel Serverless)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Helper function to convert buffer to base64 data URI
const formatImageAsDataUri = (file) => {
  if (!file) return '';
  const b64 = Buffer.from(file.buffer).toString('base64');
  return `data:${file.mimetype};base64,${b64}`;
};

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
    
    // Convert image buffer to Base64 string so it works on Vercel without local folders
    const imagePath = req.file ? formatImageAsDataUri(req.file) : '';

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
      updateData.image = formatImageAsDataUri(req.file);
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