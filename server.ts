import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

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

// Serve static uploaded materials
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Photo upload endpoint
app.post("/api/upload", (req, res) => {
  const { filename, base64Data } = req.body;
  if (!filename || !base64Data) {
    return res.status(400).json({ success: false, message: "Missing filename or base64Data payload." });
  }

  try {
    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Strip out base64 prefix headers if modern FileReader DataURL was submitted
    const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(cleanBase64, "base64");

    const ext = path.extname(filename) || ".png";
    const baseName = path.basename(filename, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
    const uniqueFilename = `${baseName}-${Date.now()}${ext}`;
    const filePath = path.join(uploadDir, uniqueFilename);

    fs.writeFileSync(filePath, buffer);

    const fileUrl = `/uploads/${uniqueFilename}`;
    res.json({ success: true, url: fileUrl });
  } catch (err: any) {
    console.error("Back-end image upload execution error:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to finalize disk write." });
  }
});

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "db.json");

// Real-world styled seed data to give the sports magazine a superb initial appearance
const INITIAL_DATABASE = {
  news: [
    {
      id: "news-1",
      title: "Chula Clinches Victory at Thailand University Golf League 2026",
      excerpt: "A look inside Chulalongkorn A Team's calculated masterclass under pressure to secure the prestigious championship at Alpine Golf Club.",
      content: `### Triumph on the Alpine Fairways

The Chulalongkorn University Golf Club Team A staged a dramatic final-round surge to conquer the 2026 Thailand University Golf League, prevailing over rival academies in a high-stakes standoff at the renowned **Alpine Golf Club** in Pathum Thani. 

Entering the final day trailing by three strokes, the Pink Elephants delivered an impeccable display of strategic ball management and ice-cold putting. Leading the brigade was junior standout **Methas "Pete" Srisai (handicap: 0.8)**, who carded a sensational 4-under-par 68 to secure individual medalist honors.

> "The greens at Alpine are famously treacherous," Head Coach Dr. Kittisun Chantrajal explained. "We spent three weeks analyzing the green contours and mapping landing boxes. The preparation paid dividends on the back nine when the pressure intensified."

### Critical Back-Nine Execution
The pivotal moment came at the par-5 14th hole. With winds picking up, captain Thanawut "Oat" Prasertsook laid up meticulously before stitching a wedge shot 3 feet from the pin. His subsequent birdie, paired with a clinical par save on 15, swung the momentum decisively in Chula's favor.

Chula A ended the 3-day tournament with a combined score of +2 (218, 220, 212), clinching the trophy by 2 strokes. This victory marks Chulalongkorn's 4th title in the tournament's 12-year history, reaffirming our position as a powerhouse in Thai collegiate golf.`,
      publishDate: "2026-05-12",
      imageUrl: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=1200"
    },
    {
      id: "news-2",
      title: "Tactical Playbook: Navigating Tight Tree-Lined Fairways",
      excerpt: "Head Coach Dr. Kittisun Chantrajal drafts an exclusive technical column on teeing strategy and wind alignment for competitive amateurs.",
      content: `### Crafting the Ball Flight: Insights for Amateurs

In this edition of the Club technical review, we tackle a common demon on championship courses: **tight, tree-lined corridors**. In Thailand, courses like Alpine and Thai Country Club demand premium ball placement over pure distance. To compete at the collegiate level, players must trade the aggressive "bomb-and-gouge" mentality for conservative target golfing.

#### 1. The 3-Wedge Strategy
Many amateurs focus too much on executing the perfect driver swing. Coach Kittisun advocates for hitting more fairway woods or driving irons off the tee. Keeping the ball in play in the short grass beats a 300-yard drive in the rough 90% of the time, especially with the heavy Bermuda grass prevalent in Southeast Asia.

#### 2. Visualizing 'Good Misses'
Before taking a swing, identify the "dead zone"—the area where recovery is statistically impossible. Structure your stance to exclude that side of the fairway. If the left flank is lined with water, aim for the right bunker. A bunker save is always better than a penalty stroke.

#### 3. Managing the Wind
Championship courses are often wind-swept in the dry season. Keeping the ball low prevents turbulent air currents from manipulating its trajectory. Practice the "punch shot" or "stinger" with your short irons by placing the ball slightly back in your stance, truncating your finish.`,
      publishDate: "2026-04-20",
      imageUrl: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=1200"
    },
    {
      id: "news-3",
      title: "Chula Golf Academy Welcomes Class of 2026",
      excerpt: "Meet the outstanding freshman prospects joining our rigorous development squad from diverse faculties across the campus.",
      content: `### Injecting Fresh Blood: The 2026 Intake

Chulalongkorn University Golf Club is proud to officially unveil its incoming class of academy prospects for the upcoming collegiate season. Following an intense, week-long trial process that assessed short game precision, athletic endurance, and mental stamina under pressure, five new scholarship athletes have earned their pink blazers.

#### Notable Signings
- **Sarisa "Prim" Chotiwat** (Faculty of Communication Arts) - Reaching us with an impressive domestic amateur resume, Prim has a flat handicap of 2.8 and is expected to strengthen our women's matches significantly.
- **Worawut "Kao" Panyarachun** (Faculty of Engineering) - A powerhouse ball-striker, capable of averaging 290 yards off the tee with a 3.2 handicap.

The recruits will undergo our rigorous summer training camp at Alpine Golf Club, focusing on technical diagnostic drills and mental sports science.`,
      publishDate: "2026-03-01",
      imageUrl: "https://images.unsplash.com/photo-1471440671318-55ddd5f546c3?auto=format&fit=crop&q=80&w=1200"
    }
  ],
  roster: [
    {
      id: "player-1",
      name: "Thanawut 'Oat' Prasertsook",
      handicap: 1.2,
      year: "Senior",
      imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400",
      isFeatured: true
    },
    {
      id: "player-2",
      name: "Methas 'Pete' Srisai",
      handicap: 0.8,
      year: "Junior",
      imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400",
      isFeatured: true
    },
    {
      id: "player-3",
      name: "Pajaree 'Mint' Wongwan",
      handicap: 2.1,
      year: "Sophomore",
      imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400",
      isFeatured: true
    },
    {
      id: "player-4",
      name: "Nattapat 'Gunn' Kittirattanavi",
      handicap: 1.5,
      year: "Senior",
      imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400"
    },
    {
      id: "player-5",
      name: "Sarisa 'Prim' Chotiwat",
      handicap: 2.8,
      year: "Freshman",
      imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400"
    }
  ],
  staff: [
    {
      id: "staff-1",
      name: "Dr. Kittisun Chantrajal",
      role: "Head Coach & Sports Director",
      year: "Faculty of Sports Science",
      imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400",
      order: 1
    },
    {
      id: "staff-2",
      name: "Prof. Dr. Anan Pipat",
      role: "Club President & Patron",
      year: "Faculty of Commerce and Accountancy",
      imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400",
      order: 2
    },
    {
      id: "staff-3",
      name: "Ms. Benyapa Tanom",
      role: "Club General Manager",
      year: "Operations Division",
      imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400",
      order: 3
    }
  ],
  scores: [
    {
      id: "score-1",
      tournamentName: "Thailand University Golf Championship 2026",
      date: "2026-05-12",
      result: "1st Place Champions (Chulalongkorn A)",
      playersCount: 4,
      scoresList: [
        { playerName: "Methas 'Pete' Srisai", score: 68, position: "1st" },
        { playerName: "Thanawut 'Oat' Prasertsook", score: 71, position: "T-4th" },
        { playerName: "Nattapat 'Gunn' Kittirattanavi", score: 73, position: "T-8th" },
        { playerName: "Pajaree 'Mint' Wongwan", score: 75, position: "12th" }
      ]
    },
    {
      id: "score-2",
      tournamentName: "Chula-Thammasat Mutual Cup 2026",
      date: "2026-02-18",
      result: "Match-Play Victory (CU 3.5 - 2.5 TU)",
      playersCount: 6,
      scoresList: [
        { playerName: "Thanawut 'Oat' Prasertsook", score: 70, position: "Win (2&1)" },
        { playerName: "Methas 'Pete' Srisai", score: 69, position: "Win (4&3)" },
        { playerName: "Pajaree 'Mint' Wongwan", score: 72, position: "Win (1 Up)" },
        { playerName: "Sarisa 'Prim' Chotiwat", score: 76, position: "Halved" },
        { playerName: "Nattapat 'Gunn' Kittirattanavi", score: 78, position: "Lost" }
      ]
    },
    {
      id: "score-3",
      tournamentName: "All Thailand Intercollegiate Invitational 2025",
      date: "2025-11-05",
      result: "2nd Place Final Standings",
      playersCount: 4,
      scoresList: [
        { playerName: "Methas 'Pete' Srisai", score: 71, position: "3rd" },
        { playerName: "Thanawut 'Oat' Prasertsook", score: 72, position: "T-5th" },
        { playerName: "Pajaree 'Mint' Wongwan", score: 74, position: "T-10th" }
      ]
    }
  ],
  gallery: [
    {
      id: "photo-1",
      title: "Alpine Championship Trophy Lift",
      imageUrl: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=800",
      date: "2026-05-12",
      category: "Tournament"
    },
    {
      id: "photo-2",
      title: "Morning Tee Off at Amata Spring",
      imageUrl: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=800",
      date: "2026-04-10",
      category: "Practice"
    },
    {
      id: "photo-3",
      title: "Team Meeting at Driving Range",
      imageUrl: "https://images.unsplash.com/photo-1471440671318-55ddd5f546c3?auto=format&fit=crop&q=80&w=800",
      date: "2026-03-15",
      category: "Training"
    },
    {
      id: "photo-4",
      title: "Precision Wedge Diagnostic Session",
      imageUrl: "https://images.unsplash.com/photo-1593111774240-d529f52ee4de?auto=format&fit=crop&q=80&w=800",
      date: "2026-02-28",
      category: "Tech Analysis"
    }
  ],
  welcomeSection: {
    imageUrl: "/src/assets/images/regenerated_image_1779791459213.jpg",
    titleThai: "จุฬาลงกรณ์มหาวิทยาลัยกอล์ฟคลับ",
    titleEnglish: "CHULALONGKORN UNIVERSITY GOLF CLUB",
    legacyQuote: "To wear the pale-pink athletic blazer of Chulalongkorn is to represent a hundred years of sportsmanship, absolute integrity, and peak physical performance on the championship green.",
    legacyQuoteAuthor: "The Chulalongkorn Golf Charter, Section IV",
    description: "With a legacy of excellence on campus, the Chulalongkorn University Golf Club is actively expanding.\n\nWe are actively looking for new members to help shape the future of the club. Join us on the course to build lasting memories, enjoy your time at Chula University"
  },
  upcomingActivity: {
    title: "VARSITY TRAINING CAMP 2026",
    description: "Our annual intensive training session focusing on precision iron play and mental fortitude. Open to all active squad members and potential trialists.",
    imageUrl: "https://images.unsplash.com/photo-1471440671318-55ddd5f546c3?auto=format&fit=crop&q=80&w=1200",
    date: "July 12-15, 2026",
    location: "Alpine Golf Club, Pathum Thani",
    registrationUrl: "https://docs.google.com/forms/d/e/1FAIpQLSdaKMAAJw0pSaf7k9atDaUiuws7zpuYg6-903oI2qt2Qk4UIg/viewform?usp=sharing",
    showSection: false
  },
  sponsors: [
    {
      id: "sponsor-1",
      name: "SINGHA ATHLETICS",
      type: "Official Title sponsor",
      description: "Supporting Thai golf sports for over four decades, providing academy funding and winter training tour locations.",
      tier: "PLATINUM PARTNER"
    },
    {
      id: "sponsor-2",
      name: "TITLEIST THAILAND",
      type: "Equipment & Ball Sponsor",
      description: "Official equipment supplier, provisioning Chula's competitive athletes with Pro V1 custom high-performance balls and custom tour bags.",
      tier: "TECHNICAL SPONSOR"
    },
    {
      id: "sponsor-3",
      name: "ALPINE GOLF CLUB",
      type: "Home Club / Training Facility",
      description: "Official championship training headquarters, granting our varsity squad regular green times and diagnostic practice setups.",
      tier: "FACILITY ADVISOR"
    },
    {
      id: "sponsor-4",
      name: "CHULA SPORTS SCIENCE",
      type: "Academic & Tech Partner",
      description: "Providing high-performance biomechanics research, kinetic labs, and mental conditioning sports psychologists.",
      tier: "COLLEGIATE AFFILIATE"
    },
    {
      id: "sponsor-5",
      name: "TAYLORMADE SE-ASIA",
      type: "Apparel & Innovation Support",
      description: "Delivering dynamic lightweight outerwear and precision custom metalwoods for our representative tournament squads.",
      tier: "APPAREL ADVOCATE"
    },
    {
      id: "sponsor-6",
      name: "PATHUM THANI SPORTS BUREAU",
      type: "Local Sports Committee",
      description: "Co-financing regional university athletic leagues and community amateur golf outreach programs.",
      tier: "MUNICIPAL PATRON"
    }
  ],
  siteSettings: {
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
    showNavbarSponsors: true
  },
  siteLabels: {
    navHome: "HOME",
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
    rosterTitle: "THE 2026 VARSITY SQUAD",
    rosterSubtitle: "ACTIVE PLAYERS MATRIX",
    rosterVerifiedLabel: "HANDICAP REGISTRATION RECORD VERIFIED • THAILAND AMATEUR INDEX",
    rosterSearchPlaceholder: "Search roster registry...",
    rosterFilterLabel: "CLASS YEAR:",
    rosterStatusLabel: "STATUS:",
    rosterNoResultsTitle: "No registrants found",
    rosterNoResultsDesc: "There are no players currently recorded matching your search parameters or select class year filters.",
    rosterSquadLeadBadge: "SQUAD LEAD",
    rosterIndexLabel: "INDEX",
    rosterAthleteLabel: "CU ATHLETE",
    rosterStatusActive: "STATUS: ACTIVE SQUAD",
    staffTitle: "EXECUTIVE COMMITTEE & STAFF",
    staffSubtitle: "GOVERNANCE BOARD",
    staffVerifiedLabel: "ADMINISTRATOR BOARD • ATHLETIC DEPARTMENT APPOINTMENTS",
    scoresTitle: "TOURNAMENT RESULTS & STATS",
    scoresSubtitle: "OFFICIAL LEADERS RECORD",
    scoresVerifiedLabel: "VARSITY LEAGUE ARCHIVES • AMATA SPRING & ALPINE LOGS VERIFIED",
    scoresRecapTitle: "ATHLETIC SEASON RECAP",
    scoresRecapSubtitle: "CU GOLF BY THE NUMBERS",
    scoresOfficialStatsBadge: "OFFICIAL STATS",
    scoresViewStandingsButton: "VIEW STANDINGS",
    scoresHideStandingsButton: "HIDE STANDINGS",
    scoresTablePlayerHeader: "PLAYER NAME",
    scoresTableScoreHeader: "STROKE SCORE",
    scoresTablePositionHeader: "POSITION",
    scoresAttestationLabel: "CU OFFICIAL GOLF SCORECARD ATTESTATION",
    scoresVerifiedDirectoryLabel: "COACH VERIFIED DIRECTORY",
    scoresDetailedLeaderboardTitle: "DETAILED COMPETITIVE LEADERBOARD",
    sponsorsTitle: "OUR SPONSORS & PARTNERS",
    sponsorsSubtitle: "CORPORATE FELLOWSHIP",
    sponsorsVerifiedLabel: "CORPORATE ALIGNMENT • ENABLING ATHLETIC MILESTONES",
    sponsorsContactTitle: "GET IN TOUCH WITH US",
    sponsorsContactDescription: "For partnership inquiries, commercial alignment, or facility support, please reach out to our executive board.",
    sponsorsOfficiallyAssociatedLabel: "OFFICIALLY ASSOCIATED 2026",
    footerMissionTitle: "OUR MISSION",
    footerMissionDescription: "Through rigorous practice, biomechanical assessment, and sporting integrity, the Chulalongkorn University Golf Club promotes elite varsity performance while instilling collegiate camaraderie and academic excellence.",
    footerLegacyTitle: "THE PINK BLAZER",
    footerLegacyDescription: "Since the early chapters of Thailand university golf sports, wearing Chulalongkorn's pale-pink athletic blazer represents high sporting distinction, absolute integrity, and competitive peak performance.",
    footerDirectoryTitle: "DIRECTORY",
    footerHeadquartersTitle: "HEADQUARTERS",
    footerAffiliationsTitle: "AFFILIATIONS",
    footerRightsReserved: "© {year} CHULALONGKORN UNIVERSITY GOLF CLUB. ALL RIGHTS RESERVED.",
    footerCmsLogin: "CMS LOG-IN",
    footerPrivacyDisclosure: "PRIVACY DISCLOSURE",
    footerTermsOfTradition: "TERMS OF TRADITION",
    footerDirectoryNewsRoom: "NEWS ROOM",
    footerDirectoryRoster: "VARSITY ROSTER",
    footerDirectoryScores: "MATCH STATS",
    footerAffiliationsChulaMain: "CHULA MAIN",
    footerAffiliationsSportsOffice: "CU SPORTS OFFICE",
    welcomeHeroTitle: "Longstanding",
    welcomeHeroSubtitle: "Legacy",
    welcomeHeroSocial: "cugolfclub @Student Government of Chulalongkorn University"
    }
    };
