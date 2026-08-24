const express = require('express');
const cors = require('cors');
const path = require('path');

const productRoutes = require('./routes/productRoutes');

const app = express();
const PORT = 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Public folder se static images serve karne ke liye
app.use('/images', express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/products', productRoutes);

// Test Route
app.get('/', (req, res) => {
  res.send('Server running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});