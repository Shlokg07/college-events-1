const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const auth = require('../middleware/auth');

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find()
      .populate('organizer', 'fullName email')
      .sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'fullName email')
      .populate('registeredParticipants', 'fullName email');
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create event (authenticated)
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, category, date, endDate, eventType, startTime, endTime, location, capacity, image } = req.body;

    console.log('📝 Event creation request received:', { title, date, endDate, eventType, startTime, endTime, location, capacity });

    // Validate all required fields
    if (!title || !description || !date || !location || !capacity) {
      console.warn('❌ Validation failed - missing fields');
      return res.status(400).json({ error: 'Please provide all required fields: title, description, date, location, capacity' });
    }

    // Parse and validate start date
    let eventDate;
    try {
      eventDate = new Date(date);
      if (isNaN(eventDate.getTime())) {
        throw new Error('Invalid date format');
      }
    } catch (dateError) {
      console.warn('❌ Date parsing failed:', date, dateError.message);
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    // Parse and validate end date if provided (for multi-day events)
    let parsedEndDate = null;
    if (endDate && eventType === 'multi-day') {
      try {
        parsedEndDate = new Date(endDate);
        if (isNaN(parsedEndDate.getTime())) {
          throw new Error('Invalid end date format');
        }
        // Validate that end date is after start date
        if (parsedEndDate <= eventDate) {
          return res.status(400).json({ error: 'End date must be after start date' });
        }
      } catch (dateError) {
        console.warn('❌ End date parsing failed:', endDate, dateError.message);
        return res.status(400).json({ error: 'Invalid end date format. Use YYYY-MM-DD' });
      }
    }

    const newEvent = new Event({
      title,
      description,
      category: category || 'Other',
      date: eventDate,
      endDate: parsedEndDate,
      eventType: eventType || 'single-day',
      startTime: startTime || '09:00',
      endTime: endTime || '17:00',
      location,
      capacity: parseInt(capacity),
      image: image || '',
      organizer: req.user.userId
    });

    console.log('💾 Saving event to MongoDB:', newEvent);
    const savedEvent = await newEvent.save();
    console.log('✅ Event saved successfully:', savedEvent._id);

    res.status(201).json({
      message: 'Event created successfully',
      event: savedEvent
    });
  } catch (error) {
    console.error('❌ Error creating event:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Update event
router.put('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.organizer.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to update this event' });
    }

    Object.assign(event, req.body);
    await event.save();

    res.json({
      message: 'Event updated successfully',
      event
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete event
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.organizer.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this event' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
