import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Initialize Supabase - with validation and production fallback
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "placeholder-key";

if (supabaseUrl === "https://placeholder.supabase.co") {
  console.warn("⚠️ WARNING: Supabase URL is missing in environment variables. Database operations will fail.");
}
if (!supabaseServiceRoleKey) {
  console.warn("⚠️ WARNING: SUPABASE_SERVICE_ROLE_KEY is not set. Member registration and admin auth operations will fail.");
}

// DB-only client — NEVER call supabase.auth.signInWithPassword() on this client.
// signInWithPassword stores the user JWT in the client's in-memory state, which
// then leaks into subsequent DB requests and causes RLS violations.
// Use signInDirect() for all login operations instead.
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey || supabaseAnonKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Dedicated admin client using service role key — required for auth.admin.* operations
const supabaseAdmin = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  : null;

// Sign in via direct HTTP — no shared client state is modified, eliminating
// the session-pollution that caused RLS violations on concurrent requests.
async function signInDirect(email: string, password: string): Promise<{
  access_token: string;
  user: { id: string; email: string; user_metadata: Record<string, unknown> };
} | { error: string }> {
  const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: supabaseAnonKey },
    body: JSON.stringify({ email, password })
  });
  const body = await res.json();
  if (!res.ok) return { error: body.error_description || body.error || "Invalid credentials" };
  return body;
}

async function getAdminEmails(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from("site_config")
      .select("data")
      .eq("key", "admin_emails")
      .single();

    if (error || !data || !data.data || !Array.isArray(data.data.emails)) {
      const envEmails = (process.env.ADMIN_EMAILS || "admin@cugolfclub.com")
        .split(",")
        .map(e => e.trim().toLowerCase())
        .filter(Boolean);

      await supabase.from("site_config").upsert({
        key: "admin_emails",
        data: { emails: envEmails },
        updated_at: new Date().toISOString()
      });
      return envEmails;
    }
    return data.data.emails;
  } catch (e) {
    return ["admin@cugolfclub.com"];
  }
}

