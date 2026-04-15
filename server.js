require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// Middleware - CORS configuration
const corsOptions = {
  origin: '*', // Allow all origins for development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' })); // Increase limit for large image uploads
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`\n📨 [${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('📦 Body:', req.body);
  }
  next();
});

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/college_events';
console.log('🔌 Connecting to MongoDB:', MONGO_URI);
mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  retryWrites: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch(err => console.log('❌ MongoDB Error:', err.message));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/registrations', require('./routes/registrations'));
app.use('/api/search', require('./routes/search'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/admin', require('./routes/admin'));

// Health check endpoint (test connectivity)
app.get('/api/health', (req, res) => {
  console.log('✅ Health check received');
  res.json({ 
    status: 'Backend is running!',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Test endpoint for debugging
app.get('/api/test', (req, res) => {
  console.log('✅ Test endpoint called');
  res.json({ 
    message: 'Backend is working!',
    cors: 'enabled'
  });
});

// Catch-all for undefined routes
app.use((req, res) => {
  console.warn(`⚠️ 404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Route not found: ' + req.path });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Test: http://localhost:${PORT}/api/test`);
  console.log(`${'='.repeat(60)}\n`);
});
