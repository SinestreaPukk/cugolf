import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const sheetsWebhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("❌ Missing Supabase environment variables in .env");
  process.exit(1);
}

if (!sheetsWebhookUrl) {
  console.error("❌ GOOGLE_SHEETS_WEBHOOK_URL is not set in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function syncAllToSheets() {
  console.log("📡 Fetching registered members from Supabase...");
  
  const { data: members, error } = await supabase
    .from("members")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("❌ Error fetching members from Supabase:", error.message);
    process.exit(1);
  }

  if (!members || members.length === 0) {
    console.log("ℹ️ No registered members found in Supabase.");
    return;
  }

  console.log(`🚀 Found ${members.length} members. Syncing to Google Sheets...`);

  let count = 0;
  for (const member of members) {
    try {
      const response = await fetch(sheetsWebhookUrl!, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timestamp: member.created_at || new Date().toISOString(),
          id: member.id,
          name: member.name,
          email: member.email,
          studentId: member.student_id,
          year: member.year || "—",
          faculty: member.faculty || "—"
        })
      });

      if (response.ok) {
        console.log(`✅ Synced [${member.student_id}] ${member.name}`);
        count++;
      } else {
        console.warn(`⚠️ Failed to sync ${member.name}: Status ${response.status}`);
      }
    } catch (err: any) {
      console.error(`❌ Network error syncing ${member.name}:`, err.message);
    }
  }

  console.log(`\n🎉 Done! Successfully synchronized ${count} of ${members.length} members to Google Sheets.`);
}

syncAllToSheets();
