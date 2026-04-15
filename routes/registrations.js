const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Register for an event
router.post('/:eventId', auth, async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if already registered
    if (event.registeredParticipants.includes(req.user.userId)) {
      return res.status(400).json({ error: 'Already registered for this event' });
    }

    // Check capacity
    if (event.registeredCount >= event.capacity) {
      return res.status(400).json({ error: 'Event is full' });
    }

    // Add user to event
    event.registeredParticipants.push(req.user.userId);
    event.registeredCount += 1;
    await event.save();

    // Add event to user
    await User.findByIdAndUpdate(req.user.userId, {
      $push: { eventsRegistered: eventId }
    });

    res.json({
      message: 'Successfully registered for event',
      event
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's registered events
router.get('/user/my-events', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('eventsRegistered');
    res.json(user.eventsRegistered);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel registration
router.delete('/:eventId', auth, async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (!event.registeredParticipants.includes(req.user.userId)) {
      return res.status(400).json({ error: 'Not registered for this event' });
    }

    event.registeredParticipants = event.registeredParticipants.filter(
      id => id.toString() !== req.user.userId
    );
    event.registeredCount -= 1;
    await event.save();

    await User.findByIdAndUpdate(req.user.userId, {
      $pull: { eventsRegistered: eventId }
    });

    res.json({ message: 'Registration cancelled' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