// Initialize Gemini client conditionally if API key exists
const geminiApiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (geminiApiKey) {
  ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Serve static uploaded materials (Keep for backward compatibility during migration)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Health check — shows configuration status without exposing secrets
app.get("/api/health", async (req, res) => {
  const checks: Record<string, boolean | string> = {
    supabase_url: !!process.env.VITE_SUPABASE_URL,
    anon_key: !!(process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY),
    service_role_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    admin_client_ready: !!supabaseAdmin,
    google_sheets_webhook: !!process.env.GOOGLE_SHEETS_WEBHOOK_URL,
    app_url: process.env.APP_URL || "(not set — forgot-password redirect may be wrong)"
  };

  let db_columns = "untested";
  try {
    const { data, error } = await supabase.from("members").select("id, prefix, instagram, line_id").limit(1);
    db_columns = error ? `error: ${error.message}` : "ok (prefix, instagram, line_id exist)";
  } catch (e: any) {
    db_columns = `exception: ${e.message}`;
  }
  checks.db_columns = db_columns;

  const allOk = checks.supabase_url && checks.anon_key && checks.service_role_key && checks.admin_client_ready && db_columns === "ok (prefix, instagram, line_id exist)";
  res.status(allOk ? 200 : 500).json({ ok: allOk, checks });
});

// Photo upload endpoint - Updated to use Supabase Storage
app.post("/api/upload", async (req, res) => {
  const { filename, base64Data } = req.body;
  if (!filename || !base64Data) {
    return res.status(400).json({ success: false, message: "Missing filename or base64Data payload." });
  }

  try {
    // Strip out base64 prefix headers
    const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(cleanBase64, "base64");

    const ext = path.extname(filename).toLowerCase() || ".png";
    const baseName = path.basename(filename, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
    const uniqueFilename = `${baseName}-${Date.now()}${ext}`;

    // Normalize content type
    let contentType = `image/${ext.replace(".", "")}`;
    if (contentType === "image/jpg") contentType = "image/jpeg";

    const { data, error } = await supabase.storage
      .from("uploads")
      .upload(uniqueFilename, buffer, {
        contentType,
        upsert: true
      });

    if (error) {
      console.error("Supabase Storage error details:", error);
      throw new Error(`Supabase Storage: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from("uploads")
      .getPublicUrl(uniqueFilename);

    console.log(`Successfully uploaded ${uniqueFilename} to Supabase.`);
    res.json({ success: true, url: publicUrl });
  } catch (err: any) {
    console.error("Back-end image upload execution error:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to process image upload." });
  }
});


// REST endpoints for the Database Layer
app.get("/api/db", async (req, res) => {
  try {
    const collections = ["news", "roster", "staff", "scores", "gallery", "sponsors"];
    const results = await Promise.all(collections.map(c => supabase.from(c).select("*")));
    
    const db: any = {};
    collections.forEach((name, index) => {
      db[name] = results[index].data || [];
    });

    // Fetch site configs
    const { data: configs } = await supabase.from("site_config").select("*");
    if (configs) {
      configs.forEach(config => {
        const camelKey = config.key.replace(/_([a-z])/g, (_: any, letter: string) => letter.toUpperCase());
        db[camelKey] = config.data || {};
      });
    }

    // Default for homeSponsorSection if not set
    if (!db.homeSponsorSection || Object.keys(db.homeSponsorSection).length === 0) {
      db.homeSponsorSection = {
        title: "SUPPORTING EXCELLENCE",
        subtitle: "CORPORATE PARTNERSHIP",
        description: "Our sponsors provide the essential resources and infrastructure that empower our student athletes to compete at the highest collegiate level.",
        marqueeText: "PLATINUM PARTNERS • EQUIPMENT PROVIDERS • FACILITY AFFILIATES • OFFICIAL CLUB SPONSORS",
        imageUrl: "https://images.unsplash.com/photo-1593111774240-d529f52ee4de?auto=format&fit=crop&q=80&w=1200",
        buttonText: "LEARN MORE",
        buttonUrl: "/sponsors",
        showSection: true
      };
    }

    if (!db.clubActivity || Object.keys(db.clubActivity).length === 0) {
      db.clubActivity = {
        heroImageUrl: "https://svbrjzmhflraqbkgiczu.supabase.co/storage/v1/object/public/uploads/windsor_team_legacy.png",
        philosophyTitle: "OUR PHILOSOPHY",
        philosophyQuote: "More than just a sport, golf at Chulalongkorn is a vehicle for personal growth, discipline, and lifelong camaraderie.",
        philosophyDescription: "At CU Golf Club, we believe in the \"Pink Spirit\"—a unique blend of fierce competitive drive and absolute integrity. As Thailand's oldest university, our golf program carries the weight of a century-old tradition. We don't just produce athletes; we cultivate leaders who understand that peak performance on the green is rooted in humility, respect for the game, and support for one's teammates.",
        technicalExcellenceDescription: "We leverage modern analytics and professional coaching to ensure our squad remains at the forefront of collegiate golf. Our training focuses on precision, mental fortitude, and strategic course management, preparing students for the high-pressure environment of national championships.",
        captainName: "Sakditouch Pukkanasut",
        captainRole: "PRESIDENT & SQUAD CAPTAIN",
        captainImageUrl: "https://svbrjzmhflraqbkgiczu.supabase.co/storage/v1/object/public/uploads/Screenshot_2026-05-26_at_21_44_02-1779806963893.png",
        captainPhilosophy: "My primary goal for this season is to bridge the gap between our storied history and the modern competitive landscape. We are not just a club; we are a high-performance unit. We prioritize consistency over occasional brilliance. Every practice session is a step toward our goal of reclaiming the Varsity Championship title.\n\nUnity is our greatest asset. Whether you're a freshman or a senior, on the green, we are one Pink Squad.",
        competitions: [
          {
            id: "comp-1",
            title: "CHANG U. GOLF CHAMPIONSHIP",
            description: "The premier collegiate golf tournament in Thailand. CU Golf Club competes against the nation's top universities for the ultimate team trophy.",
            difficulty: "ELITE LEVEL"
          },
          {
            id: "comp-2",
            title: "THE UNIVERSITY GAMES OF THAILAND",
            description: "An annual multi-sport event where our representatives compete for individual and team gold medals in the Inthanin Games and beyond.",
            difficulty: "NATIONAL LEVEL"
          },
          {
            id: "comp-3",
            title: "CHULALYMPICS GOLF",
            description: "Our internal university tournament featuring Putting, Long Drive, and Closest to the Pin challenges across all faculties.",
            difficulty: "UNIVERSITY LEVEL"
          },
          {
            id: "comp-4",
            title: "FRIENDLY INTERNATIONAL MATCHES",
            description: "Expanding our horizons through matches with international partners like Meiji University (Japan) and others across Asia.",
            difficulty: "INTERNATIONAL"
          }
        ],
        trainingDescription: "Our squad trains at the finest facilities in Thailand, including Amata Spring Country Club and Alpine Golf Club. We utilize state-of-the-art launch monitors and video analysis to refine every aspect of our game, from short-game precision to driving distance.",
        legacyDescription: "Founded in the early 20th century, the Chulalongkorn University Golf Club has been the pioneer of collegiate golf in Thailand. From the traditional wooden clubs of the 1930s to the titanium drivers of today, our commitment to excellence remains unchanged. We are proud to represent the Pink spirit on every green we touch.",
        foundedYear: "1916",
        activeYears: "100+",
        showPhilosophy: true,
        showCaptainMandate: true,
        showCompetitions: true,
        showTraining: true,
        showLegacy: true
      };
    }

    if (!db.welcomeSection || Object.keys(db.welcomeSection).length === 0) {
      db.welcomeSection = {
        imageUrl: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=1200",
        titleThai: "จุฬาลงกรณ์มหาวิทยาลัยกอล์ฟคลับ",
        titleEnglish: "CHULALONGKORN UNIVERSITY GOLF CLUB",
        legacyQuote: "Since the early chapters of Thailand university golf sports, wearing Chulalongkorn's pale-pink athletic blazer represents high sporting distinction.",
        legacyQuoteAuthor: "Varsity Athletic Charter",
        description: "Through rigorous practice and biomechanical assessment, the Chulalongkorn University Golf Club promotes elite varsity performance."
      };
    }

    if (!db.upcomingActivity || Object.keys(db.upcomingActivity).length === 0) {
      db.upcomingActivity = {
        title: "VARSITY TRAINING CAMP 2026",
        description: "Annual intensive training program for elite squad members.",
        imageUrl: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=1200",
        date: "2026-07-12",
        location: "Alpine Golf Club",
        registrationUrl: "",
        showSection: true
      };
    }

    if (!db.siteSettings || Object.keys(db.siteSettings).length === 0) {
      db.siteSettings = {
        marqueeText: "Chulalongkorn University Golf Club • Drive to Excellence",
        contactPhone: "+66 (0) 2218-1916",
        contactEmail: "golf@chula.ac.th",
        contactAddress: "Chula Sports Complex, Phayathai Rd, Pathum Wan, Bangkok 10330, Thailand",
        academicAffiliation: "Thailand University Golf Association (TUGA)",
        showMarquee: true,
        showHomeBlog: true,
        showHomeWelcome: true,
        showHomeScores: true,
        showFooterMission: true,
        showFooterLegacy: true,
        showNavbarRoster: true,
        showNavbarStaff: true,
        showNavbarScores: true,
        showNavbarSponsors: true,
        showHomeSponsors: true
      };
    }

    if (!db.siteLabels || Object.keys(db.siteLabels).length === 0) {
      db.siteLabels = {
        navHome: "HOME",
        navBlog: "ACTIVITIES",
        navRoster: "TEAM ROSTER",
        navStaff: "STAFF & BOARD",
        navScores: "SCORES & STATS",
        navSponsors: "PARTNERS",
        navAdmin: "ADMIN CMS",
        navBrandTitle: "cugolfclub.",
        navBrandSubtitle: "[Official] Chulalongkorn University Golf Club",
        navAdminActive: "REGISTRY ACTIVE",
        navAdminCms: "ADMIN CMS",
        homeBlogTitle: "ACTIVITIES BLOG & STORIES",
        homeBlogSubtitle: "C.U.G.C. LATEST LOGS",
        homeWelcomeHeroTitle: "Longstanding",
        homeWelcomeHeroSubtitle: "Legacy",
        homeWelcomeHeroSocial: "cugolfclub @Student Government of Chulalongkorn University",
        homeFeaturedActivityBadge: "FEATURED ACTIVITY",
        homeRecentUpdatesLabel: "RECENT UPDATES",
        homeReadCoverageButton: "READ COVERAGE",
        homeReadStoryButton: "READ STORY",
        homeLiveStandingsTitle: "LIVE STANDINGS",
        homeFullLeaderboardButton: "FULL LEADERBOARD",
        homeNoBlogs: "No activities blogs published yet.",
        homeActivityLabel: "ACTIVITY",
        homeNoScores: "No tournament scores listed yet.",
        homeModalOfficialBadge: "OFFICIAL EDITORIAL",
        homeModalEditorialBoard: "CU GOLF CLUB SPORTS EDITORIAL BOARD",
        homeModalLocation: "BANGKOK, THAILAND",
        homeMembershipTitle: "Become a member of the CU GOLF CLUB.",
        homeMembershipDescription: "Expand your network and elevate your game.",
        homeMembershipButtonText: "REGISTER NOW",
        rosterTitle: "VARSITY ROSTER",
        rosterSubtitle: "TEAM REGISTRY",
        rosterVerifiedLabel: "COACH VERIFIED",
        rosterSearchPlaceholder: "Search roster registry...",
        rosterFilterLabel: "CLASS YEAR:",
        rosterStatusLabel: "STATUS:",
        rosterNoResultsTitle: "No registrants found",
        rosterNoResultsDesc: "There are no players currently recorded matching your search parameters.",
        rosterSquadLeadBadge: "SQUAD LEAD",
        rosterIndexLabel: "INDEX",
        rosterAthleteLabel: "CU ATHLETE",
        rosterStatusActive: "STATUS: ACTIVE SQUAD",
        staffTitle: "STAFF & BOARD",
        staffSubtitle: "CLUB OPERATIONS",
        staffVerifiedLabel: "OFFICIAL APPOINTMENT",
        scoresTitle: "SCORES & STATS",
        scoresSubtitle: "MATCH PERFORMANCE",
        scoresVerifiedLabel: "ATTESTED LOGS",
        scoresRecapTitle: "TOURNAMENT RECAP",
        scoresRecapSubtitle: "LATEST RESULTS",
        scoresOfficialStatsBadge: "UNOFFICIAL STATS",
        scoresViewStandingsButton: "VIEW STANDINGS",
        scoresHideStandingsButton: "HIDE STANDINGS",
        scoresTablePlayerHeader: "PLAYER NAME",
        scoresTableScoreHeader: "STROKE SCORE",
        scoresTablePositionHeader: "POSITION",
        scoresAttestationLabel: "CU UNOFFICIAL GOLF SCORECARD ATTESTATION",
        scoresVerifiedDirectoryLabel: "COACH VERIFIED DIRECTORY",
        scoresDetailedLeaderboardTitle: "DETAILED COMPETITIVE LEADERBOARD",
        sponsorsTitle: "OUR SPONSORS & PARTNERS",
        sponsorsSubtitle: "CORPORATE PARTNERSHIP",
        sponsorsVerifiedLabel: "OFFICIAL PARTNER",
        sponsorsContactTitle: "GET IN TOUCH WITH US",
        sponsorsContactDescription: "For partnership inquiries, please reach out to our executive board.",
        sponsorsOfficiallyAssociatedLabel: "OFFICIALLY ASSOCIATED 2026",
        footerMissionTitle: "OUR MISSION",
        footerMissionDescription: "Elevating collegiate golf through discipline and academic excellence.",
        footerLegacyTitle: "100 YEARS OF TRADITION",
        footerLegacyDescription: "Building a legacy that transcends the game.",
        footerDirectoryTitle: "DIRECTORY",
        footerHeadquartersTitle: "HEADQUARTERS",
        footerAffiliationsTitle: "AFFILIATIONS",
        footerRightsReserved: "© 2026 CHULALONGKORN UNIVERSITY GOLF CLUB. ALL RIGHTS RESERVED.",
        footerCmsLogin: "CMS LOG-IN",
        footerPrivacyDisclosure: "PRIVACY DISCLOSURE",
        footerTermsOfTradition: "TERMS OF TRADITION",
        footerRegistryLive: "REGISTRY LIVE",
        footerDirectoryNewsRoom: "NEWS ROOM",
        footerDirectoryRoster: "VARSITY ROSTER",
        footerDirectoryScores: "MATCH STATS",
        footerAffiliationsChulaMain: "CHULA MAIN",
        footerAffiliationsSportsOffice: "CU SPORTS OFFICE",
        welcomeHeroTitle: "Longstanding",
        welcomeHeroSubtitle: "Legacy",
        welcomeHeroSocial: "cugolfclub @Student Government of Chulalongkorn University",
        navBlogSubBlog: "BLOG",
        navBlogSubClub: "CLUB ACTIVITIES",
        navFollowFb: "FOLLOW @CUGOLFCLUB (FB)",
        navFollowIg: "FOLLOW @CUGOLFCLUB (IG)",
        navFollowTiktok: "FOLLOW @CUGOLFCLUB (TIKTOK)",
        aboutClubHeroTitlePart1: "UPCOMING",
        aboutClubHeroTitlePart2: "ACTIVITIES",
        aboutClubHeroSubtitle: "SCHEDULE & TOUR DATES FOR THE CHULALONGKORN SQUAD",
        aboutClubNoActivitiesTitle: "No upcoming activities scheduled",
        aboutClubNoActivitiesDesc: "Check back later for newly added tournaments and club matches.",
        blogBackToBlog: "BACK TO BLOG",
        blogPublishedBy: "PUBLISHED BY",
        blogLocation: "LOCATION",
        rosterYearAll: "ALL",
        rosterYearFreshman: "FRESHMAN",
        rosterYearSophomore: "SOPHOMORE",
        rosterYearJunior: "JUNIOR",
        rosterYearSenior: "SENIOR",
        homeViewAllStoriesButton: "VIEW ALL STORIES"
      };
    }

    res.json(db);
  } catch (err) {
    console.error("Error fetching from Supabase:", err);
    res.status(500).json({ error: "Failed to fetch database" });
  }
});

// Admin validation - Updated to use Supabase Auth
app.post("/api/admin/auth", async (req, res) => {
  const { password } = req.body;
  const adminEmail = "admin@cugolfclub.com"; // Default admin email for the club

  try {
    let authResult = await signInDirect(adminEmail, password);

    if ("error" in authResult) {
      // If user doesn't exist, try to create them (first-time setup)
      if (password === "cugolfx2026" && supabaseAdmin) {
        const { error: signUpError } = await supabaseAdmin.auth.admin.createUser({
          email: adminEmail,
          password: password,
          email_confirm: true
        });
        if (!signUpError) {
          authResult = await signInDirect(adminEmail, password);
        }
      }
      if ("error" in authResult) {
        return res.status(401).json({ success: false, message: "Invalid credentials." });
      }
    }

    res.json({ success: true, token: authResult.access_token });
  } catch (err: any) {
    console.error("Auth error:", err);
    res.status(500).json({ success: false, message: "Authentication service error." });
  }
});

// MEMBER REGISTRATION & AUTHENTICATION ENDPOINTS
app.post("/api/members/register", async (req, res) => {
  const { email, password, name, prefix, studentId, year, faculty, instagram, lineId } = req.body;

  if (!email || !password || !name || !studentId) {
    return res.status(400).json({ success: false, message: "Email, password, name, and student ID are required." });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
  }

  if (!supabaseAdmin) {
    console.error("Registration blocked: SUPABASE_SERVICE_ROLE_KEY is not configured on the server.");
    return res.status(500).json({ success: false, message: "Registration is currently unavailable. Please contact the administrator. (Server missing SUPABASE_SERVICE_ROLE_KEY)" });
  }

  try {
    // 1. Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name }
    });

    if (authError) {
      console.error("Auth createUser error:", authError.message, authError.status);
      if (authError.message.toLowerCase().includes("already registered") || authError.message.toLowerCase().includes("already been registered")) {
        return res.status(400).json({ success: false, message: "An account with this email already exists. Please log in instead." });
      }
      return res.status(400).json({ success: false, message: authError.message });
    }

    if (!authData.user) {
      return res.status(500).json({ success: false, message: "Auth user creation returned no data." });
    }

    // 2. Insert profile into members table — try with new columns first, fall back to core only
    const profileFull = { id: authData.user.id, email, name, prefix: prefix || null, student_id: studentId, year: year || null, faculty: faculty || null, instagram: instagram || null, line_id: lineId || null };
    const profileCore = { id: authData.user.id, email, name, student_id: studentId, year: year || null, faculty: faculty || null };

    let { error: dbError } = await supabase.from("members").insert(profileFull);

    if (dbError && (dbError.code === "42703" || dbError.message.includes("column") || dbError.message.includes("does not exist"))) {
      console.warn("members table missing new columns — falling back to core insert. Run the migration:\nALTER TABLE members ADD COLUMN IF NOT EXISTS prefix TEXT;\nALTER TABLE members ADD COLUMN IF NOT EXISTS instagram TEXT;\nALTER TABLE members ADD COLUMN IF NOT EXISTS line_id TEXT;");
      ({ error: dbError } = await supabase.from("members").insert(profileCore));
    }

    if (dbError) {
      console.error("DB insert error:", dbError.code, dbError.message);
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      if (dbError.code === "23505") {
        if (dbError.message.includes("student_id")) return res.status(400).json({ success: false, message: "This student ID is already registered." });
        if (dbError.message.includes("email")) return res.status(400).json({ success: false, message: "An account with this email already exists." });
      }
      return res.status(500).json({ success: false, message: `Database error: ${dbError.message}` });
    }

    // Async push to Google Sheets Webhook if configured
    const sheetsWebhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
    if (sheetsWebhookUrl) {
      fetch(sheetsWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          id: authData.user.id,
          prefix: prefix || "—",
          name,
          email,
          studentId,
          year: year || "—",
          faculty: faculty || "—",
          instagram: instagram || "—",
          lineId: lineId || "—"
        })
      }).then(response => {
        if (!response.ok) {
          console.warn("Google Sheets Sync returned non-OK status:", response.status);
        } else {
          console.log("Successfully synced registrant to Google Sheets.");
        }
      }).catch(fetchErr => {
        console.error("Error sending registration to Google Sheets Webhook:", fetchErr.message);
      });
    }

    res.json({ success: true, message: "Member registration successful." });
  } catch (err: any) {
    console.error("Registration endpoint crash:", err);
    res.status(500).json({ success: false, message: err.message || "Internal server error during registration." });
  }
});

app.post("/api/members/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required." });
  }

  try {
    const authResult = await signInDirect(email, password);

    if ("error" in authResult) {
      console.error("Supabase login error:", authResult.error);
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    // Fetch user profile from the members table
    const { data: profile, error: profileError } = await supabase
      .from("members")
      .select("*")
      .eq("id", authResult.user.id)
      .single();

    if (profileError) {
      console.warn("Could not retrieve member database profile:", profileError.message);
    }

    const formattedProfile = profile ? { ...profile, studentId: profile.student_id } : null;

    const adminEmails = await getAdminEmails();
    res.json({
      success: true,
      token: authResult.access_token,
      user: {
        id: authResult.user.id,
        email: authResult.user.email,
        name: profile?.name || (authResult.user.user_metadata?.name as string) || "Member",
        profile: formattedProfile,
        isAdmin: adminEmails.includes(authResult.user.email.toLowerCase())
      }
    });
  } catch (err: any) {
    console.error("Login endpoint crash:", err);
    res.status(500).json({ success: false, message: err.message || "Internal server error during login." });
  }
});

app.post("/api/members/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required." });
  }

  try {
    const host = req.headers.host || "localhost:3000";
    const protocol = (req.headers["x-forwarded-proto"] as string) || "http";
    const appUrl = process.env.APP_URL || `${protocol}://${host}`;
    const redirectTo = `${appUrl}/membership`;

    // Must use anon key (not service role key) — Supabase rejects recovery
    // emails sent with the service role key in some configurations.
    const response = await fetch(`${supabaseUrl}/auth/v1/recover`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseAnonKey
      },
      body: JSON.stringify({ email, redirect_to: redirectTo })
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      console.error("Supabase forgot-password error:", response.status, JSON.stringify(body));
      const detail = body.msg || body.message || body.error_description || body.error || `HTTP ${response.status}`;
      // Rate-limit or redirect-URL-not-whitelisted are the two most common causes
      return res.status(400).json({ success: false, message: detail, rateLimited: response.status === 429 });
    }

    res.json({ success: true, message: "Password reset instructions sent to your email. Check your inbox (and spam folder)." });
  } catch (err: any) {
    console.error("Forgot password endpoint crash:", err);
    res.status(500).json({ success: false, message: err.message || "Internal server error." });
  }
});

app.post("/api/members/reset-password", async (req, res) => {
  const authHeader = req.headers.authorization;
  const { password } = req.body;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Access denied. Missing token." });
  }
  if (!password) {
    return res.status(400).json({ success: false, message: "Password is required." });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Validate token and get user info
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ success: false, message: "Session expired or invalid token." });
    }

    // Update user password via admin auth
    if (!supabaseAdmin) {
      return res.status(500).json({ success: false, message: "Password reset service is not available. Please contact the administrator." });
    }
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password
    });

    if (updateError) {
      console.error("Supabase reset-password error:", updateError.message);
      return res.status(400).json({ success: false, message: updateError.message });
    }

    res.json({ success: true, message: "Your password has been reset successfully." });
  } catch (err: any) {
    console.error("Reset password endpoint crash:", err);
    res.status(500).json({ success: false, message: err.message || "Internal server error." });
  }
});

