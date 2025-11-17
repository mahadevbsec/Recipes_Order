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
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : [
      'https://recipes-share.onrender.com',
      'http://localhost:3000',
      'http://localhost:3001',
    ];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true, // Allow cookies/authorization headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

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
