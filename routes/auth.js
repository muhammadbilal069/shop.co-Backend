// const router = require('express').Router();
// const User = require('../models/User');
// const jwt = require('jsonwebtoken');

// // Register Route (Admin ya user create karne ke liye)
// router.post('/register', async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;

//     // Check if user already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: "User already exists with this email" });
//     }

//     // Create new user (role default 'user' ya jo request mein aaye)
//     const newUser = new User({
//       name,
//       email,
//       password, // Note: Production mein bcrypt se hash karna behtar hota hai
//       role: role || 'user'
//     });

//     await newUser.save();
//     res.status(201).json({ message: "User registered successfully!", user: { id: newUser._id, email: newUser._email, role: newUser.role } });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Login Route
// router.post('/login', async (PostReq, res) => {
//   try {
//     const { email, password } = PostReq.body;

//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: "Invalid email or password" });

//     // Password comparison
//     const isMatch = password === user.password;
//     if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

//     // Check if user is Admin (agar aapne sirf admin ke liye restrict kiya hai)
//     if (user.role !== 'admin') {
//       return res.status(403).json({ message: "Access Denied! Only admins can log in here." });
//     }

//     // Generate Token
//     const token = jwt.sign(
//       { id: user._id, role: user.role }, 
//       process.env.JWT_SECRET || 'secret_key', 
//       { expiresIn: '1d' }
//     );

//     res.json({
//       message: "Login successful",
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role
//       }
//     });

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router;

const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Customer Register Route (Customer Facing Website)
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: 'customer' // Strictly customer for website users
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Server error during signup", error: err.message });
  }
});

// Customer Login Route (Customer Facing Website)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    // Optional: Agar aap chahte hain ke aam login se admin website par na jaye
    if (user.role === 'admin') {
      return res.status(403).json({ message: "Admins must use the Admin Panel login page." });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '1d' });
    
    res.json({
      message: "Logged in successfully",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error during login", error: error.message });
  }
});

// Admin Dedicated Login Route (Admin Panel)
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    // Security check: Only allow users with admin role
    if (user.role !== 'admin') {
      return res.status(403).json({ message: "Access Denied! Only admins can log in here." });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '1d' });

    res.json({
      message: "Admin login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error during admin login", error: error.message });
  }
});

// Temporary Route to Create Admin
router.post('/create-admin-once', async (req, res) => {
  try {
    const existingAdmin = await User.findOne({ email: "admin@shop.co" });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("adminpassword123", salt); // Yahan apna marzi ka password rakh sakte hain

   const adminUser = new User({
      name: "shop.co",
      email: "admin@shop.co",
      password: "shop.co7676",
      role: "admin"
    });
    await adminUser.save();
    res.status(201).json({ message: "Admin created successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;