// Help helper to get database
function readDatabase() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATABASE, null, 2), "utf-8");
    return INITIAL_DATABASE;
  }
  try {
    const data = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(data);
    // Ensure nested sections exist to prevent migration/empty state issues
    parsed.welcomeSection = parsed.welcomeSection || INITIAL_DATABASE.welcomeSection;
    parsed.upcomingActivity = parsed.upcomingActivity || INITIAL_DATABASE.upcomingActivity;
    parsed.sponsors = Array.isArray(parsed.sponsors) ? parsed.sponsors : INITIAL_DATABASE.sponsors;
    parsed.siteSettings = { ...INITIAL_DATABASE.siteSettings, ...(parsed.siteSettings || {}) };
    parsed.siteLabels = { ...INITIAL_DATABASE.siteLabels, ...(parsed.siteLabels || {}) };
    
    return parsed;
  } catch (err) {
    console.error("Error reading database file, resetting to initial state:", err);
    return INITIAL_DATABASE;
  }
}

// Help helper to write database
function writeDatabase(data: any) {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing to database file:", err);
  }
}

// REST endpoints for the Database Layer
app.get("/api/db", (req, res) => {
  res.json(readDatabase());
});

// Admin validation
app.post("/api/admin/auth", (req, res) => {
  const { password } = req.body;
  console.log("Auth attempt received");
  if (password === "cugolfx2026") {
    res.json({ success: true, token: "chula-golf-club-auth-token-1916" });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials." });
  }
});

