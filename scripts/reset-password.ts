/**
 * Force-reset a user's password using the Supabase service role key.
 * No email required.
 *
 * Usage:
 *   npx tsx scripts/reset-password.ts <email> <new-password>
 *
 * Example:
 *   npx tsx scripts/reset-password.ts admin@cugolfclub.com cugolfx2026
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const [, , email, newPassword] = process.argv;

if (!email || !newPassword) {
  console.error("Usage: npx tsx scripts/reset-password.ts <email> <new-password>");
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
  // Find user by email
  const { data: list, error: listError } = await admin.auth.admin.listUsers();
  if (listError) {
    console.error("Failed to list users:", listError.message);
    process.exit(1);
  }

  const user = list.users.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());
  if (!user) {
    console.error(`No user found with email: ${email}`);
    process.exit(1);
  }

  // Force-update the password
  const { error } = await admin.auth.admin.updateUserById(user.id, {
    password: newPassword,
    email_confirm: true
  });

  if (error) {
    console.error("Failed to reset password:", error.message);
    process.exit(1);
  }

  console.log(`✅ Password for ${email} has been reset successfully.`);
  console.log(`   You can now log in with the new password.`);
}

run();
