const express = require('express');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const audienceRoutes = require('./routes/audienceRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const {errorHandlerMiddleware} = require('./utils/errors');
require('dotenv').config(); 


// Connect to Database
connectDB();

const app = express();

// Middleware

const allowedOrigins = [
  'https://crm-front-f60y.onrender.com', 
  'http://localhost:5173',               
  'http://localhost:3000'               
];

// Configure CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    // AND allow requests from explicitly defined allowedOrigins
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true); // Allow the request
    } else {
      callback(new Error('Not allowed by CORS')); // Block the request
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed HTTP methods
  credentials: true, // If your frontend sends cookies/auth headers (e.g., with Axios 'withCredentials: true')
  optionsSuccessStatus: 204 // Some older browsers or specific setups might need this
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/audience', audienceRoutes);
app.use('/api/campaign', campaignRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error Handler
app.use(errorHandlerMiddleware);

module.exports = app;