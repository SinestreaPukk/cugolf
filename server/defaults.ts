// Fallback content served when a site_config row has not been created yet in Supabase.
// Extracted verbatim from the original monolithic /api/db handler so that the
// page-scoped content endpoints and the full CMS payload share one source of truth.

export const DEFAULT_HOME_SPONSOR_SECTION = {
  title: "SUPPORTING EXCELLENCE",
  subtitle: "CORPORATE PARTNERSHIP",
  description: "Our sponsors provide the essential resources and infrastructure that empower our student athletes to compete at the highest collegiate level.",
  marqueeText: "PLATINUM PARTNERS • EQUIPMENT PROVIDERS • FACILITY AFFILIATES • OFFICIAL CLUB SPONSORS",
  imageUrl: "https://images.unsplash.com/photo-1593111774240-d529f52ee4de?auto=format&fit=crop&q=80&w=1200",
  buttonText: "LEARN MORE",
  buttonUrl: "/sponsors",
  showSection: true
};

export const DEFAULT_CLUB_ACTIVITY = {
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

export const DEFAULT_SIMULATOR_SECTION = {
  title: "GOLF SIMULATOR ROOM",
  subtitle: "COMING SOON",
  description: "Our state-of-the-art indoor golf simulator room is coming soon — a dedicated space for year-round training, technique refinement, and competitive simulations.",
  descriptionThai: "",
  showSection: true,
  photos: []
};

export const DEFAULT_WELCOME_SECTION = {
  imageUrl: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=1200",
  titleThai: "จุฬาลงกรณ์มหาวิทยาลัยกอล์ฟคลับ",
  titleEnglish: "CHULALONGKORN UNIVERSITY GOLF CLUB",
  legacyQuote: "Since the early chapters of Thailand university golf sports, wearing Chulalongkorn's pale-pink athletic blazer represents high sporting distinction.",
  legacyQuoteAuthor: "Varsity Athletic Charter",
  description: "Through rigorous practice and biomechanical assessment, the Chulalongkorn University Golf Club promotes elite varsity performance."
};

export const DEFAULT_UPCOMING_ACTIVITY = {
  title: "VARSITY TRAINING CAMP 2026",
  description: "Annual intensive training program for elite squad members.",
  imageUrl: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=1200",
  date: "2026-07-12",
  location: "Alpine Golf Club",
  registrationUrl: "",
  showSection: true
};

export const DEFAULT_SITE_SETTINGS = {
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

export const DEFAULT_SITE_LABELS = {
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

/** Maps a camelCase content key to the object served when Supabase has no row for it. */
export const CONTENT_DEFAULTS: Record<string, any> = {
  homeSponsorSection: DEFAULT_HOME_SPONSOR_SECTION,
  clubActivity: DEFAULT_CLUB_ACTIVITY,
  simulatorSection: DEFAULT_SIMULATOR_SECTION,
  welcomeSection: DEFAULT_WELCOME_SECTION,
  upcomingActivity: DEFAULT_UPCOMING_ACTIVITY,
  siteSettings: DEFAULT_SITE_SETTINGS,
  siteLabels: DEFAULT_SITE_LABELS
};
