// server/index.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import routes
const registerRoutes = require('./routes/RegisterRoute');
const recipeRoutes = require('./routes/RecipeRoute');
const loginRoutes = require('./routes/LoginRoute');
const forgotPasswordRoutes = require('./routes/forgotPassword');

const app = express();

// === CORS Middleware ===

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim().replace(/\/$/, ''))
  : [
      '',
      'http://localhost:3000',
      'http://localhost:3001',
      'https://recipes-order12.vercel.app',
      'https://recipes-order.onrender.com'
    ];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Log for debugging
    console.log(`CORS blocked origin: ${origin}`);
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// Apply CORS middleware
app.use(cors(corsOptions));

// ✅ Handle preflight requests safely
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    cors(corsOptions)(req, res, next);
  } else {
    next();
  }
});

// === Built-in Middleware ===

app.use(express.json()); // Parse incoming JSON

// === Test Route ===

app.get('/', (req, res) => {
  res.json({ message: 'Recipe Sharing Backend Running' });
});

// === Connect to MongoDB ===

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/recipe-sharing';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  console.log('Please make sure MongoDB is running or use MongoDB Atlas');
});

// === API Routes ===

app.use('/auth', registerRoutes);
app.use('/auth', loginRoutes);
app.use('/auth', forgotPasswordRoutes);
app.use('/auth', recipeRoutes);

// === Start Server ===

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