// Change password for a logged-in user — verifies old password first, no email required.
app.post("/api/members/change-password", async (req, res) => {
  const authHeader = req.headers.authorization;
  const { oldPassword, newPassword } = req.body;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Access denied." });
  }
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ success: false, message: "Old and new passwords are required." });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: "New password must be at least 6 characters." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ success: false, message: "Session expired. Please log in again." });
    }

    // Verify the old password is correct before allowing the change
    const verify = await signInDirect(user.email!, oldPassword);
    if ("error" in verify) {
      return res.status(401).json({ success: false, message: "Current password is incorrect." });
    }

    if (!supabaseAdmin) {
      return res.status(500).json({ success: false, message: "Password service unavailable." });
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, { password: newPassword });
    if (updateError) {
      return res.status(400).json({ success: false, message: updateError.message });
    }

    res.json({ success: true, message: "Password changed successfully." });
  } catch (err: any) {
    console.error("Change password crash:", err);
    res.status(500).json({ success: false, message: err.message || "Internal server error." });
  }
});

app.get("/api/members/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Access denied. Missing token." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ success: false, message: "Session expired or invalid token." });
    }

    // Fetch user profile from the members table
    const { data: profile, error: profileError } = await supabase
      .from("members")
      .select("*")
      .eq("id", user.id)
      .single();

    const formattedProfile = profile ? { ...profile, studentId: profile.student_id } : null;

    const adminEmails = await getAdminEmails();
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: profile?.name || user.user_metadata?.name || "Member",
        profile: formattedProfile,
        isAdmin: adminEmails.includes(user.email.toLowerCase())
      }
    });
  } catch (err: any) {
    console.error("Get member profile error:", err);
    res.status(500).json({ success: false, message: "Internal server error retrieving profile." });
  }
});

