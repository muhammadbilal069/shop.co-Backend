const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// JSON file se data read karne ka helper function
const getProductsData = () => {
  const filePath = path.join(__dirname, '../data/products.json');
  const jsonData = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(jsonData);
};

// 1. Get All Products (for Shop Page & Filters)
router.get('/', (req, res) => {
  try {
    const products = getProductsData();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error reading products data' });
  }
});

// 2. Get New Arrivals Only
router.get('/new-arrivals', (req, res) => {
  try {
    const products = getProductsData();
    const newArrivals = products.filter((item) => item.isNewArrival);
    res.json(newArrivals);
  } catch (error) {
    res.status(500).json({ message: 'Error reading new arrivals' });
  }
});

// 3. Get Top Selling Products Only
router.get('/top-selling', (req, res) => {
  try {
    const products = getProductsData();
    const topSelling = products.filter((item) => item.isTopSelling);

    if (topSelling.length === 0) {
      return res.json(products.slice(0, 4));
    }

    res.json(topSelling);
  } catch (error) {
    res.status(500).json({ message: 'Error reading top selling products' });
  }
});

// 4. Get Single Product by ID (FIXED: Number aur String dono support karta hai)
router.get('/:id', (req, res) => {
  try {
    const products = getProductsData();
    const paramId = String(req.params.id);

    const product = products.find(
      (p) => String(p.id) === paramId || String(p._id) === paramId
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error reading product details' });
  }
});

// 5. Get Reviews for a Specific Product (FIXED)
router.get('/:id/reviews', (req, res) => {
  try {
    const products = getProductsData();
    const paramId = String(req.params.id);

    const product = products.find(
      (p) => String(p.id) === paramId || String(p._id) === paramId
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product.reviews || []);
  } catch (error) {
    res.status(500).json({ message: 'Error reading reviews' });
  }
});

module.exports = router;