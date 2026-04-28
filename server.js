require('dotenv').config();

const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');

const connectDB = require('./config/db');
const { validateEnv } = require('./config/env');
const { createCorsOriginChecker, getAllowedOrigins } = require('./config/cors');
const { swaggerSpec } = require('./config/swagger');
const { apiLimiter } = require('./middleware/rateLimit');
const { initSockets } = require('./sockets/index');
const { initializeWordDataset, getWordDatasetMeta } = require('./services/wordDatasetService');

const authRoutes = require('./routes/auth');
const historyRoutes = require('./routes/history');
const leaderboardRoutes = require('./routes/leaderboard');
const roomsRoutes = require('./routes/rooms');
const wordsRoutes = require('./routes/words');

// ── Init Express ──────────────────────────────────────────────────────────────
const app = express();
const httpServer = createServer(app);

// ── Socket.IO ─────────────────────────────────────────────────────────────────
const allowedOrigin = createCorsOriginChecker();

const corsOptions = {
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
};

const io = new Server(httpServer, {
  cors: corsOptions,
  connectionStateRecovery: {
    maxDisconnectionDuration: 30000,
    skipMiddlewares: false,
  },
});

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors(corsOptions));
app.use(express.json());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/docs-json', (req, res) => res.json(swaggerSpec));
app.use('/api', apiLimiter);

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/words', wordsRoutes);

// Validate-word (optional, checks if answer starts with letter from dataset)
app.post('/api/validate-word', (req, res) => {
  const { word, letter } = req.body;
  if (!word || !letter) return res.status(400).json({ error: 'word and letter required' });
  const valid = word.trim()[0]?.toUpperCase() === letter.toUpperCase();
  res.json({ valid });
});

// API root endpoint
app.get('/api', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API is reachable',
    health: '/health',
    wordsSource: getWordDatasetMeta(),
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Name-Animal-Plant-Object-Cities backend is running',
    health: '/health',
  });
});

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start ──────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

const start = async () => {
  validateEnv();
  await connectDB();
  await initializeWordDataset();
  initSockets(io);

  httpServer.listen(PORT, () => {
    console.log(`\n🎮 Name-Animal-Plant-Object-Cities backend running`);
    console.log(`   HTTP  → http://localhost:${PORT}`);
    console.log(`   WS    → ws://localhost:${PORT}`);
    console.log(`   Env   → ${process.env.NODE_ENV || 'development'}\n`);
    console.log(`   CORS  → ${getAllowedOrigins().join(', ') || 'none configured'}`);
  });
};

start().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});

module.exports = { app, io };
