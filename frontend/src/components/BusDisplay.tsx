import React, { useState, useEffect } from 'react';
import { Fingerprint, MapPin, Bus, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { gpsService } from '../services/gps';

const BusDisplay = () => {
    const [status, setStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [message, setMessage] = useState('Place Finger on Scanner');
    const [details, setDetails] = useState<any>(null);
    const [userId, setUserId] = useState('');
    const [locationIndex, setLocationIndex] = useState(0);

    const STOPS = ['Central Station', 'City Mall', 'Tech Park', 'University'];



    const handleScan = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!userId) return;

        setStatus('PROCESSING');
        setMessage('Acquiring GPS...');

        let lat: number | undefined;
        let lng: number | undefined;
        let acc: number | undefined;

        try {
            const gpsData = await gpsService.getCurrentPosition();
            lat = gpsData.latitude;
            lng = gpsData.longitude;
            acc = gpsData.accuracy;
        } catch (error) {
            console.warn('GPS signal lost or denied, falling back to simulation parameters.', error);
        }

        setMessage('Authenticating...');

        try {
            // Call Backend Bus Scan API
            const response = await api.scanBus(userId, locationIndex, lat, lng, acc);

            if (response.success) {
                setStatus('SUCCESS');
                setMessage((response as any).type === 'BOARDING' ? 'Trip Started' : 'Trip Completed');
                setDetails(response);

                // Reset after 5 seconds for next passenger
                setTimeout(() => {
                    setStatus('IDLE');
                    setMessage('Place Finger on Scanner');
                    setDetails(null);
                    setUserId('');
                }, 5000);
            } else {
                setStatus('ERROR');
                setMessage(response.error || 'Authentication Failed');
                // Extended timeout for reading error
                setTimeout(() => {
                    setStatus('IDLE');
                    setMessage('Place Finger on Scanner');
                }, 3000);
            }
        } catch (err) {
            setStatus('ERROR');
            setMessage('System Error');
            setTimeout(() => setStatus('IDLE'), 3000);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
            {/* Bus Header */}
            <div className="absolute top-0 left-0 right-0 bg-gray-800 p-4 flex justify-between items-center shadow-lg">
                <div className="flex items-center gap-3">
                    <Bus className="w-8 h-8 text-yellow-400" />
                    <div>
                        <h1 className="font-bold text-xl">SmartBus 101</h1>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <MapPin className="w-4 h-4" />
                            <span>Current Stop: <span className="text-white font-semibold">{STOPS[locationIndex]}</span></span>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-mono">{new Date().toLocaleTimeString()}</div>
                    <div className="text-xs text-gray-500">{new Date().toLocaleDateString()}</div>
                </div>
            </div>

            {/* Main Display Area */}
            <div className={`w-full max-w-lg aspect-square rounded-3xl flex flex-col items-center justify-center p-8 transition-all duration-500
                ${status === 'IDLE' ? 'bg-gray-800 border-4 border-gray-700' : ''}
                ${status === 'PROCESSING' ? 'bg-blue-900 border-4 border-blue-500 animate-pulse' : ''}
                ${status === 'SUCCESS' ? 'bg-green-900 border-4 border-green-500 scale-105 shadow-2xl shadow-green-900/50' : ''}
                ${status === 'ERROR' ? 'bg-red-900 border-4 border-red-500 shake' : ''}
            `}>

                {status === 'IDLE' && (
                    <>
                        <div className="w-40 h-40 rounded-full border-4 border-dashed border-gray-600 flex items-center justify-center mb-8 animate-pulse">
                            <Fingerprint className="w-24 h-24 text-gray-400" />
                        </div>
                        <h2 className="text-3xl font-bold mb-2 text-center text-gray-200">Place Finger</h2>
                        <p className="text-gray-500">Scan to Board or Exit</p>

                        {/* Simulation Input */}
                        <form onSubmit={handleScan} className="mt-8 w-full">
                            <input
                                type="text"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                placeholder="Enter User ID (Simulate Scan)"
                                className="w-full bg-gray-700 border-none rounded-xl py-3 px-4 text-center text-xl tracking-widest focus:ring-2 focus:ring-blue-500 outline-none"
                                autoFocus
                            />
                        </form>
                    </>
                )}

                {status === 'PROCESSING' && (
                    <>
                        <RefreshCw className="w-32 h-32 text-blue-400 animate-spin mb-6" />
                        <h2 className="text-3xl font-bold text-blue-200">Verifying...</h2>
                    </>
                )}

                {status === 'SUCCESS' && details && (
                    <>
                        <CheckCircle className="w-32 h-32 text-green-400 mb-6 drop-shadow-lg" />
                        <h2 className="text-4xl font-bold text-white mb-2">{details.message}</h2>
                        <p className="text-green-300 text-xl mb-6">{details.type === 'BOARDING' ? 'Enjoy your ride!' : 'Fare deducted successfully'}</p>

                        <div className="bg-black/30 rounded-xl p-6 w-full backdrop-blur-sm">
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-400">Location</span>
                                <span className="font-semibold">{details.location}</span>
                            </div>
                            {details.type === 'DROP' && (
                                <>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-gray-400">Distance</span>
                                        <span className="font-semibold">{details.distance}</span>
                                    </div>
                                    <div className="flex justify-between mb-2 border-t border-gray-600 pt-2">
                                        <span className="text-gray-400">Fare</span>
                                        <span className="font-bold text-2xl text-yellow-400">₹{details.fare}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Wallet Bal</span>
                                        <span className="font-semibold">₹{details.balance}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </>
                )}

                {status === 'ERROR' && (
                    <>
                        <AlertCircle className="w-32 h-32 text-red-400 mb-6" />
                        <h2 className="text-3xl font-bold text-white mb-4">Access Denied</h2>
                        <p className="text-red-200 text-center px-4">{message}</p>
                    </>
                )}
            </div>

            {/* Simulation Controls (Hidden in real device) */}
            <div className="fixed bottom-4 right-4 bg-gray-800 p-2 rounded-lg opacity-50 hover:opacity-100 transition-opacity">
                <p className="text-xs text-gray-500 mb-1">Bus Location Sim</p>
                <div className="flex gap-2">
                    {STOPS.map((stop, i) => (
                        <button
                            key={stop}
                            onClick={() => setLocationIndex(i)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                                ${locationIndex === i ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-400'}
                            `}
                            title={stop}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BusDisplay;
