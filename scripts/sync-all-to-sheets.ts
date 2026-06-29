import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("❌ Missing Supabase environment variables in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const yearMapping: Record<string, string> = {
  "Year 1": "ปี 1",
  "Year 2": "ปี 2",
  "Year 3": "ปี 3",
  "Year 4": "ปี 4",
  "Year 5": "ปี 5",
  "Year 6": "ปี 6"
};

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

  console.log(`🚀 Found ${members.length} members. Syncing to Google Sheets via Form Response...`);

  let count = 0;
  for (const member of members) {
    try {
      const mappedYear = yearMapping[member.year] || member.year || "ปี 1";
      const formUrl = "https://docs.google.com/forms/d/e/1FAIpQLSdaKMAAJw0pSaf7k9atDaUiuws7zpuYg6-903oI2qt2Qk4UIg/formResponse";
      
      const formParams = new URLSearchParams();
      formParams.append("entry.1176826944", member.name);
      formParams.append("entry.388278079", member.faculty || "—");
      formParams.append("entry.376007304", mappedYear);
      formParams.append("entry.121611115", member.student_id);
      formParams.append("entry.717576877", "—");
      formParams.append("entry.626226461", "—");
      formParams.append("entry.959057401", "Synced from Membership App");
      formParams.append("entry.327757806", "เข้าแล้ว");

      const response = await fetch(formUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formParams.toString()
      });

      if (response.status === 401) {
        console.error("❌ Sync failed (401 Unauthorized). Please turn off 'Restrict to users in Chulalongkorn University' in the Google Form settings.");
        process.exit(1);
      } else if (response.ok) {
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
