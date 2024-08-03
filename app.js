// app.js

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const fileRoutes = require('./routes/file');

// Initialize Express app
const app = express();

// Connect to the database
connectDB();

// Middleware for parsing JSON
app.use(express.json());

// Use CORS middleware with domain-specific handling
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests from localhost with any port
    if (!origin || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true
}));

// Route handlers
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/files', fileRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  if (err.message && err.message.includes('Not allowed by CORS')) {
    res.status(403).json({ error: err.message });
  } else {
    res.status(err.status || 500).json({ error: err.message });
  }
});

module.exports = app;
