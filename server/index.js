const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/event');
const bookingRoutes = require('./routes/booking');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

let databaseConnection;
const connectDatabase = () => {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve();
  }

  const mongoUri = process.env.MONGO_URI || (process.env.VERCEL ? '' : 'mongodb://localhost:27017/eventora');
  if (!mongoUri) {
    return Promise.reject(new Error('MONGO_URI is required'));
  }

  if (!databaseConnection) {
    databaseConnection = mongoose.connect(mongoUri).catch((error) => {
      databaseConnection = undefined;
      throw error;
    });
  }

  return databaseConnection;
};

app.use(async (req, res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (error) {
    console.error('MongoDB connection error:', error);
    res.status(503).json({ message: 'Database connection unavailable' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;