app.get("/api/admin/members", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, message: "Unauthorized admin access." });
  }
  
  // Verify token via admin client
  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error } = await supabase.auth.getUser(token);
  const adminEmails = await getAdminEmails();
  if (error || !user || !adminEmails.includes(user.email.toLowerCase())) {
    return res.status(403).json({ success: false, message: "Access denied. Admin credentials required." });
  }

  try {
    const { data: membersList, error: listError } = await supabase
      .from("members")
      .select("*")
      .order("created_at", { ascending: false });

    if (listError) throw listError;

    const formattedMembers = (membersList || []).map((m: any) => ({
      ...m,
      studentId: m.student_id
    }));

    res.json({ success: true, members: formattedMembers });
  } catch (err: any) {
    console.error("Admin member list fetch error:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to fetch member directory." });
  }
});

app.put("/api/admin/members/:id", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ success: false, message: "Unauthorized." });

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error } = await supabase.auth.getUser(token);
  const adminEmails = await getAdminEmails();
  if (error || !user || !adminEmails.includes(user.email!.toLowerCase())) {
    return res.status(403).json({ success: false, message: "Access denied." });
  }

  const { id } = req.params;
  const { name, prefix, studentId, year, faculty, email, instagram, lineId, newPassword } = req.body;

  try {
    const dbUpdates: any = {};
    if (name !== undefined) dbUpdates.name = name;
    if (prefix !== undefined) dbUpdates.prefix = prefix;
    if (studentId !== undefined) dbUpdates.student_id = studentId;
    if (year !== undefined) dbUpdates.year = year;
    if (faculty !== undefined) dbUpdates.faculty = faculty;
    if (email !== undefined) dbUpdates.email = email;
    if (instagram !== undefined) dbUpdates.instagram = instagram;
    if (lineId !== undefined) dbUpdates.line_id = lineId;

    if (Object.keys(dbUpdates).length > 0) {
      const { error: dbError } = await supabase.from("members").update(dbUpdates).eq("id", id);
      if (dbError) return res.status(500).json({ success: false, message: dbError.message });
    }

    if ((email || newPassword) && supabaseAdmin) {
      const authUpdates: any = {};
      if (email) authUpdates.email = email;
      if (newPassword) authUpdates.password = newPassword;
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, authUpdates);
      if (authError) return res.status(500).json({ success: false, message: authError.message });
    }

    res.json({ success: true });
  } catch (err: any) {
    console.error("Admin member update error:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to update member." });
  }
});

