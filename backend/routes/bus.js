const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Trip = require('../models/Trip');
const emailService = require('../services/emailService');

// Mock GPS Coordinates for Simulation
const STOPS = [
    { name: 'Central Station', lat: 13.0827, lng: 80.2707 },
    { name: 'City Mall', lat: 13.0600, lng: 80.2500 },
    { name: 'Tech Park', lat: 13.0400, lng: 80.2300 },
    { name: 'University', lat: 12.9800, lng: 80.2000 }
];

// Calculate Haversine distance
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// SIMULATE SCAN
router.post('/scan', async (req, res) => {
    try {
        const { userId, locationIndex, latitude, longitude, accuracy } = req.body; // locationIndex optional for demo

        // 1. Find User
        const user = await User.findOne({ userId }).populate('activeTrip');
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // 2. Determine Current Location
        let currentLocation;

        // PRIORITIZE REAL GPS IF PROVIDED
        if (latitude && longitude) {
            currentLocation = {
                name: `GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`, // Generic name for GPS point
                lat: parseFloat(latitude),
                lng: parseFloat(longitude),
                accuracy: accuracy ? parseFloat(accuracy) : null
            };
        }
        // FALLBACK TO SIMULATION
        else if (typeof locationIndex !== 'undefined' && STOPS[locationIndex]) {
            currentLocation = STOPS[locationIndex];
        } else {
            currentLocation = STOPS[Math.floor(Math.random() * STOPS.length)];
        }

        // 3. Logic Boarding vs Dropping
        if (!user.activeTrip) {
            // --- BOARDING (Start Trip) ---

            // Create Trip
            const newTrip = new Trip({
                userId: user.userId,
                tripId: `TRIP-${Date.now()}`,
                status: 'ongoing',
                pickupLocation: {
                    name: currentLocation.name,
                    lat: currentLocation.lat,
                    lng: currentLocation.lng,
                    accuracy: currentLocation.accuracy,
                    time: new Date()
                }
            });
            await newTrip.save();

            // Update User
            user.activeTrip = newTrip._id;
            await user.save();

            return res.json({
                success: true,
                type: 'BOARDING',
                message: `Welcome aboard, ${user.name}!`,
                location: currentLocation.name,
                tripId: newTrip.tripId,
                gps_data: {
                    from_latitude: currentLocation.lat,
                    from_longitude: currentLocation.lng,
                    accuracy_start: currentLocation.accuracy
                }
            });

        } else {
            // --- DROPPING (End Trip) ---
            const trip = user.activeTrip;

            // Calculate Distance
            const dist = calculateDistance(
                trip.pickupLocation.lat, trip.pickupLocation.lng,
                currentLocation.lat, currentLocation.lng
            );

            // Calculate Fare (Base ₹10 + ₹5/km)
            const fare = Math.round(10 + (dist * 5));

            // Check Balance STRICTLY
            if (user.balance < fare) {
                return res.status(400).json({
                    success: false,
                    message: "Insufficient wallet balance. Please recharge.",
                    tripId: trip.tripId,
                    required: fare,
                    available: user.balance
                });
            }

            // Update Trip
            trip.dropLocation = {
                name: currentLocation.name,
                lat: currentLocation.lat,
                lng: currentLocation.lng,
                accuracy: currentLocation.accuracy,
                time: new Date()
            };
            trip.distanceKm = dist;
            trip.fareAmount = fare;
            trip.status = 'completed';
            await trip.save();

            // Deduct User Balance
            user.balance -= fare;
            user.activeTrip = null; // Clear active trip
            await user.save();

            // Send Email (Async)
            emailService.sendTripReceipt(user, trip);

            return res.json({
                success: true,
                type: 'DROP',
                message: `fare deducted: ₹${fare}`,
                location: currentLocation.name,
                tripId: trip.tripId,
                distance: `${dist.toFixed(1)} km`,
                fare: fare,
                balance: user.balance,
                gps_data: {
                    from_latitude: trip.pickupLocation.lat,
                    from_longitude: trip.pickupLocation.lng,
                    to_latitude: currentLocation.lat,
                    to_longitude: currentLocation.lng,
                    accuracy_start: trip.pickupLocation.accuracy,
                    accuracy_end: currentLocation.accuracy
                }
            });
        }

    } catch (error) {
        console.error('Bus Scan Error:', error);
        res.status(500).json({ success: false, error: 'System Error' });
    }
});

module.exports = router;
