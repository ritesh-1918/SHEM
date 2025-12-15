/**
 * Test script for Peak Hours Detection API
 * Run with: node test-peakHours.js
 */

const BASE_URL = 'http://localhost:5000/api/peakHours';

async function testSetup() {
    console.log('\n=== Testing POST /api/peakHours/setup ===\n');

    const testCases = [
        { userId: 'user123', userState: 'Delhi', discountFlag: true, subsidyUnits: 150 },
        { userId: 'user456', userState: 'Maharashtra', discountFlag: false, subsidyUnits: 100 },
        { userId: 'user789', userState: 'Bangalore', discountFlag: true, subsidyUnits: 200 }
    ];

    for (const testCase of testCases) {
        console.log(`Testing setup for ${testCase.userState}...`);
        const startTime = Date.now();

        try {
            const response = await fetch(`${BASE_URL}/setup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testCase)
            });

            const data = await response.json();
            const responseTime = Date.now() - startTime;

            console.log(`  Status: ${response.status}`);
            console.log(`  Response Time: ${responseTime}ms ${responseTime < 200 ? '✓' : '✗ (>200ms)'}`);
            console.log(`  Peak Hours:`, JSON.stringify(data.peakHours));
            console.log(`  Off-Peak Hours:`, JSON.stringify(data.offPeakHours));
            console.log(`  Average Rate: ₹${data.averageRate}/unit`);
            console.log('');
        } catch (error) {
            console.error(`  Error: ${error.message}\n`);
        }
    }
}

async function testAnalyze() {
    console.log('\n=== Testing POST /api/peakHours/analyze ===\n');

    const testCases = [
        { userId: 'user123', currentConsumption: 1207, currentHour: 19, currentDayOfWeek: 1 },
        { userId: 'user123', currentConsumption: 500, currentHour: 3, currentDayOfWeek: 2 },
        { userId: 'user456', currentConsumption: 800, currentHour: 20, currentDayOfWeek: 0 }
    ];

    for (const testCase of testCases) {
        console.log(`Testing analyze for userId=${testCase.userId}, hour=${testCase.currentHour}...`);
        const startTime = Date.now();

        try {
            const response = await fetch(`${BASE_URL}/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testCase)
            });

            const data = await response.json();
            const responseTime = Date.now() - startTime;

            console.log(`  Status: ${response.status}`);
            console.log(`  Response Time: ${responseTime}ms ${responseTime < 200 ? '✓' : '✗ (>200ms)'}`);
            console.log(`  Is Peak Hour: ${data.isPeakHour}`);
            console.log(`  Current Rate: ₹${data.currentRate}/unit`);
            console.log(`  Current Cost: ${data.currentCost}`);
            console.log(`  Potential Savings:`, JSON.stringify(data.potentialSavings));
            console.log('');
        } catch (error) {
            console.error(`  Error: ${error.message}\n`);
        }
    }
}

async function testMonthlyForecast() {
    console.log('\n=== Testing POST /api/peakHours/monthlyForecast ===\n');

    const testCases = [
        { userId: 'user123', dailyAverageConsumption: 15 },
        { userId: 'user456', dailyAverageConsumption: 25 },
        { userId: 'user789', dailyAverageConsumption: 10 }
    ];

    for (const testCase of testCases) {
        console.log(`Testing forecast for userId=${testCase.userId}, daily=${testCase.dailyAverageConsumption} units...`);
        const startTime = Date.now();

        try {
            const response = await fetch(`${BASE_URL}/monthlyForecast`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testCase)
            });

            const data = await response.json();
            const responseTime = Date.now() - startTime;

            console.log(`  Status: ${response.status}`);
            console.log(`  Response Time: ${responseTime}ms ${responseTime < 200 ? '✓' : '✗ (>200ms)'}`);
            console.log(`  Monthly Consumption: ${data.monthlyConsumption}`);
            console.log(`  Current Month Cost: ${data.currentMonthCost}`);
            console.log(`  If Reduce Peak by 20%: ${data.ifReducePeakBy20}`);
            console.log(`  If Reduce Peak by 40%: ${data.ifReducePeakBy40}`);
            console.log(`  If Reduce Peak by 60%: ${data.ifReducePeakBy60}`);
            console.log(`  Subsidy Applied: ${data.subsidyApplied}`);
            console.log(`  Suggested Actions: ${data.suggestedActions?.slice(0, 2).join(', ')}...`);
            console.log('');
        } catch (error) {
            console.error(`  Error: ${error.message}\n`);
        }
    }
}

async function testErrorHandling() {
    console.log('\n=== Testing Error Handling ===\n');

    // Test invalid userId
    console.log('Testing missing userId...');
    try {
        const response = await fetch(`${BASE_URL}/setup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userState: 'Delhi' })
        });
        const data = await response.json();
        console.log(`  Status: ${response.status}, Error: ${data.error}\n`);
    } catch (error) {
        console.error(`  Error: ${error.message}\n`);
    }

    // Test invalid state
    console.log('Testing invalid state...');
    try {
        const response = await fetch(`${BASE_URL}/setup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: 'test', userState: 'InvalidState' })
        });
        const data = await response.json();
        console.log(`  Status: ${response.status}, Error: ${data.error}\n`);
    } catch (error) {
        console.error(`  Error: ${error.message}\n`);
    }

    // Test invalid hour
    console.log('Testing invalid hour...');
    try {
        const response = await fetch(`${BASE_URL}/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: 'user123', currentConsumption: 100, currentHour: 25, currentDayOfWeek: 1 })
        });
        const data = await response.json();
        console.log(`  Status: ${response.status}, Error: ${data.error}\n`);
    } catch (error) {
        console.error(`  Error: ${error.message}\n`);
    }
}

async function runAllTests() {
    console.log('=========================================');
    console.log('  Peak Hours Detection API Test Suite');
    console.log('=========================================');

    await testSetup();
    await testAnalyze();
    await testMonthlyForecast();
    await testErrorHandling();

    console.log('=========================================');
    console.log('  All Tests Completed!');
    console.log('=========================================');
}

runAllTests();
