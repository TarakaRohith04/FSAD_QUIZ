require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection (Serverless optimized)
let isConnected = false;
const connectDB = async (req, res, next) => {
  if (isConnected) return next();

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not defined in environment variables');
    return res.status(500).json({ message: "Database connection failed: MONGODB_URI missing in Vercel settings." });
  }

  try {
    const db = await mongoose.connect(uri);
    isConnected = db.connections[0].readyState;
    console.log(`Successfully connected to MongoDB Cloud at ${db.connections[0].host}`);
    next();
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    res.status(500).json({ message: "Database connection error: " + err.message });
  }
};

// --- Execution Order: Connect to DB FIRST, then handle Routes ---
app.use(connectDB);

// Routes
// Support both /api prefix (Vercel default) and root (rewritten) paths
app.use('/api', apiRoutes);
app.use('/', apiRoutes);

// Export the app for Vercel
module.exports = app;
