#!/usr/bin/env node
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import sheetsService from '../src/services/sheetsService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

async function addMissing() {
  try {
    console.log('Starting add-missing-ids...');
    const configPath = join(__dirname, '../../project-config.json');
    const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const users = cfg.testUsers || [];

    await sheetsService.initialize();
    const existing = await sheetsService.getAllUsers();
    const existingIds = new Set(existing.map(u => u.id).filter(Boolean));

    for (const u of users) {
      if (!existingIds.has(String(u.id))) {
        console.log(`Adding missing user row for Id ${u.id}: ${u.firstName} ${u.lastName}`);
        await sheetsService.addUser(u);
      } else {
        console.log(`User Id ${u.id} already exists, skipping`);
      }
    }

    const all = await sheetsService.getAllUsers();
    console.log(`Total rows after add: ${all.length}`);
    all.forEach((x,i)=> console.log(`${i+1}. ${x.id || 'N/A'} - ${x.firstName} ${x.lastName} (${x.email})`));

    process.exit(0);
  } catch (err) {
    console.error('add-missing-ids failed:', err);
    process.exit(1);
  }
}

addMissing();
