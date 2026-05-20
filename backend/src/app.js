const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
const { errorHandler } = require('./middlewares/errorHandler');
const billRoutes = require('./routes/bill.routes');
const logger = require('./utils/logger');

const app = express();

// Security and Performance
app.use(helmet());
app.use(compression());

// Production CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://sanjeevani-healthcare.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean);

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? allowedOrigins
    : '*',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// TODO: switch rate limit storage to redis later
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { success: false, error: 'RATE_LIMIT_EXCEEDED' }
}));

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`);
  });
  next();
});

app.get('/health', (req, res) => {
  res.json({ success: true, status: 'REST API is running' });
});

const schemeRoutes = require('./routes/schemeRoutes');
const storeRoutes = require('./routes/store.routes');
const authRoutes = require('./routes/auth.routes');
const auditRoutes = require('./routes/audit.routes');
const cghsRoutes = require('./routes/cghs.routes');

app.use('/api/v1/bills', billRoutes);
app.use('/api/v1/schemes', schemeRoutes);
app.use('/api/v1/stores', storeRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/v1/audit', auditRoutes);
app.use('/api/v1/cghs', cghsRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'ROUTE_NOT_FOUND' });
});

app.use(errorHandler);

module.exports = app;
