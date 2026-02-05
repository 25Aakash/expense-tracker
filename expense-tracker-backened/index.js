// index.js  – Expense Tracker backend bootstrap
//-------------------------------------------------
require('dotenv').config();
const express      = require('express');
const mongoose     = require('mongoose');
const cors         = require('cors');
const helmet       = require('helmet');
const swaggerUi    = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const os           = require('os');

// ⬇ route modules
const authRoutes     = require('./routes/authRoutes');
const expenseRoutes  = require('./routes/expenseRoutes');
const incomeRoutes   = require('./routes/incomeRoutes');
const adminRoutes    = require('./routes/adminRoutes');
const profileRoutes  = require('./routes/profileRoutes');
const userRoutes     = require('./routes/userRoutes');
const managerRoutes  = require('./routes/managerRoutes');

// ⬇ middlewares
const errorHandler   = require('./middleware/errorHandler');
const rateLimiter    = require('./middleware/rateLimiter'); // limits OTP + auth spam

//-------------------------------------------------
// Express-app setup
//-------------------------------------------------
const app  = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for cloud platforms (Render, Heroku, etc.)
app.set('trust proxy', 1);

//-------------------------------------------------
// Mandatory config validation (fail fast)
//-------------------------------------------------
['MONGO_URI','JWT_SECRET'].forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing required environment variable: ${key}`);
    process.exit(1);
  }
});

// Function to get local IP address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// --- security / sanity middlewares ---
app.use(helmet());
app.use(cors({
  origin: (origin, cb) => {
    const allowed = (process.env.CLIENT_ORIGIN || '').split(',').filter(Boolean);
    if (!origin || allowed.length === 0 || allowed.includes('*') || allowed.includes(origin)) return cb(null, true);
    return cb(new Error('CORS not allowed'), false);
  },
  credentials: true,
}));
app.use(express.json());

// --- Swagger docs ---
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: { title: 'Expense Tracker API', version: '1.0.0' },
  },
  apis: ['./routes/*.js'],
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- Liveness probe ---
app.get('/health', (_req, res) => res.status(200).send('Server is healthy!'));

//-------------------------------------------------
// Route mounting (JWT auth handled inside each file)
//-------------------------------------------------
app.use('/api/auth', authRoutes);  // rate-limit only these
app.use('/api/expenses', expenseRoutes);
app.use('/api/incomes',  incomeRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/profile',  profileRoutes);
app.use('/api/user',     userRoutes);
app.use('/api/manager',  managerRoutes);

//--- global error handler MUST be last ---
app.use(errorHandler);

//-------------------------------------------------
// Mongo connection & server start
//-------------------------------------------------
let server;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('🗄️  MongoDB connected');
    server = app.listen(PORT, '0.0.0.0', () => {
      const localIP = getLocalIP();
      console.log(`🚀  API server on http://localhost:${PORT}`);
      console.log(`🌐  Network access: http://${localIP}:${PORT}`);
      console.log(`📚  API docs: http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((err) => {
    console.error('❌  Mongo connection error:', err);
    process.exit(1);
  });

async function gracefulShutdown(signal) {
  console.log(`\n⏻ Received ${signal}. Shutting down gracefully...`);
  try {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
      console.log('✅ HTTP server closed');
    }
    await mongoose.connection.close();
    console.log('✅ Mongo connection closed');
    process.exit(0);
  } catch (err) {
    console.error('⚠️ Error during shutdown', err);
    process.exit(1);
  }
}
['SIGINT','SIGTERM'].forEach(sig => process.on(sig, () => gracefulShutdown(sig)));

// Export for testing
module.exports = app;
