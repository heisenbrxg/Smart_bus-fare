import { WalletAccount, Transaction } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:3001');

// API Response Types
interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
}

interface UserData {
    userId: string;
    name: string;
    phone: string;
    email?: string;
    balance: number;
    fingerprintRegistered: boolean;
    fingerprintId?: string;
    status: string;
    createdAt?: string;
    updatedAt?: string;
}

interface FingerprintCaptureResponse {
    fingerprintId: string;
    quality: number;
    captureTime: string;
}

interface FingerprintVerifyResponse {
    matched: boolean;
    score: number;
    user: {
        userId: string;
        name: string;
        balance: number;
    };
}

class ApiService {
    // User Management APIs

    async registerUser(userData: {
        userId: string;
        name: string;
        phone: string;
        password?: string;
        email?: string;
        balance?: number;
    }): Promise<ApiResponse<UserData>> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            return await response.json();
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Registration failed'
            };
        }
    }

    async getUser(userId: string): Promise<ApiResponse<UserData>> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/users/${userId}`);
            return await response.json();
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch user'
            };
        }
    }

    async getAllUsers(): Promise<ApiResponse<UserData[]>> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/users`);
            return await response.json();
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch users'
            };
        }
    }

    async updateUser(userId: string, updates: Partial<UserData>): Promise<ApiResponse<UserData>> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            return await response.json();
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update user'
            };
        }
    }

    async rechargeWallet(userId: string, amount: number): Promise<ApiResponse<any>> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/users/${userId}/recharge`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount })
            });
            return await response.json();
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Recharge failed'
            };
        }
    }

    async deductFromWallet(userId: string, amount: number): Promise<ApiResponse<any>> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/users/${userId}/deduct`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount })
            });
            return await response.json();
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Deduction failed'
            };
        }
    }

    // Fingerprint Management APIs

    async captureFingerprint(userId: string): Promise<ApiResponse<FingerprintCaptureResponse>> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/fingerprint/capture`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });
            return await response.json();
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Fingerprint capture failed'
            };
        }
    }

    async verifyFingerprint(userId: string): Promise<ApiResponse<FingerprintVerifyResponse>> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/fingerprint/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });
            return await response.json();
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Fingerprint verification failed'
            };
        }
    }

    async getUserFingerprints(userId: string): Promise<ApiResponse<any[]>> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/fingerprint/user/${userId}`);
            return await response.json();
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch fingerprints'
            };
        }
    }

    async getDeviceInfo(): Promise<ApiResponse<any>> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/fingerprint/device-info`);
            return await response.json();
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get device info'
            };
        }
    }

    async deleteFingerprint(fingerprintId: string): Promise<ApiResponse<any>> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/fingerprint/${fingerprintId}`, {
                method: 'DELETE'
            });
            return await response.json();
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to delete fingerprint'
            };
        }
    }

    async scanBus(userId: string, locationIndex?: number, latitude?: number, longitude?: number, accuracy?: number): Promise<ApiResponse<any>> {
        try {
            const body: any = { userId };
            if (locationIndex !== undefined) body.locationIndex = locationIndex;
            if (latitude !== undefined) body.latitude = latitude;
            if (longitude !== undefined) body.longitude = longitude;
            if (accuracy !== undefined) body.accuracy = accuracy;

            const response = await fetch(`${API_BASE_URL}/api/bus/scan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            return await response.json();
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Bus scan failed'
            };
        }
    }

    // System APIs

    async checkHealth(): Promise<ApiResponse<any>> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/health`);
            return await response.json();
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Health check failed'
            };
        }
    }

    // Helper function to convert backend user data to frontend WalletAccount format
    convertToWalletAccount(userData: UserData, transactions: Transaction[] = []): WalletAccount {
        return {
            userId: userData.userId,
            fullName: userData.name,
            phone: userData.phone,
            balance: userData.balance,
            fingerprintRegistered: userData.fingerprintRegistered,
            transactions: transactions
        };
    }

    // Login with backend verification
    async login(userId: string, password?: string): Promise<ApiResponse<WalletAccount>> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, password })
            });

            const result = await response.json();

            if (!result.success || !result.data) {
                return {
                    success: false,
                    error: result.message || 'Login failed'
                };
            }

            // Convert to WalletAccount format
            const walletAccount = this.convertToWalletAccount(result.data);

            return {
                success: true,
                data: walletAccount
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Login failed'
            };
        }
    }

    // Login with fingerprint verification
    async loginWithFingerprint(userId: string): Promise<ApiResponse<WalletAccount>> {
        try {
            // Verify fingerprint
            const verifyResponse = await this.verifyFingerprint(userId);

            if (!verifyResponse.success || !verifyResponse.data?.matched) {
                return {
                    success: false,
                    error: 'Fingerprint verification failed'
                };
            }

            // Get full user data
            const userResponse = await this.getUser(userId);

            if (!userResponse.success || !userResponse.data) {
                return {
                    success: false,
                    error: 'User not found'
                };
            }

            // Convert to WalletAccount format
            const walletAccount = this.convertToWalletAccount(userResponse.data);

            return {
                success: true,
                data: walletAccount
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Fingerprint login failed'
            };
        }
    }
}

export const api = new ApiService();
export default api;
