const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        ref: 'User'
    },
    tripId: {
        type: String,
        unique: true,
        required: true
    },
    status: {
        type: String,
        enum: ['ongoing', 'completed', 'cancelled'],
        default: 'ongoing'
    },
    // Pickup Details
    pickupLocation: {
        name: { type: String, default: 'Bus Stop A' },
        lat: Number,
        lng: Number,
        accuracy: Number,
        time: { type: Date, default: Date.now }
    },
    // Drop Details
    dropLocation: {
        name: String,
        lat: Number,
        lng: Number,
        accuracy: Number,
        time: Date
    },
    // Journey Stats
    distanceKm: {
        type: Number,
        default: 0
    },
    fareAmount: {
        type: Number,
        default: 0
    },
    busId: {
        type: String,
        default: 'BUS-101'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Trip', tripSchema);
