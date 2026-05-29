import React, { useState } from "react";
import golfersSilhouette from "../assets/images/golfers_silhouette.png";
import MarkdownRenderer from "./MarkdownRenderer";
import { DatabaseState, NewsItem, Player, Staff, TournamentScore, GalleryImage, PlayerScore, WelcomeSection, Sponsor, SiteSettings, Competition, ClubActivityContent } from "../types";
import {
  loginAdmin,
  createNews,
  updateNews,
  deleteNews,
  createPlayer,
  updatePlayer,
  deletePlayer,
  createStaff,
  updateStaff,
  deleteStaff,
  createTournamentScore,
  updateTournamentScore,
  deleteTournamentScore,
  createGalleryImage,
  deleteGalleryImage,
  updateWelcomeSection,
  updateUpcomingActivity,
  createSponsor,
  updateSponsor,
  deleteSponsor,
  updateSiteSettings,
  updateSiteLabels,
  updateHomeSponsorSection,
  updateClubActivity,
  uploadPhoto
} from "../utils/api";
import {
  Plus, Trash2, Edit, Save, FileText, Sparkles, LogOut, Users,
  Trophy, Image, Sparkle, Lock, Eye, AlertCircle, RefreshCw, X, Check, HelpCircle, Heart, Settings, Calendar, Award, Type, ArrowUpRight, ArrowRight
} from "lucide-react";

interface ImageUploadWidgetProps {
  id: string;
  value: string;
  onChange: (url: string) => void;
  label: string;
  placeholder?: string;
  helperText?: string;
}

