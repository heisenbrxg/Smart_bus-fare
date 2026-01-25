const mongoose = require('mongoose');

const fingerprintSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    fingerprintData: {
        type: String,
        required: true
    },
    fingerprintTemplate: {
        type: String,
        required: false
    },
    quality: {
        type: Number,
        default: 0
    },
    captureTime: {
        type: Date,
        default: Date.now
    },
    deviceInfo: {
        type: Object,
        default: {}
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'deleted'],
        default: 'active'
    },
    metadata: {
        type: Object,
        default: {}
    }
}, {
    timestamps: true
});

// Index for faster queries
fingerprintSchema.index({ userId: 1, status: 1 });
fingerprintSchema.index({ captureTime: -1 });

const Fingerprint = mongoose.model('Fingerprint', fingerprintSchema);

module.exports = Fingerprint;
