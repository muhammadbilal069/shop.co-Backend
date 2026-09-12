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
mongoConnect();

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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});