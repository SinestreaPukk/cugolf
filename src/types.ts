export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  publishDate: string;
  imageUrl: string;
  rank?: number;
  isVisible?: boolean;
}

export interface Player {
  id: string;
  name: string;
  handicap: number;
  year: string;
  faculty: string;
  imageUrl: string;
  isFeatured?: boolean;
  isVisible?: boolean;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  year: string;
  imageUrl: string;
  order: number;
  isVisible?: boolean;
}

export interface PlayerScore {
  playerName: string;
  score: number;
  position: string;
}

export interface TournamentScore {
  id: string;
  tournamentName: string;
  date: string;
  result: string;
  playersCount: number;
  scoresList: PlayerScore[];
  isVisible?: boolean;
}

export interface GalleryImage {
  id: string;
  title: string;
  imageUrl: string;
  date: string;
  category: string;
}

export interface WelcomeSection {
  imageUrl: string;
  titleThai: string;
  titleEnglish: string;
  legacyQuote: string;
  legacyQuoteAuthor: string;
  description: string;
}

export interface Sponsor {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  imageUrl: string;
  isActive: boolean;
}

export interface SiteSettings {
  marqueeText: string;
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  academicAffiliation: string;
  // Visibility toggles
  showMarquee: boolean;
  showHomeBlog: boolean;
  showHomeWelcome: boolean;
  showHomeScores: boolean;
  showFooterMission: boolean;
  showFooterLegacy: boolean;
  showNavbarRoster: boolean;
  showNavbarStaff: boolean;
  showNavbarScores: boolean;
  showNavbarSponsors: boolean;
  showHomeSponsors: boolean;
}

export interface HomeSponsorSection {
  title: string;
  subtitle: string;
  description: string;
  marqueeText: string;
  imageUrl: string;
  buttonText: string;
  buttonUrl: string;
  showSection: boolean;
}

export interface SiteLabels {
  // Navbar Labels
  navHome: string;
  navBlog: string;
  navRoster: string;
  navStaff: string;
  navScores: string;
  navSponsors: string;
  navAdmin: string;
  navBrandTitle: string;
  navBrandSubtitle: string;
  navAdminActive: string;
  navAdminCms: string;

  // Home Labels
  homeBlogTitle: string;
  homeBlogSubtitle: string;
  homeWelcomeHeroTitle: string;
  homeWelcomeHeroSubtitle: string;
  homeWelcomeHeroSocial: string;
  homeFeaturedActivityBadge: string;
  homeRecentUpdatesLabel: string;
  homeReadCoverageButton: string;
  homeReadStoryButton: string;
  homeLiveStandingsTitle: string;
  homeFullLeaderboardButton: string;
  homeNoBlogs: string;
  homeActivityLabel: string;
  homeNoScores: string;
  homeModalOfficialBadge: string;
  homeModalEditorialBoard: string;
  homeModalLocation: string;
  
  // Membership Section
  homeMembershipTitle: string;
  homeMembershipDescription: string;
  homeMembershipButtonText: string;
  
  // Roster Labels
  rosterTitle: string;
  rosterSubtitle: string;
  rosterVerifiedLabel: string;
  rosterSearchPlaceholder: string;
  rosterFilterLabel: string;
  rosterStatusLabel: string;
  rosterNoResultsTitle: string;
  rosterNoResultsDesc: string;
  rosterSquadLeadBadge: string;
  rosterIndexLabel: string;
  rosterAthleteLabel: string;
  rosterStatusActive: string;
  
  // Staff Labels
  staffTitle: string;
  staffSubtitle: string;
  staffVerifiedLabel: string;
  
  // Scores Labels
  scoresTitle: string;
  scoresSubtitle: string;
  scoresVerifiedLabel: string;
  scoresRecapTitle: string;
  scoresRecapSubtitle: string;
  scoresOfficialStatsBadge: string;
  scoresViewStandingsButton: string;
  scoresHideStandingsButton: string;
  scoresTablePlayerHeader: string;
  scoresTableScoreHeader: string;
  scoresTablePositionHeader: string;
  scoresAttestationLabel: string;
  scoresVerifiedDirectoryLabel: string;
  scoresDetailedLeaderboardTitle: string;
  
  // Sponsors Labels
  sponsorsTitle: string;
  sponsorsSubtitle: string;
  sponsorsVerifiedLabel: string;
  sponsorsContactTitle: string;
  sponsorsContactDescription: string;
  sponsorsOfficiallyAssociatedLabel: string;
  
  // Footer Labels
  footerMissionTitle: string;
  footerMissionDescription: string;
  footerLegacyTitle: string;
  footerLegacyDescription: string;
  footerDirectoryTitle: string;
  footerHeadquartersTitle: string;
  footerAffiliationsTitle: string;
  footerRightsReserved: string;
  footerCmsLogin: string;
  footerPrivacyDisclosure: string;
  footerTermsOfTradition: string;
  footerRegistryLive: string;
  footerDirectoryNewsRoom: string;
  footerDirectoryRoster: string;
  footerDirectoryScores: string;
  footerAffiliationsChulaMain: string;
  footerAffiliationsSportsOffice: string;

  // Welcome Hero Labels (Internal)
  welcomeHeroTitle: string;
  welcomeHeroSubtitle: string;
  welcomeHeroSocial: string;
}

export interface UpcomingActivity {
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  location: string;
  registrationUrl: string;
  showSection: boolean;
}

export interface Competition {
  id: string;
  title: string;
  description: string;
  difficulty: string;
}

export interface ClubActivityContent {
  heroImageUrl: string;
  philosophyTitle: string;
  philosophyQuote: string;
  philosophyDescription: string;
  technicalExcellenceDescription: string;
  captainName: string;
  captainRole: string;
  captainImageUrl: string;
  captainPhilosophy: string;
  competitions: Competition[];
  trainingDescription: string;
  legacyDescription: string;
  foundedYear: string;
  activeYears: string;
  // Visibility toggles
  showPhilosophy: boolean;
  showCaptainMandate: boolean;
  showCompetitions: boolean;
  showTraining: boolean;
  showLegacy: boolean;
}

export interface DatabaseState {
  news: NewsItem[];
  roster: Player[];
  staff: Staff[];
  scores: TournamentScore[];
  gallery: GalleryImage[];
  welcomeSection: WelcomeSection;
  upcomingActivity: UpcomingActivity;
  homeSponsorSection: HomeSponsorSection;
  clubActivity: ClubActivityContent;
  sponsors: Sponsor[];
  siteSettings: SiteSettings;
  siteLabels: SiteLabels;
}
