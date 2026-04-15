const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const User = require('../models/User');

/**
 * ========================
 * EVENT SEARCH & FILTERING
 * ========================
 */

// Advanced event search with multiple filters
// GET /api/search/events?query=tech&category=Tech&date=2024-01-01&location=campus
router.get('/events', async (req, res) => {
  try {
    const { 
      query, 
      category, 
      location, 
      date, 
      dateFrom, 
      dateTo,
      status,
      sortBy = 'date',
      order = 'asc',
      page = 1,
      limit = 10
    } = req.query;

    let filter = {};

    // Text search
    if (query) {
      filter.$text = { $search: query };
    }

    // Category filter
    if (category && category !== 'all') {
      filter.category = category;
    }

    // Location filter
    if (location) {
      filter.location = new RegExp(location, 'i'); // Case-insensitive
    }

    // Date range filter
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) {
        filter.date.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        filter.date.$lte = new Date(dateTo);
      }
    } else if (date) {
      // Single date filter (find events on that date)
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      filter.date = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    }

    // Status filter
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = order === 'desc' ? -1 : 1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const events = await Event.find(filter)
      .populate('organizer', 'fullName email')
      .populate('registeredParticipants', 'fullName')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
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

// Get events filtered by category
router.get('/events/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const events = await Event.find({ category })
      .populate('organizer', 'fullName email')
      .sort({ date: 1 });
    
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get upcoming events within date range
router.get('/events/upcoming', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + parseInt(days));
    futureDate.setHours(23, 59, 59, 999);

    const events = await Event.find({
      date: {
        $gte: today,
        $lte: futureDate
      },
      status: { $ne: 'cancelled' }
    })
      .populate('organizer', 'fullName email')
      .sort({ date: 1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get events by location
router.get('/events/location/:location', async (req, res) => {
  try {
    const { location } = req.params;
    const events = await Event.find({
      location: new RegExp(location, 'i')
    })
      .populate('organizer', 'fullName email')
      .sort({ date: 1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get events organized by a specific user
router.get('/organizer/:organizerId', async (req, res) => {
  try {
    const { organizerId } = req.params;
    const events = await Event.find({ organizer: organizerId })
      .populate('organizer', 'fullName email')
      .sort({ date: -1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * ========================
 * USER SEARCH
 * ========================
 */

// Search users by name (admin only)
router.get('/users', async (req, res) => {
  try {
    const { query, role, department } = req.query;

    let filter = {};

    // Text search on fullName
    if (query) {
      filter.$text = { $search: query };
    }

    // Filter by role
    if (role && role !== 'all') {
      filter.role = role;
    }

    // Filter by department
    if (department) {
      filter['additionalDetails.department'] = new RegExp(department, 'i');
    }

    const users = await User.find(filter)
      .select('-password'); // Exclude passwords

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
