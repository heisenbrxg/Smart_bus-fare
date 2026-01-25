const axios = require('axios');
require('dotenv').config();

class FingerprintScannerService {
    constructor() {
        this.baseURL = process.env.FINGERPRINT_SCANNER_URL;
        this.timeout = 30000; // 30 seconds timeout
    }

    /**
     * Capture fingerprint from the scanner device
     * @returns {Promise<Object>} Fingerprint data
     */
    async captureFingerprint() {
        try {
            console.log('🔄 Checking Scanner Status...');

            // 1. Check Device Info / Status first to see if it responds to anything
            try {
                // Try standard RD Service info endpoint (POST /info is common, or device info)
                // We use a short timeout just to check connectivity
                await axios.post(`${this.baseURL}/info`, {}, { timeout: 2000 }).catch(() => { });
            } catch (e) { /* ignore */ }

            // 2. Prepare Capture XML (Standard RD Service 2.0)
            const pidOptions = `<PidOptions ver="1.0">
                <Opts fCount="1" fType="2" iCount="0" pCount="0" format="0" pidVer="2.0" timeout="10000" env="P" />
            </PidOptions>`;

            console.log('📸 Sending Capture Command to Port 11100...');

            let response;

            try {
                // Try CAPTURE method first (Standard)
                response = await axios({
                    method: 'CAPTURE',
                    url: this.baseURL,
                    data: pidOptions,
                    headers: { 'Content-Type': 'text/xml' },
                    timeout: 15000 // 15s timeout
                });
            } catch (err) {
                console.log(`⚠️ CAPTURE method failed (${err.message}), trying POST...`);
                // Fallback to POST
                response = await axios({
                    method: 'POST',
                    url: this.baseURL,
                    data: pidOptions,
                    headers: { 'Content-Type': 'text/xml' },
                    timeout: 15000
                });
            }

            console.log('✅ Scanner Responded!');
            // Log a snippet of the response for debugging
            if (response.data) {
                const preview = typeof response.data === 'string' ? response.data.substring(0, 200) : JSON.stringify(response.data);
                console.log('Raw Response:', preview + '...');
            }

            // 3. Parse XML Response
            const xml = response.data;

            // Check validation errors in XML
            // A success usually has errCode="0"
            if (xml.includes('errCode="0"')) {
                // Success! Extract Template
                const pidDataMatch = xml.match(/<Data[^>]*>([^<]+)<\/Data>/);
                const template = pidDataMatch ? pidDataMatch[1] : null;

                if (template) {
                    return {
                        success: true,
                        data: {
                            fingerprintData: "Fingerprint Captured",
                            template: template,
                            quality: 60,
                            deviceInfo: {
                                deviceId: "Precision",
                                status: "Ready"
                            }
                        }
                    };
                }
            }

            // Extract Error Message
            const errInfoMatch = xml.match(/errInfo="([^"]*)"/);
            const errorMsg = errInfoMatch ? errInfoMatch[1] : 'Device Error (Non-zero error code)';

            return {
                success: false,
                error: `Scanner Error: ${errorMsg}`
            };

        } catch (error) {
            console.error('❌ Capture Failed:', error.message);

            if (error.code === 'ECONNREFUSED') {
                return {
                    success: false,
                    error: 'Scanner not found on server port. Is RD Service running?'
                };
            }

            return {
                success: false,
                error: error.message || 'Communication Error'
            };
        }
    }

    /**
     * Verify fingerprint against stored template
     * @param {string} capturedTemplate - Newly captured fingerprint template
     * @param {string} storedTemplate - Stored fingerprint template
     * @returns {Promise<Object>} Verification result
     */
    async verifyFingerprint(capturedTemplate, storedTemplate) {
        try {
            const response = await axios.post(
                `${this.baseURL}/verify`,
                {
                    template1: capturedTemplate,
                    template2: storedTemplate,
                    threshold: 70 // Matching threshold (0-100)
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    timeout: this.timeout
                }
            );

            if (response.data && response.data.ErrorCode === 0) {
                return {
                    success: true,
                    matched: response.data.Status === 'Matched',
                    score: response.data.Score || 0
                };
            } else {
                return {
                    success: false,
                    error: response.data.ErrorDescription || 'Verification failed'
                };
            }
        } catch (error) {
            console.error('Error verifying fingerprint:', error.message);
            return {
                success: false,
                error: error.message || 'Verification error'
            };
        }
    }

    /**
     * Get device information
     * @returns {Promise<Object>} Device info
     */
    async getDeviceInfo() {
        try {
            const response = await axios.get(
                `${this.baseURL}/info`,
                {
                    timeout: this.timeout
                }
            );

            if (response.data) {
                return {
                    success: true,
                    data: response.data
                };
            } else {
                return {
                    success: false,
                    error: 'Failed to get device info'
                };
            }
        } catch (error) {
            console.error('Error getting device info:', error.message);
            return {
                success: false,
                error: error.message || 'Device communication error'
            };
        }
    }
}

module.exports = new FingerprintScannerService();
