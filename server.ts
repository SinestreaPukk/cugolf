import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;
const IS_PROD = process.env.NODE_ENV === "production";

// Supabase client initialization
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "placeholder-key";

if (supabaseUrl === "https://placeholder.supabase.co") {
  console.warn("⚠️ WARNING: Supabase URL or Key is missing in environment variables. Database operations will fail.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "50mb" }));

  // API Endpoints
  app.get("/api/db", async (req, res) => {
    try {
      const collections = ["news", "roster", "staff", "scores", "gallery", "sponsors"];
      const results = await Promise.all(collections.map(c => supabase.from(c).select("*").order('id', { ascending: true })));
      
      const db: any = {
        news: [],
        roster: [],
        staff: [],
        scores: [],
        gallery: [],
        sponsors: [],
        welcomeSection: {},
        upcomingActivity: {},
        homeSponsorSection: {},
        siteSettings: {},
        siteLabels: {}
      };

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

      // Default for homeSponsorSection if not set or null
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
          homeMembershipDescription: "Expand your network and elevate your game. We are actively looking for new student members to join our representative squads and co-curricular programs.",
          homeMembershipButtonText: "REGISTER NOW",
          rosterTitle: "VARSITY ROSTER",
          rosterSubtitle: "TEAM REGISTRY",
          rosterVerifiedLabel: "COACH VERIFIED • THAILAND AMATEUR INDEX",
          rosterSearchPlaceholder: "Search roster registry...",
          rosterFilterLabel: "CLASS YEAR:",
          rosterStatusLabel: "STATUS:",
          rosterNoResultsTitle: "No registrants found",
          rosterNoResultsDesc: "There are no players currently recorded matching your search parameters.",
          rosterSquadLeadBadge: "SQUAD LEAD",
          rosterIndexLabel: "INDEX",
          rosterAthleteLabel: "CU ATHLETE",
          rosterStatusActive: "STATUS: ACTIVE SQUAD",
          staffTitle: "EXECUTIVE COMMITTEE & STAFF",
          staffSubtitle: "CLUB OPERATIONS",
          staffVerifiedLabel: "OFFICIAL APPOINTMENT",
          scoresTitle: "TOURNAMENT RESULTS & STATS",
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
          sponsorsContactDescription: "For partnership inquiries, commercial alignment, or facility support, please reach out to our executive board.",
          sponsorsOfficiallyAssociatedLabel: "OFFICIALLY ASSOCIATED 2026",
          footerMissionTitle: "OUR MISSION",
          footerMissionDescription: "Elevating collegiate golf through discipline, competitive spirit, and academic excellence within Chulalongkorn University.",
          footerLegacyTitle: "100 YEARS OF TRADITION",
          footerLegacyDescription: "Building a legacy that transcends the game, fostering leaders since the earliest chapters of Thai university sports.",
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

  app.post("/api/admin/auth", (req, res) => {
    const { password } = req.body;
    if (password === "cugolfx2026") {
      res.json({ success: true, token: "session-" + Date.now() });
    } else {
      res.status(401).json({ success: false, message: "Invalid varsity passkey credentials." });
    }
  });

  // NEWS CRUD
  app.post("/api/news", async (req, res) => {
    try {
      const { data, error } = await supabase.from("news").insert([req.body]).select().single();
      if (error) throw error;
      res.json({ success: true, item: data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.put("/api/news/:id", async (req, res) => {
    try {
      const { data, error } = await supabase.from("news").update(req.body).eq("id", req.params.id).select().single();
      if (error) throw error;
      res.json({ success: true, item: data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.delete("/api/news/:id", async (req, res) => {
    try {
      const { error } = await supabase.from("news").delete().eq("id", req.params.id);
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // ROSTER CRUD
  app.post("/api/roster", async (req, res) => {
    try {
      const { data, error } = await supabase.from("roster").insert([req.body]).select().single();
      if (error) throw error;
      res.json({ success: true, item: data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.put("/api/roster/:id", async (req, res) => {
    try {
      const { data, error } = await supabase.from("roster").update(req.body).eq("id", req.params.id).select().single();
      if (error) throw error;
      res.json({ success: true, item: data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.delete("/api/roster/:id", async (req, res) => {
    try {
      const { error } = await supabase.from("roster").delete().eq("id", req.params.id);
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // STAFF CRUD
  app.post("/api/staff", async (req, res) => {
    try {
      const { data, error } = await supabase.from("staff").insert([req.body]).select().single();
      if (error) throw error;
      res.json({ success: true, item: data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.put("/api/staff/:id", async (req, res) => {
    try {
      const { data, error } = await supabase.from("staff").update(req.body).eq("id", req.params.id).select().single();
      if (error) throw error;
      res.json({ success: true, item: data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.delete("/api/staff/:id", async (req, res) => {
    try {
      const { error } = await supabase.from("staff").delete().eq("id", req.params.id);
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // SCORES CRUD
  app.post("/api/scores", async (req, res) => {
    try {
      const { data, error } = await supabase.from("scores").insert([req.body]).select().single();
      if (error) throw error;
      res.json({ success: true, item: data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.put("/api/scores/:id", async (req, res) => {
    try {
      const { data, error } = await supabase.from("scores").update(req.body).eq("id", req.params.id).select().single();
      if (error) throw error;
      res.json({ success: true, item: data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.delete("/api/scores/:id", async (req, res) => {
    try {
      const { error } = await supabase.from("scores").delete().eq("id", req.params.id);
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // GALLERY CRUD
  app.post("/api/gallery", async (req, res) => {
    try {
      const { data, error } = await supabase.from("gallery").insert([req.body]).select().single();
      if (error) throw error;
      res.json({ success: true, item: data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.delete("/api/gallery/:id", async (req, res) => {
    try {
      const { error } = await supabase.from("gallery").delete().eq("id", req.params.id);
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // SPONSORS CRUD
  app.post("/api/sponsors", async (req, res) => {
    try {
      const { data, error } = await supabase.from("sponsors").insert([req.body]).select().single();
      if (error) throw error;
      res.json({ success: true, item: data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.put("/api/sponsors/:id", async (req, res) => {
    try {
      const { data, error } = await supabase.from("sponsors").update(req.body).eq("id", req.params.id).select().single();
      if (error) throw error;
      res.json({ success: true, item: data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.delete("/api/sponsors/:id", async (req, res) => {
    try {
      const { error } = await supabase.from("sponsors").delete().eq("id", req.params.id);
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // CONFIG UPDATES
  const updateConfig = async (key: string, data: any) => {
    const { error } = await supabase.from("site_config").upsert({ key, data }, { onConflict: "key" });
    if (error) throw error;
    return { success: true };
  };

  app.put("/api/welcome", async (req, res) => {
    try {
      await updateConfig("welcome_section", req.body);
      res.json({ success: true, welcomeSection: req.body });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.put("/api/upcoming-activity", async (req, res) => {
    try {
      await updateConfig("upcoming_activity", req.body);
      res.json({ success: true, upcomingActivity: req.body });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.put("/api/site-settings", async (req, res) => {
    try {
      await updateConfig("site_settings", req.body);
      res.json({ success: true, siteSettings: req.body });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.put("/api/site-labels", async (req, res) => {
    try {
      await updateConfig("site_labels", req.body);
      res.json({ success: true, siteLabels: req.body });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.put("/api/home-sponsor-section", async (req, res) => {
    try {
      await updateConfig("home_sponsor_section", req.body);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // FILE UPLOAD
  app.post("/api/upload", async (req, res) => {
    try {
      const { filename, base64Data } = req.body;
      const buffer = Buffer.from(base64Data, "base64");
      const filePath = path.join(process.cwd(), "public", "uploads", filename);
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(filePath, buffer);
      res.json({ success: true, url: `/uploads/${filename}` });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // VITE or STATIC SERVING
  if (!IS_PROD) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
    app.use(vite.middlewares);
    app.use("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const template = fs.readFileSync(path.resolve(__dirname, "index.html"), "utf-8");
        const html = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(html);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
