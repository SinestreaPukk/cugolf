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
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

async function migrate() {
  if (!fs.existsSync(DB_FILE)) {
    console.error('db.json not found.');
    return;
  }

  const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));

  console.log('Starting migration...');

  // 1. Migrate Collections
  const collections = ['news', 'roster', 'staff', 'scores', 'gallery', 'sponsors'];
  for (const collectionName of collections) {
    if (db[collectionName] && Array.isArray(db[collectionName])) {
      console.log(`Migrating ${collectionName}...`);
      const { error } = await supabase.from(collectionName).upsert(db[collectionName]);
      if (error) console.error(`Error migrating ${collectionName}:`, error);
    }
  }

  // 2. Migrate Configs
  const configs = ['welcomeSection', 'upcomingActivity', 'siteSettings', 'siteLabels'];
  for (const configName of configs) {
    if (db[configName]) {
      console.log(`Migrating ${configName}...`);
      const { error } = await supabase.from('site_config').upsert({
        key: configName.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`),
        data: db[configName]
      });
      if (error) console.error(`Error migrating ${configName}:`, error);
    }
  }

  // 3. Migrate Local Images to Storage
  if (fs.existsSync(UPLOADS_DIR)) {
    console.log('Migrating local uploads to Supabase Storage...');
    const files = fs.readdirSync(UPLOADS_DIR);
    for (const file of files) {
      const filePath = path.join(UPLOADS_DIR, file);
      if (fs.statSync(filePath).isFile()) {
        const fileBuffer = fs.readFileSync(filePath);
        const { data, error } = await supabase.storage
          .from('uploads')
          .upload(file, fileBuffer, {
            contentType: 'image/' + path.extname(file).slice(1),
            upsert: true
          });
        
        if (error) {
          console.error(`Error uploading ${file}:`, error.message);
        } else {
          console.log(`Uploaded ${file}`);
        }
      }
    }
  }

  console.log('Migration complete!');
}

migrate();
