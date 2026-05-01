#!/usr/bin/env node
import dotenv from 'dotenv';
import sheetsService from '../src/services/sheetsService.js';

dotenv.config();

async function diagnose() {
  try {
    console.log('=== Google Sheets Diagnostic ===\n');
    
    await sheetsService.initialize();
    const sheet = await sheetsService.getOrCreateSheet('Utilisateurs');
    await sheet.loadHeaderRow();
    
    console.log('Headers:', sheet.headerValues);
    console.log('\nFetching all rows...\n');
    
    const rows = await sheet.getRows();
    console.log(`Total rows: ${rows.length}\n`);
    
    rows.forEach((row, i) => {
      const id = row.get('Id') || row.Id || row['Id'];
      const prenom = row.get('Prénom') || row.Prénom || row['Prénom'];
      const nom = row.get('Nom') || row.Nom || row['Nom'];
      const email = row.get('Email') || row.Email || row['Email'];
      
      console.log(`Row ${i + 1}:`);
      console.log(`  Id: "${id}" (type: ${typeof id})`);
      console.log(`  Prénom: "${prenom}"`);
      console.log(`  Nom: "${nom}"`);
      console.log(`  Email: "${email}"`);
      console.log('');
    });
    
    console.log('\n=== Testing getUserData() ===');
    for (let i = 1; i <= 5; i++) {
      const user = await sheetsService.getUserData(String(i));
      console.log(`getUserData("${i}"):`, user || 'NULL');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Diagnostic failed:', err);
    process.exit(1);
  }
}

diagnose();
