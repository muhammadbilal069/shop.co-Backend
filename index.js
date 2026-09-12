const dotenv = require('dotenv');
dotenv.config(); // Yeh hamesha sabse upar hona chahiye

const express = require('express');
const cors = require('cors');
const path = require('path');
const auth = require("./routes/auth");
const productRoutes = require('./routes/productRoutes');
const users = require('./routes/users');
const orders = require('./routes/orders');
const mongoConnect = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Server start hotay hi foran terminal par connection dikhane ke liye
mongoConnect().catch(err => console.log("Initial DB Connection Error:", err));

// Serverless Database Middleware (Ensures connection on every request for Vercel)
app.use(async (req, res, next) => {
  try {
    await mongoConnect();
    next();
  } catch (error) {
    console.error("Database connection error in middleware:", error);
    res.status(500).json({ message: "Database connection failed", error: error.message });
  }
});

// Static Folders
app.use('/images', express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/products', productRoutes);
app.use('/auth', auth);
app.use('/api/users', users);
app.use('/api/orders', orders);

// Test Route
app.get('/', (req, res) => {
  res.send('Server running!');
});

// Local development ke liye listen (Vercel serverless isay ignore karta hai)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

module.exports = app;