app.delete("/api/admin/members/:id", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ success: false, message: "Unauthorized." });

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error } = await supabase.auth.getUser(token);
  const adminEmails = await getAdminEmails();
  if (error || !user || !adminEmails.includes(user.email!.toLowerCase())) {
    return res.status(403).json({ success: false, message: "Access denied." });
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ success: false, message: "Admin client not configured." });
  }

  const { id } = req.params;

  try {
    const { error: dbError } = await supabase.from("members").delete().eq("id", id);
    if (dbError) return res.status(500).json({ success: false, message: dbError.message });

    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (authError) console.error("Auth delete error (DB already removed):", authError.message);

    res.json({ success: true });
  } catch (err: any) {
    console.error("Admin member delete error:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to delete member." });
  }
});

// ADMIN EMAILS MANAGEMENT ENDPOINTS
app.get("/api/admin/emails", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ success: false, message: "Unauthorized." });

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error } = await supabase.auth.getUser(token);
  const currentAdmins = await getAdminEmails();
  if (error || !user || !currentAdmins.includes(user.email.toLowerCase())) {
    return res.status(403).json({ success: false, message: "Access denied." });
  }

  res.json({ success: true, emails: currentAdmins });
});

app.post("/api/admin/emails", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ success: false, message: "Unauthorized." });

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error } = await supabase.auth.getUser(token);
  const currentAdmins = await getAdminEmails();
  if (error || !user || !currentAdmins.includes(user.email.toLowerCase())) {
    return res.status(403).json({ success: false, message: "Access denied." });
  }

  const newEmail = req.body.email?.trim().toLowerCase();
  if (!newEmail) {
    return res.status(400).json({ success: false, message: "Email is required." });
  }

  if (currentAdmins.includes(newEmail)) {
    return res.status(400).json({ success: false, message: "Email is already an administrator." });
  }

  const updatedEmails = [...currentAdmins, newEmail];
  const { error: upsertError } = await supabase.from("site_config").upsert({
    key: "admin_emails",
    data: { emails: updatedEmails },
    updated_at: new Date().toISOString()
  });

  if (upsertError) {
    return res.status(500).json({ success: false, message: upsertError.message });
  }

  res.json({ success: true, emails: updatedEmails });
});

