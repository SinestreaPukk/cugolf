import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const DB_FILE = path.join(process.cwd(), 'data', 'db.json');
const storagePrefix = `${supabaseUrl}/storage/v1/object/public/uploads/`;

function convertPath(val: string): string {
  if (val && val.startsWith('/uploads/')) {
    return storagePrefix + val.substring('/uploads/'.length);
  }
  return val;
}

async function run() {
  if (!fs.existsSync(DB_FILE)) {
    console.error('db.json not found.');
    return;
  }

  console.log('Loading local db.json...');
  const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));

  // 1. Process local db.json arrays
  const collections = ['news', 'roster', 'staff', 'scores', 'gallery', 'sponsors'];
  for (const collName of collections) {
    if (db[collName] && Array.isArray(db[collName])) {
      console.log(`Processing local ${collName}...`);
      db[collName] = db[collName].map((item: any) => {
        if (item.imageUrl) {
          item.imageUrl = convertPath(item.imageUrl);
        }
        return item;
      });

      // Update Supabase DB for this collection
      console.log(`Updating Supabase table ${collName}...`);
      for (const item of db[collName]) {
        const { error } = await supabase
          .from(collName)
          .update({ imageUrl: item.imageUrl })
          .eq('id', item.id);
        if (error) {
          console.error(`Error updating ${collName} id ${item.id}:`, error.message);
        }
      }
    }
  }

  // 2. Process local db.json site configs
  const configs = ['welcomeSection', 'upcomingActivity', 'siteSettings', 'siteLabels', 'clubActivity', 'homeSponsorSection'];
  for (const configName of configs) {
    if (db[configName]) {
      console.log(`Processing local config ${configName}...`);
      const val = db[configName];
      
      // Update image URLs inside config object
      if (val.imageUrl) val.imageUrl = convertPath(val.imageUrl);
      if (val.heroImageUrl) val.heroImageUrl = convertPath(val.heroImageUrl);
      if (val.captainImageUrl) val.captainImageUrl = convertPath(val.captainImageUrl);

      // Update Supabase DB for this config
      const dbKey = configName.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      console.log(`Updating Supabase site_config key ${dbKey}...`);
      const { error } = await supabase
        .from('site_config')
        .update({ data: val })
        .eq('key', dbKey);
      if (error) {
        console.error(`Error updating site_config ${dbKey}:`, error.message);
      }
    }
  }

  // 3. Write back the updated local db.json
  console.log('Writing updated db.json...');
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');

  console.log('Update complete!');
}

run().catch(err => {
  console.error('Migration run crashed:', err);
});
