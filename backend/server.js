const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/database');
const fingerprintRoutes = require('./routes/fingerprint');
const userRoutes = require('./routes/users');

const app = express();
const port = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
    origin: true, // Allow any origin to access (for development)
    credentials: true
}));
app.use(express.json({ limit: '50mb' })); // Increased limit for fingerprint data
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Routes
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'SmartBus Wallet System Backend with Fingerprint Integration',
        version: '2.0.0',
        endpoints: {
            users: '/api/users',
            fingerprint: '/api/fingerprint',
            health: '/api/health'
        }
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected',
        services: {
            fingerprintScanner: process.env.FINGERPRINT_SCANNER_URL
        }
    });
});

// API Routes
// API Routes
app.use('/api/users', userRoutes);
app.use('/api/fingerprint', fingerprintRoutes);
app.use('/api/bus', require('./routes/bus'));

// Legacy routes for backward compatibility
app.get('/api/users/:id', async (req, res) => {
    try {
        const User = require('./models/User');
        const user = await User.findOne({ userId: req.params.id });
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

app.post('/api/wallet/recharge', async (req, res) => {
    try {
        const User = require('./models/User');
        const { userId, amount } = req.body;
        const user = await User.findOne({ userId });
        if (user) {
            user.balance += parseFloat(amount);
            await user.save();
            res.json({ success: true, newBalance: user.balance });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.path
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Start server if not running in Vercel/Serverless environment
if (require.main === module) {
    app.listen(port, () => {
        console.log('='.repeat(50));
        console.log(`🚀 SmartBus Wallet System Backend`);
        console.log(`📡 Server running at http://localhost:${port}`);
        console.log(`🔐 Fingerprint Scanner: ${process.env.FINGERPRINT_SCANNER_URL}`);
        console.log(`💾 MongoDB: Connected`);
        console.log('='.repeat(50));
    });
}

module.exports = app;

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});
