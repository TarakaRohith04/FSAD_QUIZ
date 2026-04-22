require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

// Database Connection (Serverless optimized)
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not defined in environment variables');
    return;
  }

  try {
    const db = await mongoose.connect(uri);
    isConnected = db.connections[0].readyState;
    console.log(`Successfully connected to MongoDB Cloud at ${db.connections[0].host}`);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
  }
};

// Connect to DB for every request (singleton handles the reuse)
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Export the app for Vercel
module.exports = app;
