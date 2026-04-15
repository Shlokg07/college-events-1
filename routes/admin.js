const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Event = require('../models/Event');
const auth = require('../middleware/auth');

/**
 * ========================
 * ADMIN MIDDLEWARE
 * ========================
 */

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

/**
 * ========================
 * ADMIN DASHBOARD STATS
 * ========================
 */

// Get platform statistics
router.get('/stats', auth, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalEvents = await Event.countDocuments();
    const totalRegistrations = await Event.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$registeredCount' }
        }
      }
    ]);

    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    const eventsByCategory = await Event.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const eventsByStatus = await Event.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      totals: {
        users: totalUsers,
        events: totalEvents,
        registrations: totalRegistrations[0]?.total || 0
      },
      usersByRole,
      eventsByCategory,
      eventsByStatus
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * ========================
 * USER MANAGEMENT
 * ========================
 */

// Get all users
router.get('/users', auth, adminOnly, async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;

    let filter = {};
    
    if (role && role !== 'all') {
      filter.role = role;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(filter)
      .select('-password -resetCode -resetCodeExpiry')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user details
router.get('/users/:userId', auth, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password -resetCode -resetCodeExpiry')
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

// Update user role
router.put('/users/:userId/role', auth, adminOnly, async (req, res) => {
  try {
    const { role } = req.body;

    if (!['student', 'organizer', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role },
      { new: true }
    ).select('-password');

    res.json({
      message: 'User role updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user
router.delete('/users/:userId', auth, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove user from all events
    await Event.updateMany(
      { registeredParticipants: req.params.userId },
      { $pull: { registeredParticipants: req.params.userId } }
    );

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * ========================
 * EVENT MANAGEMENT
 * ========================
 */

// Get all events (admin view)
router.get('/events', auth, adminOnly, async (req, res) => {
  try {
    const { status, category, search, page = 1, limit = 20 } = req.query;

    let filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const events = await Event.find(filter)
      .populate('organizer', 'fullName email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Event.countDocuments(filter);

    res.json({
      events,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update event status
router.put('/events/:eventId/status', auth, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['upcoming', 'ongoing', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const event = await Event.findByIdAndUpdate(
      req.params.eventId,
      { status },
      { new: true }
    ).populate('organizer', 'fullName email');

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({
      message: 'Event status updated successfully',
      event
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete event (admin)
router.delete('/events/:eventId', auth, adminOnly, async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.eventId);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Remove event from all users
    await User.updateMany(
      { eventsRegistered: req.params.eventId },
      { $pull: { eventsRegistered: req.params.eventId } }
    );

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * ========================
 * SYSTEM HEALTH
 * ========================
 */

// Get database health check
router.get('/health', auth, adminOnly, async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const eventCount = await Event.countDocuments();

    res.json({
      status: 'healthy',
      database: 'connected',
      collections: {
        users: userCount,
        events: eventCount
      }
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      error: error.message 
    });
  }
});

module.exports = router;