// BLOGS CRUD
app.post("/api/news", (req, res) => {
  const db = readDatabase();
  const newItem = {
    id: `news-${Date.now()}`,
    title: req.body.title || "Untitled Article",
    excerpt: req.body.excerpt || "",
    content: req.body.content || "",
    publishDate: req.body.publishDate || new Date().toISOString().split("T")[0],
    imageUrl: req.body.imageUrl || "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=1200"
  };
  db.news.unshift(newItem);
  writeDatabase(db);
  res.json({ success: true, item: newItem });
});

app.put("/api/news/:id", (req, res) => {
  const db = readDatabase();
  const index = db.news.findIndex((i: any) => i.id === req.params.id);
  if (index !== -1) {
    db.news[index] = { ...db.news[index], ...req.body };
    writeDatabase(db);
    res.json({ success: true, item: db.news[index] });
  } else {
    res.status(404).json({ success: false, message: "Item not found" });
  }
});

app.delete("/api/news/:id", (req, res) => {
  const db = readDatabase();
  const filtered = db.news.filter((i: any) => i.id !== req.params.id);
  db.news = filtered;
  writeDatabase(db);
  res.json({ success: true });
});

// ROSTER PLAYERS CRUD
app.post("/api/roster", (req, res) => {
  const db = readDatabase();
  const newItem = {
    id: `player-${Date.now()}`,
    name: req.body.name || "Anonymous Player",
    handicap: typeof req.body.handicap === "number" ? req.body.handicap : 2.0,
    year: req.body.year || "Freshman",
    faculty: req.body.faculty || "Faculty of Sports Science",
    imageUrl: req.body.imageUrl || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400",
    isFeatured: !!req.body.isFeatured
  };
  db.roster.push(newItem);
  writeDatabase(db);
  res.json({ success: true, item: newItem });
});

