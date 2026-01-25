import React, { useState, useEffect } from 'react';
import { WalletAccount, Trip } from '../types';
import {
    ArrowLeft,
    MapPin,
    Fingerprint,
    Navigation,
    Clock,
    CheckCircle,
    AlertCircle,
    Zap
} from 'lucide-react';

interface TravelProps {
    account: WalletAccount;
    onTripComplete: (trip: Trip) => void;
    onBack: () => void;
}

const Travel: React.FC<TravelProps> = ({ account, onTripComplete, onBack }) => {
    const [tripState, setTripState] = useState<'idle' | 'pickup' | 'ongoing' | 'drop' | 'completed'>('idle');
    const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
    const [verifyingFingerprint, setVerifyingFingerprint] = useState(false);
    const [distance, setDistance] = useState(0);

    // GPS & Location State
    const [useRealGps, setUseRealGps] = useState(true);
    const [lastPosition, setLastPosition] = useState<{ lat: number, lng: number } | null>(null);
    const [gpsStatus, setGpsStatus] = useState<'searching' | 'locked' | 'error' | 'simulated'>('searching');

    // Haversine Distance Formula
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in km
    };

    // REAL GPS Tracking Implementation
    useEffect(() => {
        let watchId: number;
        let simulationInterval: ReturnType<typeof setInterval>;

        if (tripState === 'ongoing' && currentTrip) {

            if (useRealGps && 'geolocation' in navigator) {
                // --- REAL GPS ---
                setGpsStatus('searching');

                watchId = navigator.geolocation.watchPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        setGpsStatus('locked');

                        setLastPosition(prev => {
                            if (prev) {
                                // Calculate distance from last point
                                const dist = calculateDistance(prev.lat, prev.lng, latitude, longitude);

                                // Filter noise (only update if moved > 5 meters)
                                if (dist > 0.005) {
                                    setDistance(total => {
                                        const newTotal = total + dist;
                                        // Update fare: ₹2 per km (min ₹5)
                                        const newFare = Math.max(5, Math.ceil(newTotal * 2));

                                        setCurrentTrip(trip => trip ? {
                                            ...trip,
                                            distance: parseFloat(newTotal.toFixed(2)),
                                            estimatedFare: newFare
                                        } : null);

                                        return newTotal;
                                    });
                                }
                            }
                            // Always update last position
                            return { lat: latitude, lng: longitude };
                        });
                    },
                    (error) => {
                        console.error('GPS Error:', error);
                        setGpsStatus('error');
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0
                    }
                );

            } else {
                // --- FALLBACK SIMULATION (For demo/testing) ---
                setGpsStatus('simulated');
                simulationInterval = setInterval(() => {
                    setDistance(prev => {
                        const newDistance = prev + (Math.random() * 0.1); // Smaller increments
                        const estimatedFare = Math.ceil(newDistance * 2);

                        setCurrentTrip(trip => trip ? {
                            ...trip,
                            distance: parseFloat(newDistance.toFixed(2)),
                            estimatedFare
                        } : null);

                        return newDistance;
                    });
                }, 2000);
            }
        }

        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
            if (simulationInterval) clearInterval(simulationInterval);
        };
    }, [tripState, useRealGps]);

    const handlePickupVerification = () => {
        setVerifyingFingerprint(true);

        // Simulate fingerprint verification
        setTimeout(() => {
            const newTrip: Trip = {
                id: `TRIP${Date.now()}`,
                status: 'ongoing',
                pickupLocation: 'Central Bus Stand',
                pickupTime: new Date().toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                distance: 0,
                estimatedFare: 0,
                pickupVerified: true,
                dropVerified: false
            };

            setCurrentTrip(newTrip);
            setTripState('ongoing');
            setVerifyingFingerprint(false);
            setDistance(0);
        }, 2000);
    };

    const handleDropVerification = () => {
        setVerifyingFingerprint(true);

        // Simulate fingerprint verification
        setTimeout(() => {
            if (currentTrip) {
                const completedTrip: Trip = {
                    ...currentTrip,
                    status: 'completed',
                    dropLocation: 'Tech Park',
                    dropTime: new Date().toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    actualFare: currentTrip.estimatedFare,
                    dropVerified: true
                };

                setCurrentTrip(completedTrip);
                setTripState('completed');
                setVerifyingFingerprint(false);

                // Complete trip after showing summary
                setTimeout(() => {
                    onTripComplete(completedTrip);
                }, 3000);
            }
        }, 2000);
    };

    const initiatePickup = () => {
        setTripState('pickup');
    };

    const initiateDrop = () => {
        setTripState('drop');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 pb-24">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 pt-8 pb-6 rounded-b-[2rem] shadow-lg">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                    >
                        <ArrowLeft className="w-5 h-5 text-white" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-white text-2xl font-bold">
                            {tripState === 'idle' ? 'Start Travel' :
                                tripState === 'pickup' ? 'Verify Pickup' :
                                    tripState === 'ongoing' ? 'Trip Ongoing' :
                                        tripState === 'drop' ? 'Verify Drop' :
                                            'Trip Completed'}
                        </h1>
                        {tripState === 'ongoing' && (
                            <p className="text-blue-100 text-sm mt-1">Tracking your journey...</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="px-6 py-6">
                {/* Idle State - Start Trip */}
                {tripState === 'idle' && (
                    <div className="space-y-6">
                        {/* Balance Check */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Available Balance</p>
                                    <p className={`text-3xl font-bold ${account.balance < 50 ? 'text-red-600' : 'text-green-600'
                                        }`}>
                                        ₹{account.balance}
                                    </p>
                                </div>
                                {account.balance < 50 && (
                                    <AlertCircle className="w-8 h-8 text-red-500" />
                                )}
                            </div>
                            {account.balance < 50 && (
                                <div className="mt-4 p-3 bg-red-50 rounded-xl border border-red-200">
                                    <p className="text-sm text-red-700">
                                        Low balance! Please recharge to continue traveling.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Fingerprint Status */}
                        <div className={`rounded-2xl p-6 shadow-lg border-2 ${account.fingerprintRegistered
                            ? 'bg-green-50 border-green-200'
                            : 'bg-amber-50 border-amber-200'
                            }`}>
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${account.fingerprintRegistered ? 'bg-green-100' : 'bg-amber-100'
                                    }`}>
                                    <Fingerprint className={`w-8 h-8 ${account.fingerprintRegistered ? 'text-green-600' : 'text-amber-600'
                                        }`} />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-800 mb-1">
                                        {account.fingerprintRegistered
                                            ? 'Fingerprint Registered'
                                            : 'Fingerprint Not Registered'}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {account.fingerprintRegistered
                                            ? 'You can start your journey'
                                            : 'Please register at bus station'}
                                    </p>
                                </div>
                                {account.fingerprintRegistered && (
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                )}
                            </div>
                        </div>

                        {/* Start Trip Button */}
                        <button
                            onClick={initiatePickup}
                            disabled={!account.fingerprintRegistered || account.balance < 10}
                            className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-5 rounded-2xl font-bold text-lg hover:from-blue-600 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                            <MapPin className="w-6 h-6" />
                            Start Journey
                        </button>

                        {/* Instructions */}
                        <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                            <p className="text-sm font-semibold text-blue-900 mb-3">How it works:</p>
                            <div className="space-y-2">
                                {[
                                    'Verify fingerprint at pickup point',
                                    'GPS tracks your journey automatically',
                                    'Verify fingerprint at drop point',
                                    'Fare deducted from wallet instantly'
                                ].map((step, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                            {index + 1}
                                        </div>
                                        <p className="text-sm text-blue-800">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Pickup Verification */}
                {tripState === 'pickup' && (
                    <div className="space-y-6">
                        <FingerprintScanner
                            title="Verify Pickup"
                            subtitle="Place your finger on the scanner"
                            onVerify={handlePickupVerification}
                            verifying={verifyingFingerprint}
                        />
                    </div>
                )}

                {/* Ongoing Trip */}
                {tripState === 'ongoing' && currentTrip && (
                    <div className="space-y-6">
                        {/* Trip Status */}
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 shadow-lg text-white">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-xl">
                                        <CheckCircle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-green-100 text-sm">Trip Status</p>
                                        <p className="text-xl font-bold">In Progress</p>
                                    </div>
                                </div>
                                <div className="animate-pulse">
                                    <div className="w-3 h-3 bg-white rounded-full"></div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-green-100">
                                <Clock className="w-4 h-4" />
                                <span>Started at {currentTrip.pickupTime}</span>
                            </div>
                        </div>

                        {/* GPS Tracking Visualization */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-gray-800">GPS Tracking</h3>
                                <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-xs font-semibold text-green-700">Active</span>
                                </div>
                            </div>

                            {/* Map Placeholder or Real GPS Info */}
                            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl mb-4 p-4 border-2 border-blue-100">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${gpsStatus === 'locked' ? 'bg-green-500 animate-pulse' :
                                            gpsStatus === 'searching' ? 'bg-yellow-500 animate-bounce' :
                                                gpsStatus === 'error' ? 'bg-red-500' : 'bg-blue-400'
                                            }`}></div>
                                        <span className="font-semibold text-gray-700">
                                            {gpsStatus === 'locked' ? 'GPS Signal Locked' :
                                                gpsStatus === 'searching' ? 'Searching for Satellite...' :
                                                    gpsStatus === 'error' ? 'GPS Signal Lost' :
                                                        'GPS Simulation Mode'}
                                        </span>
                                    </div>

                                    {/* Toggle for Testing */}
                                    <button
                                        onClick={() => setUseRealGps(!useRealGps)}
                                        className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-gray-600 font-medium"
                                    >
                                        Switch to {useRealGps ? 'Simulation' : 'Real GPS'}
                                    </button>
                                </div>

                                {useRealGps && lastPosition && (
                                    <div className="font-mono text-xs text-gray-500 mb-2">
                                        Lat: {lastPosition.lat.toFixed(6)} <br />
                                        Lng: {lastPosition.lng.toFixed(6)}
                                    </div>
                                )}

                                <div className="aspect-video bg-blue-100/50 rounded-lg flex items-center justify-center relative overflow-hidden">
                                    {/* Simple Grid Animation */}
                                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

                                    <div className="relative z-10 text-center">
                                        <Navigation className={`w-12 h-12 text-blue-600 mx-auto mb-2 ${tripState === 'ongoing' ? 'animate-bounce' : ''}`} />
                                        <p className="text-sm font-semibold text-blue-700">
                                            {useRealGps ? 'Tracking Live Coordinates' : 'Simulating Route...'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Route Info */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                                    <MapPin className="w-5 h-5 text-blue-600" />
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500">Pickup</p>
                                        <p className="text-sm font-semibold text-gray-800">{currentTrip.pickupLocation}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <MapPin className="w-5 h-5 text-gray-400" />
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500">Drop (Destination)</p>
                                        <p className="text-sm font-semibold text-gray-800">Tracking...</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Live Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
                                <div className="flex items-center gap-3 mb-2">
                                    <Navigation className="w-5 h-5 text-blue-600" />
                                    <p className="text-xs text-gray-500">Distance</p>
                                </div>
                                <p className="text-2xl font-bold text-gray-800">{currentTrip.distance} km</p>
                            </div>
                            <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
                                <div className="flex items-center gap-3 mb-2">
                                    <Zap className="w-5 h-5 text-amber-600" />
                                    <p className="text-xs text-gray-500">Est. Fare</p>
                                </div>
                                <p className="text-2xl font-bold text-amber-600">₹{currentTrip.estimatedFare}</p>
                            </div>
                        </div>

                        {/* End Trip Button */}
                        <button
                            onClick={initiateDrop}
                            className="w-full bg-gradient-to-r from-red-500 to-red-700 text-white py-5 rounded-2xl font-bold text-lg hover:from-red-600 hover:to-red-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                        >
                            <Fingerprint className="w-6 h-6" />
                            End Journey
                        </button>
                    </div>
                )}

                {/* Drop Verification */}
                {tripState === 'drop' && currentTrip && (
                    <div className="space-y-6">
                        {/* Trip Summary */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-4">Trip Summary</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Distance Travelled</span>
                                    <span className="font-semibold text-gray-800">{currentTrip.distance} km</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Duration</span>
                                    <span className="font-semibold text-gray-800">
                                        {currentTrip.pickupTime} - Now
                                    </span>
                                </div>
                                <div className="pt-3 border-t border-gray-200 flex justify-between">
                                    <span className="font-semibold text-gray-800">Total Fare</span>
                                    <span className="text-2xl font-bold text-blue-600">₹{currentTrip.estimatedFare}</span>
                                </div>
                            </div>
                        </div>

                        <FingerprintScanner
                            title="Verify Drop"
                            subtitle="Place your finger on the scanner to complete trip"
                            onVerify={handleDropVerification}
                            verifying={verifyingFingerprint}
                        />
                    </div>
                )}

                {/* Completed Trip */}
                {tripState === 'completed' && currentTrip && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4 animate-bounce">
                                <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Trip Completed!</h3>
                            <p className="text-gray-500 mb-6">Thank you for traveling with us</p>

                            {/* Final Summary */}
                            <div className="bg-gray-50 rounded-xl p-6 mb-6">
                                <div className="space-y-3 text-left">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">Distance</span>
                                        <span className="font-semibold text-gray-800">{currentTrip.distance} km</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">Fare Deducted</span>
                                        <span className="font-semibold text-red-600">-₹{currentTrip.actualFare}</span>
                                    </div>
                                    <div className="pt-3 border-t border-gray-200 flex justify-between">
                                        <span className="font-semibold text-gray-800">New Balance</span>
                                        <span className="text-xl font-bold text-green-600">
                                            ₹{account.balance - (currentTrip.actualFare || 0)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-gray-400">Redirecting to dashboard...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Fingerprint Scanner Component
const FingerprintScanner: React.FC<{
    title: string;
    subtitle: string;
    onVerify: () => void;
    verifying: boolean;
}> = ({ title, subtitle, onVerify, verifying }) => {
    return (
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
            <p className="text-gray-500 mb-8">{subtitle}</p>

            {/* Fingerprint Animation */}
            <div className="relative inline-block mb-8">
                <div className={`w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center ${verifying ? 'animate-pulse' : ''
                    }`}>
                    <Fingerprint className="w-16 h-16 text-white" />
                </div>
                {verifying && (
                    <>
                        <div className="absolute inset-0 border-4 border-blue-400 rounded-full animate-ping"></div>
                        <div className="absolute inset-0 border-4 border-blue-300 rounded-full animate-pulse"></div>
                    </>
                )}
            </div>

            {verifying ? (
                <div className="space-y-2">
                    <p className="font-semibold text-blue-600">Verifying...</p>
                    <p className="text-sm text-gray-400">Please wait</p>
                </div>
            ) : (
                <button
                    onClick={onVerify}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-4 rounded-xl font-bold hover:from-blue-600 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
                >
                    Scan Fingerprint
                </button>
            )}
        </div>
    );
};

export default Travel;
