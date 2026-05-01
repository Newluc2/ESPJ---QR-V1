#!/usr/bin/env node
import dotenv from 'dotenv';
import sheetsService from '../src/services/sheetsService.js';

dotenv.config();

async function inspect() {
  try {
    await sheetsService.initialize();
    const sheet = await sheetsService.getOrCreateSheet('Utilisateurs');
    await sheet.loadHeaderRow();
    console.log('Header values:', sheet.headerValues);
    const rows = await sheet.getRows();
    console.log('Row count:', rows.length);
    if (rows.length > 0) {
      const r = rows[0];
      console.log('First row raw keys:', Object.keys(r));
      console.log('First row get(ID):', r.get ? r.get('ID') : undefined);
      console.log('First row _rawData:', r._rawData || 'N/A');
    }
    process.exit(0);
  } catch (err) {
    console.error('inspect failed:', err);
    process.exit(1);
  }
}

inspect();
