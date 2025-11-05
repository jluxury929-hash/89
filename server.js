// server.js - Complete Railway Backend for Ultra Earning Engine
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ CRITICAL: Enable CORS for all origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept']
}));

// Parse JSON bodies
app.use(express.json());

// In-memory storage (use database in production)
const activeSessions = new Map();
const metrics = new Map();

// ✅ Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Ultra Earning Engine Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// ✅ Engine start endpoint
app.post('/api/engine/start', (req, res) => {
  const { walletAddress, miningContract, strategies } = req.body;
  
  if (!walletAddress) {
    return res.status(400).json({ error: 'Wallet address required' });
  }

  // Create session
  const session = {
    walletAddress,
    miningContract,
    strategies: strategies || [],
    startTime: Date.now(),
    active: true
  };

  activeSessions.set(walletAddress, session);
  
  // Initialize metrics
  metrics.set(walletAddress, {
    totalProfit: 0,
    hourlyRate: 15 + Math.random() * 10,
    dailyProfit: 0,
    activePositions: strategies ? strategies.length : 0
  });

  console.log(`✅ Engine started for ${walletAddress}`);

  res.json({
    success: true,
    message: 'Engine started successfully',
    session,
    timestamp: new Date().toISOString()
  });
});

// ✅ Engine stop endpoint
app.post('/api/engine/stop', (req, res) => {
  const { walletAddress } = req.body;
  
  if (!walletAddress) {
    return res.status(400).json({ error: 'Wallet address required' });
  }

  const session = activeSessions.get(walletAddress);
  if (session) {
    session.active = false;
    activeSessions.delete(walletAddress);
  }

  console.log(`⏸️ Engine stopped for ${walletAddress}`);

  res.json({
    success: true,
    message: 'Engine stopped successfully',
    timestamp: new Date().toISOString()
  });
});

// ✅ Get metrics endpoint
app.get('/api/engine/metrics', (req, res) => {
  const walletAddress = req.query.wallet || req.headers['x-wallet-address'];
  
  // If no specific wallet, return sample data
  if (!walletAddress) {
    return res.json({
      totalProfit: 1250.50 + Math.random() * 100,
      hourlyRate: 15 + Math.random() * 10,
      dailyProfit: 360 + Math.random() * 120,
      activePositions: 7,
      timestamp: new Date().toISOString()
    });
  }

  let metric = metrics.get(walletAddress);
  if (!metric) {
    metric = {
      totalProfit: 0,
      hourlyRate: 15,
      dailyProfit: 0,
      activePositions: 0
    };
  }

  // Simulate earnings growth
  metric.totalProfit += Math.random() * 2;
  metric.dailyProfit = metric.hourlyRate * 24;
  metrics.set(walletAddress, metric);

  res.json({
    ...metric,
    timestamp: new Date().toISOString()
  });
});

// ✅ API Status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'operational',
    activeSessions: activeSessions.size,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /',
      'GET /api/status',
      'GET /api/engine/metrics',
      'POST /api/engine/start',
      'POST /api/engine/stop'
    ]
  });
});

// Start server on 0.0.0.0 (required for Railway)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Ultra Earning Engine Backend running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/`);
  console.log(`✅ CORS enabled for all origins`);
});
