/**
 * 🧪 CORS CONFIGURATION TEST SUITE
 * 
 * Run this script to verify your CORS configuration is working correctly.
 * 
 * Usage:
 *   node test-cors.js
 * 
 * Requirements:
 *   npm install axios colors
 */

import axios from 'axios';
import colors from 'colors';

// Configuration
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

const TEST_CASES = [
    {
        name: 'Allowed Origin - Main Frontend',
        origin: 'https://terravale-main.onrender.com',
        shouldPass: true,
    },
    {
        name: 'Allowed Origin - Admin Frontend',
        origin: 'https://terravale-admin.onrender.com',
        shouldPass: true,
    },
    {
        name: 'Allowed Origin - Labour Frontend',
        origin: 'https://terravale-labour.onrender.com',
        shouldPass: true,
    },
    {
        name: 'Allowed Origin - Localhost (Dev)',
        origin: 'http://localhost:5173',
        shouldPass: true,
    },
    {
        name: 'Blocked Origin - Evil Site',
        origin: 'https://evil-hacker-site.com',
        shouldPass: false,
    },
    {
        name: 'Blocked Origin - Similar Domain',
        origin: 'https://terravale-fake.onrender.com',
        shouldPass: false,
    },
    {
        name: 'Blocked Origin - Subdomain Attack',
        origin: 'https://evil.terravale-main.onrender.com',
        shouldPass: false,
    },
];

/**
 * Test a single CORS configuration
 */
async function testCORS(testCase) {
    try {
        const response = await axios({
            method: 'OPTIONS',
            url: `${BACKEND_URL}/api/users`,
            headers: {
                'Origin': testCase.origin,
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type,Authorization',
            },
            validateStatus: () => true, // Don't throw on any status
        });

        const allowedOrigin = response.headers['access-control-allow-origin'];
        const allowCredentials = response.headers['access-control-allow-credentials'];
        const allowMethods = response.headers['access-control-allow-methods'];

        const passed = testCase.shouldPass
            ? allowedOrigin === testCase.origin && allowCredentials === 'true'
            : !allowedOrigin || allowedOrigin !== testCase.origin;

        return {
            ...testCase,
            passed,
            response: {
                status: response.status,
                allowedOrigin,
                allowCredentials,
                allowMethods,
            },
        };
    } catch (error) {
        return {
            ...testCase,
            passed: !testCase.shouldPass, // If it errors, it should be a blocked origin
            error: error.message,
        };
    }
}

/**
 * Run all tests
 */
async function runTests() {
    console.log('\n' + '='.repeat(60).cyan);
    console.log('🧪 CORS CONFIGURATION TEST SUITE'.cyan.bold);
    console.log('='.repeat(60).cyan + '\n');

    console.log(`Testing backend: ${BACKEND_URL.yellow}\n`);

    let passedCount = 0;
    let failedCount = 0;

    for (const testCase of TEST_CASES) {
        const result = await testCORS(testCase);

        if (result.passed) {
            console.log(`✅ PASS`.green.bold + ` - ${result.name}`);
            if (result.response) {
                console.log(`   Origin: ${result.response.allowedOrigin || 'none'}`.gray);
                console.log(`   Credentials: ${result.response.allowCredentials || 'false'}`.gray);
            }
            passedCount++;
        } else {
            console.log(`❌ FAIL`.red.bold + ` - ${result.name}`);
            if (result.response) {
                console.log(`   Expected: ${testCase.shouldPass ? 'allowed' : 'blocked'}`.gray);
                console.log(`   Got: ${result.response.allowedOrigin ? 'allowed' : 'blocked'}`.gray);
                console.log(`   Origin: ${result.response.allowedOrigin || 'none'}`.gray);
            }
            if (result.error) {
                console.log(`   Error: ${result.error}`.gray);
            }
            failedCount++;
        }
        console.log('');
    }

    console.log('='.repeat(60).cyan);
    console.log(`Results: ${passedCount} passed`.green + `, ${failedCount} failed`.red);
    console.log('='.repeat(60).cyan + '\n');

    if (failedCount === 0) {
        console.log('🎉 All tests passed! Your CORS configuration is secure.'.green.bold);
    } else {
        console.log('⚠️  Some tests failed. Please review your CORS configuration.'.yellow.bold);
    }

    process.exit(failedCount > 0 ? 1 : 0);
}

/**
 * Test credentials handling
 */
async function testCredentials() {
    console.log('\n' + '='.repeat(60).cyan);
    console.log('🔐 CREDENTIALS TEST'.cyan.bold);
    console.log('='.repeat(60).cyan + '\n');

    try {
        const response = await axios({
            method: 'GET',
            url: `${BACKEND_URL}/api/profile`,
            headers: {
                'Origin': 'https://terravale-main.onrender.com',
                'Cookie': 'buyer_token=test123',
            },
            withCredentials: true,
            validateStatus: () => true,
        });

        const allowCredentials = response.headers['access-control-allow-credentials'];

        if (allowCredentials === 'true') {
            console.log('✅ Credentials are properly configured'.green);
            console.log(`   Access-Control-Allow-Credentials: ${allowCredentials}`.gray);
        } else {
            console.log('❌ Credentials are NOT properly configured'.red);
            console.log(`   Access-Control-Allow-Credentials: ${allowCredentials || 'missing'}`.gray);
        }
    } catch (error) {
        console.log('❌ Credentials test failed'.red);
        console.log(`   Error: ${error.message}`.gray);
    }

    console.log('');
}

/**
 * Main execution
 */
async function main() {
    console.log('\n🚀 Starting CORS tests...\n');

    // Check if backend is running
    try {
        await axios.get(BACKEND_URL, { timeout: 5000 });
    } catch (error) {
        console.error(`❌ Cannot connect to backend at ${BACKEND_URL}`.red.bold);
        console.error(`   Make sure your backend is running.`.yellow);
        process.exit(1);
    }

    await runTests();
    await testCredentials();
}

// Run tests
main().catch(error => {
    console.error('❌ Test suite error:'.red.bold, error.message);
    process.exit(1);
});
