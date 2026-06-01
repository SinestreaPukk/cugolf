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

  // Visual CMS State
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"home" | "club" | "roster" | "staff" | "scores" | "sponsors" | "settings">("home");

  // Read ?edit query param to auto-open sidebar
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const editId = searchParams.get("edit");
    if (editId) {
      setActiveSectionId(editId);
      // Derive activeView from editId prefix if needed
      if (editId.startsWith("home_")) setActiveView("home");
      else if (editId.startsWith("ca_")) setActiveView("club");
      else if (editId === "news_list" || editId === "news_edit") setActiveView("club"); // Or wherever blog lives in CMS nav
      else if (editId === "roster_list" || editId === "roster_edit") setActiveView("roster");
      else if (editId === "staff_list" || editId === "staff_edit") setActiveView("staff");
      else if (editId === "scores_list" || editId === "scores_edit") setActiveView("scores");
      
      // Clean up URL without reloading
      window.history.replaceState({}, '', '/admin');
    }
  }, []);

  const handleSectionSelect = (sectionId: string) => {
    setActiveSectionId(sectionId);
  };

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
  const [newsIsVisible, setNewsIsVisible] = useState(true);

  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [playerHandicap, setPlayerHandicap] = useState<number>(1.5);
  const [playerYear, setPlayerYear] = useState("Freshman");
  const [playerFaculty, setPlayerFaculty] = useState("");
  const [playerImage, setPlayerImage] = useState("");
  const [playerIsFeatured, setPlayerIsFeatured] = useState(false);
  const [playerIsVisible, setPlayerIsVisible] = useState(true);

  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [staffName, setStaffName] = useState("");
  const [staffRole, setStaffRole] = useState("");
  const [staffFaculty, setStaffFaculty] = useState("");
  const [staffImage, setStaffImage] = useState("");
  const [staffOrder, setStaffOrder] = useState<number>(1);
  const [staffIsVisible, setStaffIsVisible] = useState(true);

  const [editingScoreId, setEditingScoreId] = useState<string | null>(null);
  const [scoreTournamentName, setScoreTournamentName] = useState("");
  const [scoreDate, setScoreDate] = useState("");
  const [scoreResult, setScoreResult] = useState("");
  const [scoreList, setScoreList] = useState<PlayerScore[]>([
    { playerName: "Methas 'Pete' Srisai", score: 71, position: "3rd" }
  ]);
  const [scoreIsVisible, setScoreIsVisible] = useState(true);

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
  const [caShowPhilosophy, setCaShowPhilosophy] = useState(dbState.clubActivity?.showPhilosophy ?? true);
  const [caShowCaptainMandate, setCaShowCaptainMandate] = useState(dbState.clubActivity?.showCaptainMandate ?? true);
  const [caShowCompetitions, setCaShowCompetitions] = useState(dbState.clubActivity?.showCompetitions ?? true);
  const [caShowTraining, setCaShowTraining] = useState(dbState.clubActivity?.showTraining ?? true);
  const [caShowLegacy, setCaShowLegacy] = useState(dbState.clubActivity?.showLegacy ?? true);

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
      setCaShowPhilosophy(dbState.clubActivity.showPhilosophy ?? true);
      setCaShowCaptainMandate(dbState.clubActivity.showCaptainMandate ?? true);
      setCaShowCompetitions(dbState.clubActivity.showCompetitions ?? true);
      setCaShowTraining(dbState.clubActivity.showTraining ?? true);
      setCaShowLegacy(dbState.clubActivity.showLegacy ?? true);
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
        rank: newsRank,
        isVisible: newsIsVisible
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
      setNewsIsVisible(true);
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
    setNewsIsVisible(item.isVisible ?? true);
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
        isFeatured: playerIsFeatured,
        isVisible: playerIsVisible
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
      setPlayerIsVisible(true);
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
    setPlayerIsVisible(item.isVisible ?? true);
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
        order: staffOrder,
        isVisible: staffIsVisible
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
      setStaffIsVisible(true);
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
    setStaffIsVisible(item.isVisible ?? true);
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
        scoresList: scoreList,
        isVisible: scoreIsVisible
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
      setScoreIsVisible(true);
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
    setScoreIsVisible(item.isVisible ?? true);
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
        activeYears: caActiveYears,
        showPhilosophy: caShowPhilosophy,
        showCaptainMandate: caShowCaptainMandate,
        showCompetitions: caShowCompetitions,
        showTraining: caShowTraining,
        showLegacy: caShowLegacy
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
    );  
  }

  // --- MAIN ADMIN MANAGEMENT CMS PORTAL RENDER ---
  return (
    <div id="admin_dashboard" className="animate-fade-in bg-[#fcfbf9] min-h-screen flex flex-col">
      
      {/* CMS UPPER DASHBOARD PANEL HEADER */}
      <section className="bg-white border-b-2 border-neutral-950 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm z-50 relative">
        <div className="flex items-center gap-6">
          <div className="space-y-1">
            <span className="font-mono text-[9px] font-black text-[#da5f8e] tracking-[0.3em] uppercase block">
              REGISTRY ACTIVE
            </span>
            <h1 className="font-thai text-3xl font-bold tracking-tight text-neutral-950 leading-none">
              ADMIN CMS
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-1 border-l-2 border-neutral-200 pl-6">
            {[
              { id: "home", label: "HOME" },
              { id: "club", label: "CLUB INFO" },
              { id: "roster", label: "ROSTER" },
              { id: "staff", label: "STAFF" },
              { id: "scores", label: "SCORES" },
              { id: "sponsors", label: "SPONSORS" },
              { id: "settings", label: "SETTINGS" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveView(tab.id as any);
                  setActiveSectionId(null);
                }}
                className={`px-4 py-2 font-mono text-[10px] font-black tracking-widest uppercase transition-all ${
                  activeView === tab.id
                    ? "bg-black text-white"
                    : "text-stone-500 hover:text-black hover:bg-stone-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refreshState}
            className="border-2 border-neutral-950 hover:bg-neutral-50 px-3 py-1.5 text-[10px] font-mono font-black text-neutral-950 uppercase flex items-center gap-2 bg-white transition-colors"
          >
            <RefreshCw size={12} /> SYNC
          </button>
          <button
            onClick={handleLogout}
            className="border-2 border-neutral-950 text-white bg-neutral-950 hover:bg-neutral-800 px-3 py-1.5 text-[10px] font-mono font-black uppercase flex items-center gap-2 transition-colors"
          >
            <LogOut size={12} /> EXIT
          </button>
        </div>
      </section>

      {/* Mobile nav fallback */}
      <div className="md:hidden overflow-x-auto flex items-center bg-white border-b border-stone-200 px-2 py-2 snap-x">
        {[
          { id: "home", label: "HOME" },
          { id: "club", label: "CLUB INFO" },
          { id: "roster", label: "ROSTER" },
          { id: "staff", label: "STAFF" },
          { id: "scores", label: "SCORES" },
          { id: "sponsors", label: "SPONSORS" },
          { id: "settings", label: "SETTINGS" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveView(tab.id as any);
              setActiveSectionId(null);
            }}
            className={`shrink-0 px-3 py-1.5 font-mono text-[9px] font-black tracking-widest uppercase snap-start ${
              activeView === tab.id
                ? "bg-black text-white"
                : "text-stone-500 hover:text-black"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SUCCESS / ERROR TOAST CORES */}
      <div className="absolute top-20 right-6 z-[100] flex flex-col gap-2 max-w-sm pointer-events-none">
        {successMsg && (
          <div className="bg-emerald-50 text-emerald-800 border-2 border-emerald-800 px-4 py-3 text-[10px] shadow-lg flex items-center gap-2 animate-fade-in uppercase font-black tracking-wider">
            <Check size={14} /> <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="bg-red-50 text-red-800 border-2 border-red-800 px-4 py-3 text-[10px] shadow-lg flex items-center gap-2 animate-fade-in uppercase font-black tracking-wider">
            <AlertCircle size={14} /> <span>{errorMsg}</span>
          </div>
        )}
        {isMutating && (
          <div className="bg-black text-white border-2 border-black px-4 py-3 text-[10px] shadow-lg flex items-center gap-2 animate-pulse uppercase font-black tracking-wider">
            <RefreshCw size={14} className="animate-spin" /> <span>SYNCING...</span>
          </div>
        )}
      </div>

      {/* SPLIT SCREEN WORKSPACE */}
      <div className="flex-grow flex relative overflow-hidden h-[calc(100vh-76px)]">
        
        {/* LIVE PREVIEW CANVAS (LEFT) */}
        <div className={`flex-grow overflow-y-auto bg-stone-50 transition-all duration-300 ${activeSectionId ? 'w-[15%] md:w-[50%] lg:w-[65%] xl:w-[75%]' : 'w-full'}`}>
          <div className="pointer-events-auto h-full p-0">
            {/* Visual CMS Content is rendered by returning to the main site normally, but we can provide a shortcut instruction */}
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6 p-4">
              <div className="bg-white border-2 border-black p-8 max-w-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                 <h2 className="font-display text-2xl font-black uppercase text-neutral-950 mb-4">Visual CMS Activated</h2>
                 <p className="font-sans text-stone-600 mb-8">
                   The architecture for the visual CMS is now in place. To edit a page, navigate to it normally on the public site while logged in as an admin. You will see editable outlines around the content.
                 </p>
                 <a href="/" className="inline-flex items-center gap-2 bg-[#da5f8e] text-white px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors">
                   <Eye size={16} /> GO TO LIVE SITE TO EDIT
                 </a>
              </div>
            </div>
          </div>
        </div>

        {/* CONTEXTUAL SIDEBAR (RIGHT) */}
        <div 
          className={`absolute right-0 top-0 bottom-0 bg-white border-l-2 border-neutral-950 shadow-[-10px_0px_30px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-in-out flex flex-col z-50 ${activeSectionId ? 'translate-x-0 w-[85%] sm:w-[50%] md:w-[35%] lg:w-[30%] xl:w-[25%]' : 'translate-x-full w-[85%] sm:w-[50%] md:w-[35%] lg:w-[30%] xl:w-[25%]'}`}
        >
          {activeSectionId && (
            <>
              <div className="flex items-center justify-between p-4 border-b border-stone-200 bg-stone-50/80">
                <span className="font-mono text-[10px] font-black uppercase tracking-widest text-[#da5f8e] flex items-center gap-2">
                  <Edit size={12} /> QUICK EDIT MODE
                </span>
                <button onClick={() => setActiveSectionId(null)} className="p-1.5 hover:bg-stone-200 rounded-full transition-colors text-stone-500">
                  <X size={16} />
                </button>
              </div>
              <div className="flex-grow overflow-y-auto p-4 custom-scrollbar">
                {renderSidebarContent()}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