app.put("/api/roster/:id", (req, res) => {
  const db = readDatabase();
  const index = db.roster.findIndex((i: any) => i.id === req.params.id);
  if (index !== -1) {
    db.roster[index] = { ...db.roster[index], ...req.body };
    writeDatabase(db);
    res.json({ success: true, item: db.roster[index] });
  } else {
    res.status(404).json({ success: false, message: "Player not found" });
  }
});

app.delete("/api/roster/:id", (req, res) => {
  const db = readDatabase();
  const filtered = db.roster.filter((i: any) => i.id !== req.params.id);
  db.roster = filtered;
  writeDatabase(db);
  res.json({ success: true });
});

// STAFF CRUD
app.post("/api/staff", (req, res) => {
  const db = readDatabase();
  const newItem = {
    id: `staff-${Date.now()}`,
    name: req.body.name || "Staff Member",
    role: req.body.role || "Committee Member",
    year: req.body.year || "Club Operations",
    imageUrl: req.body.imageUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400",
    order: typeof req.body.order === "number" ? req.body.order : db.staff.length + 1
  };
  db.staff.push(newItem);
  writeDatabase(db);
  res.json({ success: true, item: newItem });
});

app.put("/api/staff/:id", (req, res) => {
  const db = readDatabase();
  const index = db.staff.findIndex((i: any) => i.id === req.params.id);
  if (index !== -1) {
    db.staff[index] = { ...db.staff[index], ...req.body };
    writeDatabase(db);
    res.json({ success: true, item: db.staff[index] });
  } else {
    res.status(404).json({ success: false, message: "Staff not found" });
  }
});

