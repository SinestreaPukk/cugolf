export interface NewsItem {
  id: string;
  title: string;
  titleThai?: string;
  excerpt: string;
  excerptThai?: string;
  content: string;
  contentThai?: string;
  publishDate: string;
  imageUrl: string;
  rank?: number;
  isVisible?: boolean;
}

export interface Player {
  id: string;
  name: string;
  nameThai?: string;
  handicap: number;
  year: string;
  yearThai?: string;
  faculty: string;
  facultyThai?: string;
  imageUrl: string;
  isFeatured?: boolean;
  isVisible?: boolean;
}

export interface Staff {
  id: string;
  name: string;
  nameThai?: string;
  role: string;
  roleThai?: string;
  year: string;
  yearThai?: string;
  imageUrl: string;
  order: number;
  isVisible?: boolean;
}

export interface PlayerScore {
  playerName: string;
  playerNameThai?: string;
  score: number;
  position: string;
  positionThai?: string;
}

export interface TournamentScore {
  id: string;
  tournamentName: string;
  tournamentNameThai?: string;
  date: string;
  result: string;
  resultThai?: string;
  playersCount: number;
  scoresList: PlayerScore[];
  isVisible?: boolean;
}

export interface GalleryImage {
  id: string;
  title: string;
  titleThai?: string;
  imageUrl: string;
  date: string;
  category: string;
  categoryThai?: string;
}

export interface AdminEditProps {
  isAdmin?: boolean;
  onEditSection?: (sectionId: string) => void;
  activeSectionId?: string | null;
}

export interface WelcomeSection {
  imageUrl: string;
  titleThai: string;
  titleEnglish: string;
  legacyQuote: string;
  legacyQuoteThai?: string;
  legacyQuoteAuthor: string;
  legacyQuoteAuthorThai?: string;
  description: string;
  descriptionThai?: string;
}

export interface Sponsor {
  id: string;
  name: string;
  nameThai?: string;
  description: string;
  descriptionThai?: string;
  websiteUrl: string;
  imageUrl: string;
  isActive: boolean;
}

export interface SiteSettings {
  marqueeText: string;
  marqueeTextThai?: string;
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  contactAddressThai?: string;
  academicAffiliation: string;
  academicAffiliationThai?: string;
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
  titleThai?: string;
  subtitle: string;
  subtitleThai?: string;
  description: string;
  descriptionThai?: string;
  marqueeText: string;
  marqueeTextThai?: string;
  imageUrl: string;
  buttonText: string;
  buttonTextThai?: string;
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
  navBlogSubBlog?: string;
  navBlogSubClub?: string;
  navFollowFb?: string;
  navFollowIg?: string;
  navFollowTiktok?: string;
  aboutClubHeroTitlePart1?: string;
  aboutClubHeroTitlePart2?: string;
  aboutClubHeroSubtitle?: string;
  aboutClubNoActivitiesTitle?: string;
  aboutClubNoActivitiesDesc?: string;
  blogBackToBlog?: string;
  blogPublishedBy?: string;
  blogLocation?: string;
  rosterYearAll?: string;
  rosterYearFreshman?: string;
  rosterYearSophomore?: string;
  rosterYearJunior?: string;
  rosterYearSenior?: string;
  homeViewAllStoriesButton?: string;
}

export interface UpcomingActivity {
  title: string;
  titleThai?: string;
  description: string;
  descriptionThai?: string;
  imageUrl: string;
  date: string;
  dateThai?: string;
  location: string;
  locationThai?: string;
  registrationUrl: string;
  showSection: boolean;
}

export interface Competition {
  id: string;
  title: string;
  titleThai?: string;
  description: string;
  descriptionThai?: string;
  difficulty: string;
  difficultyThai?: string;
  imageUrl?: string;
  date?: string;
}

export interface ClubActivityContent {
  heroImageUrl: string;
  philosophyTitle: string;
  philosophyTitleThai?: string;
  philosophyQuote: string;
  philosophyQuoteThai?: string;
  philosophyDescription: string;
  philosophyDescriptionThai?: string;
  technicalExcellenceDescription: string;
  technicalExcellenceDescriptionThai?: string;
  captainName: string;
  captainNameThai?: string;
  captainRole: string;
  captainRoleThai?: string;
  captainImageUrl: string;
  captainPhilosophy: string;
  captainPhilosophyThai?: string;
  competitions: Competition[];
  trainingDescription: string;
  trainingDescriptionThai?: string;
  legacyDescription: string;
  legacyDescriptionThai?: string;
  foundedYear: string;
  activeYears: string;
  activeYearsThai?: string;
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
  memberEvents: MemberEvent[];
  welcomeSection: WelcomeSection;
  upcomingActivity: UpcomingActivity;
  homeSponsorSection: HomeSponsorSection;
  clubActivity: ClubActivityContent;
  sponsors: Sponsor[];
  siteSettings: SiteSettings;
  siteLabels: SiteLabels;
  siteLabelsThai?: SiteLabels;
}

export interface MemberEvent {
  id: string;
  title: string;
  titleThai?: string;
  description?: string;
  descriptionThai?: string;
  date?: string;
  time?: string;
  location?: string;
  locationThai?: string;
  imageUrl?: string;
  registrationOpen: boolean;
  googleFormUrl?: string;
  isVisible: boolean;
  created_at?: string;
}

export interface Member {
  id: string;
  email: string;
  name: string;
  studentId: string;
  prefix?: string;
  year?: string;
  faculty?: string;
  instagram?: string;
  lineId?: string;
  created_at?: string;
}
