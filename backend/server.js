require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const path = require('path');
const mongoose = require('mongoose');

const connectDB = require('./config/db');
const ensureAdminSeeded = require('./utils/ensureAdmin');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const enquiryRoutes = require('./routes/enquiryRoutes');

const app = express();

// --- Security & parsing middleware ---
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

const allowedOrigins = (process.env.CLIENT_ORIGINS || '').split(',').map((o) => o.trim());
// In development only, also allow any localhost / private-LAN origin on any
// port (e.g. http://192.168.1.6:5173) so the app can be opened from a phone
// on the same WiFi without having to hardcode your PC's IP into .env.
const isPrivateDevOrigin = (origin) =>
  process.env.NODE_ENV !== 'production' &&
  /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})(:\d+)?$/.test(
    origin
  );
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin) || isPrivateDevOrigin(origin)) return cb(null, true);
      cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use('/api', apiLimiter);

// Serve locally-stored compressed images (only used when Cloudinary isn't configured)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Routes ---
// Instant, no-database health check. Used by the frontend warm-up ping, the
// Render "Health Check Path" setting and any uptime monitor.
app.get('/api/health', (req, res) =>
  res.json({
    status: 'ok',
    service: 'PMV Properties API',
    db: mongoose.connection.readyState === 1 ? 'up' : 'connecting',
  })
);

// Login must wait until MongoDB is connected AND the admin account has been
// synced from .env (see `ready` below), so the first login after a boot works.
// Public property routes do NOT wait — mongoose queues their queries until the
// DB is up, which is what makes the first page load fast.
app.use(
  '/api/auth',
  async (req, res, next) => {
    await ready;
    next();
  },
  authRoutes
);
app.use('/api/properties', propertyRoutes);
app.use('/api/enquiries', enquiryRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and sync the admin login in the BACKGROUND while the
// server is already accepting requests. (Previously the server only started
// listening after both finished, which added several seconds to every cold
// start on Render's free plan.) `ready` resolves when both are done.
const ready = (async () => {
  await connectDB();
  await ensureAdminSeeded();
})();

// Render's free plan puts the service to sleep after ~15 minutes without
// traffic, and waking it takes about a minute. Once awake, ping our own public
// URL every 10 minutes so it doesn't fall asleep again. RENDER_EXTERNAL_URL is
// set by Render automatically. Set KEEP_ALIVE=false to turn this off.
// (This can't wake a sleeping server — pair it with an external monitor, see
// README "Fast first load on Render".)
function startKeepAlive() {
  const url = (process.env.RENDER_EXTERNAL_URL || '').replace(/\/+$/, '');
  if (!url || process.env.KEEP_ALIVE === 'false') return;
  const ping = () => fetch(`${url}/api/health`).catch(() => {});
  setInterval(ping, 10 * 60 * 1000);
  console.log('[keep-alive] self-ping every 10 min enabled');
}

app.listen(PORT, () => {
  console.log(`PMV Properties API running on port ${PORT}`);
  startKeepAlive();
});
