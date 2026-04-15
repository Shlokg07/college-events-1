const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Event = require('../models/Event');
const auth = require('../middleware/auth');

/**
 * ========================
 * USER PROFILE ENDPOINTS
 * ========================
 */

// Get current user profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate('eventsRegistered')
      .populate('eventsOrganized');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user profile by ID (public)
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password -resetCode -resetCodeExpiry')
      .populate('eventsOrganized', 'title date location category')
      .exec();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put('/me/update', auth, async (req, res) => {
  try {
    const { fullName, phone, additionalDetails } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        ...(fullName && { fullName }),
        ...(phone && { phone }),
        ...(additionalDetails && { additionalDetails })
      },
      { new: true }
    );

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's dashboard stats
router.get('/me/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate('eventsRegistered')
      .populate('eventsOrganized');

    const registeredCount = user.eventsRegistered.length;
    const organizedCount = user.eventsOrganized.length;

    // Get upcoming registered events
    const today = new Date();
    const upcomingRegistered = user.eventsRegistered.filter(
      event => new Date(event.date) >= today
    );

    // Get upcoming organized events
    const upcomingOrganized = user.eventsOrganized.filter(
      event => new Date(event.date) >= today
    );

    res.json({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        department: user.additionalDetails?.department
      },
      stats: {
        totalRegistered: registeredCount,
        totalOrganized: organizedCount,
        upcomingRegistered: upcomingRegistered.length,
        upcomingOrganized: upcomingOrganized.length
      },
      upcomingRegistered,
      upcomingOrganized
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's registered events
router.get('/me/registered-events', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate({
        path: 'eventsRegistered',
        populate: { path: 'organizer', select: 'fullName email' }
      });

    res.json(user.eventsRegistered);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's organized events
router.get('/me/organized-events', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate({
        path: 'eventsOrganized',
        populate: { path: 'registeredParticipants', select: 'fullName email' }
      });

    res.json(user.eventsOrganized);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
