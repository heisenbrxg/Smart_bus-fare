const express = require('express');
const router = express.Router();
const fingerprintScannerService = require('../services/fingerprintScanner');
const Fingerprint = require('../models/Fingerprint');
const User = require('../models/User');

/**
 * @route   POST /api/fingerprint/capture
 * @desc    Capture fingerprint from scanner and store in database
 * @access  Public
 */
router.post('/capture', async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        // Check if user exists
        let user = await User.findOne({ userId });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Capture fingerprint from scanner
        const captureResult = await fingerprintScannerService.captureFingerprint();

        if (!captureResult.success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to capture fingerprint',
                error: captureResult.error
            });
        }

        // Store fingerprint in database
        const fingerprint = new Fingerprint({
            userId: userId,
            fingerprintData: captureResult.data.fingerprintData,
            fingerprintTemplate: captureResult.data.template,
            quality: captureResult.data.quality,
            deviceInfo: captureResult.data.deviceInfo,
            status: 'active'
        });

        await fingerprint.save();

        // Update user's fingerprint status
        user.fingerprintRegistered = true;
        user.fingerprintId = fingerprint._id;
        await user.save();

        res.json({
            success: true,
            message: 'Fingerprint captured and stored successfully',
            data: {
                fingerprintId: fingerprint._id,
                quality: fingerprint.quality,
                captureTime: fingerprint.captureTime
            }
        });

    } catch (error) {
        console.error('Error in fingerprint capture:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/fingerprint/verify
 * @desc    Verify captured fingerprint against stored fingerprint
 * @access  Public
 */
router.post('/verify', async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        // Find user and their stored fingerprint
        const user = await User.findOne({ userId }).populate('fingerprintId');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!user.fingerprintRegistered || !user.fingerprintId) {
            return res.status(400).json({
                success: false,
                message: 'No fingerprint registered for this user'
            });
        }

        // Capture new fingerprint
        const captureResult = await fingerprintScannerService.captureFingerprint();

        if (!captureResult.success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to capture fingerprint',
                error: captureResult.error
            });
        }

        // Verify against stored template
        const verifyResult = await fingerprintScannerService.verifyFingerprint(
            captureResult.data.template,
            user.fingerprintId.fingerprintTemplate
        );

        if (!verifyResult.success) {
            return res.status(500).json({
                success: false,
                message: 'Verification failed',
                error: verifyResult.error
            });
        }

        res.json({
            success: true,
            matched: verifyResult.matched,
            score: verifyResult.score,
            user: {
                userId: user.userId,
                name: user.name,
                balance: user.balance
            }
        });

    } catch (error) {
        console.error('Error in fingerprint verification:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/fingerprint/user/:userId
 * @desc    Get all fingerprints for a user
 * @access  Public
 */
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const fingerprints = await Fingerprint.find({
            userId,
            status: 'active'
        }).sort({ captureTime: -1 });

        res.json({
            success: true,
            count: fingerprints.length,
            data: fingerprints
        });

    } catch (error) {
        console.error('Error fetching fingerprints:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/fingerprint/device-info
 * @desc    Get fingerprint scanner device information
 * @access  Public
 */
router.get('/device-info', async (req, res) => {
    try {
        const deviceInfo = await fingerprintScannerService.getDeviceInfo();

        if (!deviceInfo.success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to get device info',
                error: deviceInfo.error
            });
        }

        res.json({
            success: true,
            data: deviceInfo.data
        });

    } catch (error) {
        console.error('Error getting device info:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

/**
 * @route   DELETE /api/fingerprint/:fingerprintId
 * @desc    Delete a fingerprint record
 * @access  Public
 */
router.delete('/:fingerprintId', async (req, res) => {
    try {
        const { fingerprintId } = req.params;

        const fingerprint = await Fingerprint.findById(fingerprintId);

        if (!fingerprint) {
            return res.status(404).json({
                success: false,
                message: 'Fingerprint not found'
            });
        }

        // Soft delete
        fingerprint.status = 'deleted';
        await fingerprint.save();

        res.json({
            success: true,
            message: 'Fingerprint deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting fingerprint:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

module.exports = router;
