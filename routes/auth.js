const router = require('express').Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Register Route (Admin ya user create karne ke liye)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Create new user (role default 'user' ya jo request mein aaye)
    const newUser = new User({
      name,
      email,
      password, // Note: Production mein bcrypt se hash karna behtar hota hai
      role: role || 'user'
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully!", user: { id: newUser._id, email: newUser._email, role: newUser.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login Route
router.post('/login', async (PostReq, res) => {
  try {
    const { email, password } = PostReq.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    // Password comparison
    const isMatch = password === user.password;
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    // Check if user is Admin (agar aapne sirf admin ke liye restrict kiya hai)
    if (user.role !== 'admin') {
      return res.status(403).json({ message: "Access Denied! Only admins can log in here." });
    }

    // Generate Token
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET || 'secret_key', 
      { expiresIn: '1d' }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;