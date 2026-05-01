#!/usr/bin/env node
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

async function testAttendanceScenario() {
  try {
    console.log('=== Testing Attendance Scenario ===\n');
    
    const users = ['1', '2'];
    
    console.log('Step 1: Both users arrive');
    for (const userId of users) {
      const res = await axios.post(`${API_BASE}/attendance/register`, { userId });
      console.log(`  User ${userId}: ${res.data.type} at ${res.data.time} ✅`);
    }
    
    console.log('\nStep 2: Both users leave');
    for (const userId of users) {
      const res = await axios.post(`${API_BASE}/attendance/register`, { userId });
      console.log(`  User ${userId}: ${res.data.type} at ${res.data.time} ✅`);
    }
    
    console.log('\nStep 3: Both users come back (re-arrival)');
    for (const userId of users) {
      const res = await axios.post(`${API_BASE}/attendance/register`, { userId });
      console.log(`  User ${userId}: ${res.data.type} at ${res.data.time} ✅`);
    }
    
    console.log('\nStep 4: Verify attendance records');
    const sheetRes = await axios.get(`${API_BASE}/attendance/all-today`);
    console.log(`\nTotal attendance records for today: ${sheetRes.data.length}`);
    sheetRes.data.forEach((record, i) => {
      console.log(`${i + 1}. User ${record.userId}: ${record.firstName} ${record.lastName} - In: ${record.arrivalTime}, Out: ${record.departureTime}`);
    });
    
    console.log('\n✅ Test completed!');
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.error || error.message);
  }
  process.exit(0);
}

testAttendanceScenario();
