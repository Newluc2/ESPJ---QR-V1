#!/usr/bin/env node
import dotenv from 'dotenv';
import sheetsService from '../src/services/sheetsService.js';

dotenv.config();

async function verifyData() {
  try {
    console.log('=== Verifying Attendance Data in Google Sheets ===\n');
    
    await sheetsService.initialize();
    const sheet = await sheetsService.getOrCreateSheet('Pointages');
    await sheet.loadHeaderRow();
    
    const rows = await sheet.getRows();
    console.log(`Total attendance records: ${rows.length}\n`);
    
    rows.forEach((row, i) => {
      const date = row.get('Date');
      const userId = row.get('ID Utilisateur');
      const firstName = row.get('Prénom');
      const lastName = row.get('Nom');
      const arrivalTime = row.get('Heure Arrivée');
      const departureTime = row.get('Heure Sortie');
      
      console.log(`${i + 1}. Date: ${date} | User ${userId} (${firstName} ${lastName}) | In: ${arrivalTime} | Out: ${departureTime}`);
    });
    
    console.log('\n✅ Verification complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

verifyData();
