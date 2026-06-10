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
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "placeholder-key";

if (supabaseUrl === "https://placeholder.supabase.co") {
  console.warn("⚠️ WARNING: Supabase URL or Key is missing in environment variables. Database operations will fail.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

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
        heroImageUrl: "/uploads/windsor_team_legacy.png",
        philosophyTitle: "OUR PHILOSOPHY",
        philosophyQuote: "More than just a sport, golf at Chulalongkorn is a vehicle for personal growth, discipline, and lifelong camaraderie.",
        philosophyDescription: "At CU Golf Club, we believe in the \"Pink Spirit\"—a unique blend of fierce competitive drive and absolute integrity. As Thailand's oldest university, our golf program carries the weight of a century-old tradition. We don't just produce athletes; we cultivate leaders who understand that peak performance on the green is rooted in humility, respect for the game, and support for one's teammates.",
        technicalExcellenceDescription: "We leverage modern analytics and professional coaching to ensure our squad remains at the forefront of collegiate golf. Our training focuses on precision, mental fortitude, and strategic course management, preparing students for the high-pressure environment of national championships.",
        captainName: "Sakditouch Pukkanasut",
        captainRole: "PRESIDENT & SQUAD CAPTAIN",
        captainImageUrl: "/uploads/Screenshot_2026-05-26_at_21_44_02-1779806963893.png",
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
        welcomeHeroSocial: "cugolfclub @Student Government of Chulalongkorn University"
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
    // Attempt to sign in with the provided password
    const { data, error } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: password,
    });

    if (error) {
      // If user doesn't exist, try to create them (first-time setup)
      if (error.message.includes("Invalid login credentials") && password === "cugolfx2026") {
         const { error: signUpError } = await supabase.auth.admin.createUser({
           email: adminEmail,
           password: password,
           email_confirm: true
         });
         
         if (!signUpError) {
           // Retry login after creation
           const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
             email: adminEmail,
             password: password,
           });
           if (!retryError) {
             return res.json({ success: true, token: retryData.session?.access_token });
           }
         }
      }
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    res.json({ success: true, token: data.session?.access_token });
  } catch (err: any) {
    console.error("Auth error:", err);
    res.status(500).json({ success: false, message: "Authentication service error." });
  }
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
  });
}

startServer();
