const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
    console.log('\n' + '='.repeat(60));
    log(title, 'cyan');
    console.log('='.repeat(60));
}

async function testAPI() {
    try {
        logSection('🚀 Starting API Tests');

        // Test 1: Health Check
        logSection('Test 1: Health Check');
        try {
            const health = await axios.get(`${BASE_URL}/api/health`);
            log('✓ Health check passed', 'green');
            console.log(JSON.stringify(health.data, null, 2));
        } catch (error) {
            log('✗ Health check failed: ' + error.message, 'red');
        }

        // Test 2: Register User
        logSection('Test 2: Register New User');
        const testUser = {
            userId: 'TEST001',
            name: 'Test User',
            phone: '9999999999',
            email: 'test@example.com',
            balance: 1000
        };

        try {
            const registerResponse = await axios.post(`${BASE_URL}/api/users/register`, testUser);
            log('✓ User registered successfully', 'green');
            console.log(JSON.stringify(registerResponse.data, null, 2));
        } catch (error) {
            if (error.response?.data?.message?.includes('already exists')) {
                log('⚠ User already exists (expected if running multiple times)', 'yellow');
            } else {
                log('✗ User registration failed: ' + error.message, 'red');
            }
        }

        // Test 3: Get User
        logSection('Test 3: Get User Details');
        try {
            const userResponse = await axios.get(`${BASE_URL}/api/users/${testUser.userId}`);
            log('✓ User retrieved successfully', 'green');
            console.log(JSON.stringify(userResponse.data, null, 2));
        } catch (error) {
            log('✗ Get user failed: ' + error.message, 'red');
        }

        // Test 4: Get All Users
        logSection('Test 4: Get All Users');
        try {
            const allUsersResponse = await axios.get(`${BASE_URL}/api/users`);
            log(`✓ Retrieved ${allUsersResponse.data.count} users`, 'green');
            console.log(JSON.stringify(allUsersResponse.data, null, 2));
        } catch (error) {
            log('✗ Get all users failed: ' + error.message, 'red');
        }

        // Test 5: Wallet Recharge
        logSection('Test 5: Wallet Recharge');
        try {
            const rechargeResponse = await axios.post(
                `${BASE_URL}/api/users/${testUser.userId}/recharge`,
                { amount: 500 }
            );
            log('✓ Wallet recharged successfully', 'green');
            console.log(JSON.stringify(rechargeResponse.data, null, 2));
        } catch (error) {
            log('✗ Wallet recharge failed: ' + error.message, 'red');
        }

        // Test 6: Wallet Deduction
        logSection('Test 6: Wallet Deduction');
        try {
            const deductResponse = await axios.post(
                `${BASE_URL}/api/users/${testUser.userId}/deduct`,
                { amount: 50 }
            );
            log('✓ Amount deducted successfully', 'green');
            console.log(JSON.stringify(deductResponse.data, null, 2));
        } catch (error) {
            log('✗ Wallet deduction failed: ' + error.message, 'red');
        }

        // Test 7: Capture Fingerprint (This will fail if scanner is not connected)
        logSection('Test 7: Capture Fingerprint');
        log('⚠ This test requires a physical fingerprint scanner to be connected', 'yellow');
        try {
            const captureResponse = await axios.post(
                `${BASE_URL}/api/fingerprint/capture`,
                { userId: testUser.userId }
            );
            log('✓ Fingerprint captured successfully', 'green');
            console.log(JSON.stringify(captureResponse.data, null, 2));
        } catch (error) {
            log('✗ Fingerprint capture failed (expected without scanner): ' +
                (error.response?.data?.error || error.message), 'yellow');
        }

        // Test 8: Get Device Info (This will fail if scanner is not connected)
        logSection('Test 8: Get Scanner Device Info');
        log('⚠ This test requires a physical fingerprint scanner to be connected', 'yellow');
        try {
            const deviceResponse = await axios.get(`${BASE_URL}/api/fingerprint/device-info`);
            log('✓ Device info retrieved successfully', 'green');
            console.log(JSON.stringify(deviceResponse.data, null, 2));
        } catch (error) {
            log('✗ Get device info failed (expected without scanner): ' +
                (error.response?.data?.error || error.message), 'yellow');
        }

        // Test 9: Get User Fingerprints
        logSection('Test 9: Get User Fingerprints');
        try {
            const fingerprintsResponse = await axios.get(
                `${BASE_URL}/api/fingerprint/user/${testUser.userId}`
            );
            log(`✓ Retrieved ${fingerprintsResponse.data.count} fingerprints`, 'green');
            console.log(JSON.stringify(fingerprintsResponse.data, null, 2));
        } catch (error) {
            log('✗ Get fingerprints failed: ' + error.message, 'red');
        }

        logSection('✅ API Tests Completed');
        log('\nNote: Some tests may fail if the fingerprint scanner is not connected.', 'yellow');
        log('This is expected behavior. The database and user management tests should pass.', 'yellow');

    } catch (error) {
        log('\n❌ Test suite failed: ' + error.message, 'red');
        console.error(error);
    }
}

// Run tests
log('Starting API Test Suite...', 'blue');
log('Make sure the server is running on http://localhost:3001\n', 'yellow');

setTimeout(() => {
    testAPI().then(() => {
        log('\n🏁 Test suite finished', 'blue');
        process.exit(0);
    }).catch(error => {
        log('\n❌ Fatal error: ' + error.message, 'red');
        process.exit(1);
    });
}, 1000);
