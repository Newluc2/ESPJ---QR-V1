#!/usr/bin/env node
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import sheetsService from '../src/services/sheetsService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

async function fixIds() {
  try {
    console.log('Starting fix-user-ids...');
    const configPath = join(__dirname, '../../project-config.json');
    const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const users = cfg.testUsers || [];

    await sheetsService.initialize();
    const sheet = await sheetsService.getOrCreateSheet('Utilisateurs');
    await sheet.loadHeaderRow();
    const rows = await sheet.getRows();

    for (const u of users) {
      const match = rows.find(r => {
        const email = r.get('Email') || r.Email || r['Email'] || '';
        const first = r.get('Prénom') || r.Prénom || r['Prénom'] || '';
        const last = r.get('Nom') || r.Nom || r['Nom'] || '';
        return String(email).toLowerCase() === String(u.email).toLowerCase() ||
               (String(first).toLowerCase() === String(u.firstName).toLowerCase() && String(last).toLowerCase() === String(u.lastName).toLowerCase());
      });

      if (match) {
          console.log(`Setting Id ${u.id} for ${u.firstName} ${u.lastName} (row ${match._rowNumber})`);
          match['Id'] = u.id;
          await match.save();
          console.log(`Saved Id for row ${match._rowNumber}:`, match.get('Id'));
      } else {
        console.log(`No match found for ${u.firstName} ${u.lastName} (${u.email})`);
      }
    }

    const updatedRows = await sheet.getRows();
    console.log('Final users in sheet:');
    updatedRows.forEach((r, i) => {
      const id = r.get('Id') || r.get('ID') || r.Id || r.ID || r['Id'] || r['ID'] || 'N/A';
      console.log(`${i+1}. ${id} - ${r.get('Prénom')} ${r.get('Nom')} (${r.get('Email')})`);
    });

    console.log('fix-user-ids done');
    process.exit(0);
  } catch (err) {
    console.error('fix-user-ids failed:', err);
    process.exit(1);
  }
}

fixIds();
