const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['student', 'organizer', 'admin'],
    default: 'student'
  },
  additionalDetails: {
    bio: {
      type: String,
      default: ''
    },
    department: {
      type: String,
      default: ''
    },
    year: {
      type: String,
      default: ''
    }
  },
  eventsRegistered: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],
  eventsOrganized: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],
  resetCode: {
    type: String,
    default: null
  },
  resetCodeExpiry: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    this.password = await bcryptjs.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

// Create indexes for performance optimization
userSchema.index({ email: 1 }); // Email lookups
userSchema.index({ role: 1 }); // Filter by role
userSchema.index({ fullName: 'text' }); // Text search on name
userSchema.index({ 'additionalDetails.department': 1 }); // Filter by department

// Method to compare passwords
userSchema.methods.comparePassword = async function(password) {
  return await bcryptjs.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
