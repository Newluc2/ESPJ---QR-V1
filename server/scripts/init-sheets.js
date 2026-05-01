import dotenv from 'dotenv';
import sheetsService from '../src/services/sheetsService.js';

dotenv.config();

async function initializeSheets() {
  try {
    console.log('📊 Initializing Google Sheets...');

    // Initialize sheets service
    await sheetsService.initialize();

    // Create/ensure Utilisateurs sheet
    const usersSheet = await sheetsService.getOrCreateSheet('Utilisateurs');
    console.log('✅ Utilisateurs sheet created/verified');

    // Create/ensure Pointages sheet
    const attendanceSheet = await sheetsService.getOrCreateSheet('Pointages');
    console.log('✅ Pointages sheet created/verified');

    // Add sample users if sheet is empty
    const existingUsers = await sheetsService.getAllUsers();
    if (existingUsers.length === 0) {
      console.log('📝 Adding sample users...');
      const sampleUsers = [
        { id: '1', firstName: 'Jean', lastName: 'Dupont', email: 'jean@example.com', department: 'IT' },
        { id: '2', firstName: 'Marie', lastName: 'Martin', email: 'marie@example.com', department: 'HR' },
        { id: '3', firstName: 'Pierre', lastName: 'Bernard', email: 'pierre@example.com', department: 'Finance' }
      ];

      for (const user of sampleUsers) {
        await sheetsService.addUser(user);
      }
      console.log('✅ Sample users added');
    }

    console.log('🎉 Google Sheets initialization complete!');
  } catch (error) {
    console.error('❌ Error initializing sheets:', error);
    process.exit(1);
  }
}

initializeSheets();
