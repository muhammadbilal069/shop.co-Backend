const router = require('express').Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    // Password check (agar bcrypt use nahi kiya toh direct comparison)
    const isMatch = password === user.password;
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    // Check if user is Admin
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