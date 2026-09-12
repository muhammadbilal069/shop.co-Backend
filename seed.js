const mongoose = require('mongoose');
const Product = require('./models/Product');
const productsData = require('./data/products.json');
require('dotenv').config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database connected for seeding...");

    await Product.deleteMany();
    console.log("Old products cleared.");

    // JSON objects mein jo 'id' aur '_id' hain, unhe map karke insert karna
    const formattedProducts = productsData.map(product => ({
      ...product,
      _id: product._id || product.id // ensure _id exists
    }));

    await Product.insertMany(formattedProducts);
    console.log("Products successfully imported to MongoDB!");

    mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedDatabase();