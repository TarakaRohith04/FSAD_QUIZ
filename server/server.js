require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

// Database Connection
const uri = process.env.MONGODB_URI;
mongoose.connect(uri)
  .then(() => {
    const host = mongoose.connection.host;
    console.log(`Successfully connected to MongoDB Cloud at ${host}`);
  })
  .catch(err => {
    console.error('CRITICAL: MongoDB connection error:', err.message);
    console.log('Server will continue running, but database operations will fail.');
  });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
