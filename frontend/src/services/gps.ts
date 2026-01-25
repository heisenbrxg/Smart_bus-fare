
export interface GPSCoordinates {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
}

export interface TripGPSData {
    from_latitude: number | null;
    from_longitude: number | null;
    to_latitude: number | null;
    to_longitude: number | null;
    distance_km?: number;
}

export interface GPSError {
    code: number;
    message: string;
}

class GPSService {
    private static instance: GPSService;
    private watchId: number | null = null;

    // High accuracy options strictly for better results
    private options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    };

    private constructor() { }

    public static getInstance(): GPSService {
        if (!GPSService.instance) {
            GPSService.instance = new GPSService();
        }
        return GPSService.instance;
    }

    /**
     * generic wrapper for getCurrentPosition
     */
    public getCurrentPosition(): Promise<GPSCoordinates> {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject({ code: 0, message: "Geolocation is not supported by this browser." });
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        timestamp: position.timestamp
                    });
                },
                (error) => {
                    let errorMessage = "Unknown GPS error";
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = "User denied the request for Geolocation.";
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = "Location information is unavailable.";
                            break;
                        case error.TIMEOUT:
                            errorMessage = "The request to get user location timed out.";
                            break;
                    }
                    console.error(`GPS Error: ${errorMessage}`, error);
                    reject({ code: error.code, message: errorMessage });
                },
                this.options
            );
        });
    }

    /**
     * Captures the boarding (start) location
     */
    public async captureStart(): Promise<Partial<TripGPSData>> {
        try {
            const coords = await this.getCurrentPosition();
            // Basic validation or accuracy check could go here
            if (coords.accuracy > 100) {
                console.warn(`Warning: GPS accuracy is low (${coords.accuracy}m)`);
            }

            return {
                from_latitude: coords.latitude,
                from_longitude: coords.longitude
            };
        } catch (error) {
            console.error("Failed to capture start location", error);
            throw error;
        }
    }

    /**
     * Captures the drop (end) location
     */
    public async captureEnd(): Promise<Partial<TripGPSData>> {
        try {
            const coords = await this.getCurrentPosition();

            return {
                to_latitude: coords.latitude,
                to_longitude: coords.longitude
            };
        } catch (error) {
            console.error("Failed to capture end location", error);
            throw error;
        }
    }

    /**
     * Calculate distance between two points in km (Haversine formula)
     */
    public calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Radius of the earth in km
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return Number(d.toFixed(2));
    }

    private deg2rad(deg: number): number {
        return deg * (Math.PI / 180);
    }
}

export const gpsService = GPSService.getInstance();

/**
 * Sample Output Format (JSON)
 * 
 * {
 *   "trip_id": "T12345",
 *   "gps_data": {
 *     "from_latitude": 8.16913,
 *     "from_longitude": 77.42065,
 *     "to_latitude": 8.17500,
 *     "to_longitude": 77.43000,
 *     "accuracy_start": 12.5,
 *     "accuracy_end": 10.2
 *   },
 *   "status": "completed"
 * }
 */