app.delete("/api/staff/:id", (req, res) => {
  const db = readDatabase();
  const filtered = db.staff.filter((i: any) => i.id !== req.params.id);
  db.staff = filtered;
  writeDatabase(db);
  res.json({ success: true });
});

// TOURNAMENTS & SCORES CRUD
app.post("/api/scores", (req, res) => {
  const db = readDatabase();
  const newItem = {
    id: `score-${Date.now()}`,
    tournamentName: req.body.tournamentName || "Chula Internal Open",
    date: req.body.date || new Date().toISOString().split("T")[0],
    result: req.body.result || "Practice Round",
    playersCount: Array.isArray(req.body.scoresList) ? req.body.scoresList.length : 0,
    scoresList: req.body.scoresList || []
  };
  db.scores.push(newItem);
  writeDatabase(db);
  res.json({ success: true, item: newItem });
});

app.put("/api/scores/:id", (req, res) => {
  const db = readDatabase();
  const index = db.scores.findIndex((i: any) => i.id === req.params.id);
  if (index !== -1) {
    const scoresList = req.body.scoresList ?? db.scores[index].scoresList;
    db.scores[index] = {
      ...db.scores[index],
      ...req.body,
      playersCount: Array.isArray(scoresList) ? scoresList.length : db.scores[index].playersCount,
      scoresList
    };
    writeDatabase(db);
    res.json({ success: true, item: db.scores[index] });
  } else {
    res.status(404).json({ success: false, message: "Score record not found" });
  }
});

