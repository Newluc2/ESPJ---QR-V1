#!/usr/bin/env node
import dotenv from 'dotenv';
import sheetsService from '../src/services/sheetsService.js';

dotenv.config();

async function cleanAttendance() {
  try {
    console.log('=== Cleaning Attendance Records ===\n');
    
    await sheetsService.initialize();
    const sheet = await sheetsService.getOrCreateSheet('Pointages');
    await sheet.loadHeaderRow();
    
    let rows = await sheet.getRows();
    console.log(`Deleting ${rows.length} attendance records...`);
    
    for (const row of rows) {
      await row.delete();
    }
    
    console.log('✅ Cleaned!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

cleanAttendance();
