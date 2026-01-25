const express = require('express');
const router = express.Router();
const User = require('../models/User');

/**
 * @route   POST /api/users/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', async (req, res) => {
    try {
        console.log('Registration request body:', req.body);
        const { userId, name, phone, email, balance, password } = req.body;

        // Validation
        if (!userId || !name || !phone || !password) {
            return res.status(400).json({
                success: false,
                message: 'User ID, name, phone, and password are required'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ userId }, { phone }] });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this ID or phone already exists'
            });
        }

        // Create new user
        const user = new User({
            userId,
            name,
            phone,
            password,
            email: email || '',
            balance: balance || 0
        });

        await user.save();

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                userId: user.userId,
                name: user.name,
                phone: user.phone,
                balance: user.balance
            }
        });

    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/users/:userId
 * @desc    Get user by ID
 * @access  Public
 */
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findOne({ userId }).populate('fingerprintId');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user
        });

    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
        const users = await User.find({ status: 'active' })
            .select('-__v')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: users.length,
            data: users
        });

    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

/**
 * @route   PUT /api/users/:userId
 * @desc    Update user information
 * @access  Public
 */
router.put('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const updates = req.body;

        // Don't allow updating userId or fingerprintId directly
        delete updates.userId;
        delete updates.fingerprintId;

        const user = await User.findOneAndUpdate(
            { userId },
            { ...updates, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User updated successfully',
            data: user
        });

    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/users/:userId/recharge
 * @desc    Recharge user wallet
 * @access  Public
 */
router.post('/:userId/recharge', async (req, res) => {
    try {
        const { userId } = req.params;
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid amount is required'
            });
        }

        const user = await User.findOne({ userId });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.balance += parseFloat(amount);
        await user.save();

        res.json({
            success: true,
            message: 'Wallet recharged successfully',
            data: {
                userId: user.userId,
                newBalance: user.balance,
                amountAdded: amount
            }
        });

    } catch (error) {
        console.error('Error recharging wallet:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/users/:userId/deduct
 * @desc    Deduct amount from user wallet
 * @access  Public
 */
router.post('/:userId/deduct', async (req, res) => {
    try {
        const { userId } = req.params;
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid amount is required'
            });
        }

        const user = await User.findOne({ userId });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.balance < amount) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient balance'
            });
        }

        user.balance -= parseFloat(amount);
        await user.save();

        res.json({
            success: true,
            message: 'Amount deducted successfully',
            data: {
                userId: user.userId,
                newBalance: user.balance,
                amountDeducted: amount
            }
        });

    } catch (error) {
        console.error('Error deducting from wallet:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/users/login
 * @desc    Login user with password
 * @access  Public
 */
router.post('/login', async (req, res) => {
    try {
        const { userId, password } = req.body;

        // Validation
        if (!userId || !password) {
            return res.status(400).json({
                success: false,
                message: 'User ID and password are required'
            });
        }

        // Check user by userId OR phone
        const user = await User.findOne({
            $or: [
                { userId: userId },
                { phone: userId }
            ]
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Validate password
        if (user.password !== password) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                userId: user.userId,
                name: user.name,
                phone: user.phone,
                balance: user.balance,
                fingerprintRegistered: user.fingerprintRegistered
            }
        });

    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

module.exports = router;