app.delete("/api/admin/emails", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ success: false, message: "Unauthorized." });

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error } = await supabase.auth.getUser(token);
  const currentAdmins = await getAdminEmails();
  if (error || !user || !currentAdmins.includes(user.email.toLowerCase())) {
    return res.status(403).json({ success: false, message: "Access denied." });
  }

  const emailToRemove = req.body.email?.trim().toLowerCase();
  if (!emailToRemove) {
    return res.status(400).json({ success: false, message: "Email is required." });
  }

  if (emailToRemove === "admin@cugolfclub.com") {
    return res.status(400).json({ success: false, message: "Default system administrator cannot be removed." });
  }

  if (!currentAdmins.includes(emailToRemove)) {
    return res.status(400).json({ success: false, message: "Email is not an administrator." });
  }

  const updatedEmails = currentAdmins.filter(e => e !== emailToRemove);
  const { error: upsertError } = await supabase.from("site_config").upsert({
    key: "admin_emails",
    data: { emails: updatedEmails },
    updated_at: new Date().toISOString()
  });

  if (upsertError) {
    return res.status(500).json({ success: false, message: upsertError.message });
  }

  res.json({ success: true, emails: updatedEmails });
});

// BLOGS CRUD
app.post("/api/news", async (req, res) => {
  try {
    const newItem = {
      id: `news-${Date.now()}`,
      title: req.body.title || "Untitled Article",
      excerpt: req.body.excerpt || "",
      content: req.body.content || "",
      publishDate: req.body.publishDate || new Date().toISOString().split("T")[0],
      imageUrl: req.body.imageUrl || "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=1200",
      rank: typeof req.body.rank === "number" ? req.body.rank : 0,
      isVisible: req.body.isVisible ?? true
    };
    const { error } = await supabase.from("news").insert(newItem);
    if (error) {
       console.error("Supabase News Insert Error:", error);
       return res.status(500).json({ success: false, message: `Database error: ${error.message}` });
    }
    res.json({ success: true, item: newItem });
  } catch (err: any) {
    console.error("News creation crash:", err);
    res.status(500).json({ success: false, message: err.message || "Internal server error during news creation." });
  }
});

