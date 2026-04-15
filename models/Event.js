const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Tech', 'Sports', 'Music', 'Art', 'Cultural', 'Business', 'Other'],
    default: 'Other'
  },
  date: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    default: null
  },
  eventType: {
    type: String,
    enum: ['single-day', 'multi-day'],
    default: 'single-day'
  },
  startTime: {
    type: String, // HH:MM format
    required: true
  },
  endTime: {
    type: String, // HH:MM format
    required: true
  },
  location: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    required: true
  },
  registeredCount: {
    type: Number,
    default: 0
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  registeredParticipants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for performance optimization
eventSchema.index({ title: 'text', description: 'text' }); // Text search index
eventSchema.index({ category: 1 }); // Filter by category
eventSchema.index({ date: 1 }); // Sort by date
eventSchema.index({ organizer: 1 }); // Find events by organizer
eventSchema.index({ status: 1 }); // Filter by status
eventSchema.index({ location: 1 }); // Filter by location
eventSchema.index({ 'date': 1, 'category': 1 }); // Compound index for date + category filtering

module.exports = mongoose.model('Event', eventSchema);