app.delete("/api/scores/:id", (req, res) => {
  const db = readDatabase();
  const filtered = db.scores.filter((i: any) => i.id !== req.params.id);
  db.scores = filtered;
  writeDatabase(db);
  res.json({ success: true });
});

// GALLERY CRUD
app.post("/api/gallery", (req, res) => {
  const db = readDatabase();
  const newItem = {
    id: `photo-${Date.now()}`,
    title: req.body.title || "Club Photography",
    imageUrl: req.body.imageUrl || "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=800",
    date: req.body.date || new Date().toISOString().split("T")[0],
    category: req.body.category || "General"
  };
  db.gallery.unshift(newItem);
  writeDatabase(db);
  res.json({ success: true, item: newItem });
});

app.delete("/api/gallery/:id", (req, res) => {
  const db = readDatabase();
  const filtered = db.gallery.filter((i: any) => i.id !== req.params.id);
  db.gallery = filtered;
  writeDatabase(db);
  res.json({ success: true });
});

// WELCOME SECTION UPDATE
app.put("/api/welcome", (req, res) => {
  const db = readDatabase();
  db.welcomeSection = {
    imageUrl: req.body.imageUrl || "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=1600",
    titleThai: req.body.titleThai || "จุฬาลงกรณ์มหาวิทยาลัยกอล์ฟคลับ",
    titleEnglish: req.body.titleEnglish || "CHULALONGKORN UNIVERSITY GOLF CLUB",
    legacyQuote: req.body.legacyQuote || "",
    legacyQuoteAuthor: req.body.legacyQuoteAuthor || "",
    description: req.body.description || ""
  };
  writeDatabase(db);
  res.json({ success: true, welcomeSection: db.welcomeSection });
});

