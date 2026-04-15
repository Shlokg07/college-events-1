const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');
const auth = require('../middleware/auth');

// Sign up
router.post('/signup', async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword, phone, role } = req.body;

    // Validation
    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create new user
    const newUser = new User({
      fullName,
      email,
      password,
      phone: phone || '',
      role: role || 'student'
    });

    await newUser.save();

    // Generate token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email, role: newUser.role },
      config.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        additionalDetails: newUser.additionalDetails
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      config.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        additionalDetails: user.additionalDetails
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put('/update-profile', auth, async (req, res) => {
  try {
    const { phone, additionalDetails } = req.body;

    // Find user by ID from token
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Only allow phone and additionalDetails to be updated
    // fullName and email are locked and cannot be changed
    if (phone) user.phone = phone;
    
    // Update additional details if provided
    if (additionalDetails) {
      user.additionalDetails = {
        bio: additionalDetails.bio || user.additionalDetails?.bio || '',
        department: additionalDetails.department || user.additionalDetails?.department || '',
        year: additionalDetails.year || user.additionalDetails?.year || ''
      };
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        additionalDetails: user.additionalDetails
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Update any user's profile (admin only)
router.put('/admin/update-user/:userId', auth, async (req, res) => {
  try {
    // Check if user is admin
    const adminUser = await User.findById(req.user.userId);
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can update user information' });
    }

    const { userId } = req.params;
    const { fullName, email, phone, role, additionalDetails } = req.body;

    // Find the user to update
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Admin can update all fields
    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (role && ['student', 'organizer', 'admin'].includes(role)) {
      user.role = role;
    }
    
    // Update additional details if provided
    if (additionalDetails) {
      user.additionalDetails = {
        bio: additionalDetails.bio || user.additionalDetails?.bio || '',
        department: additionalDetails.department || user.additionalDetails?.department || '',
        year: additionalDetails.year || user.additionalDetails?.year || ''
      };
    }

    await user.save();

    res.json({
      message: 'User updated successfully by admin',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        additionalDetails: user.additionalDetails
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Forgot Password: Send reset code
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists or not (security best practice)
      return res.json({ message: 'If email exists, reset code will be sent' });
    }

    // Generate 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set reset code expiry to 15 minutes from now
    const resetCodeExpiry = new Date(Date.now() + 15 * 60 * 1000);

    // Update user with reset code
    user.resetCode = resetCode;
    user.resetCodeExpiry = resetCodeExpiry;
    await user.save();

    // In a real application, you would send an email here
    // For now, we'll log it to console (development only)
    console.log(`📧 Password reset code for ${email}: ${resetCode}`);
    
    res.json({ 
      message: 'Reset code sent to email',
      // Development only - remove in production
      devNote: `Reset code: ${resetCode} (expires in 15 minutes)`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify Reset Code
router.post('/verify-reset-code', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required' });
    }

    // Find user and check reset code
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if reset code exists and hasn't expired
    if (!user.resetCode || !user.resetCodeExpiry) {
      return res.status(400).json({ error: 'No reset code found. Please request a new one.' });
    }

    if (new Date() > user.resetCodeExpiry) {
      return res.status(400).json({ error: 'Reset code has expired. Please request a new one.' });
    }

    // Check if code matches
    if (user.resetCode !== code) {
      return res.status(401).json({ error: 'Invalid reset code' });
    }

    res.json({ message: 'Code verified successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email and new password are required' });
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    if (!/[A-Z]/.test(newPassword)) {
      return res.status(400).json({ error: 'Password must contain an uppercase letter' });
    }

    if (!/[0-9]/.test(newPassword)) {
      return res.status(400).json({ error: 'Password must contain a number' });
    }

    if (!/[!@#$%^&*]/.test(newPassword)) {
      return res.status(400).json({ error: 'Password must contain a special character (!@#$%^&*)' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if reset code exists and hasn't expired
    if (!user.resetCode || !user.resetCodeExpiry) {
      return res.status(400).json({ error: 'No valid reset session. Please start over.' });
    }

    if (new Date() > user.resetCodeExpiry) {
      return res.status(400).json({ error: 'Reset code has expired. Please request a new one.' });
    }

    // Reset the password
    user.password = newPassword;
    user.resetCode = null;
    user.resetCodeExpiry = null;
    await user.save();

    res.json({ 
      message: 'Password reset successfully. You can now login with your new password.'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logout (frontend should clear token from localStorage)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
