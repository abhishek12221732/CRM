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
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:5173','https://crm-frontend-sltp.onrender.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
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