// UPCOMING ACTIVITY UPDATE
app.put("/api/upcoming-activity", (req, res) => {
  const db = readDatabase();
  db.upcomingActivity = {
    title: req.body.title || "",
    description: req.body.description || "",
    imageUrl: req.body.imageUrl || "",
    date: req.body.date || "",
    location: req.body.location || "",
    registrationUrl: req.body.registrationUrl || "",
    showSection: req.body.showSection ?? true
  };
  writeDatabase(db);
  res.json({ success: true, upcomingActivity: db.upcomingActivity });
});

// SPONSORS CRUD
app.post("/api/sponsors", (req, res) => {
  const db = readDatabase();
  const newItem = {
    id: `sponsor-${Date.now()}`,
    name: req.body.name || "Brand Partner",
    description: req.body.description || "",
    websiteUrl: req.body.websiteUrl || "",
    imageUrl: req.body.imageUrl || "",
    isActive: req.body.isActive ?? true
  };
  if (!db.sponsors) db.sponsors = [];
  db.sponsors.push(newItem);
  writeDatabase(db);
  res.json({ success: true, item: newItem });
});

app.put("/api/sponsors/:id", (req, res) => {
  const db = readDatabase();
  if (!db.sponsors) db.sponsors = [];
  const index = db.sponsors.findIndex((i: any) => i.id === req.params.id);
  if (index !== -1) {
    db.sponsors[index] = { ...db.sponsors[index], ...req.body };
    writeDatabase(db);
    res.json({ success: true, item: db.sponsors[index] });
  } else {
    res.status(404).json({ success: false, message: "Sponsor not found" });
  }
});

app.delete("/api/sponsors/:id", (req, res) => {
  const db = readDatabase();
  if (!db.sponsors) db.sponsors = [];
  db.sponsors = db.sponsors.filter((i: any) => i.id !== req.params.id);
  writeDatabase(db);
  res.json({ success: true });
});

// SITE SETTINGS UPDATE
app.put("/api/site-settings", (req, res) => {
  const db = readDatabase();
  db.siteSettings = {
    ...db.siteSettings,
    ...req.body
  };
  writeDatabase(db);
  res.json({ success: true, siteSettings: db.siteSettings });
});

// SITE LABELS UPDATE
app.put("/api/site-labels", (req, res) => {
  const db = readDatabase();
  db.siteLabels = { ...db.siteLabels, ...req.body };
  writeDatabase(db);
  res.json({ success: true, siteLabels: db.siteLabels });
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
  });
}

startServer();