app.put("/api/news/:id", async (req, res) => {
  const { error } = await supabase.from("news").update(req.body).eq("id", req.params.id);
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true });
});

app.delete("/api/news/:id", async (req, res) => {
  const { error } = await supabase.from("news").delete().eq("id", req.params.id);
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true });
});

// ROSTER PLAYERS CRUD
app.post("/api/roster", async (req, res) => {
  const newItem = {
    id: `player-${Date.now()}`,
    name: req.body.name || "Anonymous Player",
    handicap: typeof req.body.handicap === "number" ? req.body.handicap : 2.0,
    year: req.body.year || "Freshman",
    faculty: req.body.faculty || "Faculty of Sports Science",
    imageUrl: req.body.imageUrl || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400",
    isFeatured: !!req.body.isFeatured,
    isVisible: req.body.isVisible ?? true
  };
  const { error } = await supabase.from("roster").insert(newItem);
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true, item: newItem });
});

app.put("/api/roster/:id", async (req, res) => {
  const { error } = await supabase.from("roster").update(req.body).eq("id", req.params.id);
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true });
});

app.delete("/api/roster/:id", async (req, res) => {
  const { error } = await supabase.from("roster").delete().eq("id", req.params.id);
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true });
});

// STAFF CRUD
app.post("/api/staff", async (req, res) => {
  const newItem = {
    id: `staff-${Date.now()}`,
    name: req.body.name || "Staff Member",
    role: req.body.role || "Committee Member",
    year: req.body.year || "Club Operations",
    imageUrl: req.body.imageUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400",
    order: typeof req.body.order === "number" ? req.body.order : 0,
    isVisible: req.body.isVisible ?? true
  };
  const { error } = await supabase.from("staff").insert(newItem);
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true, item: newItem });
});

app.put("/api/staff/:id", async (req, res) => {
  const { error } = await supabase.from("staff").update(req.body).eq("id", req.params.id);
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true });
});

app.delete("/api/staff/:id", async (req, res) => {
  const { error } = await supabase.from("staff").delete().eq("id", req.params.id);
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true });
});

// TOURNAMENTS & SCORES CRUD
app.post("/api/scores", async (req, res) => {
  const newItem = {
    id: `score-${Date.now()}`,
    tournamentName: req.body.tournamentName || "Chula Internal Open",
    date: req.body.date || new Date().toISOString().split("T")[0],
    result: req.body.result || "Practice Round",
    playersCount: Array.isArray(req.body.scoresList) ? req.body.scoresList.length : 0,
    scoresList: req.body.scoresList || [],
    isVisible: req.body.isVisible ?? true
  };
  const { error } = await supabase.from("scores").insert(newItem);
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true, item: newItem });
});

app.put("/api/scores/:id", async (req, res) => {
  const { error } = await supabase.from("scores").update(req.body).eq("id", req.params.id);
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true });
});

app.delete("/api/scores/:id", async (req, res) => {
  const { error } = await supabase.from("scores").delete().eq("id", req.params.id);
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true });
});

// GALLERY CRUD
app.post("/api/gallery", async (req, res) => {
  const newItem = {
    id: `photo-${Date.now()}`,
    title: req.body.title || "Club Photography",
    imageUrl: req.body.imageUrl || "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=800",
    date: req.body.date || new Date().toISOString().split("T")[0],
    category: req.body.category || "General"
  };
  const { error } = await supabase.from("gallery").insert(newItem);
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true, item: newItem });
});

app.delete("/api/gallery/:id", async (req, res) => {
  const { error } = await supabase.from("gallery").delete().eq("id", req.params.id);
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true });
});