function ImageUploadWidget({ id, value, onChange, label, placeholder, helperText }: ImageUploadWidgetProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const processFile = async (file: File) => {
    setIsUploading(true);
    setError("");
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        try {
          const res = await uploadPhoto(file.name, base64Data);
          if (res.success && res.url) {
            onChange(res.url);
          } else {
            setError(res.message || "Upload failed on database storage.");
          }
        } catch (err: any) {
          setError(err.message || "Failed to reach upload gateway.");
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError("Failed to convert image binary.");
      setIsUploading(false);
    }
  };

  const [isDragging, setIsDragging] = useState(false);
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  return (
    <div className="space-y-1.5 text-left">
      <label htmlFor={id} className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase block">
        {label}
      </label>
      
      <div className="flex gap-2">
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "https://images.unsplash.com/... or own image path"}
          className="flex-1 bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black focus:outline-none text-[#121212] font-mono"
        />
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="shrink-0 border-2 border-black bg-white hover:bg-neutral-150 disabled:opacity-50 px-3.5 py-2 text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer text-black"
        >
          {isUploading ? (
            <span className="flex items-center gap-1">
              <RefreshCw size={11} className="animate-spin" />
              UP...
            </span>
          ) : (
            <span>UPLOAD REAL PHOTO</span>
          )}
        </button>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-md p-3.5 text-center cursor-pointer transition-all ${
          isDragging 
            ? "border-emerald-600 bg-emerald-50/40 text-emerald-800" 
            : "border-stone-200 bg-stone-50/50 hover:bg-stone-50 hover:border-black text-stone-500"
        }`}
      >
        <span className="font-mono text-[9px] uppercase font-semibold">
          {isUploading ? "Uploading file..." : "Drag & drop image here or click to browse local files"}
        </span>
      </div>

      {error && (
        <span className="text-[9px] text-red-600 font-mono uppercase block font-black">
          ⚠ {error}
        </span>
      )}

      {value && value.startsWith("/uploads/") && (
        <span className="text-[9px] text-[#4c1d95] font-mono uppercase block font-bold">
          ✓ Active Local Photo: <span className="underline">{value.substring(value.lastIndexOf("/") + 1)}</span>
        </span>
      )}

      {helperText && <p className="text-[9px] text-[#121212]/50 italic uppercase">{helperText}</p>}
    </div>
  );
}

interface AdminViewProps {
  dbState: DatabaseState;
  refreshState: () => void;
  adminToken: string | null;
  setAdminToken: (token: string | null) => void;
}

export default function AdminView({ dbState, refreshState, adminToken, setAdminToken }: AdminViewProps) {
  // Login credentials
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Active sub-section state
  const [activeSubTab, setActiveSubTab] = useState<"news" | "roster" | "scores" | "gallery" | "welcome" | "upcoming" | "sponsors" | "siteSettings" | "siteLabels" | "homeSponsors" | "clubActivity">("news");

  // Notifications
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isMutating, setIsMutating] = useState(false);

  // Active Edit Forms state
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [newsTitle, setNewsTitle] = useState("");
  const [newsExcerpt, setNewsExcerpt] = useState("");
  const [newsContent, setNewsContent] = useState("");
  const [newsImage, setNewsImage] = useState("");
  const [newsDate, setNewsDate] = useState("");
  const [newsRank, setNewsRank] = useState<number>(0);

  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [playerHandicap, setPlayerHandicap] = useState<number>(1.5);
  const [playerYear, setPlayerYear] = useState("Freshman");
  const [playerFaculty, setPlayerFaculty] = useState("");
  const [playerImage, setPlayerImage] = useState("");
  const [playerIsFeatured, setPlayerIsFeatured] = useState(false);

  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [staffName, setStaffName] = useState("");
  const [staffRole, setStaffRole] = useState("");
  const [staffFaculty, setStaffFaculty] = useState("");
  const [staffImage, setStaffImage] = useState("");
  const [staffOrder, setStaffOrder] = useState<number>(1);

  const [editingScoreId, setEditingScoreId] = useState<string | null>(null);
  const [scoreTournamentName, setScoreTournamentName] = useState("");
  const [scoreDate, setScoreDate] = useState("");
  const [scoreResult, setScoreResult] = useState("");
  const [scoreList, setScoreList] = useState<PlayerScore[]>([
    { playerName: "Methas 'Pete' Srisai", score: 71, position: "3rd" }
  ]);

  // Gallery quick add variables
  const [galTitle, setGalTitle] = useState("");
  const [galUrl, setGalUrl] = useState("");
  const [galCategory, setGalCategory] = useState("Tournament");

  // Welcome page CMS states
  const [welcomeImageUrl, setWelcomeImageUrl] = useState(dbState.welcomeSection?.imageUrl || "");
  const [welcomeTitleThai, setWelcomeTitleThai] = useState(dbState.welcomeSection?.titleThai || "");
  const [welcomeTitleEnglish, setWelcomeTitleEnglish] = useState(dbState.welcomeSection?.titleEnglish || "");
  const [welcomeLegacyQuote, setWelcomeLegacyQuote] = useState(dbState.welcomeSection?.legacyQuote || "");
  const [welcomeLegacyQuoteAuthor, setWelcomeLegacyQuoteAuthor] = useState(dbState.welcomeSection?.legacyQuoteAuthor || "");
  const [welcomeDescription, setWelcomeDescription] = useState(dbState.welcomeSection?.description || "");

  // Upcoming Activity CMS states
  const [upcomingTitle, setUpcomingTitle] = useState(dbState.upcomingActivity?.title || "");
  const [upcomingDescription, setUpcomingDescription] = useState(dbState.upcomingActivity?.description || "");
  const [upcomingImageUrl, setUpcomingImageUrl] = useState(dbState.upcomingActivity?.imageUrl || "");
  const [upcomingDate, setUpcomingDate] = useState(dbState.upcomingActivity?.date || "");
  const [upcomingLocation, setUpcomingLocation] = useState(dbState.upcomingActivity?.location || "");
  const [upcomingRegUrl, setUpcomingRegUrl] = useState(dbState.upcomingActivity?.registrationUrl || "");
  const [upcomingShowSection, setUpcomingShowSection] = useState(dbState.upcomingActivity?.showSection ?? true);

  // Sponsors page CMS states
  const [editingSponsorId, setEditingSponsorId] = useState<string | null>(null);
  const [sponName, setSponName] = useState("");
  const [sponDescription, setSponDescription] = useState("");
  const [sponWebsiteUrl, setSponWebsiteUrl] = useState("");
  const [sponImageUrl, setSponImageUrl] = useState("");
  const [sponIsActive, setSponIsActive] = useState(true);

  // Site general settings CMS states (Marquee, contact phone, contact email, addresses)
  const [setsMarqueeText, setSetsMarqueeText] = useState(dbState.siteSettings?.marqueeText || "Chulalongkorn University Golf Club • Drive to Excellence");
  const [setsContactPhone, setSetsContactPhone] = useState(dbState.siteSettings?.contactPhone || "+66 (0) 2218-1916");
  const [setsContactEmail, setSetsContactEmail] = useState(dbState.siteSettings?.contactEmail || "golf@chula.ac.th");
  const [setsContactAddress, setSetsContactAddress] = useState(dbState.siteSettings?.contactAddress || "Chula Sports Complex, Phayathai Rd, Pathum Wan, Bangkok 10330, Thailand");
  const [setsAcademicAffiliation, setSetsAcademicAffiliation] = useState(dbState.siteSettings?.academicAffiliation || "Thailand University Golf Association (TUGA)");

  // Visibility States
  const [setsShowMarquee, setSetsShowMarquee] = useState(dbState.siteSettings?.showMarquee ?? true);
  const [setsShowHomeBlog, setSetsShowHomeBlog] = useState(dbState.siteSettings?.showHomeBlog ?? true);
  const [setsShowHomeWelcome, setSetsShowHomeWelcome] = useState(dbState.siteSettings?.showHomeWelcome ?? true);
  const [setsShowHomeScores, setSetsShowHomeScores] = useState(dbState.siteSettings?.showHomeScores ?? true);
  const [setsShowFooterMission, setSetsShowFooterMission] = useState(dbState.siteSettings?.showFooterMission ?? true);
  const [setsShowFooterLegacy, setSetsShowFooterLegacy] = useState(dbState.siteSettings?.showFooterLegacy ?? true);
  const [setsShowNavbarRoster, setSetsShowNavbarRoster] = useState(dbState.siteSettings?.showNavbarRoster ?? true);
  const [setsShowNavbarStaff, setSetsShowNavbarStaff] = useState(dbState.siteSettings?.showNavbarStaff ?? true);
  const [setsShowNavbarScores, setSetsShowNavbarScores] = useState(dbState.siteSettings?.showNavbarScores ?? true);
  const [setsShowNavbarSponsors, setSetsShowNavbarSponsors] = useState(dbState.siteSettings?.showNavbarSponsors ?? true);
  const [setsShowHomeSponsors, setSetsShowHomeSponsors] = useState(dbState.siteSettings?.showHomeSponsors ?? true);

  // Home Sponsor Section states
  const [homeSponTitle, setHomeSponTitle] = useState(dbState.homeSponsorSection?.title || "SUPPORTING EXCELLENCE");
  const [homeSponSubtitle, setHomeSponSubtitle] = useState(dbState.homeSponsorSection?.subtitle || "CORPORATE PARTNERSHIP");
  const [homeSponDescription, setHomeSponDescription] = useState(dbState.homeSponsorSection?.description || "Our sponsors provide the essential resources and infrastructure that empower our student athletes to compete at the highest collegiate level.");
  const [homeSponMarqueeText, setHomeSponMarqueeText] = useState(dbState.homeSponsorSection?.marqueeText || "");
  const [homeSponImageUrl, setHomeSponImageUrl] = useState(dbState.homeSponsorSection?.imageUrl || "");
  const [homeSponButtonText, setHomeSponButtonText] = useState(dbState.homeSponsorSection?.buttonText || "LEARN MORE");
  const [homeSponButtonUrl, setHomeSponButtonUrl] = useState(dbState.homeSponsorSection?.buttonUrl || "/sponsors");
  const [homeSponShowSection, setHomeSponShowSection] = useState(dbState.homeSponsorSection?.showSection ?? true);

  // Club Activity CMS states
  const [caHeroImageUrl, setCaHeroImageUrl] = useState(dbState.clubActivity?.heroImageUrl || "");
  const [caPhilosophyTitle, setCaPhilosophyTitle] = useState(dbState.clubActivity?.philosophyTitle || "OUR PHILOSOPHY");
  const [caPhilosophyQuote, setCaPhilosophyQuote] = useState(dbState.clubActivity?.philosophyQuote || "");
  const [caPhilosophyDescription, setCaPhilosophyDescription] = useState(dbState.clubActivity?.philosophyDescription || "");
  const [caTechnicalExcellenceDescription, setCaTechnicalExcellenceDescription] = useState(dbState.clubActivity?.technicalExcellenceDescription || "");
  const [caCaptainName, setCaCaptainName] = useState(dbState.clubActivity?.captainName || "");
  const [caCaptainRole, setCaCaptainRole] = useState(dbState.clubActivity?.captainRole || "");
  const [caCaptainImageUrl, setCaCaptainImageUrl] = useState(dbState.clubActivity?.captainImageUrl || "");
  const [caCaptainPhilosophy, setCaCaptainPhilosophy] = useState(dbState.clubActivity?.captainPhilosophy || "");
  const [caCompetitions, setCaCompetitions] = useState<Competition[]>(dbState.clubActivity?.competitions || []);
  const [caTrainingDescription, setCaTrainingDescription] = useState(dbState.clubActivity?.trainingDescription || "");
  const [caLegacyDescription, setCaLegacyDescription] = useState(dbState.clubActivity?.legacyDescription || "");
  const [caFoundedYear, setCaFoundedYear] = useState(dbState.clubActivity?.foundedYear || "1916");
  const [caActiveYears, setCaActiveYears] = useState(dbState.clubActivity?.activeYears || "100+");

  // Site Labels states
  const [labelNavHome, setLabelNavHome] = useState(dbState.siteLabels?.navHome || "HOME");
  const [labelNavBlog, setLabelNavBlog] = useState(dbState.siteLabels?.navBlog || "ACTIVITIES");
  const [labelNavRoster, setLabelNavRoster] = useState(dbState.siteLabels?.navRoster || "TEAM ROSTER");

  const [labelNavStaff, setLabelNavStaff] = useState(dbState.siteLabels?.navStaff || "STAFF & BOARD");
  const [labelNavScores, setLabelNavScores] = useState(dbState.siteLabels?.navScores || "SCORES & STATS");
  const [labelNavSponsors, setLabelNavSponsors] = useState(dbState.siteLabels?.navSponsors || "PARTNERS");
  const [labelNavAdmin, setLabelNavAdmin] = useState(dbState.siteLabels?.navAdmin || "ADMIN CMS");
  const [labelNavBrandTitle, setLabelNavBrandTitle] = useState(dbState.siteLabels?.navBrandTitle || "cugolfclub.");
  const [labelNavBrandSubtitle, setLabelNavBrandSubtitle] = useState(dbState.siteLabels?.navBrandSubtitle || "[Official] Chulalongkorn University Golf Club");
  const [labelNavAdminActive, setLabelNavAdminActive] = useState(dbState.siteLabels?.navAdminActive || "REGISTRY ACTIVE");
  const [labelNavAdminCms, setLabelNavAdminCms] = useState(dbState.siteLabels?.navAdminCms || "ADMIN CMS");

  const [labelHomeBlogTitle, setLabelHomeBlogTitle] = useState(dbState.siteLabels?.homeBlogTitle || "");
  const [labelHomeBlogSubtitle, setLabelHomeBlogSubtitle] = useState(dbState.siteLabels?.homeBlogSubtitle || "");
  const [labelHomeWelcomeHeroTitle, setLabelHomeWelcomeHeroTitle] = useState(dbState.siteLabels?.homeWelcomeHeroTitle || "");
  const [labelHomeWelcomeHeroSubtitle, setLabelHomeWelcomeHeroSubtitle] = useState(dbState.siteLabels?.homeWelcomeHeroSubtitle || "Legacy");
  const [labelHomeWelcomeHeroSocial, setLabelHomeWelcomeHeroSocial] = useState(dbState.siteLabels?.homeWelcomeHeroSocial || "cugolfclub @Student Government of Chulalongkorn University");
  const [labelHomeFeaturedActivityBadge, setLabelHomeFeaturedActivityBadge] = useState(dbState.siteLabels?.homeFeaturedActivityBadge || "FEATURED ACTIVITY");
  const [labelHomeRecentUpdatesLabel, setLabelHomeRecentUpdatesLabel] = useState(dbState.siteLabels?.homeRecentUpdatesLabel || "RECENT UPDATES");
  const [labelHomeReadCoverageButton, setLabelHomeReadCoverageButton] = useState(dbState.siteLabels?.homeReadCoverageButton || "READ COVERAGE");
  const [labelHomeReadStoryButton, setLabelHomeReadStoryButton] = useState(dbState.siteLabels?.homeReadStoryButton || "READ STORY");
  const [labelHomeLiveStandingsTitle, setLabelHomeLiveStandingsTitle] = useState(dbState.siteLabels?.homeLiveStandingsTitle || "LIVE STANDINGS");
  const [labelHomeFullLeaderboardButton, setLabelHomeFullLeaderboardButton] = useState(dbState.siteLabels?.homeFullLeaderboardButton || "FULL LEADERBOARD");
  const [labelHomeNoBlogs, setLabelHomeNoBlogs] = useState(dbState.siteLabels?.homeNoBlogs || "No activities blogs published yet.");
  const [labelHomeActivityLabel, setLabelHomeActivityLabel] = useState(dbState.siteLabels?.homeActivityLabel || "ACTIVITY");
  const [labelHomeNoScores, setLabelHomeNoScores] = useState(dbState.siteLabels?.homeNoScores || "No tournament scores listed yet.");
  const [labelHomeModalOfficialBadge, setLabelHomeModalOfficialBadge] = useState(dbState.siteLabels?.homeModalOfficialBadge || "OFFICIAL EDITORIAL");
  const [labelHomeModalEditorialBoard, setLabelHomeModalEditorialBoard] = useState(dbState.siteLabels?.homeModalEditorialBoard || "CU GOLF CLUB SPORTS EDITORIAL BOARD");
  const [labelHomeModalLocation, setLabelHomeModalLocation] = useState(dbState.siteLabels?.homeModalLocation || "BANGKOK, THAILAND");

  const [labelHomeMembershipTitle, setLabelHomeMembershipTitle] = useState(dbState.siteLabels?.homeMembershipTitle || "Become a member of the CU GOLF CLUB.");
  const [labelHomeMembershipDescription, setLabelHomeMembershipDescription] = useState(dbState.siteLabels?.homeMembershipDescription || "Expand your network and elevate your game.");
  const [labelHomeMembershipButtonText, setLabelHomeMembershipButtonText] = useState(dbState.siteLabels?.homeMembershipButtonText || "REGISTER NOW");

  const [labelRosterTitle, setLabelRosterTitle] = useState(dbState.siteLabels?.rosterTitle || "");
  const [labelRosterSubtitle, setLabelRosterSubtitle] = useState(dbState.siteLabels?.rosterSubtitle || "");
  const [labelRosterVerifiedLabel, setLabelRosterVerifiedLabel] = useState(dbState.siteLabels?.rosterVerifiedLabel || "");
  const [labelRosterSearchPlaceholder, setLabelRosterSearchPlaceholder] = useState(dbState.siteLabels?.rosterSearchPlaceholder || "Search roster registry...");
  const [labelRosterFilterLabel, setLabelRosterFilterLabel] = useState(dbState.siteLabels?.rosterFilterLabel || "CLASS YEAR:");
  const [labelRosterStatusLabel, setLabelRosterStatusLabel] = useState(dbState.siteLabels?.rosterStatusLabel || "STATUS:");
  const [labelRosterNoResultsTitle, setLabelRosterNoResultsTitle] = useState(dbState.siteLabels?.rosterNoResultsTitle || "No registrants found");
  const [labelRosterNoResultsDesc, setLabelRosterNoResultsDesc] = useState(dbState.siteLabels?.rosterNoResultsDesc || "There are no players currently recorded matching your search parameters or select class year filters.");
  const [labelRosterSquadLeadBadge, setLabelRosterSquadLeadBadge] = useState(dbState.siteLabels?.rosterSquadLeadBadge || "SQUAD LEAD");
  const [labelRosterIndexLabel, setLabelRosterIndexLabel] = useState(dbState.siteLabels?.rosterIndexLabel || "INDEX");
  const [labelRosterAthleteLabel, setLabelRosterAthleteLabel] = useState(dbState.siteLabels?.rosterAthleteLabel || "CU ATHLETE");
  const [labelRosterStatusActive, setLabelRosterStatusActive] = useState(dbState.siteLabels?.rosterStatusActive || "STATUS: ACTIVE SQUAD");

  const [labelStaffTitle, setLabelStaffTitle] = useState(dbState.siteLabels?.staffTitle || "");
  const [labelStaffSubtitle, setLabelStaffSubtitle] = useState(dbState.siteLabels?.staffSubtitle || "");
  const [labelStaffVerifiedLabel, setLabelStaffVerifiedLabel] = useState(dbState.siteLabels?.staffVerifiedLabel || "");
  const [labelScoresTitle, setLabelScoresTitle] = useState(dbState.siteLabels?.scoresTitle || "");
  const [labelScoresSubtitle, setLabelScoresSubtitle] = useState(dbState.siteLabels?.scoresSubtitle || "");
  const [labelScoresVerifiedLabel, setLabelScoresVerifiedLabel] = useState(dbState.siteLabels?.scoresVerifiedLabel || "");
  const [labelScoresRecapTitle, setLabelScoresRecapTitle] = useState(dbState.siteLabels?.scoresRecapTitle || "");
  const [labelScoresRecapSubtitle, setLabelScoresRecapSubtitle] = useState(dbState.siteLabels?.scoresRecapSubtitle || "");
  const [labelScoresOfficialStatsBadge, setLabelScoresOfficialStatsBadge] = useState(dbState.siteLabels?.scoresOfficialStatsBadge || "UNOFFICIAL STATS");
  const [labelScoresViewStandingsButton, setLabelScoresViewStandingsButton] = useState(dbState.siteLabels?.scoresViewStandingsButton || "VIEW STANDINGS");
  const [labelScoresHideStandingsButton, setLabelScoresHideStandingsButton] = useState(dbState.siteLabels?.scoresHideStandingsButton || "HIDE STANDINGS");
  const [labelScoresTablePlayerHeader, setLabelScoresTablePlayerHeader] = useState(dbState.siteLabels?.scoresTablePlayerHeader || "PLAYER NAME");
  const [labelScoresTableScoreHeader, setLabelScoresTableScoreHeader] = useState(dbState.siteLabels?.scoresTableScoreHeader || "STROKE SCORE");
  const [labelScoresTablePositionHeader, setLabelScoresTablePositionHeader] = useState(dbState.siteLabels?.scoresTablePositionHeader || "POSITION");
  const [labelScoresAttestationLabel, setLabelScoresAttestationLabel] = useState(dbState.siteLabels?.scoresAttestationLabel || "CU UNOFFICIAL GOLF SCORECARD ATTESTATION");
  const [labelScoresVerifiedDirectoryLabel, setLabelScoresVerifiedDirectoryLabel] = useState(dbState.siteLabels?.scoresVerifiedDirectoryLabel || "COACH VERIFIED DIRECTORY");
  const [labelScoresDetailedLeaderboardTitle, setLabelScoresDetailedLeaderboardTitle] = useState(dbState.siteLabels?.scoresDetailedLeaderboardTitle || "DETAILED COMPETITIVE LEADERBOARD");

  const [labelSponsorsTitle, setLabelSponsorsTitle] = useState(dbState.siteLabels?.sponsorsTitle || "");
  const [labelSponsorsSubtitle, setLabelSponsorsSubtitle] = useState(dbState.siteLabels?.sponsorsSubtitle || "");
  const [labelSponsorsVerifiedLabel, setLabelSponsorsVerifiedLabel] = useState(dbState.siteLabels?.sponsorsVerifiedLabel || "");
  const [labelSponsorsContactTitle, setLabelSponsorsContactTitle] = useState(dbState.siteLabels?.sponsorsContactTitle || "");
  const [labelSponsorsContactDescription, setLabelSponsorsContactDescription] = useState(dbState.siteLabels?.sponsorsContactDescription || "");
  const [labelSponsorsOfficiallyAssociatedLabel, setLabelSponsorsOfficiallyAssociatedLabel] = useState(dbState.siteLabels?.sponsorsOfficiallyAssociatedLabel || "OFFICIALLY ASSOCIATED 2026");

  const [labelFooterMissionTitle, setLabelFooterMissionTitle] = useState(dbState.siteLabels?.footerMissionTitle || "");
  const [labelFooterMissionDescription, setLabelFooterMissionDescription] = useState(dbState.siteLabels?.footerMissionDescription || "");
  const [labelFooterLegacyTitle, setLabelFooterLegacyTitle] = useState(dbState.siteLabels?.footerLegacyTitle || "");
  const [labelFooterLegacyDescription, setLabelFooterLegacyDescription] = useState(dbState.siteLabels?.footerLegacyDescription || "");
  const [labelFooterDirectoryTitle, setLabelFooterDirectoryTitle] = useState(dbState.siteLabels?.footerDirectoryTitle || "DIRECTORY");
  const [labelFooterHeadquartersTitle, setLabelFooterHeadquartersTitle] = useState(dbState.siteLabels?.footerHeadquartersTitle || "HEADQUARTERS");
  const [labelFooterAffiliationsTitle, setLabelFooterAffiliationsTitle] = useState(dbState.siteLabels?.footerAffiliationsTitle || "AFFILIATIONS");
  const [labelFooterRightsReserved, setLabelFooterRightsReserved] = useState(dbState.siteLabels?.footerRightsReserved || "© {year} CHULALONGKORN UNIVERSITY GOLF CLUB. ALL RIGHTS RESERVED.");
  const [labelFooterCmsLogin, setLabelFooterCmsLogin] = useState(dbState.siteLabels?.footerCmsLogin || "CMS LOG-IN");
  const [labelFooterPrivacyDisclosure, setLabelFooterPrivacyDisclosure] = useState(dbState.siteLabels?.footerPrivacyDisclosure || "PRIVACY DISCLOSURE");
  const [labelFooterTermsOfTradition, setLabelFooterTermsOfTradition] = useState(dbState.siteLabels?.footerTermsOfTradition || "TERMS OF TRADITION");
  const [labelFooterDirectoryNewsRoom, setLabelFooterDirectoryNewsRoom] = useState(dbState.siteLabels?.footerDirectoryNewsRoom || "NEWS ROOM");
  const [labelFooterDirectoryRoster, setLabelFooterDirectoryRoster] = useState(dbState.siteLabels?.footerDirectoryRoster || "VARSITY ROSTER");
  const [labelFooterDirectoryScores, setLabelFooterDirectoryScores] = useState(dbState.siteLabels?.footerDirectoryScores || "MATCH STATS");
  const [labelFooterAffiliationsChulaMain, setLabelFooterAffiliationsChulaMain] = useState(dbState.siteLabels?.footerAffiliationsChulaMain || "CHULA MAIN");
  const [labelFooterAffiliationsSportsOffice, setLabelFooterAffiliationsSportsOffice] = useState(dbState.siteLabels?.footerAffiliationsSportsOffice || "CU SPORTS OFFICE");

  const [labelWelcomeHeroTitle, setLabelWelcomeHeroTitle] = useState(dbState.siteLabels?.welcomeHeroTitle || "Longstanding");
  const [labelWelcomeHeroSubtitle, setLabelWelcomeHeroSubtitle] = useState(dbState.siteLabels?.welcomeHeroSubtitle || "Legacy");
  const [labelWelcomeHeroSocial, setLabelWelcomeHeroSocial] = useState(dbState.siteLabels?.welcomeHeroSocial || "cugolfclub @Student Government of Chulalongkorn University");

  // Clear sync with outer state updates
  React.useEffect(() => {
    if (dbState?.welcomeSection) {
      setWelcomeImageUrl(dbState.welcomeSection?.imageUrl || "");
      setWelcomeTitleThai(dbState.welcomeSection?.titleThai || "");
      setWelcomeTitleEnglish(dbState.welcomeSection?.titleEnglish || "");
      setWelcomeLegacyQuote(dbState.welcomeSection?.legacyQuote || "");
      setWelcomeLegacyQuoteAuthor(dbState.welcomeSection?.legacyQuoteAuthor || "");
      setWelcomeDescription(dbState.welcomeSection?.description || "");
    }
    if (dbState?.siteSettings) {
      setSetsMarqueeText(dbState.siteSettings?.marqueeText || "Chulalongkorn University Golf Club • Drive to Excellence");
      setSetsContactPhone(dbState.siteSettings?.contactPhone || "+66 (0) 2218-1916");
      setSetsContactEmail(dbState.siteSettings?.contactEmail || "golf@chula.ac.th");
      setSetsContactAddress(dbState.siteSettings?.contactAddress || "Chula Sports Complex, Phayathai Rd, Pathum Wan, Bangkok 10330, Thailand");
      setSetsAcademicAffiliation(dbState.siteSettings?.academicAffiliation || "Thailand University Golf Association (TUGA)");
      
      setSetsShowMarquee(dbState.siteSettings?.showMarquee ?? true);
      setSetsShowHomeBlog(dbState.siteSettings?.showHomeBlog ?? true);
      setSetsShowHomeWelcome(dbState.siteSettings?.showHomeWelcome ?? true);
      setSetsShowHomeScores(dbState.siteSettings?.showHomeScores ?? true);
      setSetsShowFooterMission(dbState.siteSettings?.showFooterMission ?? true);
      setSetsShowFooterLegacy(dbState.siteSettings?.showFooterLegacy ?? true);
      setSetsShowNavbarRoster(dbState.siteSettings?.showNavbarRoster ?? true);
      setSetsShowNavbarStaff(dbState.siteSettings?.showNavbarStaff ?? true);
      setSetsShowNavbarScores(dbState.siteSettings?.showNavbarScores ?? true);
      setSetsShowNavbarSponsors(dbState.siteSettings?.showNavbarSponsors ?? true);
      setSetsShowHomeSponsors(dbState.siteSettings?.showHomeSponsors ?? true);
    }
    if (dbState?.homeSponsorSection) {
      setHomeSponTitle(dbState.homeSponsorSection?.title || "");
      setHomeSponSubtitle(dbState.homeSponsorSection?.subtitle || "");
      setHomeSponDescription(dbState.homeSponsorSection?.description || "");
      setHomeSponMarqueeText(dbState.homeSponsorSection?.marqueeText || "");
      setHomeSponImageUrl(dbState.homeSponsorSection?.imageUrl || "");
      setHomeSponButtonText(dbState.homeSponsorSection?.buttonText || "");
      setHomeSponButtonUrl(dbState.homeSponsorSection?.buttonUrl || "");
      setHomeSponShowSection(dbState.homeSponsorSection?.showSection ?? true);
    }
    if (dbState?.upcomingActivity) {
      setUpcomingTitle(dbState.upcomingActivity?.title || "");
      setUpcomingDescription(dbState.upcomingActivity?.description || "");
      setUpcomingImageUrl(dbState.upcomingActivity?.imageUrl || "");
      setUpcomingDate(dbState.upcomingActivity?.date || "");
      setUpcomingLocation(dbState.upcomingActivity?.location || "");
      setUpcomingRegUrl(dbState.upcomingActivity?.registrationUrl || "");
      setUpcomingShowSection(dbState.upcomingActivity?.showSection ?? true);
    }
    if (dbState?.clubActivity) {
      setCaHeroImageUrl(dbState.clubActivity.heroImageUrl || "");
      setCaPhilosophyTitle(dbState.clubActivity.philosophyTitle || "");
      setCaPhilosophyQuote(dbState.clubActivity.philosophyQuote || "");
      setCaPhilosophyDescription(dbState.clubActivity.philosophyDescription || "");
      setCaTechnicalExcellenceDescription(dbState.clubActivity.technicalExcellenceDescription || "");
      setCaCaptainName(dbState.clubActivity.captainName || "");
      setCaCaptainRole(dbState.clubActivity.captainRole || "");
      setCaCaptainImageUrl(dbState.clubActivity.captainImageUrl || "");
      setCaCaptainPhilosophy(dbState.clubActivity.captainPhilosophy || "");
      setCaCompetitions(dbState.clubActivity.competitions || []);
      setCaTrainingDescription(dbState.clubActivity.trainingDescription || "");
      setCaLegacyDescription(dbState.clubActivity.legacyDescription || "");
      setCaFoundedYear(dbState.clubActivity.foundedYear || "");
      setCaActiveYears(dbState.clubActivity.activeYears || "");
    }
    if (dbState?.siteLabels) {
      setLabelNavHome(dbState.siteLabels?.navHome || "HOME");
      setLabelNavRoster(dbState.siteLabels?.navRoster || "TEAM ROSTER");
      setLabelNavStaff(dbState.siteLabels?.navStaff || "STAFF & BOARD");
      setLabelNavScores(dbState.siteLabels?.navScores || "SCORES & STATS");
      setLabelNavSponsors(dbState.siteLabels?.navSponsors || "PARTNERS");
      setLabelNavAdmin(dbState.siteLabels?.navAdmin || "ADMIN CMS");
      setLabelNavBrandTitle(dbState.siteLabels?.navBrandTitle || "cugolfclub.");
      setLabelNavBrandSubtitle(dbState.siteLabels?.navBrandSubtitle || "[Official] Chulalongkorn University Golf Club");
      setLabelNavAdminActive(dbState.siteLabels?.navAdminActive || "REGISTRY ACTIVE");
      setLabelNavAdminCms(dbState.siteLabels?.navAdminCms || "ADMIN CMS");

      setLabelHomeBlogTitle(dbState.siteLabels?.homeBlogTitle || "");
      setLabelHomeBlogSubtitle(dbState.siteLabels?.homeBlogSubtitle || "");
      setLabelHomeWelcomeHeroTitle(dbState.siteLabels?.homeWelcomeHeroTitle || "");
      setLabelHomeWelcomeHeroSubtitle(dbState.siteLabels?.homeWelcomeHeroSubtitle || "Legacy");
      setLabelHomeWelcomeHeroSocial(dbState.siteLabels?.homeWelcomeHeroSocial || "cugolfclub @Student Government of Chulalongkorn University");
      setLabelHomeFeaturedActivityBadge(dbState.siteLabels?.homeFeaturedActivityBadge || "FEATURED ACTIVITY");
      setLabelHomeRecentUpdatesLabel(dbState.siteLabels?.homeRecentUpdatesLabel || "RECENT UPDATES");
      setLabelHomeReadCoverageButton(dbState.siteLabels?.homeReadCoverageButton || "READ COVERAGE");
      setLabelHomeReadStoryButton(dbState.siteLabels?.homeReadStoryButton || "READ STORY");
      setLabelHomeLiveStandingsTitle(dbState.siteLabels?.homeLiveStandingsTitle || "LIVE STANDINGS");
      setLabelHomeFullLeaderboardButton(dbState.siteLabels?.homeFullLeaderboardButton || "FULL LEADERBOARD");
      setLabelHomeNoBlogs(dbState.siteLabels?.homeNoBlogs || "No activities blogs published yet.");
      setLabelHomeActivityLabel(dbState.siteLabels?.homeActivityLabel || "ACTIVITY");
      setLabelHomeNoScores(dbState.siteLabels?.homeNoScores || "No tournament scores listed yet.");
      setLabelHomeModalOfficialBadge(dbState.siteLabels?.homeModalOfficialBadge || "OFFICIAL EDITORIAL");
      setLabelHomeModalEditorialBoard(dbState.siteLabels?.homeModalEditorialBoard || "CU GOLF CLUB SPORTS EDITORIAL BOARD");
      setLabelHomeModalLocation(dbState.siteLabels?.homeModalLocation || "BANGKOK, THAILAND");

      setLabelHomeMembershipTitle(dbState.siteLabels?.homeMembershipTitle || "Become a member of the CU GOLF CLUB.");
      setLabelHomeMembershipDescription(dbState.siteLabels?.homeMembershipDescription || "Expand your network and elevate your game.");
      setLabelHomeMembershipButtonText(dbState.siteLabels?.homeMembershipButtonText || "REGISTER NOW");

      setLabelRosterTitle(dbState.siteLabels?.rosterTitle || "");
      setLabelRosterSubtitle(dbState.siteLabels?.rosterSubtitle || "");
      setLabelRosterVerifiedLabel(dbState.siteLabels?.rosterVerifiedLabel || "");
      setLabelRosterSearchPlaceholder(dbState.siteLabels?.rosterSearchPlaceholder || "Search roster registry...");
      setLabelRosterFilterLabel(dbState.siteLabels?.rosterFilterLabel || "CLASS YEAR:");
      setLabelRosterStatusLabel(dbState.siteLabels?.rosterStatusLabel || "STATUS:");
      setLabelRosterNoResultsTitle(dbState.siteLabels?.rosterNoResultsTitle || "No registrants found");
      setLabelRosterNoResultsDesc(dbState.siteLabels?.rosterNoResultsDesc || "There are no players currently recorded matching your search parameters or select class year filters.");
      setLabelRosterSquadLeadBadge(dbState.siteLabels?.rosterSquadLeadBadge || "SQUAD LEAD");
      setLabelRosterIndexLabel(dbState.siteLabels?.rosterIndexLabel || "INDEX");
      setLabelRosterAthleteLabel(dbState.siteLabels?.rosterAthleteLabel || "CU ATHLETE");
      setLabelRosterStatusActive(dbState.siteLabels?.rosterStatusActive || "STATUS: ACTIVE SQUAD");

      setLabelStaffTitle(dbState.siteLabels?.staffTitle || "");
      setLabelStaffSubtitle(dbState.siteLabels?.staffSubtitle || "");
      setLabelStaffVerifiedLabel(dbState.siteLabels?.staffVerifiedLabel || "");
      setLabelScoresTitle(dbState.siteLabels?.scoresTitle || "");
      setLabelScoresSubtitle(dbState.siteLabels?.scoresSubtitle || "");
      setLabelScoresVerifiedLabel(dbState.siteLabels?.scoresVerifiedLabel || "");
      setLabelScoresRecapTitle(dbState.siteLabels?.scoresRecapTitle || "");
      setLabelScoresRecapSubtitle(dbState.siteLabels?.scoresRecapSubtitle || "");
      setLabelScoresOfficialStatsBadge(dbState.siteLabels?.scoresOfficialStatsBadge || "UNOFFICIAL STATS");
      setLabelScoresViewStandingsButton(dbState.siteLabels?.scoresViewStandingsButton || "VIEW STANDINGS");
      setLabelScoresHideStandingsButton(dbState.siteLabels?.scoresHideStandingsButton || "HIDE STANDINGS");
      setLabelScoresTablePlayerHeader(dbState.siteLabels?.scoresTablePlayerHeader || "PLAYER NAME");
      setLabelScoresTableScoreHeader(dbState.siteLabels?.scoresTableScoreHeader || "STROKE SCORE");
      setLabelScoresTablePositionHeader(dbState.siteLabels?.scoresTablePositionHeader || "POSITION");
      setLabelScoresAttestationLabel(dbState.siteLabels?.scoresAttestationLabel || "CU UNOFFICIAL GOLF SCORECARD ATTESTATION");
      setLabelScoresVerifiedDirectoryLabel(dbState.siteLabels?.scoresVerifiedDirectoryLabel || "COACH VERIFIED DIRECTORY");
      setLabelScoresDetailedLeaderboardTitle(dbState.siteLabels?.scoresDetailedLeaderboardTitle || "DETAILED COMPETITIVE LEADERBOARD");

      setLabelSponsorsTitle(dbState.siteLabels?.sponsorsTitle || "");
      setLabelSponsorsSubtitle(dbState.siteLabels?.sponsorsSubtitle || "");
      setLabelSponsorsVerifiedLabel(dbState.siteLabels?.sponsorsVerifiedLabel || "");
      setLabelSponsorsContactTitle(dbState.siteLabels?.sponsorsContactTitle || "");
      setLabelSponsorsContactDescription(dbState.siteLabels?.sponsorsContactDescription || "");
      setLabelSponsorsOfficiallyAssociatedLabel(dbState.siteLabels?.sponsorsOfficiallyAssociatedLabel || "OFFICIALLY ASSOCIATED 2026");

      setLabelFooterMissionTitle(dbState.siteLabels?.footerMissionTitle || "");
      setLabelFooterMissionDescription(dbState.siteLabels?.footerMissionDescription || "");
      setLabelFooterLegacyTitle(dbState.siteLabels?.footerLegacyTitle || "");
      setLabelFooterLegacyDescription(dbState.siteLabels?.footerLegacyDescription || "");
      setLabelFooterDirectoryTitle(dbState.siteLabels?.footerDirectoryTitle || "DIRECTORY");
      setLabelFooterHeadquartersTitle(dbState.siteLabels?.footerHeadquartersTitle || "HEADQUARTERS");
      setLabelFooterAffiliationsTitle(dbState.siteLabels?.footerAffiliationsTitle || "AFFILIATIONS");
      setLabelFooterRightsReserved(dbState.siteLabels?.footerRightsReserved || "© {year} CHULALONGKORN UNIVERSITY GOLF CLUB. ALL RIGHTS RESERVED.");
      setLabelFooterCmsLogin(dbState.siteLabels?.footerCmsLogin || "CMS LOG-IN");
      setLabelFooterPrivacyDisclosure(dbState.siteLabels?.footerPrivacyDisclosure || "PRIVACY DISCLOSURE");
      setLabelFooterTermsOfTradition(dbState.siteLabels?.footerTermsOfTradition || "TERMS OF TRADITION");
      setLabelFooterDirectoryNewsRoom(dbState.siteLabels?.footerDirectoryNewsRoom || "NEWS ROOM");
      setLabelFooterDirectoryRoster(dbState.siteLabels?.footerDirectoryRoster || "VARSITY ROSTER");
      setLabelFooterDirectoryScores(dbState.siteLabels?.footerDirectoryScores || "MATCH STATS");
      setLabelFooterAffiliationsChulaMain(dbState.siteLabels?.footerAffiliationsChulaMain || "CHULA MAIN");
      setLabelFooterAffiliationsSportsOffice(dbState.siteLabels?.footerAffiliationsSportsOffice || "CU SPORTS OFFICE");

      setLabelWelcomeHeroTitle(dbState.siteLabels?.welcomeHeroTitle || "Longstanding");
      setLabelWelcomeHeroSubtitle(dbState.siteLabels?.welcomeHeroSubtitle || "Legacy");
      setLabelWelcomeHeroSocial(dbState.siteLabels?.welcomeHeroSocial || "cugolfclub @Student Government of Chulalongkorn University");
    }
  }, [dbState]);

  // Helpers to show notifications brief
  const triggerSuccessMsg = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  const triggerErrorMsg = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(""), 3500);
  };

  // Administration authentication handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsAuthenticating(true);
    try {
      const result = await loginAdmin(password);
      if (result.success && result.token) {
        setAdminToken(result.token);
        triggerSuccessMsg("Administrator session successfully authenticated.");
      } else {
        setLoginError(result.message || "Invalid passkey credentials.");
      }
    } catch (err: any) {
      setLoginError("Failed to reach server authentication endpoint.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Logout handler
  const handleLogout = () => {
    setAdminToken(null);
    triggerSuccessMsg("Log out complete.");
  };

  // -- NEWS CRUD ACTIONS --
  const handleSaveNews = async () => {
    if (!newsTitle || !newsExcerpt || !newsContent) {
      triggerErrorMsg("News fields cannot be empty.");
      return;
    }
    setIsMutating(true);
    try {
      const payload = {
        title: newsTitle,
        excerpt: newsExcerpt,
        content: newsContent,
        imageUrl: newsImage || "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=1200",
        publishDate: newsDate || new Date().toISOString().split("T")[0],
        rank: newsRank
      };

      if (editingNewsId) {
        await updateNews(editingNewsId, payload);
        triggerSuccessMsg("Activity story updated.");
      } else {
        await createNews(payload);
        triggerSuccessMsg("New activity story published.");
      }

      // Reset
      setEditingNewsId(null);
      setNewsTitle("");
      setNewsExcerpt("");
      setNewsContent("");
      setNewsImage("");
      setNewsDate("");
      setNewsRank(0);
      refreshState();
    } catch (err: any) {
      triggerErrorMsg(err.message || "Failed to save changes.");
    } finally {
      setIsMutating(false);
    }
  };

  const handleEditNewsTrigger = (item: NewsItem) => {
    setEditingNewsId(item.id);
    setNewsTitle(item.title);
    setNewsExcerpt(item.excerpt);
    setNewsContent(item.content);
    setNewsImage(item.imageUrl);
    setNewsDate(item.publishDate);
    setNewsRank(item.rank || 0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteNewsCall = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this activity story permanently?")) return;
    setIsMutating(true);
    try {
      await deleteNews(id);
      triggerSuccessMsg("Activity story removed.");
      refreshState();
    } catch (err) {
      triggerErrorMsg("Failed to delete.");
    } finally {
      setIsMutating(false);
    }
  };

  // -- ROSTER CRUD ACTIONS --
  const handleSavePlayer = async () => {
    if (!playerName) {
      triggerErrorMsg("Player name is required.");
      return;
    }
    setIsMutating(true);
    try {
      const payload = {
        name: playerName,
        handicap: playerHandicap,
        year: playerYear,
        faculty: playerFaculty || "Faculty of Sports Science",
        imageUrl: playerImage || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400",
        isFeatured: playerIsFeatured
      };

      if (editingPlayerId) {
        await updatePlayer(editingPlayerId, payload);
        triggerSuccessMsg("Player updated.");
      } else {
        await createPlayer(payload);
        triggerSuccessMsg("New athlete added to varsity.");
      }

      setEditingPlayerId(null);
      setPlayerName("");
      setPlayerHandicap(1.5);
      setPlayerYear("Freshman");
      setPlayerFaculty("");
      setPlayerImage("");
      setPlayerIsFeatured(false);
      refreshState();
    } catch (err) {
      triggerErrorMsg("Failed to save player.");
    } finally {
      setIsMutating(false);
    }
  };

  const handleEditPlayerTrigger = (item: Player) => {
    setEditingPlayerId(item.id);
    setPlayerName(item.name);
    setPlayerHandicap(item.handicap);
    setPlayerYear(item.year);
    setPlayerFaculty(item.faculty || "");
    setPlayerImage(item.imageUrl);
    setPlayerIsFeatured(!!item.isFeatured);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeletePlayerCall = async (id: string) => {
    if (!window.confirm("Remove player registry permanently?")) return;
    setIsMutating(true);
    try {
      await deletePlayer(id);
      triggerSuccessMsg("Player registry removed.");
      refreshState();
    } catch (err) {
      triggerErrorMsg("Failed to delete.");
    } finally {
      setIsMutating(false);
    }
  };

  // -- STAFF CRUD ACTIONS --
  const handleSaveStaff = async () => {
    if (!staffName || !staffRole) {
      triggerErrorMsg("Name and Role are required.");
      return;
    }
    setIsMutating(true);
    try {
      const payload = {
        name: staffName,
        role: staffRole,
        year: staffFaculty || "Faculty of Sports Science",
        imageUrl: staffImage || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400",
        order: staffOrder
      };

      if (editingStaffId) {
        await updateStaff(editingStaffId, payload);
        triggerSuccessMsg("Staff member updated.");
      } else {
        await createStaff(payload);
        triggerSuccessMsg("New staff added.");
      }

      setEditingStaffId(null);
      setStaffName("");
      setStaffRole("");
      setStaffFaculty("");
      setStaffImage("");
      setStaffOrder(1);
      refreshState();
    } catch (err) {
      triggerErrorMsg("Failed to save staff.");
    } finally {
      setIsMutating(false);
    }
  };

  const handleEditStaffTrigger = (item: Staff) => {
    setEditingStaffId(item.id);
    setStaffName(item.name);
    setStaffRole(item.role);
    setStaffFaculty(item.year);
    setStaffImage(item.imageUrl);
    setStaffOrder(item.order);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteStaffCall = async (id: string) => {
    if (!window.confirm("Remove staff member permanently?")) return;
    setIsMutating(true);
    try {
      await deleteStaff(id);
      triggerSuccessMsg("Staff member deleted.");
      refreshState();
    } catch (err) {
      triggerErrorMsg("Failed to delete.");
    } finally {
      setIsMutating(false);
    }
  };

  // -- TOURNAMENTS CRUD ACTIONS & SUB-ROWS --
  const handleSaveTournament = async () => {
    if (!scoreTournamentName || !scoreDate || !scoreResult) {
      triggerErrorMsg("All tournament parameters are required.");
      return;
    }
    setIsMutating(true);
    try {
      const payload = {
        tournamentName: scoreTournamentName,
        date: scoreDate,
        result: scoreResult,
        scoresList: scoreList
      };

      if (editingScoreId) {
        await updateTournamentScore(editingScoreId, payload);
        triggerSuccessMsg("Tournament scoreboard updated.");
      } else {
        await createTournamentScore(payload);
        triggerSuccessMsg("New match result logged.");
      }

      setEditingScoreId(null);
      setScoreTournamentName("");
      setScoreDate("");
      setScoreResult("");
      setScoreList([{ playerName: "Methas 'Pete' Srisai", score: 71, position: "3rd" }]);
      refreshState();
    } catch (err) {
      triggerErrorMsg("Failed to save scoreboard.");
    } finally {
      setIsMutating(false);
    }
  };

  const handleAddPlayerScoreRow = () => {
    setScoreList([...scoreList, { playerName: "", score: 72, position: "" }]);
  };

  const handleRemovePlayerScoreRow = (index: number) => {
    const updated = scoreList.filter((_, idx) => idx !== index);
    setScoreList(updated);
  };

  const handleUpdatePlayerScoreRow = (index: number, field: string, value: any) => {
    const updated = [...scoreList];
    updated[index] = { ...updated[index], [field]: value };
    setScoreList(updated);
  };

  const handleEditScoreTrigger = (item: TournamentScore) => {
    setEditingScoreId(item.id);
    setScoreTournamentName(item.tournamentName);
    setScoreDate(item.date);
    setScoreResult(item.result);
    setScoreList(item.scoresList);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteScoreCall = async (id: string) => {
    if (!window.confirm("Delete this entire scoreboard entry?")) return;
    setIsMutating(true);
    try {
      await deleteTournamentScore(id);
      triggerSuccessMsg("Leaderboard deleted.");
      refreshState();
    } catch (err) {
      triggerErrorMsg("Failed to delete.");
    } finally {
      setIsMutating(false);
    }
  };

  // -- GALLERY CURATOR ACTIONS --
  const handleSaveGalleryImage = async () => {
    if (!galTitle || !galUrl) {
      triggerErrorMsg("Title and Image URL are required.");
      return;
    }
    setIsMutating(true);
    try {
      await createGalleryImage({
        title: galTitle,
        imageUrl: galUrl,
        category: galCategory
      });
      triggerSuccessMsg("Gallery image curated successfully.");
      setGalTitle("");
      setGalUrl("");
      setGalCategory("Tournament");
      refreshState();
    } catch (err) {
      triggerErrorMsg("Failed to save gallery.");
    } finally {
      setIsMutating(false);
    }
  };

  const handleDeleteGalleryCall = async (id: string) => {
    if (!window.confirm("Remove this photo from curation?")) return;
    setIsMutating(true);
    try {
      await deleteGalleryImage(id);
      triggerSuccessMsg("Gallery photo removed.");
      refreshState();
    } catch (err) {
      triggerErrorMsg("Failed to remove image.");
    } finally {
      setIsMutating(false);
    }
  };

  // -- WELCOME CMS HANDLERS --
  const handleUpdateWelcomeSection = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsMutating(true);
    try {
      const data = await updateWelcomeSection({
        imageUrl: welcomeImageUrl,
        titleThai: welcomeTitleThai,
        titleEnglish: welcomeTitleEnglish,
        legacyQuote: welcomeLegacyQuote,
        legacyQuoteAuthor: welcomeLegacyQuoteAuthor,
        description: welcomeDescription
      });
      if (data.success) {
        triggerSuccessMsg("STATIC WELCOME PHOTOS & LEGACY QUOTE SETTINGS SUCCESSFULLY UPDATED.");
        refreshState();
      } else {
        triggerErrorMsg("UNABLE TO TRANSMIT REVISION DRAFT CORRECTION BACK TO SERVER STATE.");
      }
    } catch (err: any) {
      console.error(err);
      triggerErrorMsg(err.message || "DATALINK ERROR UPDATING GREETING BLOCKS.");
    } finally {
      setIsMutating(false);
    }
  };

  const handleUpdateUpcomingActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsMutating(true);
    try {
      const resVal = await updateUpcomingActivity({
        title: upcomingTitle,
        description: upcomingDescription,
        imageUrl: upcomingImageUrl,
        date: upcomingDate,
        location: upcomingLocation,
        registrationUrl: upcomingRegUrl,
        showSection: upcomingShowSection
      });
      if (resVal.success) {
        triggerSuccessMsg("UPCOMING ACTIVITY DETAILS SUCCESSFULLY UPDATED.");
        refreshState();
      } else {
        triggerErrorMsg("UNABLE TO TRANSMIT REVISION DRAFT CORRECTION BACK TO SERVER STATE.");
      }
    } catch (err: any) {
      console.error(err);
      triggerErrorMsg(err.message || "DATALINK ERROR UPDATING ACTIVITY BLOCKS.");
    } finally {
      setIsMutating(false);
    }
  };

  // -- SPONSORS CMS HANDLERS --
  const handleSaveSponsor = async () => {
    if (!sponName) {
      triggerErrorMsg("Sponsor name is required.");
      return;
    }
    setIsMutating(true);
    try {
      const payload = {
        name: sponName,
        description: sponDescription,
        websiteUrl: sponWebsiteUrl,
        imageUrl: sponImageUrl,
        isActive: sponIsActive
      };

      if (editingSponsorId) {
        await updateSponsor(editingSponsorId, payload);
        triggerSuccessMsg("Sponsor details updated.");
      } else {
        await createSponsor(payload);
        triggerSuccessMsg("New sponsor brand uploaded.");
      }

      setEditingSponsorId(null);
      setSponName("");
      setSponDescription("");
      setSponWebsiteUrl("");
      setSponImageUrl("");
      setSponIsActive(true);
      refreshState();
    } catch (err) {
      triggerErrorMsg("Failed to save sponsor partner.");
    } finally {
      setIsMutating(false);
    }
  };

  const handleEditSponsorTrigger = (item: Sponsor) => {
    setActiveSubTab("sponsors");
    setEditingSponsorId(item.id);
    setSponName(item.name);
    setSponDescription(item.description);
    setSponWebsiteUrl(item.websiteUrl || "");
    setSponImageUrl(item.imageUrl || "");
    setSponIsActive(!!item.isActive);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteSponsorCall = async (id: string) => {
    if (!window.confirm("Remove this sponsor permanently?")) return;
    setIsMutating(true);
    try {
      await deleteSponsor(id);
      triggerSuccessMsg("Sponsor deleted.");
      refreshState();
    } catch (err) {
      triggerErrorMsg("Failed to remove sponsor.");
    } finally {
      setIsMutating(false);
    }
  };

  // -- SITE LABELS HANDLER --
  const handleUpdateSiteLabels = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsMutating(true);
    try {
      const resVal = await updateSiteLabels({
        navHome: labelNavHome,
        navBlog: labelNavBlog,
        navRoster: labelNavRoster,
        navStaff: labelNavStaff,
        navScores: labelNavScores,
        navSponsors: labelNavSponsors,
        navAdmin: labelNavAdmin,
        navBrandTitle: labelNavBrandTitle,
        navBrandSubtitle: labelNavBrandSubtitle,
        navAdminActive: labelNavAdminActive,
        navAdminCms: labelNavAdminCms,
        homeBlogTitle: labelHomeBlogTitle,
        homeBlogSubtitle: labelHomeBlogSubtitle,
        homeWelcomeHeroTitle: labelHomeWelcomeHeroTitle,        homeWelcomeHeroSubtitle: labelHomeWelcomeHeroSubtitle,
        homeWelcomeHeroSocial: labelHomeWelcomeHeroSocial,
        homeFeaturedActivityBadge: labelHomeFeaturedActivityBadge,
        homeRecentUpdatesLabel: labelHomeRecentUpdatesLabel,
        homeReadCoverageButton: labelHomeReadCoverageButton,
        homeReadStoryButton: labelHomeReadStoryButton,
        homeLiveStandingsTitle: labelHomeLiveStandingsTitle,
        homeFullLeaderboardButton: labelHomeFullLeaderboardButton,
        homeNoBlogs: labelHomeNoBlogs,
        homeActivityLabel: labelHomeActivityLabel,
        homeNoScores: labelHomeNoScores,
        homeModalOfficialBadge: labelHomeModalOfficialBadge,        homeModalEditorialBoard: labelHomeModalEditorialBoard,
        homeModalLocation: labelHomeModalLocation,
        homeMembershipTitle: labelHomeMembershipTitle,
        homeMembershipDescription: labelHomeMembershipDescription,
        homeMembershipButtonText: labelHomeMembershipButtonText,
        rosterTitle: labelRosterTitle,        rosterSubtitle: labelRosterSubtitle,
        rosterVerifiedLabel: labelRosterVerifiedLabel,
        rosterSearchPlaceholder: labelRosterSearchPlaceholder,
        rosterFilterLabel: labelRosterFilterLabel,
        rosterStatusLabel: labelRosterStatusLabel,
        rosterNoResultsTitle: labelRosterNoResultsTitle,
        rosterNoResultsDesc: labelRosterNoResultsDesc,
        rosterSquadLeadBadge: labelRosterSquadLeadBadge,
        rosterIndexLabel: labelRosterIndexLabel,
        rosterAthleteLabel: labelRosterAthleteLabel,
        rosterStatusActive: labelRosterStatusActive,
        staffTitle: labelStaffTitle,
        staffSubtitle: labelStaffSubtitle,
        staffVerifiedLabel: labelStaffVerifiedLabel,
        scoresTitle: labelScoresTitle,
        scoresSubtitle: labelScoresSubtitle,
        scoresVerifiedLabel: labelScoresVerifiedLabel,
        scoresRecapTitle: labelScoresRecapTitle,
        scoresRecapSubtitle: labelScoresRecapSubtitle,
        scoresOfficialStatsBadge: labelScoresOfficialStatsBadge,
        scoresViewStandingsButton: labelScoresViewStandingsButton,
        scoresHideStandingsButton: labelScoresHideStandingsButton,
        scoresTablePlayerHeader: labelScoresTablePlayerHeader,
        scoresTableScoreHeader: labelScoresTableScoreHeader,
        scoresTablePositionHeader: labelScoresTablePositionHeader,
        scoresAttestationLabel: labelScoresAttestationLabel,
        scoresVerifiedDirectoryLabel: labelScoresVerifiedDirectoryLabel,
        scoresDetailedLeaderboardTitle: labelScoresDetailedLeaderboardTitle,        sponsorsTitle: labelSponsorsTitle,
        sponsorsSubtitle: labelSponsorsSubtitle,
        sponsorsVerifiedLabel: labelSponsorsVerifiedLabel,
        sponsorsContactTitle: labelSponsorsContactTitle,
        sponsorsContactDescription: labelSponsorsContactDescription,
        sponsorsOfficiallyAssociatedLabel: labelSponsorsOfficiallyAssociatedLabel,        footerMissionTitle: labelFooterMissionTitle,
        footerMissionDescription: labelFooterMissionDescription,
        footerLegacyTitle: labelFooterLegacyTitle,
        footerLegacyDescription: labelFooterLegacyDescription,
        footerDirectoryTitle: labelFooterDirectoryTitle,        footerHeadquartersTitle: labelFooterHeadquartersTitle,
        footerAffiliationsTitle: labelFooterAffiliationsTitle,
        footerRightsReserved: labelFooterRightsReserved,
        footerCmsLogin: labelFooterCmsLogin,
        footerPrivacyDisclosure: labelFooterPrivacyDisclosure,
        footerTermsOfTradition: labelFooterTermsOfTradition,
        footerDirectoryNewsRoom: labelFooterDirectoryNewsRoom,        footerDirectoryRoster: labelFooterDirectoryRoster,
        footerDirectoryScores: labelFooterDirectoryScores,
        footerAffiliationsChulaMain: labelFooterAffiliationsChulaMain,
        footerAffiliationsSportsOffice: labelFooterAffiliationsSportsOffice,
        welcomeHeroTitle: labelWelcomeHeroTitle,
        welcomeHeroSubtitle: labelWelcomeHeroSubtitle,
        welcomeHeroSocial: labelWelcomeHeroSocial,
      });
      if (resVal.success) {
        triggerSuccessMsg("SITE CONTENT LABELS & EDITORIAL TEXT UPDATED SUCCESSFULLY.");
        refreshState();
      }
    } catch (err: any) {
      triggerErrorMsg(err.message || "Failed to edit site content labels.");
    } finally {
      setIsMutating(false);
    }
  };

  // -- SITE SETTINGS HANDLER --
  const handleUpdateHomeSponsorSection = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsMutating(true);
    try {
      const res = await updateHomeSponsorSection({
        title: homeSponTitle,
        subtitle: homeSponSubtitle,
        description: homeSponDescription,
        marqueeText: homeSponMarqueeText,
        imageUrl: homeSponImageUrl,
        buttonText: homeSponButtonText,
        buttonUrl: homeSponButtonUrl,
        showSection: homeSponShowSection
      });
      if (res.success) {
        triggerSuccessMsg("HOME SPONSOR SHOWCASE UPDATED.");
        refreshState();
      }
    } catch (err: any) {
      triggerErrorMsg(err.message || "Failed to update home sponsor section.");
    } finally {
      setIsMutating(false);
    }
  };

  const handleUpdateClubActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsMutating(true);
    try {
      const { success } = await updateClubActivity({
        heroImageUrl: caHeroImageUrl,
        philosophyTitle: caPhilosophyTitle,
        philosophyQuote: caPhilosophyQuote,
        philosophyDescription: caPhilosophyDescription,
        technicalExcellenceDescription: caTechnicalExcellenceDescription,
        captainName: caCaptainName,
        captainRole: caCaptainRole,
        captainImageUrl: caCaptainImageUrl,
        captainPhilosophy: caCaptainPhilosophy,
        competitions: caCompetitions,
        trainingDescription: caTrainingDescription,
        legacyDescription: caLegacyDescription,
        foundedYear: caFoundedYear,
        activeYears: caActiveYears
      });
      if (success) {
        triggerSuccessMsg("CLUB ACTIVITIES CONTENT UPDATED.");
        refreshState();
      }
    } catch (err: any) {
      triggerErrorMsg(err.message || "Failed to update club activities content.");
    } finally {
      setIsMutating(false);
    }
  };

  const handleAddCompetition = () => {
    const newComp: Competition = {
      id: `comp-${Date.now()}`,
      title: "New Competition",
      description: "Brief description of the tournament.",
      difficulty: "NATIONAL LEVEL"
    };
    setCaCompetitions([...caCompetitions, newComp]);
  };

  const handleUpdateCompetition = (id: string, updates: Partial<Competition>) => {
    setCaCompetitions(caCompetitions.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const handleDeleteCompetition = (id: string) => {
    setCaCompetitions(caCompetitions.filter(c => c.id !== id));
  };

  const handleUpdateSiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsMutating(true);
    try {
      const resVal = await updateSiteSettings({
        marqueeText: setsMarqueeText,
        contactPhone: setsContactPhone,
        contactEmail: setsContactEmail,
        contactAddress: setsContactAddress,
        academicAffiliation: setsAcademicAffiliation,
        showMarquee: setsShowMarquee,
        showHomeBlog: setsShowHomeBlog,
        showHomeWelcome: setsShowHomeWelcome,
        showHomeScores: setsShowHomeScores,
        showFooterMission: setsShowFooterMission,
        showFooterLegacy: setsShowFooterLegacy,
        showNavbarRoster: setsShowNavbarRoster,
        showNavbarStaff: setsShowNavbarStaff,
        showNavbarScores: setsShowNavbarScores,
        showNavbarSponsors: setsShowNavbarSponsors,
        showHomeSponsors: setsShowHomeSponsors
      });

      if (resVal.success) {
        triggerSuccessMsg("GENERAL SETTINGS, MOVING MARQUEE TEXT & FOOTER CORRECTIONS SET LIVE.");
        refreshState();
      } else {
        triggerErrorMsg("Failed to submit general configuration settings correction.");
      }
    } catch (err: any) {
      triggerErrorMsg(err.message || "Failed to edit site general configuration.");
    } finally {
      setIsMutating(false);
    }
  };


  // --- RENDERING FOR LOGIN IF NOT LOGGED IN ---
  if (!adminToken) {
    return (
      <div className="mx-auto max-w-md py-24 px-4 animate-fade-in">
        <div className="border-2 border-neutral-950 bg-white p-8 md:p-12 space-y-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-center space-y-4 border-b-2 border-neutral-950 pb-8">
            <div className="mx-auto h-16 w-16 border-2 border-neutral-950 flex items-center justify-center text-white bg-neutral-950">
              <Lock size={28} />
            </div>
            <h2 className="font-thai text-4xl font-bold uppercase tracking-tight text-neutral-950 leading-none pt-4">
              CMS ACCESS
            </h2>
            <p className="font-mono text-[10px] text-neutral-400 tracking-[0.3em] uppercase font-black">
              AUTHORIZATION REQUIRED
            </p>
          </div>

          {loginError && (
            <div className="bg-red-50 border-2 border-black text-black p-3.5 text-xs font-black flex items-center gap-2 uppercase">
              <AlertCircle size={16} />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="passkey" className="font-mono text-[9px] font-black text-black/60 uppercase block">
                VARSITY PASSKEY CODE
              </label>
              <input
                id="passkey"
                type="password"
                required
                placeholder="Enter Passkey"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-50 border-2 border-black py-2.5 px-3 font-mono text-xs focus:outline-none focus:bg-white text-black"
              />
              </div>

              <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full bg-black py-3 text-xs font-black tracking-widest text-white uppercase hover:bg-neutral-900 border-2 border-black transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
              {isAuthenticating ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  CONNECTING...
                </>
              ) : (
                "SIGN-IN TO CMS"
              )}
              </button>
              </form>
              </div>
              </div>
              );  }

  // --- MAIN ADMIN MANAGEMENT CMS PORTAL RENDER ---
  return (
    <div id="admin_dashboard" className="space-y-12 animate-fade-in px-4 md:px-0 bg-white">
      
      {/* CMS UPPER DASHBOARD PANEL HEADER */}
      <section className="mx-auto max-w-7xl pt-10">
        <div className="bg-white border-2 border-neutral-950 p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)]">
          <div className="space-y-2 text-left">
            <span className="font-mono text-[10px] font-black text-[#da5f8e] tracking-[0.3em] uppercase block mb-1">
              REGISTRY ACTIVE
            </span>
            <h1 className="font-thai text-5xl font-bold tracking-tight text-neutral-950 leading-none">
              ADMIN CMS
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={refreshState}
              className="border-2 border-neutral-950 hover:bg-neutral-50 px-3.5 py-2 text-xs font-mono font-black text-neutral-950 uppercase flex items-center gap-2 bg-white cursor-pointer"
            >
              <RefreshCw size={13} />
              SYNC DB STATE
            </button>
            <button
              onClick={handleLogout}
              className="border-2 border-neutral-950 text-white bg-neutral-950 hover:bg-neutral-800 px-3.5 py-2 text-xs font-mono font-black uppercase flex items-center gap-2 cursor-pointer"
            >
              <LogOut size={13} />
              REVOKE ACCESS
            </button>
          </div>
        </div>
      </section>

      {/* SUCCESS / ERROR TOAST CORES */}
      {(successMsg || errorMsg || isMutating) && (
        <section className="mx-auto max-w-7xl">
          {successMsg && (
            <div className="bg-emerald-55 text-emerald-800 border-2 border-black px-4 py-3 text-xs font-semibold flex items-center gap-2 animate-fade-in uppercase font-black tracking-wider">
              <Check size={16} />
              <span>{successMsg}</span>
            </div>
          )}
          {errorMsg && (
            <div className="bg-neutral-50 text-black border-2 border-black px-4 py-3 text-xs font-semibold flex items-center gap-2 animate-fade-in uppercase font-black tracking-wider">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}
          {isMutating && (
            <div className="bg-neutral-50 text-black border-2 border-black px-4 py-3 text-xs font-semibold flex items-center gap-2 animate-pulse uppercase font-black tracking-wider">
              <RefreshCw size={14} className="animate-spin" />
              <span>Pushing adjustments to database, sync requested...</span>
            </div>
          )}
        </section>
      )}

      {/* CATEGORY DIRECTORY NAVIGATION TAB BOARD */}
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-wrap border-b-4 border-black">
          <button
            onClick={() => {
              setActiveSubTab("news");
              setEditingNewsId(null);
            }}
            className={`px-5 py-3 font-mono text-xs font-black tracking-widest border-t-2 border-x-2 cursor-pointer transition-all ${
              activeSubTab === "news"
                ? "border-black bg-black text-white"
                : "border-transparent text-black/50 hover:text-black hover:bg-neutral-100"
            }`}
          >
            <span className="flex items-center gap-2 uppercase">
              <FileText size={14} /> ACTIVITIES BLOG & STORIES CMS
            </span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab("clubActivity");
            }}
            className={`px-5 py-3 font-mono text-xs font-black tracking-widest border-t-2 border-x-2 cursor-pointer transition-all ${
              activeSubTab === "clubActivity"
                ? "border-black bg-black text-white"
                : "border-transparent text-black/50 hover:text-black hover:bg-neutral-100"
            }`}
          >
            <span className="flex items-center gap-2 uppercase">
              <Sparkles size={14} /> CLUB ACTIVITIES CMS
            </span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab("roster");
              setEditingPlayerId(null);
              setEditingStaffId(null);
            }}
            className={`px-5 py-3 font-mono text-xs font-black tracking-widest border-t-2 border-x-2 cursor-pointer transition-all ${
              activeSubTab === "roster"
                ? "border-black bg-black text-white"
                : "border-transparent text-black/50 hover:text-black hover:bg-neutral-100"
            }`}
          >
            <span className="flex items-center gap-2 uppercase">
              <Users size={14} /> PLAYERS & STAFF CMS
            </span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab("scores");
              setEditingScoreId(null);
            }}
            className={`px-5 py-3 font-mono text-xs font-black tracking-widest border-t-2 border-x-2 cursor-pointer transition-all ${
              activeSubTab === "scores"
                ? "border-black bg-black text-white"
                : "border-transparent text-black/50 hover:text-black hover:bg-neutral-100"
            }`}
          >
            <span className="flex items-center gap-2 uppercase">
              <Trophy size={14} /> SCORES & TOURNEY CMS
            </span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab("gallery");
            }}
            className={`px-5 py-3 font-mono text-xs font-black tracking-widest border-t-2 border-x-2 cursor-pointer transition-all ${
              activeSubTab === "gallery"
                ? "border-black bg-black text-white"
                : "border-transparent text-black/50 hover:text-black hover:bg-neutral-100"
            }`}
          >
            <span className="flex items-center gap-2 uppercase">
              <Image size={14} /> GALLERY CABINET CMS
            </span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab("welcome");
            }}
            className={`px-5 py-3 font-mono text-xs font-black tracking-widest border-t-2 border-x-2 cursor-pointer transition-all ${
              activeSubTab === "welcome"
                ? "border-black bg-black text-white"
                : "border-transparent text-black/50 hover:text-black hover:bg-neutral-100"
            }`}
          >
            <span className="flex items-center gap-2 uppercase">
              <Sparkle size={14} /> WELCOME HERO CMS
            </span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab("upcoming");
            }}
            className={`px-5 py-3 font-mono text-xs font-black tracking-widest border-t-2 border-x-2 cursor-pointer transition-all ${
              activeSubTab === "upcoming"
                ? "border-black bg-black text-white"
                : "border-transparent text-black/50 hover:text-black hover:bg-neutral-100"
            }`}
          >
            <span className="flex items-center gap-2 uppercase">
              <Calendar size={14} /> UPCOMING ACTIVITY CMS
            </span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab("sponsors");
              setEditingSponsorId(null);
              setSponName("");
              setSponDescription("");
              setSponWebsiteUrl("");
              setSponImageUrl("");
              setSponIsActive(true);
            }}
            className={`px-5 py-3 font-mono text-xs font-black tracking-widest border-t-2 border-x-2 cursor-pointer transition-all ${
              activeSubTab === "sponsors"
                ? "border-black bg-black text-white"
                : "border-transparent text-black/50 hover:text-black hover:bg-neutral-100"
            }`}
          >
            <span className="flex items-center gap-2 uppercase">
              <Award size={14} /> SPONSORS CMS
            </span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab("homeSponsors");
            }}
            className={`px-5 py-3 font-mono text-xs font-black tracking-widest border-t-2 border-x-2 cursor-pointer transition-all ${
              activeSubTab === "homeSponsors"
                ? "border-black bg-black text-white"
                : "border-transparent text-black/50 hover:text-black hover:bg-neutral-100"
            }`}
          >
            <span className="flex items-center gap-2 uppercase">
              <Award size={14} /> HOME SPONSORS CMS
            </span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab("siteLabels");
            }}
            className={`px-5 py-3 font-mono text-xs font-black tracking-widest border-t-2 border-x-2 cursor-pointer transition-all ${
              activeSubTab === "siteLabels"
                ? "border-black bg-black text-white"
                : "border-transparent text-black/50 hover:text-black hover:bg-neutral-100"
            }`}
          >
            <span className="flex items-center gap-2 uppercase">
              <Type size={14} /> SITE CONTENT CMS
            </span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab("siteSettings");
            }}
            className={`px-5 py-3 font-mono text-xs font-black tracking-widest border-t-2 border-x-2 cursor-pointer transition-all ${
              activeSubTab === "siteSettings"
                ? "border-black bg-black text-white"
                : "border-transparent text-black/50 hover:text-black hover:bg-neutral-100"
            }`}
          >
            <span className="flex items-center gap-2 uppercase">
              <Settings size={14} /> GENERAL SETTINGS CMS
            </span>
          </button>
        </div>
      </section>

      {/* --- SUB-TAB CORE 1: NEWS CMS --- */}
      {activeSubTab === "news" && (
        <section className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans">
          
          {/* Left panel: Blogs Editor & GEMINI AI WRITER DRAFT ASSISTANT */}
          <div className="lg:col-span-7 space-y-6">
            <div className="border border-[#121212] bg-white p-6 space-y-6">
              <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#121212]">
                {editingNewsId ? "REVISE REGISTERED ACTIVITY STORY" : "WRITE & PUBLISH NEW ACTIVITY STORY"}
              </h2>

              {/* Dynamic inputs */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="article_title" className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">TITLE</label>
                  <input
                    id="article_title"
                    type="text"
                    value={newsTitle}
                    onChange={(e) => setNewsTitle(e.target.value)}
                    placeholder="Chula team secures match victory..."
                    className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:outline-none focus:border-[#ec4899] text-[#121212]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="article_date" className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">PUBLISH DATE</label>
                  <input
                    id="article_date"
                    type="date"
                    value={newsDate}
                    onChange={(e) => setNewsDate(e.target.value)}
                    className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:outline-none focus:border-[#ec4899] text-[#121212]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="article_rank" className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">RANK (Higher values show as main)</label>
                  <input
                    id="article_rank"
                    type="number"
                    value={newsRank}
                    onChange={(e) => setNewsRank(Number(e.target.value))}
                    className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:outline-none focus:border-[#ec4899] text-[#121212]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="article_excerpt" className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">EXCERPT (Sub-line brief)</label>
                  <input
                    id="article_excerpt"
                    type="text"
                    value={newsExcerpt}
                    onChange={(e) => setNewsExcerpt(e.target.value)}
                    placeholder="An inside technical study of Alpine's green structures..."
                    className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:outline-none focus:border-[#ec4899] text-[#121212]"
                  />
                </div>

                <ImageUploadWidget
                  id="article_image"
                  label="IMAGE MATERIAL (Unsplash sports golf address or local photo upload)"
                  value={newsImage}
                  onChange={setNewsImage}
                  placeholder="https://images.unsplash.com/photo-..."
                  helperText="Aspect ratio 16:9 or panoramic 24:9 looks best."
                />

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="article_content" className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase block">CONTENT (Valid Markdown prose)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        id="embedded_image_upload"
                        className="hidden"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          setIsMutating(true);
                          try {
                            const reader = new FileReader();
                            reader.onloadend = async () => {
                              const base64Data = reader.result as string;
                              const res = await uploadPhoto(file.name, base64Data);
                              if (res.success && res.url) {
                                const markdownImg = `\n![${file.name}](${res.url})\n`;
                                setNewsContent(prev => prev + markdownImg);
                                triggerSuccessMsg("Image uploaded and inserted into content.");
                              } else {
                                triggerErrorMsg("Failed to upload image.");
                              }
                              setIsMutating(false);
                            };
                            reader.readAsDataURL(file);
                          } catch (err) {
                            triggerErrorMsg("Error uploading image.");
                            setIsMutating(false);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => document.getElementById("embedded_image_upload")?.click()}
                        className="flex items-center gap-1.5 text-[9px] font-mono font-bold text-[#da5f8e] hover:underline uppercase bg-stone-50 px-2 py-1 border border-stone-200"
                      >
                        <Image size={10} /> INSERT EMBEDDED PHOTO
                      </button>
                    </div>
                  </div>
                  <textarea
                    id="article_content"
                    rows={12}
                    value={newsContent}
                    onChange={(e) => setNewsContent(e.target.value)}
                    placeholder="Use ### Header for sections and - for bullet columns. You can now also insert photos between texts."
                    className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2.5 text-xs focus:outline-none focus:border-[#ec4899] text-[#121212] font-mono leading-relaxed"
                  />
                </div>

                {newsContent && (
                  <div className="space-y-2 mt-4">
                    <label className="font-mono text-[9px] font-bold text-[#da5f8e] uppercase flex items-center gap-1.5">
                      <Eye size={10} /> STORY CONTENT LIVE PREVIEW
                    </label>
                    <div className="border border-dashed border-[#da5f8e]/30 p-4 bg-stone-50/50 rounded-sm max-h-[400px] overflow-y-auto prose prose-sm prose-stone">
                      <MarkdownRenderer text={newsContent} />
                    </div>
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="flex items-center gap-4 border-t border-[#121212]/10 pt-4">
                <button
                  onClick={handleSaveNews}
                  className="bg-[#121212] text-white hover:bg-[#ec4899] px-6 py-2.5 font-mono text-xs font-bold tracking-wider uppercase flex items-center gap-2 cursor-pointer"
                >
                  <Save size={13} />
                  {editingNewsId ? "COMMIT STORY ADJUSTMENTS" : "PUBLISH ACTIVITY STORY"}
                </button>
                {editingNewsId && (
                  <button
                    onClick={() => {
                      setEditingNewsId(null);
                      setNewsTitle("");
                      setNewsExcerpt("");
                      setNewsContent("");
                      setNewsImage("");
                      setNewsDate("");
                    }}
                    className="border border-[#121212]/15 text-[#121212] px-4 py-2 text-xs font-mono uppercase hover:bg-stone-50 cursor-pointer"
                  >
                    CANCEL [X]
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* Right panel: Registered Article Lists with previews and delete actions */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border border-[#121212] bg-white p-6 space-y-6">
              <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#121212]">
                REGISTERED ACTIVITIES & STORIES
              </h2>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {(dbState.news || []).map((item) => (
                  <div key={item.id} className="border border-[#121212]/10 bg-stone-50 p-4 space-y-3 flex flex-col justify-between hover:border-[#121212]">
                    <div className="space-y-1.5">
                      <span className="font-mono text-[9px] text-[#121212]/40 block">{item.publishDate}</span>
                      <h3 className="font-display text-xs font-bold uppercase text-[#121212] leading-snug">{item.title}</h3>
                      <p className="text-[10px] text-[#121212]/60 line-clamp-2">{item.excerpt}</p>
                    </div>

                    <div className="flex items-center gap-3 pt-2 border-t border-[#121212]/5">
                      <button
                        onClick={() => handleEditNewsTrigger(item)}
                        className="inline-flex items-center gap-1 font-mono text-[10px] text-blue-600 hover:underline cursor-pointer"
                      >
                        <Edit size={11} /> REVISE
                      </button>
                      <span>•</span>
                      <button
                        onClick={() => handleDeleteNewsCall(item.id)}
                        className="inline-flex items-center gap-1 font-mono text-[10px] text-red-600 hover:underline cursor-pointer"
                      >
                        <Trash2 size={11} /> DELETE
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </section>
      )}

      {/* --- SUB-TAB CORE 1.5: CLUB ACTIVITY CMS --- */}
      {activeSubTab === "clubActivity" && (
        <section className="mx-auto max-w-7xl font-sans animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <div className="border border-[#121212] bg-white p-6 space-y-8">
                <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#121212] flex items-center gap-2">
                  <Sparkles size={16} className="text-[#da5f8e]" /> CLUB ACTIVITIES PAGE CONTENT
                </h2>

                <div className="space-y-6">
                  {/* Hero Image */}
                  <ImageUploadWidget
                    id="ca_hero_image"
                    label="PAGE HERO BACKGROUND IMAGE"
                    value={caHeroImageUrl}
                    onChange={setCaHeroImageUrl}
                    placeholder="https://images.unsplash.com/photo-..."
                    helperText="A panoramic (21:9 or 24:9) landscape looks best here."
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Philosophy Section */}
                    <div className="space-y-4 border-t border-stone-100 pt-6">
                      <h3 className="font-mono text-[10px] font-black text-[#da5f8e] uppercase tracking-widest">Philosophy Section</h3>
                      <div className="space-y-1.5">
                        <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">PHILOSOPHY TITLE</label>
                        <input
                          type="text"
                          value={caPhilosophyTitle}
                          onChange={(e) => setCaPhilosophyTitle(e.target.value)}
                          className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">BIG QUOTE</label>
                        <textarea
                          rows={3}
                          value={caPhilosophyQuote}
                          onChange={(e) => setCaPhilosophyQuote(e.target.value)}
                          className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:outline-none italic"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">PHILOSOPHY DESCRIPTION</label>
                        <textarea
                          rows={6}
                          value={caPhilosophyDescription}
                          onChange={(e) => setCaPhilosophyDescription(e.target.value)}
                          className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:outline-none leading-relaxed"
                        />
                      </div>
                    </div>

                    {/* Technical Excellence */}
                    <div className="space-y-4 border-t border-stone-100 pt-6">
                      <h3 className="font-mono text-[10px] font-black text-[#da5f8e] uppercase tracking-widest">Training & Excellence</h3>
                      <div className="space-y-1.5">
                        <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">TECHNICAL EXCELLENCE DESC</label>
                        <textarea
                          rows={4}
                          value={caTechnicalExcellenceDescription}
                          onChange={(e) => setCaTechnicalExcellenceDescription(e.target.value)}
                          className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:outline-none leading-relaxed"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">TRAINING FACILITIES DESC</label>
                        <textarea
                          rows={4}
                          value={caTrainingDescription}
                          onChange={(e) => setCaTrainingDescription(e.target.value)}
                          className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:outline-none leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Captain's Mandate */}
                  <div className="space-y-6 border-t border-stone-100 pt-6">
                    <h3 className="font-mono text-[10px] font-black text-[#da5f8e] uppercase tracking-widest">Captain's Mandate</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">CAPTAIN NAME</label>
                        <input
                          type="text"
                          value={caCaptainName}
                          onChange={(e) => setCaCaptainName(e.target.value)}
                          className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">CAPTAIN ROLE / TITLE</label>
                        <input
                          type="text"
                          value={caCaptainRole}
                          onChange={(e) => setCaCaptainRole(e.target.value)}
                          className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                    <ImageUploadWidget
                      id="ca_captain_image"
                      label="CAPTAIN PROFILE IMAGE"
                      value={caCaptainImageUrl}
                      onChange={setCaCaptainImageUrl}
                      placeholder="https://images.unsplash.com/photo-..."
                    />
                    <div className="space-y-1.5">
                      <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">CAPTAIN'S PHILOSOPHY TEXT</label>
                      <textarea
                        rows={6}
                        value={caCaptainPhilosophy}
                        onChange={(e) => setCaCaptainPhilosophy(e.target.value)}
                        className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2.5 text-xs font-serif italic focus:outline-none leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Competitions */}
                  <div className="space-y-6 border-t border-stone-100 pt-6">
                    <div className="flex justify-between items-center">
                      <h3 className="font-mono text-[10px] font-black text-[#da5f8e] uppercase tracking-widest">Major Competitions Calendar</h3>
                      <button
                        onClick={handleAddCompetition}
                        className="bg-black text-white px-3 py-1.5 font-mono text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5"
                      >
                        <Plus size={10} /> ADD COMPETITION
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {caCompetitions.map((comp) => (
                        <div key={comp.id} className="border border-stone-200 p-4 space-y-4 bg-stone-50/30 relative group">
                          <button
                            onClick={() => handleDeleteCompetition(comp.id)}
                            className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={14} />
                          </button>
                          <div className="space-y-1.5">
                            <label className="font-mono text-[8px] font-bold text-[#121212]/40 uppercase">TITLE</label>
                            <input
                              type="text"
                              value={comp.title}
                              onChange={(e) => handleUpdateCompetition(comp.id, { title: e.target.value })}
                              className="w-full bg-white border border-[#121212]/10 p-1.5 text-[11px] focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="font-mono text-[8px] font-bold text-[#121212]/40 uppercase">LEVEL / DIFFICULTY</label>
                            <input
                              type="text"
                              value={comp.difficulty}
                              onChange={(e) => handleUpdateCompetition(comp.id, { difficulty: e.target.value })}
                              className="w-full bg-white border border-[#121212]/10 p-1.5 text-[11px] focus:outline-none font-mono"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="font-mono text-[8px] font-bold text-[#121212]/40 uppercase">DESCRIPTION</label>
                            <textarea
                              rows={3}
                              value={comp.description}
                              onChange={(e) => handleUpdateCompetition(comp.id, { description: e.target.value })}
                              className="w-full bg-white border border-[#121212]/10 p-1.5 text-[11px] focus:outline-none leading-relaxed"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Legacy Section */}
                  <div className="space-y-6 border-t border-stone-100 pt-6">
                    <h3 className="font-mono text-[10px] font-black text-[#da5f8e] uppercase tracking-widest">Legacy & History</h3>
                    <div className="space-y-1.5">
                      <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">LEGACY DESCRIPTION</label>
                      <textarea
                        rows={4}
                        value={caLegacyDescription}
                        onChange={(e) => setCaLegacyDescription(e.target.value)}
                        className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:outline-none leading-relaxed"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">FOUNDED YEAR</label>
                        <input
                          type="text"
                          value={caFoundedYear}
                          onChange={(e) => setCaFoundedYear(e.target.value)}
                          className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:outline-none font-mono"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">ACTIVE YEARS LABEL</label>
                        <input
                          type="text"
                          value={caActiveYears}
                          onChange={(e) => setCaActiveYears(e.target.value)}
                          className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>

                </div>

                <div className="flex items-center gap-4 border-t border-[#121212]/10 pt-8">
                  <button
                    onClick={handleUpdateClubActivity}
                    className="bg-neutral-950 text-white hover:bg-[#da5f8e] px-8 py-3 font-mono text-xs font-black tracking-widest uppercase flex items-center gap-2 cursor-pointer transition-colors shadow-lg"
                  >
                    <Save size={14} /> COMMIT CLUB ACTIVITIES CONTENT SET LIVE
                  </button>
                </div>
              </div>
            </div>

            {/* Preview Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <div className="border border-[#121212] bg-stone-50 p-6 space-y-6 sticky top-32">
                <h3 className="font-display text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em]">CMS GUIDELINES</h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="block font-mono text-[9px] font-bold text-black uppercase">Editorial Standard</span>
                    <p className="text-[10px] text-stone-500 leading-relaxed">
                      Maintain a professional, prestigious tone. Use high-resolution images for the hero section to establish authority.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="block font-mono text-[9px] font-bold text-black uppercase">Captain's Philosophy</span>
                    <p className="text-[10px] text-stone-500 leading-relaxed">
                      This section is crucial for recruiting and branding. Use an authentic voice that represents the current leadership.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="block font-mono text-[9px] font-bold text-black uppercase">Image Assets</span>
                    <p className="text-[10px] text-stone-500 leading-relaxed">
                      Prefer photos with high contrast or grayscale for the background to ensure text remains legible.
                    </p>
                  </div>
                </div>
                <div className="pt-6 border-t border-stone-200">
                  <a 
                    href="/activities/club" 
                    target="_blank" 
                    className="inline-flex items-center gap-1.5 text-[9px] font-mono font-black text-[#da5f8e] uppercase hover:underline"
                  >
                    <Eye size={10} /> VIEW LIVE PAGE <ArrowUpRight size={10} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* --- SUB-TAB CORE 2: ROSTER & STAFF CMS --- */}
      {activeSubTab === "roster" && (
        <section className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans">
          
          {/* Active Player Registry adding Form left */}
          <div className="lg:col-span-6 space-y-6">
            <div className="border border-[#121212] bg-white p-6 space-y-6">
              <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#121212]">
                {editingPlayerId ? "EDIT ATHLETE FILE" : "REGISTER CHULA ATHLETE"}
              </h2>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="player_name" className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">FULL NAME</label>
                  <input
                    id="player_name"
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Thanawut 'Oat' Prasertsook"
                    className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:outline-none focus:border-[#ec4899] text-[#121212]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="player_handicap" className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">HANDICAP (Float)</label>
                    <input
                      id="player_handicap"
                      type="number"
                      step="0.1"
                      value={playerHandicap}
                      onChange={(e) => setPlayerHandicap(parseFloat(e.target.value) || 0.0)}
                      className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:outline-none"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label htmlFor="player_year" className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase block">CLASS YEAR</label>
                    <select
                      id="player_year"
                      value={playerYear}
                      onChange={(e) => setPlayerYear(e.target.value)}
                      className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:outline-none"
                    >
                      <option value="Freshman">Freshman</option>
                      <option value="Sophomore">Sophomore</option>
                      <option value="Junior">Junior</option>
                      <option value="Senior">Senior</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 col-span-2">
                    <label htmlFor="player_faculty" className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase block">FACULTY</label>
                    <input
                      id="player_faculty"
                      type="text"
                      value={playerFaculty}
                      onChange={(e) => setPlayerFaculty(e.target.value)}
                      placeholder="Faculty of Engineering"
                      className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:outline-none focus:border-[#ec4899] text-[#121212]"
                    />
                  </div>
                </div>

                <ImageUploadWidget
                  id="player_headshot"
                  label="PROFILE IMAGE (Unsplash portrait URL or local photo upload)"
                  value={playerImage}
                  onChange={setPlayerImage}
                  placeholder="https://images.unsplash.com/photo-..."
                  helperText="A square or portrait headshot looks best."
                />

                <div className="flex items-center gap-2 py-3">
                  <input
                    id="player_lead"
                    type="checkbox"
                    checked={playerIsFeatured}
                    onChange={(e) => setPlayerIsFeatured(e.target.checked)}
                    className="h-4 w-4 text-[#ec4899] accent-[#ec4899]"
                  />
                  <label htmlFor="player_lead" className="font-mono text-[9px] font-bold text-[#121212]/75 uppercase">
                    FEATURE ON HOME RADAR (SQUAD LEAD)
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-4 border-t border-[#121212]/10 pt-4">
                <button
                  onClick={handleSavePlayer}
                  className="bg-[#121212] text-white hover:bg-[#ec4899] px-6 py-2.5 font-mono text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={13} />
                  {editingPlayerId ? "APPLY PROFILE" : "ENLIST ATHLETE"}
                </button>
                {editingPlayerId && (
                  <button
                    onClick={() => {
                      setEditingPlayerId(null);
                      setPlayerName("");
                      setPlayerHandicap(1.5);
                      setPlayerYear("Freshman");
                      setPlayerImage("");
                      setPlayerIsFeatured(false);
                    }}
                    className="border border-[#121212]/15 text-xs font-mono uppercase px-3 py-2"
                  >
                    CANCEL [X]
                  </button>
                )}
              </div>

            </div>

            {/* Staff Manager inside tab */}
            <div className="border border-[#121212] bg-white p-6 space-y-6">
              <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#121212]">
                {editingStaffId ? "REVISE STAFF FILE" : "ENLIST EXECUTIVE COMMITTEE"}
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="staff_name" className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">NAME</label>
                    <input
                      id="staff_name"
                      type="text"
                      value={staffName}
                      onChange={(e) => setStaffName(e.target.value)}
                      placeholder="Dr. Kittisun Chantrajal"
                      className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="staff_role" className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">STAFF ROLE</label>
                    <input
                      id="staff_role"
                      type="text"
                      value={staffRole}
                      onChange={(e) => setStaffRole(e.target.value)}
                      placeholder="Head Coach / Committee"
                      className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="staff_faculty" className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">AFFILIATION / GROUP</label>
                    <input
                      id="staff_faculty"
                      type="text"
                      value={staffFaculty}
                      onChange={(e) => setStaffFaculty(e.target.value)}
                      placeholder="Faculty of Sports Science"
                      className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="staff_order" className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">SORT INT (Order)</label>
                    <input
                      id="staff_order"
                      type="number"
                      value={staffOrder}
                      onChange={(e) => setStaffOrder(parseInt(e.target.value) || 1)}
                      className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <ImageUploadWidget
                  id="staff_headshot"
                  label="PORTRAIT IMAGE (Unsplash portrait URL or local photo upload)"
                  value={staffImage}
                  onChange={setStaffImage}
                  placeholder="https://images.unsplash.com/photo-..."
                  helperText="A square or portrait headshot looks best."
                />
              </div>

              <div className="flex items-center gap-4 border-t border-[#121212]/10 pt-4">
                <button
                  onClick={handleSaveStaff}
                  className="bg-[#121212] text-white hover:bg-[#ec4899] px-6 py-2.5 font-mono text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={13} />
                  {editingStaffId ? "APPLY ROLE" : "APPLY OFFICER"}
                </button>
                {editingStaffId && (
                  <button
                    onClick={() => {
                      setEditingStaffId(null);
                      setStaffName("");
                      setStaffRole("");
                      setStaffFaculty("");
                      setStaffImage("");
                      setStaffOrder(1);
                    }}
                    className="border border-[#121212]/15 text-xs font-mono uppercase px-3 py-2"
                  >
                    CANCEL [X]
                  </button>
                )}
              </div>

            </div>

          </div>

          {/* Right side Lists of Players and Staff */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Player list */}
            <div className="border border-[#121212] bg-white p-6 space-y-4">
              <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#121212]">
                ACTIVE PLAYERS REGISTRY ({(dbState.roster?.length || 0)} ATHLETES)
              </h2>

              <div className="divide-y divide-[#121212]/10 max-h-[300px] overflow-y-auto pr-1">
                {(dbState.roster || []).map((player) => (
                  <div key={player.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-display text-xs font-bold uppercase text-[#121212]">{player.name}</div>
                      <div className="font-mono text-[9px] text-[#121212]/40">
                        {player.year} • {player.faculty || "No Faculty"} • Index: <strong className="text-stone-700">{player.handicap}</strong>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditPlayerTrigger(player)}
                        className="p-1 text-blue-600 hover:bg-stone-100 cursor-pointer"
                        title="Edit profile"
                      >
                        <Edit size={13} />
                      </button>
                      <button
                        onClick={() => handleDeletePlayerCall(player.id)}
                        className="p-1 text-red-600 hover:bg-stone-100 cursor-pointer"
                        title="Delete player"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Staff list */}
            <div className="border border-[#121212] bg-white p-6 space-y-4">
              <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#121212]">
                GOVERNANCE OFFICERS ({(dbState.staff?.length || 0)} BOARD REGS)
              </h2>

              <div className="divide-y divide-[#121212]/10 max-h-[300px] overflow-y-auto pr-1">
                {(dbState.staff || []).map((p) => (
                  <div key={p.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-display text-xs font-bold uppercase text-[#121212]">{p.name}</div>
                      <div className="font-mono text-[9px] text-[#121212]/40">
                        {p.role} • Order Int: {p.order}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditStaffTrigger(p)}
                        className="p-1 text-blue-600 hover:bg-stone-100 cursor-pointer"
                      >
                        <Edit size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteStaffCall(p.id)}
                        className="p-1 text-red-600 hover:bg-stone-100 cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </section>
      )}

      {/* --- SUB-TAB CORE 3: SCORES & TOURNAMENTS CMS --- */}
      {activeSubTab === "scores" && (
        <section className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans">
          
          {/* Tournament creator panel */}
          <div className="lg:col-span-6 space-y-6">
            <div className="border border-[#121212] bg-white p-6 space-y-6">
              <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#121212]">
                {editingScoreId ? "REVISE SCORES RECORDS" : "LOG TOURNAMENT LEADERS RECORD"}
              </h2>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="score_tourney_name" className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">TOURNAMENT TITLE</label>
                  <input
                    id="score_tourney_name"
                    type="text"
                    value={scoreTournamentName}
                    onChange={(e) => setScoreTournamentName(e.target.value)}
                    placeholder="Thailand Intercollegiate Cup 2026"
                    className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:outline-none focus:border-[#ec4899] text-[#121212]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="score_tourney_date" className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase block">DATE (YYYY-MM-DD)</label>
                    <input
                      id="score_tourney_date"
                      type="date"
                      value={scoreDate}
                      onChange={(e) => setScoreDate(e.target.value)}
                      className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs text-[#121212] font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="score_tourney_result" className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase block">TEAM FINAL BRIEF (Outcome)</label>
                    <input
                      id="score_tourney_result"
                      type="text"
                      value={scoreResult}
                      onChange={(e) => setScoreResult(e.target.value)}
                      placeholder="1st Place Cup Winners"
                      className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs text-[#121212] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Sub-item scores editor registry */}
                <div className="border border-[#121212]/10 bg-stone-50 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-mono text-[9px] uppercase font-bold text-[#ec4899]">
                      PLAYERS FIELD LEADERBOARD LIST
                    </span>
                    <button
                      type="button"
                      onClick={handleAddPlayerScoreRow}
                      className="text-[9px] font-mono font-bold bg-[#121212] text-white px-2 py-0.5 tracking-wider uppercase flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus size={10} /> ADD ROW
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {scoreList.map((row, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 border border-[#121212]/5 p-2 bg-white flex items-center">
                        <div className="col-span-6">
                          <input
                            aria-label={`Player ${index + 1} Name`}
                            type="text"
                            value={row.playerName}
                            placeholder="Player Full Name"
                            onChange={(e) => handleUpdatePlayerScoreRow(index, "playerName", e.target.value)}
                            className="bg-transparent text-xs p-1 focus:outline-none w-full border border-[#121212]/10"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            aria-label={`Player ${index + 1} Score`}
                            type="number"
                            value={row.score}
                            placeholder="Score"
                            onChange={(e) => handleUpdatePlayerScoreRow(index, "score", parseInt(e.target.value) || 72)}
                            className="bg-transparent text-xs p-1 focus:outline-none w-full border border-[#121212]/10 font-mono text-center"
                          />
                        </div>
                        <div className="col-span-3">
                          <input
                            aria-label={`Player ${index + 1} Position`}
                            type="text"
                            value={row.position}
                            placeholder="Pos"
                            onChange={(e) => handleUpdatePlayerScoreRow(index, "position", e.target.value)}
                            className="bg-transparent text-xs p-1 focus:outline-none w-full border border-[#121212]/10 text-center text-[#ec4899] font-bold"
                          />
                        </div>
                        <div className="col-span-1 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemovePlayerScoreRow(index)}
                            className="text-red-600 p-0.5 hover:bg-stone-150 rounded"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              <div className="flex items-center gap-4 border-t border-[#121212]/10 pt-4">
                <button
                  onClick={handleSaveTournament}
                  className="bg-[#121212] text-white hover:bg-[#ec4899] px-6 py-2.5 font-mono text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={13} />
                  {editingScoreId ? "COMMIT RESULTS" : "LOG LEADERBOARD"}
                </button>
                {editingScoreId && (
                  <button
                    onClick={() => {
                      setEditingScoreId(null);
                      setScoreTournamentName("");
                      setScoreDate("");
                      setScoreResult("");
                      setScoreList([{ playerName: "Methas 'Pete' Srisai", score: 71, position: "3rd" }]);
                    }}
                    className="border border-[#121212]/15 text-xs font-mono uppercase px-3 py-2 cursor-pointer"
                  >
                    CANCEL [X]
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* Leaderboard records log */}
          <div className="lg:col-span-6 space-y-6">
            <div className="border border-[#121212] bg-white p-6 space-y-4">
              <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#121212]">
                REGISTERED MATCH LOGS
              </h2>

              <div className="divide-y divide-[#121212]/10 max-h-[500px] overflow-y-auto pr-1">
                {(dbState.scores || []).map((score) => (
                  <div key={score.id} className="py-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] text-[#121212]/40">{score.date}</span>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/5 px-1.5 py-0.5 border border-emerald-500/10">
                        {score.result}
                      </span>
                    </div>

                    <h4 className="font-display text-xs font-bold uppercase text-[#121212] leading-tight">
                      {score.tournamentName}
                    </h4>

                    {/* micro rows */}
                    <div className="text-[10px] text-stone-500 font-mono">
                      Field size: {score.scoresList?.length || 0} players registered as scoring.
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => handleEditScoreTrigger(score)}
                        className="inline-flex items-center gap-1 font-mono text-[9px] text-blue-600 hover:underline cursor-pointer"
                      >
                        <Edit size={10} /> EDIT SCORECARD
                      </button>
                      <span>•</span>
                      <button
                        onClick={() => handleDeleteScoreCall(score.id)}
                        className="inline-flex items-center gap-1 font-mono text-[9px] text-red-600 hover:underline cursor-pointer"
                      >
                        <Trash2 size={10} /> DELETE ENTRIES
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </section>
      )}

      {/* --- SUB-TAB CORE 4: GALLERY CMS --- */}
      {activeSubTab === "gallery" && (
        <section className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans">
          
          {/* Gallery Add Form left */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border border-[#121212] bg-white p-6 space-y-6">
              <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#121212]">
                CURATE FIELD PHOTOGRAPHY
              </h2>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="gal_title" className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">PHOTO CAPTION TITLE</label>
                  <input
                    id="gal_title"
                    type="text"
                    value={galTitle}
                    onChange={(e) => setGalTitle(e.target.value)}
                    placeholder="Championship trophy ceremony Alpine CC..."
                    className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs text-[#121212] focus:outline-none"
                  />
                </div>

                <ImageUploadWidget
                  id="gal_image"
                  label="GALLERY PHOTO MATERIAL (URL path or local file upload)"
                  value={galUrl}
                  onChange={setGalUrl}
                  placeholder="https://images.unsplash.com/photo-..."
                  helperText="A classic landscape or competitive golf action photograph."
                />

                <div className="space-y-1.5">
                  <label htmlFor="gal_cat" className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase block">CATEGORY</label>
                  <select
                    id="gal_cat"
                    value={galCategory}
                    onChange={(e) => setGalCategory(e.target.value)}
                    className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:outline-none"
                  >
                    <option value="Tournament">Tournament Action</option>
                    <option value="Practice">Practice Session</option>
                    <option value="Training">Training & Drills</option>
                    <option value="Tech Analysis">High-Tech Diagnostics</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-[#121212]/10 pt-4 select-none">
                <button
                  type="button"
                  onClick={handleSaveGalleryImage}
                  className="bg-[#121212] text-white hover:bg-[#ec4899] px-6 py-2.5 font-mono text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 cursor-pointer w-full justify-center"
                >
                  <Plus size={13} />
                  CURATE IMAGE TO HOMEPAGE CABINET
                </button>
              </div>

            </div>
          </div>

          {/* Image Showcase curation Lists right */}
          <div className="lg:col-span-7 space-y-6">
            <div className="border border-[#121212] bg-white p-6 space-y-4">
              <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#121212]">
                CURATED PHOTOS CABINET ({(dbState.gallery?.length || 0)} IMAGES ACTIVE)
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-1">
                {(dbState.gallery || []).map((img) => (
                  <div key={img.id} className="group relative aspect-square border border-[#121212]/15 bg-stone-100 overflow-hidden">
                    <img
                      src={img.imageUrl}
                      alt={img.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Hover delete curator overlay */}
                    <div className="absolute inset-x-0 bottom-0 bg-[#121212]/95 p-2 text-[9px] flex flex-col justify-between transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 text-white font-mono gap-1">
                      <div className="line-clamp-1 leading-snug font-display font-bold uppercase text-[8px] text-[#ec4899]">{img.title}</div>
                      <button
                        onClick={() => handleDeleteGalleryCall(img.id)}
                        className="text-red-400 font-bold hover:underline flex items-center justify-center gap-0.5 mt-1 cursor-pointer"
                      >
                        <Trash2 size={10} /> REMOVE
                      </button>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          </div>

        </section>
      )}

      {/* --- SUB-TAB CORE 5: WELCOME BANNER & LEGACY WORDS CMS --- */}
      {activeSubTab === "welcome" && (
        <section className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans">
          
          {/* Left panel: Form fields to edit static welcoming banner elements */}
          <div className="lg:col-span-5 space-y-6">
            <form onSubmit={handleUpdateWelcomeSection} className="border border-[#121212] bg-white p-6 space-y-5">
              <div>
                <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#121212] mb-1">
                  EDIT STATS WELLCOMING BANNER & LEGACY TEXTS
                </h2>
                <p className="text-[10px] text-gray-500 font-mono uppercase">
                  All parameters persist within the simulated database layer on disk.
                </p>
              </div>

              <div className="space-y-4">
                {/* Image URL */}
                <ImageUploadWidget
                  id="welcome_img"
                  label="PANORAMIC TEAM PHOTO (URL or local photo upload)"
                  value={welcomeImageUrl}
                  onChange={setWelcomeImageUrl}
                  placeholder="https://images.unsplash.com/... or own image url"
                  helperText="Aspect ratio 16:9 or panoramic 24:9 looks best."
                />

                {/* Title (Thai) */}
                <div className="space-y-1.5">
                  <label htmlFor="welcome_thai" className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase block">MAIN CLUB TITLE (THAI)</label>
                  <input
                    id="welcome_thai"
                    type="text"
                    value={welcomeTitleThai}
                    onChange={(e) => setWelcomeTitleThai(e.target.value)}
                    placeholder="e.g. จุฬาลงกรณ์มหาวิทยาลัยกอล์ฟคลับ"
                    className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black focus:outline-none font-bold"
                    required
                  />
                </div>

                {/* Title (English) */}
                <div className="space-y-1.5">
                  <label htmlFor="welcome_eng" className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase block">SUBTITLE (ENGLISH / ALL-CAPS)</label>
                  <input
                    id="welcome_eng"
                    type="text"
                    value={welcomeTitleEnglish}
                    onChange={(e) => setWelcomeTitleEnglish(e.target.value)}
                    placeholder="e.g. CHULALONGKORN UNIVERSITY GOLF CLUB"
                    className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black focus:outline-none uppercase font-semibold"
                    required
                  />
                </div>

                {/* Legacy Quote */}
                <div className="space-y-1.5">
                  <label htmlFor="welcome_quote" className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase block">LEGACY FOUNDATIONAL QUOTATION</label>
                  <textarea
                    id="welcome_quote"
                    rows={3}
                    value={welcomeLegacyQuote}
                    onChange={(e) => setWelcomeLegacyQuote(e.target.value)}
                    placeholder="Provide a historical quote about the university golf sports premium tradition."
                    className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black focus:outline-none"
                  />
                </div>

                {/* Legacy Quote Author */}
                <div className="space-y-1.5">
                  <label htmlFor="welcome_author" className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase block">QUOTATION CITATION / AUTHOR SOURCE</label>
                  <input
                    id="welcome_author"
                    type="text"
                    value={welcomeLegacyQuoteAuthor}
                    onChange={(e) => setWelcomeLegacyQuoteAuthor(e.target.value)}
                    placeholder="e.g. Section IV, The Chulalongkorn Varsity Athletic Charter"
                    className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black focus:outline-none"
                  />
                </div>

                {/* Legacy General Description */}
                <div className="space-y-1.5">
                  <label htmlFor="welcome_desc" className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase block">CORE CLUB EXPLANATION & BACKGROUND HISTORY</label>
                  <textarea
                    id="welcome_desc"
                    rows={4}
                    value={welcomeDescription}
                    onChange={(e) => setWelcomeDescription(e.target.value)}
                    placeholder="A descriptive paragraph about the background academic and sports prestige heritage."
                    className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black focus:outline-none text-justify"
                    required
                  />
                </div>
              </div>

              <div className="border-t border-[#121212]/10 pt-4">
                <button
                  type="submit"
                  disabled={isMutating}
                  className="bg-[#121212] text-white hover:bg-emerald-600 disabled:opacity-50 px-6 py-2.5 font-mono text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 cursor-pointer w-full justify-center transition-all duration-300"
                >
                  <Save size={13} />
                  {isMutating ? "SAVING SYSTEM ENTRIES..." : "COMMIT WELCOME REVISIONS"}
                </button>
              </div>
            </form>
          </div>

          {/* Right panel: Instant High-Fidelity Reactive Preview layout */}
          <div className="lg:col-span-7 space-y-4">
            <span className="font-mono text-[10px] font-bold tracking-widest text-black/55 uppercase flex items-center gap-1.5">
              <Eye size={12} className="text-[#a855f7]" /> INSTANT PREVIEW (ACCORDING TO APPLIED PRINT EDITORIAL GRID RULES)
            </span>

            {/* Simulated Live Section Wrapper */}
            <div className="border-2 border-dashed border-black/30 p-4 bg-gray-50/50">
              <div className="space-y-6 text-black">
                
                {/* 1. Panoramic Image Preview */}
                <div className="border-2 border-black bg-stone-200 overflow-hidden relative aspect-[21/9]">
                  {welcomeImageUrl ? (
                    <img
                      src={welcomeImageUrl}
                      alt="Panoramic live thumbnail preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center font-mono text-stone-400 text-[10px]">
                      <span>[NO IMAGE URL SPECIFIED]</span>
                    </div>
                  )}
                  <div className="absolute top-2 left-2 bg-black text-white font-mono text-[8px] font-bold px-1.5 py-0.5">
                    HERO GRAPHIC
                  </div>
                </div>

                {/* 2. Structured Block Mirror Preview */}
                <div className="bg-white grid grid-cols-1 md:grid-cols-6 overflow-hidden font-sans">
                  
                  {/* Left core info preview */}
                  <div className="p-4 md:col-span-4 space-y-4">
                    <div className="space-y-1.5">
                      <span className="bg-black text-white font-mono text-[7px] font-bold px-1 tracking-wider uppercase block w-max">
                        ESTABLISHED IN 1916 • CO-CURRICULAR CHARTER
                      </span>
                      <h3 className="text-xl font-black tracking-tight leading-none text-black mt-1">
                        {welcomeTitleThai || "[THAI TITLE]"}
                      </h3>
                      <h4 className="text-[10px] font-bold tracking-wider text-[#737373] uppercase leading-none">
                        {welcomeTitleEnglish || "[ENGLISH SUBTITLE]"}
                      </h4>
                    </div>

                    {welcomeLegacyQuote && (
                      <div className="p-3 bg-neutral-50/80 border-l-[3px] border-black text-xs font-bold leading-relaxed italic uppercase text-black/90">
                        "{welcomeLegacyQuote}"
                        {welcomeLegacyQuoteAuthor && (
                          <div className="text-[8px] tracking-wider text-black/55 mt-1 font-mono uppercase not-italic">
                            — {welcomeLegacyQuoteAuthor}
                          </div>
                        )}
                      </div>
                    )}

                    <p className="text-[10px] font-semibold tracking-wide leading-relaxed text-black/70 text-justify uppercase">{welcomeDescription || "[BACKGROUND PARAGRAPH]"}</p>
                  </div>

                  {/* Right Col preview: 3-Golfers Premium Artwork Block */}
                  <div className="p-3 md:col-span-2 bg-white flex items-center justify-center min-h-[130px] md:min-h-[150px] relative overflow-hidden">
                    <img
                      src={golfersSilhouette}
                      alt="Three Chula golfers in color silhouette overlays"
                      referrerPolicy="no-referrer"
                      className="w-full h-auto max-h-[140px] md:max-h-[160px] scale-[1.12] md:scale-[1.18] object-contain select-none relative z-10"
                    />
                  </div>

                </div>

              </div>
            </div>

          </div>

        </section>
      )}

      {/* --- SUB-TAB CORE 7.5: UPCOMING ACTIVITY CMS --- */}
      {activeSubTab === "upcoming" && (
        <section className="mx-auto max-w-4xl font-sans">
          <form onSubmit={handleUpdateUpcomingActivity} className="border border-[#121212] bg-white p-6 md:p-10 space-y-8 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#121212]/10 pb-4">
              <div>
                <h2 className="font-display text-base font-black uppercase tracking-tight text-black">
                  FEATURED UPCOMING ACTIVITY
                </h2>
                <p className="text-[10px] text-gray-500 font-mono uppercase mt-1">
                  Manage the prominent event shown on the homepage.
                </p>
              </div>
              <div className="flex items-center gap-3 bg-stone-50 px-4 py-2 border border-stone-200 rounded-xs">
                <span className="font-mono text-[9px] font-bold text-stone-600 uppercase">Show Section</span>
                <input 
                  type="checkbox" 
                  checked={upcomingShowSection} 
                  onChange={(e) => setUpcomingShowSection(e.target.checked)} 
                  className="accent-black h-4 w-4" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase block">ACTIVITY TITLE</label>
                <input
                  type="text"
                  value={upcomingTitle}
                  onChange={(e) => setUpcomingTitle(e.target.value)}
                  placeholder="e.g. VARSITY TRAINING CAMP 2026"
                  className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black focus:outline-none font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase block">EVENT DATE</label>
                <input
                  type="text"
                  value={upcomingDate}
                  onChange={(e) => setUpcomingDate(e.target.value)}
                  placeholder="e.g. July 12-15, 2026"
                  className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase block">LOCATION</label>
                <input
                  type="text"
                  value={upcomingLocation}
                  onChange={(e) => setUpcomingLocation(e.target.value)}
                  placeholder="e.g. Alpine Golf Club"
                  className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase block">REGISTRATION LINK (Optional)</label>
                <input
                  type="text"
                  value={upcomingRegUrl}
                  onChange={(e) => setUpcomingRegUrl(e.target.value)}
                  placeholder="https://docs.google.com/forms/..."
                  className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase block">BRIEF DESCRIPTION</label>
              <textarea
                rows={3}
                value={upcomingDescription}
                onChange={(e) => setUpcomingDescription(e.target.value)}
                placeholder="Describe the activity and what attendees can expect..."
                className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black focus:outline-none leading-relaxed"
              />
            </div>

            <ImageUploadWidget
              id="upcoming_image"
              label="PROMOTIONAL COVER IMAGE"
              value={upcomingImageUrl}
              onChange={setUpcomingImageUrl}
              placeholder="https://images.unsplash.com/..."
              helperText="A high-quality 16:9 aspect ratio image works best."
            />

            <div className="pt-6 border-t border-[#121212]/10">
              <button
                type="submit"
                disabled={isMutating}
                className="bg-[#121212] text-white hover:bg-[#ec4899] px-8 py-3 font-mono text-xs font-black tracking-widest uppercase flex items-center gap-2 cursor-pointer transition-all duration-350 disabled:opacity-50"
              >
                <Save size={14} />
                {isMutating ? "SAVING CHANGES..." : "UPDATE UPCOMING ACTIVITY"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* --- SUB-TAB CORE 8: SPONSORS CMS --- */}
      {activeSubTab === "sponsors" && (
        <section className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans">
          {/* Left Panel: Add/Edit Form */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border border-[#121212] bg-white p-6 space-y-5">
              <div>
                <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#121212] mb-1">
                  {editingSponsorId ? "EDIT SPONSOR PARTNER" : "NEW SPONSOR PARTNER"}
                </h2>
                <p className="text-[10px] text-gray-500 font-mono uppercase">
                  Add commercial brands, equipment partners or facility affiliates.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase block">SPONSOR BRAND NAME</label>
                  <input
                    type="text"
                    value={sponName}
                    onChange={(e) => setSponName(e.target.value)}
                    placeholder="e.g. TITLEIST THAILAND"
                    className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black focus:outline-none font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase block">WEBSITE URL</label>
                  <input
                    type="text"
                    value={sponWebsiteUrl}
                    onChange={(e) => setSponWebsiteUrl(e.target.value)}
                    placeholder="https://www.titleist.in.th/"
                    className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase block">SPONSOR DESCRIPTION</label>
                  <textarea
                    rows={3}
                    value={sponDescription}
                    onChange={(e) => setSponDescription(e.target.value)}
                    placeholder="Brief description of the partnership..."
                    className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black focus:outline-none leading-relaxed"
                  />
                </div>

                <ImageUploadWidget
                  id="spon_image"
                  label="SPONSOR LOGO (Transparent PNG preferred)"
                  value={sponImageUrl}
                  onChange={setSponImageUrl}
                  placeholder="https://logo-url.com/logo.png"
                  helperText="Upload or link to a high-quality logo image."
                />

                <div className="flex items-center justify-between p-3 bg-stone-50 border border-stone-200 rounded-sm">
                  <span className="font-mono text-[9px] font-bold text-stone-600 uppercase tracking-widest">Active Status</span>
                  <input 
                    type="checkbox" 
                    checked={sponIsActive} 
                    onChange={(e) => setSponIsActive(e.target.checked)} 
                    className="accent-black h-4 w-4" 
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 border-t border-[#121212]/10 pt-4">
                <button
                  onClick={handleSaveSponsor}
                  className="bg-[#121212] text-white hover:bg-[#ec4899] px-6 py-2.5 font-mono text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 cursor-pointer w-full justify-center transition-all duration-350"
                >
                  <Plus size={13} />
                  {editingSponsorId ? "SAVE REVISION DETAILS" : "PUBLISH SPONSOR PARTNER"}
                </button>
                {editingSponsorId && (
                  <button
                    onClick={() => {
                      setEditingSponsorId(null);
                      setSponName("");
                      setSponDescription("");
                      setSponWebsiteUrl("");
                      setSponImageUrl("");
                      setSponIsActive(true);
                    }}
                    className="border border-[#121212]/25 hover:bg-stone-50 text-xs font-mono uppercase px-3 py-2 shrink-0 cursor-pointer"
                  >
                    CANCEL [X]
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel: Curated list of Sponsors */}
          <div className="lg:col-span-7 space-y-6">
            <div className="border border-[#121212] bg-white p-6 space-y-4">
              <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#121212]">
                ACTIVE CORPORATE RECOGNITION BOARD
              </h2>

              <div className="divide-y divide-[#121212]/10 max-h-[600px] overflow-y-auto pr-1">
                {(dbState.sponsors || []).map((spon) => (
                  <div key={spon.id} className="py-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`h-1.5 w-1.5 rounded-full ${spon.isActive ? "bg-emerald-500 animate-pulse" : "bg-red-400"}`}></span>
                        <span className="font-mono text-[9px] font-bold text-black/55 uppercase tracking-widest">
                          {spon.isActive ? "Active Partnership" : "Inactive / On Hold"}
                        </span>
                      </div>
                      {spon.imageUrl && (
                        <div className="h-8 w-12 border border-black/5 bg-stone-50 rounded-xs flex items-center justify-center p-1 overflow-hidden">
                          <img src={spon.imageUrl} alt={spon.name} className="max-h-full max-w-full object-contain" />
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="font-display text-sm font-black uppercase text-black leading-tight">
                        {spon.name}
                      </h4>
                      {spon.websiteUrl && (
                        <a href={spon.websiteUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-[8px] text-blue-500 hover:underline flex items-center gap-1">
                          {spon.websiteUrl} <ArrowUpRight size={8} />
                        </a>
                      )}
                    </div>

                    <p className="text-[11px] leading-relaxed text-stone-500 italic line-clamp-2">
                      "{spon.description}"
                    </p>

                    <div className="flex items-center gap-3 pt-1 border-t border-black/5">
                      <button
                        onClick={() => handleEditSponsorTrigger(spon)}
                        className="inline-flex items-center gap-1 font-mono text-[9px] text-blue-600 hover:underline cursor-pointer font-bold"
                      >
                        <Edit size={10} /> EDIT PARTNER INFO
                      </button>
                      <span className="text-black/10">•</span>
                      <button
                        onClick={() => handleDeleteSponsorCall(spon.id)}
                        className="inline-flex items-center gap-1 font-mono text-[9px] text-red-600 hover:underline cursor-pointer font-bold"
                      >
                        <Trash2 size={10} /> REVOKE SPONSORSHIP
                      </button>
                    </div>
                  </div>
                ))}
                {(!dbState.sponsors || dbState.sponsors.length === 0) && (
                  <p className="text-xs text-stone-400 font-mono italic">No custom sponsors populated. Defaults are shown in active view.</p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* --- SUB-TAB CORE 8B: HOME SPONSORS CMS --- */}
      {activeSubTab === "homeSponsors" && (
        <section className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans">
          {/* Form */}
          <div className="lg:col-span-6 space-y-6">
            <form onSubmit={handleUpdateHomeSponsorSection} className="border border-[#121212] bg-white p-6 space-y-5">
              <div>
                <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#121212] mb-1">
                  EDIT HOME SPONSOR SHOWCASE
                </h2>
                <p className="text-[10px] text-gray-500 font-mono uppercase">
                  Configure the featured sponsor section on the main landing page.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-stone-50 border border-stone-200 p-3 rounded-xs mb-4">
                  <input
                    id="toggle_home_sponsors"
                    type="checkbox"
                    checked={homeSponShowSection}
                    onChange={(e) => setHomeSponShowSection(e.target.checked)}
                    className="accent-black h-4 w-4"
                  />
                  <label htmlFor="toggle_home_sponsors" className="font-mono text-[9px] font-bold text-stone-600 uppercase cursor-pointer">
                    ENABLE & SHOW SPONSOR SHOWCASE ON HOME PAGE
                  </label>
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase block">MAIN TITLE</label>
                  <input
                    type="text"
                    value={homeSponTitle}
                    onChange={(e) => setHomeSponTitle(e.target.value)}
                    placeholder="SUPPORTING EXCELLENCE"
                    className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black focus:outline-none font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase block">SUBTITLE / KICKER</label>
                  <input
                    type="text"
                    value={homeSponSubtitle}
                    onChange={(e) => setHomeSponSubtitle(e.target.value)}
                    placeholder="CORPORATE PARTNERSHIP"
                    className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase block">DESCRIPTION TEXT</label>
                  <textarea
                    rows={4}
                    value={homeSponDescription}
                    onChange={(e) => setHomeSponDescription(e.target.value)}
                    placeholder="Our sponsors provide the essential resources..."
                    className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase block">SECTION MARQUEE TEXT (Optional)</label>
                  <input
                    type="text"
                    value={homeSponMarqueeText}
                    onChange={(e) => setHomeSponMarqueeText(e.target.value)}
                    placeholder="e.g. PLATINUM PARTNERS • EQUIPMENT PROVIDERS"
                    className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black focus:outline-none font-bold"
                  />
                  <p className="text-[8px] text-stone-400 font-mono uppercase">This text will scroll alongside the sponsor logos in this section.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase block">BUTTON TEXT</label>
                  <input
                    type="text"
                    value={homeSponButtonText}
                    onChange={(e) => setHomeSponButtonText(e.target.value)}
                    placeholder="LEARN MORE"
                    className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase block">BUTTON DESTINATION URL (Or relative path like /sponsors)</label>
                  <input
                    type="text"
                    value={homeSponButtonUrl}
                    onChange={(e) => setHomeSponButtonUrl(e.target.value)}
                    placeholder="/sponsors"
                    className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <ImageUploadWidget
                    id="homeSpon_img"
                    label="FEATURED SPONSOR IMAGE URL"
                    value={homeSponImageUrl}
                    onChange={setHomeSponImageUrl}
                    placeholder="Select featured photo..."
                  />
                </div>
              </div>

              <div className="border-t border-[#121212]/10 pt-6 mt-6">
                <button
                  type="submit"
                  disabled={isMutating}
                  className="bg-[#121212] text-white hover:bg-[#ec4899] px-8 py-3 font-mono text-xs font-black tracking-widest uppercase flex items-center gap-2 cursor-pointer transition-all duration-350 disabled:opacity-50"
                >
                  <Save size={14} />
                  {isMutating ? "SAVING CHANGES..." : "UPDATE SPONSOR SHOWCASE"}
                </button>
              </div>
            </form>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-6 space-y-4">
            <span className="font-mono text-[10px] font-bold tracking-widest text-black/55 uppercase flex items-center gap-1.5">
              <Eye size={12} className="text-[#a855f7]" /> CONTENT PREVIEW MAP
            </span>
            <div className="border-2 border-dashed border-black/30 p-4 bg-stone-50 pointer-events-none opacity-80">
              <div className="flex flex-col bg-white border border-stone-200 overflow-hidden shadow-xs">
                {/* Marquee Preview */}
                <div className="border-b border-stone-100 bg-stone-50/50 py-3 overflow-hidden">
                  <div className="flex whitespace-nowrap gap-6 items-center">
                    {homeSponMarqueeText && (
                      <span className="font-mono text-[8px] font-black text-[#da5f8e] uppercase px-4 border-r border-stone-200 shrink-0">
                        {homeSponMarqueeText}
                      </span>
                    )}
                    <div className="flex gap-4 shrink-0">
                      <div className="h-6 w-12 bg-stone-200 rounded-xs"></div>
                      <div className="h-6 w-10 bg-stone-200 rounded-xs"></div>
                      <div className="h-6 w-14 bg-stone-200 rounded-xs"></div>
                    </div>
                  </div>
                </div>

                {homeSponImageUrl && (
                  <div className="h-40 relative overflow-hidden bg-stone-100 border-b border-stone-200">
                    <img src={homeSponImageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-6 space-y-4">
                  <span className="font-mono text-[10px] font-bold text-[#da5f8e] tracking-[0.3em] uppercase">
                    {homeSponSubtitle || "CORPORATE PARTNERSHIP"}
                  </span>
                  <h2 className="font-thai text-3xl font-bold tracking-tight text-neutral-950 leading-none">
                    {homeSponTitle || "SUPPORTING EXCELLENCE"}
                  </h2>
                  <p className="font-sans text-xs text-stone-600 leading-relaxed">
                    {homeSponDescription}
                  </p>
                  <div className="inline-flex items-center gap-2 bg-neutral-950 text-white px-4 py-2 font-mono text-[10px] font-black tracking-widest uppercase">
                    {homeSponButtonText || "LEARN MORE"} <ArrowRight size={10} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* --- SUB-TAB CORE 9: SITE LABELS CMS --- */}
      {activeSubTab === "siteLabels" && (
        <section className="mx-auto max-w-7xl font-sans space-y-8">
          <form onSubmit={handleUpdateSiteLabels} className="border border-[#121212] bg-white p-6 md:p-10 space-y-12">
            <div>
              <h2 className="font-display text-lg font-bold uppercase tracking-wider text-[#121212] mb-1">
                EDIT SITE-WIDE EDITORIAL TEXT & LABELS
              </h2>
              <p className="text-xs text-gray-500 font-mono uppercase">
                Customize every title, subtitle, and descriptive block across all pages.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">

              {/* NAVBAR LABELS */}
              <div className="space-y-6">
                <h3 className="font-mono text-[11px] font-black text-[#ec4899] uppercase tracking-[0.2em] border-b border-[#ec4899]/20 pb-2">NAVBAR CONTENT</h3>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">NAV HOME</label>
                    <input type="text" value={labelNavHome} onChange={(e) => setLabelNavHome(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">NAV ACTIVITIES (BLOG)</label>
                    <input type="text" value={labelNavBlog} onChange={(e) => setLabelNavBlog(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">NAV TEAM ROSTER</label>
                    <input type="text" value={labelNavRoster} onChange={(e) => setLabelNavRoster(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">NAV STAFF & BOARD</label>
                    <input type="text" value={labelNavStaff} onChange={(e) => setLabelNavStaff(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">NAV SCORES & STATS</label>
                    <input type="text" value={labelNavScores} onChange={(e) => setLabelNavScores(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">NAV PARTNERS</label>
                    <input type="text" value={labelNavSponsors} onChange={(e) => setLabelNavSponsors(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">NAV ADMIN CMS</label>
                    <input type="text" value={labelNavAdmin} onChange={(e) => setLabelNavAdmin(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">NAV ADMIN ACTIVE</label>
                    <input type="text" value={labelNavAdminActive} onChange={(e) => setLabelNavAdminActive(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">NAV ADMIN CMS (LABEL)</label>
                    <input type="text" value={labelNavAdminCms} onChange={(e) => setLabelNavAdminCms(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">BRAND TITLE</label>
                    <input type="text" value={labelNavBrandTitle} onChange={(e) => setLabelNavBrandTitle(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-black" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">BRAND SUBTITLE</label>
                    <input type="text" value={labelNavBrandSubtitle} onChange={(e) => setLabelNavBrandSubtitle(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-medium" />
                  </div>
                </div>
              </div>

              {/* HOME PAGE LABELS */}
              <div className="space-y-6">
                <h3 className="font-mono text-[11px] font-black text-[#ec4899] uppercase tracking-[0.2em] border-b border-[#ec4899]/20 pb-2">HOME PAGE CONTENT</h3>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">BLOG SECTION TITLE</label>
                    <input type="text" value={labelHomeBlogTitle} onChange={(e) => setLabelHomeBlogTitle(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">BLOG SECTION SUBTITLE</label>
                    <input type="text" value={labelHomeBlogSubtitle} onChange={(e) => setLabelHomeBlogSubtitle(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-medium" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">READ COVERAGE BUTTON</label>
                    <input type="text" value={labelHomeReadCoverageButton} onChange={(e) => setLabelHomeReadCoverageButton(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">READ STORY BUTTON</label>
                    <input type="text" value={labelHomeReadStoryButton} onChange={(e) => setLabelHomeReadStoryButton(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">LIVE STANDINGS TITLE</label>
                    <input type="text" value={labelHomeLiveStandingsTitle} onChange={(e) => setLabelHomeLiveStandingsTitle(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">FULL LEADERBOARD BUTTON</label>
                    <input type="text" value={labelHomeFullLeaderboardButton} onChange={(e) => setLabelHomeFullLeaderboardButton(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">FEATURED ACTIVITY BADGE</label>
                    <input type="text" value={labelHomeFeaturedActivityBadge} onChange={(e) => setLabelHomeFeaturedActivityBadge(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">RECENT UPDATES LABEL</label>
                    <input type="text" value={labelHomeRecentUpdatesLabel} onChange={(e) => setLabelHomeRecentUpdatesLabel(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">ACTIVITY LABEL</label>
                    <input type="text" value={labelHomeActivityLabel} onChange={(e) => setLabelHomeActivityLabel(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">NO BLOGS MESSAGE</label>
                    <input type="text" value={labelHomeNoBlogs} onChange={(e) => setLabelHomeNoBlogs(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">NO SCORES MESSAGE</label>
                    <input type="text" value={labelHomeNoScores} onChange={(e) => setLabelHomeNoScores(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">MODAL OFFICIAL BADGE</label>
                    <input type="text" value={labelHomeModalOfficialBadge} onChange={(e) => setLabelHomeModalOfficialBadge(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">MODAL EDITORIAL BOARD</label>
                    <input type="text" value={labelHomeModalEditorialBoard} onChange={(e) => setLabelHomeModalEditorialBoard(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">MODAL LOCATION</label>
                    <input type="text" value={labelHomeModalLocation} onChange={(e) => setLabelHomeModalLocation(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-bold" />
                  </div>
                </div>
              </div>

              {/* HOME MEMBERSHIP SECTION LABELS */}
              <div className="space-y-6">
                <h3 className="font-mono text-[11px] font-black text-[#ec4899] uppercase tracking-[0.2em] border-b border-[#ec4899]/20 pb-2">MEMBERSHIP INVITATION SECTION</h3>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">MEMBERSHIP TITLE</label>
                    <input type="text" value={labelHomeMembershipTitle} onChange={(e) => setLabelHomeMembershipTitle(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">MEMBERSHIP DESCRIPTION</label>
                    <textarea rows={3} value={labelHomeMembershipDescription} onChange={(e) => setLabelHomeMembershipDescription(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none leading-relaxed" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">REGISTRATION BUTTON TEXT</label>
                    <input type="text" value={labelHomeMembershipButtonText} onChange={(e) => setLabelHomeMembershipButtonText(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-bold" />
                  </div>
                </div>
              </div>

              {/* ROSTER PAGE LABELS */}
              <div className="space-y-6">
                <h3 className="font-mono text-[11px] font-black text-[#ec4899] uppercase tracking-[0.2em] border-b border-[#ec4899]/20 pb-2">ROSTER PAGE CONTENT</h3>
                
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">ROSTER MAIN TITLE</label>
                    <input type="text" value={labelRosterTitle} onChange={(e) => setLabelRosterTitle(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">ROSTER SUBTITLE</label>
                    <input type="text" value={labelRosterSubtitle} onChange={(e) => setLabelRosterSubtitle(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-medium" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">VERIFIED STATUS LABEL</label>
                    <input type="text" value={labelRosterVerifiedLabel} onChange={(e) => setLabelRosterVerifiedLabel(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-mono" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">SEARCH PLACEHOLDER</label>
                    <input type="text" value={labelRosterSearchPlaceholder} onChange={(e) => setLabelRosterSearchPlaceholder(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">FILTER LABEL</label>
                    <input type="text" value={labelRosterFilterLabel} onChange={(e) => setLabelRosterFilterLabel(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">STATUS LABEL</label>
                    <input type="text" value={labelRosterStatusLabel} onChange={(e) => setLabelRosterStatusLabel(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">NO RESULTS TITLE</label>
                    <input type="text" value={labelRosterNoResultsTitle} onChange={(e) => setLabelRosterNoResultsTitle(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">NO RESULTS DESC</label>
                    <textarea rows={2} value={labelRosterNoResultsDesc} onChange={(e) => setLabelRosterNoResultsDesc(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">SQUAD LEAD BADGE</label>
                    <input type="text" value={labelRosterSquadLeadBadge} onChange={(e) => setLabelRosterSquadLeadBadge(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">INDEX LABEL</label>
                    <input type="text" value={labelRosterIndexLabel} onChange={(e) => setLabelRosterIndexLabel(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">ATHLETE LABEL</label>
                    <input type="text" value={labelRosterAthleteLabel} onChange={(e) => setLabelRosterAthleteLabel(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">STATUS ACTIVE LABEL</label>
                    <input type="text" value={labelRosterStatusActive} onChange={(e) => setLabelRosterStatusActive(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none" />
                  </div>
                </div>
              </div>

              {/* WELCOME HERO LABELS */}
              <div className="space-y-6">
                <h3 className="font-mono text-[11px] font-black text-[#ec4899] uppercase tracking-[0.2em] border-b border-[#ec4899]/20 pb-2">WELCOME HERO CONTENT</h3>
                
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">HERO MAIN TITLE (Legacy)</label>
                    <input type="text" value={labelWelcomeHeroTitle} onChange={(e) => setLabelWelcomeHeroTitle(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">HERO SUBTITLE (Legacy)</label>
                    <input type="text" value={labelWelcomeHeroSubtitle} onChange={(e) => setLabelWelcomeHeroSubtitle(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-bold italic" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">HERO SOCIAL HANDLE</label>
                    <input type="text" value={labelWelcomeHeroSocial} onChange={(e) => setLabelWelcomeHeroSocial(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-mono" />
                  </div>
                </div>
              </div>

              {/* STAFF PAGE LABELS */}
              <div className="space-y-6">
                <h3 className="font-mono text-[11px] font-black text-[#ec4899] uppercase tracking-[0.2em] border-b border-[#ec4899]/20 pb-2">STAFF PAGE CONTENT</h3>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">STAFF MAIN TITLE</label>
                    <input type="text" value={labelStaffTitle} onChange={(e) => setLabelStaffTitle(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">STAFF SUBTITLE</label>
                    <input type="text" value={labelStaffSubtitle} onChange={(e) => setLabelStaffSubtitle(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-medium" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">VERIFIED STATUS LABEL</label>
                    <input type="text" value={labelStaffVerifiedLabel} onChange={(e) => setLabelStaffVerifiedLabel(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-mono" />
                  </div>
                </div>
              </div>

              {/* SCORES PAGE LABELS */}
              <div className="space-y-6">
                <h3 className="font-mono text-[11px] font-black text-[#ec4899] uppercase tracking-[0.2em] border-b border-[#ec4899]/20 pb-2">SCORES PAGE CONTENT</h3>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">SCORES MAIN TITLE</label>
                    <input type="text" value={labelScoresTitle} onChange={(e) => setLabelScoresTitle(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">SCORES SUBTITLE</label>
                    <input type="text" value={labelScoresSubtitle} onChange={(e) => setLabelScoresSubtitle(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-medium" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">VERIFIED STATUS LABEL</label>
                    <input type="text" value={labelScoresVerifiedLabel} onChange={(e) => setLabelScoresVerifiedLabel(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-mono" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">RECAP WIDGET TITLE</label>
                    <input type="text" value={labelScoresRecapTitle} onChange={(e) => setLabelScoresRecapTitle(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">RECAP WIDGET SUBTITLE</label>
                    <input type="text" value={labelScoresRecapSubtitle} onChange={(e) => setLabelScoresRecapSubtitle(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-medium" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">OFFICIAL STATS BADGE</label>
                    <input type="text" value={labelScoresOfficialStatsBadge} onChange={(e) => setLabelScoresOfficialStatsBadge(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">VIEW STANDINGS BUTTON</label>
                    <input type="text" value={labelScoresViewStandingsButton} onChange={(e) => setLabelScoresViewStandingsButton(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">HIDE STANDINGS BUTTON</label>
                    <input type="text" value={labelScoresHideStandingsButton} onChange={(e) => setLabelScoresHideStandingsButton(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">PLAYER HEADER</label>
                    <input type="text" value={labelScoresTablePlayerHeader} onChange={(e) => setLabelScoresTablePlayerHeader(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">SCORE HEADER</label>
                    <input type="text" value={labelScoresTableScoreHeader} onChange={(e) => setLabelScoresTableScoreHeader(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">POSITION HEADER</label>
                    <input type="text" value={labelScoresTablePositionHeader} onChange={(e) => setLabelScoresTablePositionHeader(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">ATTESTATION LABEL</label>
                    <input type="text" value={labelScoresAttestationLabel} onChange={(e) => setLabelScoresAttestationLabel(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">VERIFIED DIRECTORY LABEL</label>
                    <input type="text" value={labelScoresVerifiedDirectoryLabel} onChange={(e) => setLabelScoresVerifiedDirectoryLabel(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">DETAILED LEADERBOARD TITLE</label>
                    <input type="text" value={labelScoresDetailedLeaderboardTitle} onChange={(e) => setLabelScoresDetailedLeaderboardTitle(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-bold" />
                  </div>
                </div>
              </div>

              {/* SPONSORS PAGE LABELS */}
              <div className="space-y-6">
                <h3 className="font-mono text-[11px] font-black text-[#ec4899] uppercase tracking-[0.2em] border-b border-[#ec4899]/20 pb-2">SPONSORS PAGE CONTENT</h3>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">SPONSORS MAIN TITLE</label>
                    <input type="text" value={labelSponsorsTitle} onChange={(e) => setLabelSponsorsTitle(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">SPONSORS SUBTITLE</label>
                    <input type="text" value={labelSponsorsSubtitle} onChange={(e) => setLabelSponsorsSubtitle(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-medium" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">VERIFIED STATUS LABEL</label>
                    <input type="text" value={labelSponsorsVerifiedLabel} onChange={(e) => setLabelSponsorsVerifiedLabel(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-mono" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">CONTACT SECTION TITLE</label>
                    <input type="text" value={labelSponsorsContactTitle} onChange={(e) => setLabelSponsorsContactTitle(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">CONTACT SECTION DESCRIPTION</label>
                    <textarea rows={3} value={labelSponsorsContactDescription} onChange={(e) => setLabelSponsorsContactDescription(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none leading-relaxed" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">OFFICIALLY ASSOCIATED LABEL</label>
                    <input type="text" value={labelSponsorsOfficiallyAssociatedLabel} onChange={(e) => setLabelSponsorsOfficiallyAssociatedLabel(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-bold" />
                  </div>
                </div>
              </div>

              {/* FOOTER LABELS */}
              <div className="space-y-6">
                <h3 className="font-mono text-[11px] font-black text-[#ec4899] uppercase tracking-[0.2em] border-b border-[#ec4899]/20 pb-2">FOOTER EDITORIAL CONTENT</h3>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">MISSION TITLE</label>
                    <input type="text" value={labelFooterMissionTitle} onChange={(e) => setLabelFooterMissionTitle(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">MISSION DESCRIPTION</label>
                    <textarea rows={3} value={labelFooterMissionDescription} onChange={(e) => setLabelFooterMissionDescription(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none leading-relaxed" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">LEGACY TITLE</label>
                    <input type="text" value={labelFooterLegacyTitle} onChange={(e) => setLabelFooterLegacyTitle(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">LEGACY DESCRIPTION</label>
                    <textarea rows={3} value={labelFooterLegacyDescription} onChange={(e) => setLabelFooterLegacyDescription(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none leading-relaxed" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">DIRECTORY TITLE</label>
                    <input type="text" value={labelFooterDirectoryTitle} onChange={(e) => setLabelFooterDirectoryTitle(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">HEADQUARTERS TITLE</label>
                    <input type="text" value={labelFooterHeadquartersTitle} onChange={(e) => setLabelFooterHeadquartersTitle(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">AFFILIATIONS TITLE</label>
                    <input type="text" value={labelFooterAffiliationsTitle} onChange={(e) => setLabelFooterAffiliationsTitle(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">RIGHTS RESERVED LABEL</label>
                    <input type="text" value={labelFooterRightsReserved} onChange={(e) => setLabelFooterRightsReserved(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">CMS LOGIN LABEL</label>
                    <input type="text" value={labelFooterCmsLogin} onChange={(e) => setLabelFooterCmsLogin(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">PRIVACY DISCLOSURE LABEL</label>
                    <input type="text" value={labelFooterPrivacyDisclosure} onChange={(e) => setLabelFooterPrivacyDisclosure(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">TERMS OF TRADITION LABEL</label>
                    <input type="text" value={labelFooterTermsOfTradition} onChange={(e) => setLabelFooterTermsOfTradition(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">NEWS ROOM LINK LABEL</label>
                    <input type="text" value={labelFooterDirectoryNewsRoom} onChange={(e) => setLabelFooterDirectoryNewsRoom(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">VARSITY ROSTER LINK LABEL</label>
                    <input type="text" value={labelFooterDirectoryRoster} onChange={(e) => setLabelFooterDirectoryRoster(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">MATCH STATS LINK LABEL</label>
                    <input type="text" value={labelFooterDirectoryScores} onChange={(e) => setLabelFooterDirectoryScores(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">CHULA MAIN LINK LABEL</label>
                    <input type="text" value={labelFooterAffiliationsChulaMain} onChange={(e) => setLabelFooterAffiliationsChulaMain(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase">CU SPORTS OFFICE LINK LABEL</label>
                    <input type="text" value={labelFooterAffiliationsSportsOffice} onChange={(e) => setLabelFooterAffiliationsSportsOffice(e.target.value)} className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black outline-none font-bold" />
                  </div>
                </div>
              </div>

            </div>

            <div className="border-t border-[#121212]/10 pt-8">
              <button
                type="submit"
                disabled={isMutating}
                className="bg-[#121212] text-white hover:bg-emerald-600 disabled:opacity-50 px-8 py-3.5 font-mono text-xs font-bold tracking-wider uppercase flex items-center gap-2 cursor-pointer w-full md:w-auto justify-center transition-all duration-300 shadow-md"
              >
                <Save size={14} />
                {isMutating ? "COMMITTING CONTENT UPDATES..." : "PUBLISH SITE CONTENT REVISIONS"}
              </button>
            </div>
          </form>
        </section>
      )}
      {/* --- SUB-TAB CORE 8: GENERAL SITE SETTINGS CMS --- */}
      {activeSubTab === "siteSettings" && (
        <section className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans">
          {/* Form left */}
          <div className="lg:col-span-6 space-y-6">
            <form onSubmit={handleUpdateSiteSettings} className="border border-[#121212] bg-white p-6 space-y-5">
              <div>
                <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#121212] mb-1">
                  EDIT GLOBAL ANNOUNCEMENTS & INFO
                </h2>
                <p className="text-[10px] text-gray-500 font-mono uppercase">
                  Re-configure moving marquee banner text, office addresses, and official lines.
                </p>
              </div>

              <div className="space-y-4">
                {/* Marquee Text */}
                <div className="space-y-1.5">
                  <label htmlFor="marquee_text" className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase block">MOVING MARQUEE ANNOUNCEMENT TEXT (RIGHT TO LEFT DIRECTIVE)</label>
                  <textarea
                    id="marquee_text"
                    rows={2}
                    value={setsMarqueeText}
                    onChange={(e) => setSetsMarqueeText(e.target.value)}
                    placeholder="Chulalongkorn University Golf Club • Drive to Excellence"
                    className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black focus:outline-none font-bold"
                    required
                  />
                  <p className="text-[9px] text-stone-400 font-mono uppercase leading-snug">This text automatically scrolls continuously across the border of EVERY single page of the website!</p>
                </div>

                {/* Telephone */}
                <div className="space-y-1.5">
                  <label htmlFor="sets_phone" className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase block">CONTACT TELEPHONE NUMBER</label>
                  <input
                    id="sets_phone"
                    type="text"
                    value={setsContactPhone}
                    onChange={(e) => setSetsContactPhone(e.target.value)}
                    placeholder="+66 (0) 2218-1916"
                    className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black focus:outline-none font-bold"
                    required
                  />
                </div>

                {/* Email address */}
                <div className="space-y-1.5">
                  <label htmlFor="sets_email" className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase block">CONTACT EMAIL ADDRESS</label>
                  <input
                    id="sets_email"
                    type="email"
                    value={setsContactEmail}
                    onChange={(e) => setSetsContactEmail(e.target.value)}
                    placeholder="golf@chula.ac.th"
                    className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black focus:outline-none"
                    required
                  />
                </div>

                {/* Address block */}
                <div className="space-y-1.5">
                  <label htmlFor="sets_addr" className="font-mono text-[9px] font-bold text-[#121212]/60 uppercase block">PHYSICAL HEADQUARTERS ADDRESS</label>
                  <textarea
                    id="sets_addr"
                    rows={2}
                    value={setsContactAddress}
                    onChange={(e) => setSetsContactAddress(e.target.value)}
                    placeholder="Chula Sports Complex, Phayathai Rd, Pathum Wan, Bangkok 10330, Thailand"
                    className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black focus:outline-none"
                    required
                  />
                </div>

                {/* Academic Affiliation */}
                <div className="space-y-1.5">
                  <label htmlFor="sets_academic" className="font-mono text-[9px] font-bold text-[#121212]/65 uppercase block">ACADEMIC & LEAGUE AFFILIATION</label>
                  <input
                    id="sets_academic"
                    type="text"
                    value={setsAcademicAffiliation}
                    onChange={(e) => setSetsAcademicAffiliation(e.target.value)}
                    placeholder="Thailand University Golf Association (TUGA)"
                    className="w-full bg-[#fcfbf9] border border-[#121212]/20 p-2 text-xs focus:ring-1 focus:ring-black focus:outline-none font-semibold"
                    required
                  />
                </div>

                {/* VISIBILITY TOGGLES */}
                <div className="pt-6 space-y-4">
                  <h3 className="font-mono text-[10px] font-black text-[#ec4899] uppercase tracking-widest border-b border-[#ec4899]/15 pb-2">SECTION VISIBILITY CONTROL</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 bg-stone-50 border border-stone-200 rounded-sm">
                      <span className="font-mono text-[9px] font-bold text-stone-600 uppercase">Show Marquee</span>
                      <input type="checkbox" checked={setsShowMarquee} onChange={(e) => setSetsShowMarquee(e.target.checked)} className="accent-black" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-stone-50 border border-stone-200 rounded-sm">
                      <span className="font-mono text-[9px] font-bold text-stone-600 uppercase">Show Home Blog</span>
                      <input type="checkbox" checked={setsShowHomeBlog} onChange={(e) => setSetsShowHomeBlog(e.target.checked)} className="accent-black" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-stone-50 border border-stone-200 rounded-sm">
                      <span className="font-mono text-[9px] font-bold text-stone-600 uppercase">Show Home Welcome</span>
                      <input type="checkbox" checked={setsShowHomeWelcome} onChange={(e) => setSetsShowHomeWelcome(e.target.checked)} className="accent-black" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-stone-50 border border-stone-200 rounded-sm">
                      <span className="font-mono text-[9px] font-bold text-stone-600 uppercase">Show Home Scores</span>
                      <input type="checkbox" checked={setsShowHomeScores} onChange={(e) => setSetsShowHomeScores(e.target.checked)} className="accent-black" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-stone-50 border border-stone-200 rounded-sm">
                      <span className="font-mono text-[9px] font-bold text-stone-600 uppercase">Show Home Sponsors</span>
                      <input type="checkbox" checked={setsShowHomeSponsors} onChange={(e) => setSetsShowHomeSponsors(e.target.checked)} className="accent-black" />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-stone-50 border border-stone-200 rounded-sm">
                      <span className="font-mono text-[9px] font-bold text-stone-600 uppercase">Show Footer Mission</span>
                      <input type="checkbox" checked={setsShowFooterMission} onChange={(e) => setSetsShowFooterMission(e.target.checked)} className="accent-black" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-stone-50 border border-stone-200 rounded-sm">
                      <span className="font-mono text-[9px] font-bold text-stone-600 uppercase">Show Footer Legacy</span>
                      <input type="checkbox" checked={setsShowFooterLegacy} onChange={(e) => setSetsShowFooterLegacy(e.target.checked)} className="accent-black" />
                    </div>
                  </div>

                  <h3 className="font-mono text-[10px] font-black text-blue-600 uppercase tracking-widest border-b border-blue-600/15 pt-2 pb-2">NAVBAR ITEM VISIBILITY</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 bg-stone-50 border border-stone-200 rounded-sm">
                      <span className="font-mono text-[9px] font-bold text-stone-600 uppercase">Nav: Roster</span>
                      <input type="checkbox" checked={setsShowNavbarRoster} onChange={(e) => setSetsShowNavbarRoster(e.target.checked)} className="accent-black" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-stone-50 border border-stone-200 rounded-sm">
                      <span className="font-mono text-[9px] font-bold text-stone-600 uppercase">Nav: Staff</span>
                      <input type="checkbox" checked={setsShowNavbarStaff} onChange={(e) => setSetsShowNavbarStaff(e.target.checked)} className="accent-black" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-stone-50 border border-stone-200 rounded-sm">
                      <span className="font-mono text-[9px] font-bold text-stone-600 uppercase">Nav: Scores</span>
                      <input type="checkbox" checked={setsShowNavbarScores} onChange={(e) => setSetsShowNavbarScores(e.target.checked)} className="accent-black" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-stone-50 border border-stone-200 rounded-sm">
                      <span className="font-mono text-[9px] font-bold text-stone-600 uppercase">Nav: Sponsors</span>
                      <input type="checkbox" checked={setsShowNavbarSponsors} onChange={(e) => setSetsShowNavbarSponsors(e.target.checked)} className="accent-black" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#121212]/10 pt-4">
                <button
                  type="submit"
                  disabled={isMutating}
                  className="bg-[#121212] text-white hover:bg-emerald-600 disabled:opacity-50 px-6 py-2.5 font-mono text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 cursor-pointer w-full justify-center transition-all duration-300"
                >
                  <Save size={13} />
                  {isMutating ? "SAVING SITE CONFIG..." : "COMMIT GLOBAL SITE SETTINGS"}
                </button>
              </div>
            </form>
          </div>

          {/* Preview panel right */}
          <div className="lg:col-span-6 space-y-4">
            <span className="font-mono text-[10px] font-bold tracking-widest text-black/55 uppercase flex items-center gap-1.5">
              <Eye size={12} className="text-[#a855f7]" /> DYNAMIC MARQUEE INFOBAR LIVE SIMULATION
            </span>

            <div className="border-2 border-dashed border-black/30 p-4 bg-stone-50">
              <div className="space-y-4">
                {/* Simulated Marquee */}
                <div className="w-full bg-neutral-950 text-stone-100 py-2.5 overflow-hidden border border-black select-none relative">
                  <span className="bg-[#ec4899] text-white font-mono text-[7px] font-bold absolute left-0 top-0 bottom-0 z-10 px-1.5 py-1.5 uppercase leading-none">LIVE BANNER</span>
                  <div className="w-full overflow-hidden whitespace-nowrap pl-20">
                    <span className="animate-marquee inline-block font-mono text-[8.5px] uppercase tracking-wider font-extrabold text-stone-200">
                      {setsMarqueeText || "Chulalongkorn University Golf Club • Drive to Excellence"}
                    </span>
                  </div>
                </div>

                {/* Simulated Footer card info */}
                <div className="border border-black bg-white p-4 font-sans space-y-3">
                  <span className="font-mono text-[8.5px] bg-[#ec4899]/5 px-2 py-1 text-[#ec4899] font-bold tracking-widest border border-[#ec4899]/15">REACTIVE FOOTER DETAILS</span>
                  <div className="grid grid-cols-2 gap-2 text-[10px] uppercase font-semibold text-stone-700">
                    <div>
                      <span className="block text-[8px] text-stone-400 font-mono">PHONELINE:</span>
                      {setsContactPhone}
                    </div>
                    <div>
                      <span className="block text-[8px] text-stone-400 font-mono">EMAIL BOX:</span>
                      <span className="lowercase">{setsContactEmail}</span>
                    </div>
                  </div>
                  <div>
                    <span className="block text-[8px] text-stone-400 font-mono">ADDRESS LOCATION:</span>
                    <p className="text-[10px] text-stone-605 lowercase first-letter:uppercase">{setsContactAddress}</p>
                  </div>
                  <div>
                    <span className="block text-[8px] text-stone-400 font-mono">AFFILIATION:</span>
                    <p className="text-[10px] text-stone-800 font-bold uppercase">{setsAcademicAffiliation}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
