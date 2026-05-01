#!/usr/bin/env node
import dotenv from 'dotenv';
import sheetsService from '../src/services/sheetsService.js';

dotenv.config();

async function cleanAndPopulate() {
  try {
    console.log('=== Cleaning and Repopulating Users ===\n');
    
    await sheetsService.initialize();
    const sheet = await sheetsService.getOrCreateSheet('Utilisateurs');
    await sheet.loadHeaderRow();
    
    // Delete all existing rows
    console.log('Deleting existing rows...');
    let rows = await sheet.getRows();
    for (const row of rows) {
      await row.delete();
    }
    console.log(`✅ Deleted ${rows.length} rows\n`);
    
    // Add fresh test users
    const testUsers = [
      { id: '1', firstName: 'Jean', lastName: 'Dupont', email: 'jean.dupont@example.com' },
      { id: '2', firstName: 'Marie', lastName: 'Martin', email: 'marie.martin@example.com' },
      { id: '3', firstName: 'Pierre', lastName: 'Bernard', email: 'pierre.bernard@example.com' },
      { id: '4', firstName: 'Sophie', lastName: 'Dupuis', email: 'sophie.dupuis@example.com' },
      { id: '5', firstName: 'Luc', lastName: 'Francois', email: 'luc.francois@example.com' }
    ];
    
    console.log('Adding 5 test users...');
    for (const user of testUsers) {
      await sheetsService.addUser(user);
      console.log(`✅ Added: ${user.id} - ${user.firstName} ${user.lastName}`);
    }
    
    console.log('\n=== Verification ===\n');
    rows = await sheet.getRows();
    console.log(`Total rows now: ${rows.length}\n`);
    
    rows.forEach((row, i) => {
      const id = row.get('Id');
      const prenom = row.get('Prénom');
      const nom = row.get('Nom');
      console.log(`${i + 1}. ID="${id}" - ${prenom} ${nom}`);
    });
    
    console.log('\n=== Testing getUserData() ===');
    for (let i = 1; i <= 5; i++) {
      const user = await sheetsService.getUserData(String(i));
      console.log(`getUserData("${i}"):`, user ? `✅ ${user.firstName} ${user.lastName}` : '❌ NULL');
    }
    
    console.log('\nDone!');
    process.exit(0);
  } catch (err) {
    console.error('Failed:', err);
    process.exit(1);
  }
}

cleanAndPopulate();