// WELCOME SECTION UPDATE
app.put("/api/welcome", async (req, res) => {
  const { error } = await supabase.from("site_config").upsert({
    key: "welcome_section",
    data: req.body
  });
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true });
});

// UPCOMING ACTIVITY UPDATE
app.put("/api/upcoming-activity", async (req, res) => {
  const { error } = await supabase.from("site_config").upsert({
    key: "upcoming_activity",
    data: req.body
  });
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true });
});

// SPONSORS CRUD
app.post("/api/sponsors", async (req, res) => {
  const newItem = {
    id: `sponsor-${Date.now()}`,
    name: req.body.name || "Brand Partner",
    description: req.body.description || "",
    websiteUrl: req.body.websiteUrl || "",
    imageUrl: req.body.imageUrl || "",
    isActive: req.body.isActive ?? true
  };
  const { error } = await supabase.from("sponsors").insert(newItem);
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true, item: newItem });
});

app.put("/api/sponsors/:id", async (req, res) => {
  const { error } = await supabase.from("sponsors").update(req.body).eq("id", req.params.id);
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true });
});

app.delete("/api/sponsors/:id", async (req, res) => {
  const { error } = await supabase.from("sponsors").delete().eq("id", req.params.id);
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true });
});

// SITE SETTINGS UPDATE
app.put("/api/site-settings", async (req, res) => {
  const { error } = await supabase.from("site_config").upsert({
    key: "site_settings",
    data: req.body
  });
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true });
});

// SITE LABELS UPDATE
app.put("/api/site-labels", async (req, res) => {
  const { error } = await supabase.from("site_config").upsert({
    key: "site_labels",
    data: req.body
  });
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true });
});

// SITE LABELS THAI UPDATE
app.put("/api/site-labels-thai", async (req, res) => {
  const { error } = await supabase.from("site_config").upsert({
    key: "site_labels_thai",
    data: req.body
  });
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true });
});

// HOME SPONSOR SECTION UPDATE
app.put("/api/home-sponsor-section", async (req, res) => {
  const { error } = await supabase.from("site_config").upsert({
    key: "home_sponsor_section",
    data: req.body
  });
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true });
});

// CLUB ACTIVITY UPDATE
app.put("/api/club-activity", async (req, res) => {
  const { error } = await supabase.from("site_config").upsert({
    key: "club_activity",
    data: req.body
  });
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true });
});

// GOOGLE SHEETS SYNC
async function syncAllMembersToSheets(): Promise<{ synced: number; total: number; errors: number }> {
  const sheetsWebhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!sheetsWebhookUrl) {
    throw new Error("GOOGLE_SHEETS_WEBHOOK_URL is not configured.");
  }

  const { data: members, error } = await supabase
    .from("members")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Failed to fetch members: ${error.message}`);
  if (!members || members.length === 0) return { synced: 0, total: 0, errors: 0 };

  let synced = 0;
  let errors = 0;

  for (const member of members) {
    try {
      const response = await fetch(sheetsWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timestamp: member.created_at || new Date().toISOString(),
          id: member.id,
          prefix: member.prefix || "—",
          name: member.name,
          email: member.email,
          studentId: member.student_id,
          year: member.year || "—",
          faculty: member.faculty || "—",
          instagram: member.instagram || "—",
          lineId: member.line_id || "—"
        })
      });
      if (response.ok) { synced++; } else { errors++; }
    } catch {
      errors++;
    }
  }

  return { synced, total: members.length, errors };
}

app.post("/api/admin/sync-sheets", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ success: false, message: "Unauthorized." });

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error } = await supabase.auth.getUser(token);
  const adminEmails = await getAdminEmails();
  if (error || !user || !adminEmails.includes(user.email!.toLowerCase())) {
    return res.status(403).json({ success: false, message: "Access denied." });
  }

  try {
    const result = await syncAllMembersToSheets();
    console.log(`[Sync] Manual trigger by ${user.email}: ${result.synced}/${result.total} synced.`);
    res.json({ success: true, ...result });
  } catch (err: any) {
    console.error("[Sync] Manual sync failed:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Start routing with Vite / Static bundling
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Mount Vite middleware in development so HMR/Vite serving is active isomorphically
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Read files directly in production container
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);

    // Optional self-pinging to keep Render instance awake
    const RENDER_EXTERNAL_URL = process.env.RENDER_EXTERNAL_URL;
    if (RENDER_EXTERNAL_URL) {
      console.log(`Self-pinging enabled for: ${RENDER_EXTERNAL_URL}`);
      setInterval(() => {
        fetch(`${RENDER_EXTERNAL_URL}/api/health`)
          .then(res => res.json())
          .then(data => console.log('Self-ping success:', data.timestamp))
          .catch(err => console.error('Self-ping failed:', err.message));
      }, 14 * 60 * 1000); // Ping every 14 minutes
    }

    // Daily scheduled sync of all members to Google Sheets
    const SYNC_INTERVAL_MS = 24 * 60 * 60 * 1000; // every 24 hours
    if (process.env.GOOGLE_SHEETS_WEBHOOK_URL) {
      console.log("📊 Daily Google Sheets sync scheduled (every 24h).");
      setInterval(async () => {
        try {
          const result = await syncAllMembersToSheets();
          console.log(`[Sync] Scheduled sync complete: ${result.synced}/${result.total} members synced, ${result.errors} errors.`);
        } catch (err: any) {
          console.error("[Sync] Scheduled sync failed:", err.message);
        }
      }, SYNC_INTERVAL_MS);
    }
  });
}

startServer();
