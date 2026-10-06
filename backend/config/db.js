const mongoose = require('mongoose');

// Queries that arrive while the DB is still connecting (right after a cold
// start) are queued; give them up to 30s instead of mongoose's 10s default.
mongoose.set('bufferTimeoutMS', 30000);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Fail fast with a clear error instead of hanging, and keep a few
      // connections open so requests after the first don't re-handshake.
      serverSelectionTimeoutMS: 15000,
      maxPoolSize: 10,
      minPoolSize: 1,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
