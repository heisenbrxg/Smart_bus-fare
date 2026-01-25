const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: true
    },
    balance: {
        type: Number,
        default: 0,
        min: 0
    },
    fingerprintRegistered: {
        type: Boolean,
        default: false
    },
    fingerprintId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fingerprint',
        required: false
    },
    activeTrip: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trip',
        default: null
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for faster queries
// userSchema.index({ phone: 1 });
// userSchema.index({ userId: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
