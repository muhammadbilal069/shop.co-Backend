const mongoose = require('mongoose');
const Product = require('./models/Product');
const productsData = require('./data/products.json');
require('dotenv').config();

const seedDatabase = async () => {
  try {
    // Database connection
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database connected for seeding...");

    // Purana data saaf karna
    await Product.deleteMany();
    console.log("Old products cleared.");

    // Manual string _id hata kar MongoDB ko auto ObjectId banane dena 
    // taaki CastError na aaye aur frontend par product._id / product.id dono chal sakein
    const formattedProducts = productsData.map(({ _id, id, ...rest }) => ({
      ...rest,
      isNewArrival: Boolean(rest.isNewArrival),
      isTopSelling: Boolean(rest.isTopSelling)
    }));

    await Product.insertMany(formattedProducts);
    console.log("Products successfully imported to MongoDB!");

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedDatabase();