const axios = require('axios');

async function scanPorts() {
    console.log('🔍 Scanning for Fingerprint Scanner RD Service...');

    // Common ports for Indian RD Services (Precision, Mantra, Morpho, etc.)
    const ports = [11100, 11101, 11102, 11103, 11104, 11105];
    const paths = ['', '/rdm', '/capture', '/device', '/info'];

    let found = false;

    for (const port of ports) {
        console.log(`\nTesting Port ${port}...`);

        try {
            // Try simple connection first
            await axios.get(`http://localhost:${port}/`, { timeout: 1000 });
            console.log(`✅ Port ${port} is OPEN and responding!`);
            found = true;

            // Try to identify if it's the scanner
            try {
                const response = await axios.get(`http://localhost:${port}/rdm`, { timeout: 1000 });
                console.log(`   ➜ Endpoint '/rdm' exists. This looks like the Precision scanner!`);
            } catch (e) { /* ignore */ }

        } catch (error) {
            if (error.code === 'ECONNREFUSED') {
                console.log(`❌ Port ${port} is closed.`);
            } else {
                // If we get 404 or other errors, the port is OPEN but path might be wrong
                console.log(`⚠️ Port ${port} is OPEN but returned error: ${error.message}`);
                console.log(`   This is likely the scanner! Service is running.`);
                found = true;
            }
        }
    }

    console.log('\n----------------------------------------');
    if (found) {
        console.log('🎉 FOUND! Your scanner service is running.');
        console.log('Please check the logs above for the specific open port.');
    } else {
        console.log('❌ NO SCANNER FOUND on common ports (11100-11105).');
        console.log('Troubleshooting steps:');
        console.log('1. Ensure "Precision RD Service" is installed.');
        console.log('2. Check Windows Services (Run "services.msc") and ensuring the service is "Running".');
        console.log('3. Unplug and replug the USB scanner.');
    }
}

scanPorts();
