#!/usr/bin/env node
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import sheetsService from '../src/services/sheetsService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

async function populate() {
  try {
    console.log('Starting populate-test-users...');
    const configPath = join(__dirname, '../../project-config.json');
    const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const users = cfg.testUsers || [];
    console.log(`Found ${users.length} test users in project-config.json`);

    await sheetsService.initialize();

    for (const u of users) {
      try {
        const res = await sheetsService.addUser(u);
        console.log(`Added user ${u.id} - ${u.firstName} ${u.lastName}:`, res.success ? 'OK' : `ERROR ${res.error}`);
      } catch (err) {
        console.error(`Error adding user ${u.id}:`, err.message || err);
      }
    }

    const all = await sheetsService.getAllUsers();
    console.log(`Total users now in sheet: ${all.length}`);
    all.forEach((x, i) => console.log(`${i+1}. ${x.id || 'N/A'} - ${x.firstName} ${x.lastName} (${x.email})`));

    console.log('populate-test-users done');
    process.exit(0);
  } catch (error) {
    console.error('populate-test-users failed:', error);
    process.exit(1);
  }
}

populate();
