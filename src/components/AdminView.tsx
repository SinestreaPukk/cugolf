import React, { useState } from"react";
import golfersSilhouette from"../assets/images/golfers_silhouette.png";
import MarkdownRenderer from"./MarkdownRenderer";
import HomeView from"./HomeView";
import BlogView from"./BlogView";
import AboutClubView from"./AboutClubView";
import RosterView from"./RosterView";
import StaffView from"./StaffView";
import ScoresView from"./ScoresView";
import SponsorsView from"./SponsorsView";
import { DatabaseState, NewsItem, Player, Staff, TournamentScore, GalleryImage, PlayerScore, WelcomeSection, Sponsor, SiteSettings, Competition, ClubActivityContent, MemberEvent } from"../types";
import { fmtDate } from"../utils/format";
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
 updateSiteLabelsThai,
 updateHomeSponsorSection,
 updateClubActivity,
 uploadPhoto,
 getAdminEmailsList,
 addAdminEmail,
 removeAdminEmail,
 syncMembersToSheets,
 getAdminMembers,
 updateAdminMember,
 deleteAdminMember,
 createMemberEvent,
 updateMemberEvent,
 deleteMemberEvent,
 createInstagramPost,
 deleteInstagramPost
} from"../utils/api";
import {
 Plus, Trash2, Edit, Save, FileText, Sparkles, LogOut, Users,
 Trophy, Image, Sparkle, Lock, Eye, AlertCircle, RefreshCw, X, Check, HelpCircle, Heart, Settings, Calendar, Award, Type, ArrowUpRight, ArrowRight, Layout
} from"lucide-react";

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
 setError(res.message ||"Upload failed on database storage.");
 }
 } catch (err: any) {
 setError(err.message ||"Failed to reach upload gateway.");
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
 <label htmlFor={id} className="font-display text-[9px] font-bold text-brand-ink/60 uppercase block">
 {label}
 </label>
 
 <div className="flex gap-2">
 <input
 id={id}
 type="text"
 value={value}
 onChange={(e) => onChange(e.target.value)}
 placeholder={placeholder ||"https://images.unsplash.com/... or own image path"}
 className="flex-1 bg-brand-neutral border border-brand-ink/20 p-2 text-xs focus:ring-1 focus:ring-black focus:outline-none text-brand-ink font-display"
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
 className="shrink-0 border-2 border-brand-ink bg-brand-neutral hover:bg-neutral-150 disabled:opacity-50 px-3.5 py-2 text-xs font-display font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer text-brand-ink"
 >
 {isUploading ? (
 <span className="flex items-center gap-1">
 <RefreshCw size={11} className="animate-spin"/>
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
 className={`border-2 border-dashed p-3.5 text-center cursor-pointer transition-all ${
 isDragging 
 ?"border-emerald-600 bg-emerald-50/40 text-emerald-800"
 :"border-stone-200 bg-brand-stone/50 hover:bg-brand-stone hover:border-brand-ink text-stone-500"
 }`}
 >
 <span className="font-display text-[9px] uppercase font-semibold">
 {isUploading ?"Uploading file...":"Drag & drop image here or click to browse local files"}
 </span>
 </div>

 {error && (
 <span className="text-[9px] text-red-600 font-display uppercase block font-black">
 ⚠ {error}
 </span>
 )}

 {value && value.startsWith("/uploads/") && (
 <span className="text-[9px] text-[#4c1d95] font-display uppercase block font-bold">
 ✓ Active Local Photo: <span className="underline">{value.substring(value.lastIndexOf("/") + 1)}</span>
 </span>
 )}

 {helperText && <p className="text-[9px] text-brand-ink/50 italic uppercase">{helperText}</p>}
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
 const [activeView, setActiveView] = useState<"home"|"blog"|"club"|"roster"|"staff"|"scores"|"sponsors"|"settings"|"gallery"|"upcoming"|"admins"|"members"|"portal-events"|"instagram">("home");

 // Admin emails management states and handlers
 const [adminEmails, setAdminEmails] = useState<string[]>([]);
 const [newAdminEmail, setNewAdminEmail] = useState("");
 const [isLoadingAdmins, setIsLoadingAdmins] = useState(false);

 // Google Sheets sync state
 const [isSyncing, setIsSyncing] = useState(false);
 const [syncResult, setSyncResult] = useState<{ synced?: number; total?: number; errors?: number; message?: string } | null>(null);

 // Member management state
 const [membersList, setMembersList] = useState<any[]>([]);
 const [isLoadingMembers, setIsLoadingMembers] = useState(false);
 const [editingMember, setEditingMember] = useState<any | null>(null);
 const [editName, setEditName] = useState("");
 const [editEmail, setEditEmail] = useState("");
 const [editPrefix, setEditPrefix] = useState("");
 const [editStudentId, setEditStudentId] = useState("");
 const [editYear, setEditYear] = useState("");
 const [editFaculty, setEditFaculty] = useState("");
 const [editInstagram, setEditInstagram] = useState("");
 const [editLineId, setEditLineId] = useState("");

 // Portal events state
 const [editingEventId, setEditingEventId] = useState<string | null>(null);
 const [evtTitle, setEvtTitle] = useState("");
 const [evtTitleThai, setEvtTitleThai] = useState("");
 const [evtDescription, setEvtDescription] = useState("");
 const [evtDescriptionThai, setEvtDescriptionThai] = useState("");
 const [evtDate, setEvtDate] = useState("");
 const [evtTime, setEvtTime] = useState("");
 const [evtLocation, setEvtLocation] = useState("");
 const [evtLocationThai, setEvtLocationThai] = useState("");
 const [evtImageUrl, setEvtImageUrl] = useState("");
 const [evtRegistrationStatus, setEvtRegistrationStatus] = useState<"open"|"not_open"|"closed"|"delayed">("closed");
 const [evtGoogleFormUrl, setEvtGoogleFormUrl] = useState("");
 const [evtIsVisible, setEvtIsVisible] = useState(true);

 const clearEventForm = () => {
   setEditingEventId(null); setEvtTitle(""); setEvtTitleThai(""); setEvtDescription(""); setEvtDescriptionThai("");
   setEvtDate(""); setEvtTime(""); setEvtLocation(""); setEvtLocationThai(""); setEvtImageUrl("");
   setEvtRegistrationStatus("closed"); setEvtGoogleFormUrl(""); setEvtIsVisible(true);
 };

 const handleEditEventTrigger = (evt: MemberEvent) => {
   setEditingEventId(evt.id); setEvtTitle(evt.title); setEvtTitleThai(evt.titleThai || "");
   setEvtDescription(evt.description || ""); setEvtDescriptionThai(evt.descriptionThai || "");
   setEvtDate(evt.date || ""); setEvtTime(evt.time || ""); setEvtLocation(evt.location || "");
   setEvtLocationThai(evt.locationThai || ""); setEvtImageUrl(evt.imageUrl || "");
   setEvtRegistrationStatus((evt.registrationStatus || (evt.registrationOpen ? "open" : "closed")) as any);
   setEvtGoogleFormUrl(evt.googleFormUrl || "");
   setEvtIsVisible(evt.isVisible); window.scrollTo({ top: 0, behavior: "smooth" });
 };

 const handleSaveEvent = async () => {
   if (!adminToken) return;
   const payload = {
     title: evtTitle, titleThai: evtTitleThai || null, description: evtDescription || null,
     descriptionThai: evtDescriptionThai || null, date: evtDate || null, time: evtTime || null,
     location: evtLocation || null, locationThai: evtLocationThai || null,
     imageUrl: evtImageUrl || null,
     registrationOpen: evtRegistrationStatus === "open",
     registrationStatus: evtRegistrationStatus,
     googleFormUrl: evtGoogleFormUrl || null, isVisible: evtIsVisible
   };
   try {
     if (editingEventId) {
       await updateMemberEvent(editingEventId, payload, adminToken);
     } else {
       await createMemberEvent(payload, adminToken);
     }
     clearEventForm();
     refreshState();
   } catch (err: any) {
     triggerErrorMsg(err.message || "Failed to save event.");
   }
 };

 const handleDeleteEvent = async (id: string) => {
   if (!adminToken || !confirm("Delete this event?")) return;
   try {
     await deleteMemberEvent(id, adminToken);
     refreshState();
   } catch (err: any) {
     triggerErrorMsg(err.message || "Failed to delete event.");
   }
 };
 const [editPassword, setEditPassword] = useState("");
 const [memberSearch, setMemberSearch] = useState("");

 const loadAdmins = async () => {
   setIsLoadingAdmins(true);
   try {
     const res = await getAdminEmailsList(adminToken || "");
     if (res.success && res.emails) {
       setAdminEmails(res.emails);
     } else {
       setErrorMsg(res.message || "Failed to load admin list.");
     }
   } catch (err: any) {
     setErrorMsg(err.message || "Failed to load admin list.");
   } finally {
     setIsLoadingAdmins(false);
   }
 };

 const handleAddAdmin = async (e: React.FormEvent) => {
   e.preventDefault();
   if (!newAdminEmail.trim()) return;
   setIsLoadingAdmins(true);
   try {
     const res = await addAdminEmail(newAdminEmail.trim(), adminToken || "");
     if (res.success && res.emails) {
       setAdminEmails(res.emails);
       setNewAdminEmail("");
       setSuccessMsg("Admin email added successfully.");
     } else {
       setErrorMsg(res.message || "Failed to add admin email.");
     }
   } catch (err: any) {
     setErrorMsg(err.message || "Failed to add admin email.");
   } finally {
     setIsLoadingAdmins(false);
   }
 };

 const handleRemoveAdmin = async (email: string) => {
   if (email === "admin@cugolfclub.com") {
     setErrorMsg("Cannot remove default system administrator.");
     return;
   }
   if (!window.confirm(`Are you sure you want to remove admin access for ${email}?`)) {
     return;
   }
   setIsLoadingAdmins(true);
   try {
     const res = await removeAdminEmail(email, adminToken || "");
     if (res.success && res.emails) {
       setAdminEmails(res.emails);
       setSuccessMsg("Admin email removed successfully.");
     } else {
       setErrorMsg(res.message || "Failed to remove admin email.");
     }
   } catch (err: any) {
     setErrorMsg(err.message || "Failed to remove admin email.");
   } finally {
     setIsLoadingAdmins(false);
   }
 };

 const handleSyncSheets = async () => {
   setIsSyncing(true);
   setSyncResult(null);
   try {
     const res = await syncMembersToSheets(adminToken || "");
     if (res.success) {
       setSyncResult({ synced: res.synced, total: res.total, errors: res.errors });
     } else {
       setSyncResult({ message: res.message || "Sync failed." });
     }
   } catch (err: any) {
     setSyncResult({ message: err.message || "Sync failed." });
   } finally {
     setIsSyncing(false);
   }
 };

 const loadMembers = async () => {
   setIsLoadingMembers(true);
   try {
     const res = await getAdminMembers(adminToken || "");
     if (res.success && res.members) setMembersList(res.members);
   } catch (err: any) {
     setErrorMsg(err.message || "Failed to load members.");
   } finally {
     setIsLoadingMembers(false);
   }
 };

 const openEditMember = (member: any) => {
   setEditingMember(member);
   setEditName(member.name || "");
   setEditEmail(member.email || "");
   setEditPrefix(member.prefix || "นาย");
   setEditStudentId(member.studentId || member.student_id || "");
   setEditYear(member.year || "Year 1");
   setEditFaculty(member.faculty || "");
   setEditInstagram(member.instagram || "");
   setEditLineId(member.line_id || member.lineId || "");
   setEditPassword("");
 };

 const handleUpdateMember = async (e: React.FormEvent) => {
   e.preventDefault();
   if (!editingMember) return;
   try {
     const res = await updateAdminMember(editingMember.id, {
       name: editName,
       email: editEmail,
       prefix: editPrefix,
       studentId: editStudentId,
       year: editYear,
       faculty: editFaculty,
       instagram: editInstagram,
       lineId: editLineId,
       ...(editPassword ? { newPassword: editPassword } : {})
     }, adminToken || "");
     if (res.success) {
       setSuccessMsg("Member updated successfully.");
       setEditingMember(null);
       loadMembers();
     } else {
       setErrorMsg(res.message || "Failed to update member.");
     }
   } catch (err: any) {
     setErrorMsg(err.message || "Failed to update member.");
   }
 };

 const handleDeleteMember = async (member: any) => {
   if (!window.confirm(`Remove ${member.name} (${member.email}) permanently? This cannot be undone.`)) return;
   try {
     const res = await deleteAdminMember(member.id, adminToken || "");
     if (res.success) {
       setSuccessMsg(`${member.name} has been removed.`);
       setMembersList(prev => prev.filter(m => m.id !== member.id));
     } else {
       setErrorMsg(res.message || "Failed to delete member.");
     }
   } catch (err: any) {
     setErrorMsg(err.message || "Failed to delete member.");
   }
 };

 React.useEffect(() => {
   if (activeView === "admins" && adminToken) {
     loadAdmins();
   }
   if (activeView === "members" && adminToken) {
     loadMembers();
   }
 }, [activeView, adminToken]);

 // Read ?edit query param to auto-open sidebar
 React.useEffect(() => {
 const searchParams = new URLSearchParams(window.location.search);
 const editId = searchParams.get("edit");
 if (editId) {
 setActiveSectionId(editId);
 // Derive activeView from editId prefix if needed
 if (editId === "home_gallery") setActiveView("gallery");
 else if (editId === "home_upcoming") setActiveView("upcoming");
 else if (editId.startsWith("home_")) setActiveView("home");
 else if (editId.startsWith("ca_")) setActiveView("club");
 else if (editId ==="news_list"|| editId ==="news_edit") setActiveView("blog"); 
 else if (editId ==="roster_list"|| editId ==="roster_edit") setActiveView("roster");
 else if (editId ==="staff_list"|| editId ==="staff_edit") setActiveView("staff");
 else if (editId ==="scores_list"|| editId ==="scores_edit") setActiveView("scores");
 
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
 const [newsTitleThai, setNewsTitleThai] = useState("");
 const [newsExcerpt, setNewsExcerpt] = useState("");
 const [newsExcerptThai, setNewsExcerptThai] = useState("");
 const [newsContent, setNewsContent] = useState("");
 const [newsContentThai, setNewsContentThai] = useState("");
 const [newsImage, setNewsImage] = useState("");
 const [newsDate, setNewsDate] = useState("");
 const [newsRank, setNewsRank] = useState<number>(0);
 const [newsIsVisible, setNewsIsVisible] = useState(true);

 const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
 const [playerName, setPlayerName] = useState("");
 const [playerNameThai, setPlayerNameThai] = useState("");
 const [playerHandicap, setPlayerHandicap] = useState<number>(1.5);
 const [playerYear, setPlayerYear] = useState("Freshman");
 const [playerYearThai, setPlayerYearThai] = useState("Freshman");
 const [playerFaculty, setPlayerFaculty] = useState("");
 const [playerFacultyThai, setPlayerFacultyThai] = useState("");
 const [playerImage, setPlayerImage] = useState("");
 const [playerIsFeatured, setPlayerIsFeatured] = useState(false);
 const [playerIsVisible, setPlayerIsVisible] = useState(true);

 const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
 const [staffName, setStaffName] = useState("");
 const [staffNameThai, setStaffNameThai] = useState("");
 const [staffRole, setStaffRole] = useState("");
 const [staffRoleThai, setStaffRoleThai] = useState("");
 const [staffFaculty, setStaffFaculty] = useState("");
 const [staffFacultyThai, setStaffFacultyThai] = useState("");
 const [staffImage, setStaffImage] = useState("");
 const [staffOrder, setStaffOrder] = useState<number>(1);
 const [staffIsVisible, setStaffIsVisible] = useState(true);

 const [editingScoreId, setEditingScoreId] = useState<string | null>(null);
  const [scoreTournamentName, setScoreTournamentName] = useState("");
  const [scoreTournamentNameThai, setScoreTournamentNameThai] = useState("");
  const [scoreDate, setScoreDate] = useState("");
  const [scoreResult, setScoreResult] = useState("");
  const [scoreResultThai, setScoreResultThai] = useState("");
  const [scoreList, setScoreList] = useState<PlayerScore[]>([
    { playerName: "Methas 'Pete' Srisai", score: 71, position: "3rd" }
  ]);
  const [scoreIsVisible, setScoreIsVisible] = useState(true);

  // Gallery quick add variables
  const [galTitle, setGalTitle] = useState("");
  const [galUrl, setGalUrl] = useState("");
  const [galCategory, setGalCategory] = useState("Tournament");

  // Instagram posts states
  const [igImageUrl, setIgImageUrl] = useState("");
  const [igPostUrl, setIgPostUrl] = useState("");
  const [igCaption, setIgCaption] = useState("");

  const handleSaveIgPost = async () => {
    if (!igImageUrl) { triggerErrorMsg("Please upload an image first."); return; }
    try {
      await createInstagramPost({ imageUrl: igImageUrl, postUrl: igPostUrl || undefined, caption: igCaption || undefined }, adminToken!);
      setIgImageUrl(""); setIgPostUrl(""); setIgCaption("");
      refreshState();
    } catch (err: any) { triggerErrorMsg(err.message || "Failed to add post."); }
  };

  const handleDeleteIgPost = async (id: string) => {
    if (!confirm("Remove this post from the feed?")) return;
    try { await deleteInstagramPost(id, adminToken!); refreshState(); }
    catch (err: any) { triggerErrorMsg(err.message || "Failed to delete post."); }
  };

  // Welcome page CMS states
  const [welcomeImageUrl, setWelcomeImageUrl] = useState(dbState.welcomeSection?.imageUrl || "");
  const [welcomeTitleThai, setWelcomeTitleThai] = useState(dbState.welcomeSection?.titleThai || "");
  const [welcomeTitleEnglish, setWelcomeTitleEnglish] = useState(dbState.welcomeSection?.titleEnglish || "");
  const [welcomeLegacyQuote, setWelcomeLegacyQuote] = useState(dbState.welcomeSection?.legacyQuote || "");
  const [welcomeLegacyQuoteThai, setWelcomeLegacyQuoteThai] = useState(dbState.welcomeSection?.legacyQuoteThai || "");
  const [welcomeLegacyQuoteAuthor, setWelcomeLegacyQuoteAuthor] = useState(dbState.welcomeSection?.legacyQuoteAuthor || "");
  const [welcomeLegacyQuoteAuthorThai, setWelcomeLegacyQuoteAuthorThai] = useState(dbState.welcomeSection?.legacyQuoteAuthorThai || "");
  const [welcomeDescription, setWelcomeDescription] = useState(dbState.welcomeSection?.description || "");
  const [welcomeDescriptionThai, setWelcomeDescriptionThai] = useState(dbState.welcomeSection?.descriptionThai || "");

  // Upcoming Activity CMS states
  const [upcomingTitle, setUpcomingTitle] = useState(dbState.upcomingActivity?.title || "");
  const [upcomingTitleThai, setUpcomingTitleThai] = useState(dbState.upcomingActivity?.titleThai || "");
  const [upcomingDescription, setUpcomingDescription] = useState(dbState.upcomingActivity?.description || "");
  const [upcomingDescriptionThai, setUpcomingDescriptionThai] = useState(dbState.upcomingActivity?.descriptionThai || "");
  const [upcomingImageUrl, setUpcomingImageUrl] = useState(dbState.upcomingActivity?.imageUrl || "");
  const [upcomingDate, setUpcomingDate] = useState(dbState.upcomingActivity?.date || "");
  const [upcomingDateThai, setUpcomingDateThai] = useState(dbState.upcomingActivity?.dateThai || "");
  const [upcomingLocation, setUpcomingLocation] = useState(dbState.upcomingActivity?.location || "");
  const [upcomingLocationThai, setUpcomingLocationThai] = useState(dbState.upcomingActivity?.locationThai || "");
  const [upcomingRegUrl, setUpcomingRegUrl] = useState(dbState.upcomingActivity?.registrationUrl || "");
  const [upcomingShowSection, setUpcomingShowSection] = useState(dbState.upcomingActivity?.showSection ?? true);

  // Sponsors page CMS states
  const [editingSponsorId, setEditingSponsorId] = useState<string | null>(null);
  const [sponName, setSponName] = useState("");
  const [sponNameThai, setSponNameThai] = useState("");
  const [sponDescription, setSponDescription] = useState("");
  const [sponDescriptionThai, setSponDescriptionThai] = useState("");
  const [sponWebsiteUrl, setSponWebsiteUrl] = useState("");
  const [sponImageUrl, setSponImageUrl] = useState("");
  const [sponIsActive, setSponIsActive] = useState(true);

 // Site general settings CMS states (Marquee, contact phone, contact email, addresses)
 const [setsMarqueeText, setSetsMarqueeText] = useState(dbState.siteSettings?.marqueeText ||"Chulalongkorn University Golf Club • Drive to Excellence");
 const [setsMarqueeTextThai, setSetsMarqueeTextThai] = useState(dbState.siteSettings?.marqueeTextThai ||"");
 const [setsContactPhone, setSetsContactPhone] = useState(dbState.siteSettings?.contactPhone ||"+66 (0) 2218-1916");
 const [setsContactEmail, setSetsContactEmail] = useState(dbState.siteSettings?.contactEmail ||"golf@chula.ac.th");
 const [setsContactAddress, setSetsContactAddress] = useState(dbState.siteSettings?.contactAddress ||"Chula Sports Complex, Phayathai Rd, Pathum Wan, Bangkok 10330, Thailand");
 const [setsContactAddressThai, setSetsContactAddressThai] = useState(dbState.siteSettings?.contactAddressThai ||"");
 const [setsAcademicAffiliation, setSetsAcademicAffiliation] = useState(dbState.siteSettings?.academicAffiliation ||"Thailand University Golf Association (TUGA)");
 const [setsAcademicAffiliationThai, setSetsAcademicAffiliationThai] = useState(dbState.siteSettings?.academicAffiliationThai ||"");

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
 const [homeSponTitle, setHomeSponTitle] = useState(dbState.homeSponsorSection?.title ||"SUPPORTING EXCELLENCE");
 const [homeSponTitleThai, setHomeSponTitleThai] = useState(dbState.homeSponsorSection?.titleThai ||"");
 const [homeSponSubtitle, setHomeSponSubtitle] = useState(dbState.homeSponsorSection?.subtitle ||"CORPORATE PARTNERSHIP");
 const [homeSponSubtitleThai, setHomeSponSubtitleThai] = useState(dbState.homeSponsorSection?.subtitleThai ||"");
 const [homeSponDescription, setHomeSponDescription] = useState(dbState.homeSponsorSection?.description ||"Our sponsors provide the essential resources and infrastructure that empower our student athletes to compete at the highest collegiate level.");
 const [homeSponDescriptionThai, setHomeSponDescriptionThai] = useState(dbState.homeSponsorSection?.descriptionThai ||"");
 const [homeSponMarqueeText, setHomeSponMarqueeText] = useState(dbState.homeSponsorSection?.marqueeText ||"");
 const [homeSponMarqueeTextThai, setHomeSponMarqueeTextThai] = useState(dbState.homeSponsorSection?.marqueeTextThai ||"");
 const [homeSponImageUrl, setHomeSponImageUrl] = useState(dbState.homeSponsorSection?.imageUrl ||"");
 const [homeSponButtonText, setHomeSponButtonText] = useState(dbState.homeSponsorSection?.buttonText ||"LEARN MORE");
 const [homeSponButtonTextThai, setHomeSponButtonTextThai] = useState(dbState.homeSponsorSection?.buttonTextThai ||"");
 const [homeSponButtonUrl, setHomeSponButtonUrl] = useState(dbState.homeSponsorSection?.buttonUrl ||"/sponsors");
 const [homeSponShowSection, setHomeSponShowSection] = useState(dbState.homeSponsorSection?.showSection ?? true);

 // Club Activity CMS states
 const [caHeroImageUrl, setCaHeroImageUrl] = useState(dbState.clubActivity?.heroImageUrl ||"");
 const [caPhilosophyTitle, setCaPhilosophyTitle] = useState(dbState.clubActivity?.philosophyTitle ||"OUR PHILOSOPHY");
 const [caPhilosophyTitleThai, setCaPhilosophyTitleThai] = useState(dbState.clubActivity?.philosophyTitleThai ||"");
 const [caPhilosophyQuote, setCaPhilosophyQuote] = useState(dbState.clubActivity?.philosophyQuote ||"");
 const [caPhilosophyQuoteThai, setCaPhilosophyQuoteThai] = useState(dbState.clubActivity?.philosophyQuoteThai ||"");
 const [caPhilosophyDescription, setCaPhilosophyDescription] = useState(dbState.clubActivity?.philosophyDescription ||"");
 const [caPhilosophyDescriptionThai, setCaPhilosophyDescriptionThai] = useState(dbState.clubActivity?.philosophyDescriptionThai ||"");
 const [caTechnicalExcellenceDescription, setCaTechnicalExcellenceDescription] = useState(dbState.clubActivity?.technicalExcellenceDescription ||"");
 const [caTechnicalExcellenceDescriptionThai, setCaTechnicalExcellenceDescriptionThai] = useState(dbState.clubActivity?.technicalExcellenceDescriptionThai ||"");
 const [caCaptainName, setCaCaptainName] = useState(dbState.clubActivity?.captainName ||"");
 const [caCaptainNameThai, setCaCaptainNameThai] = useState(dbState.clubActivity?.captainNameThai ||"");
 const [caCaptainRole, setCaCaptainRole] = useState(dbState.clubActivity?.captainRole ||"");
 const [caCaptainRoleThai, setCaCaptainRoleThai] = useState(dbState.clubActivity?.captainRoleThai ||"");
 const [caCaptainImageUrl, setCaCaptainImageUrl] = useState(dbState.clubActivity?.captainImageUrl ||"");
 const [caCaptainPhilosophy, setCaCaptainPhilosophy] = useState(dbState.clubActivity?.captainPhilosophy ||"");
 const [caCaptainPhilosophyThai, setCaCaptainPhilosophyThai] = useState(dbState.clubActivity?.captainPhilosophyThai ||"");
 const [caCompetitions, setCaCompetitions] = useState<Competition[]>(dbState.clubActivity?.competitions || []);
 const [caTrainingDescription, setCaTrainingDescription] = useState(dbState.clubActivity?.trainingDescription ||"");
 const [caTrainingDescriptionThai, setCaTrainingDescriptionThai] = useState(dbState.clubActivity?.trainingDescriptionThai ||"");
 const [caLegacyDescription, setCaLegacyDescription] = useState(dbState.clubActivity?.legacyDescription ||"");
 const [caLegacyDescriptionThai, setCaLegacyDescriptionThai] = useState(dbState.clubActivity?.legacyDescriptionThai ||"");
 const [caFoundedYear, setCaFoundedYear] = useState(dbState.clubActivity?.foundedYear ||"1916");
 const [caActiveYears, setCaActiveYears] = useState(dbState.clubActivity?.activeYears ||"100+");
 const [caActiveYearsThai, setCaActiveYearsThai] = useState(dbState.clubActivity?.activeYearsThai ||"");
 const [caShowPhilosophy, setCaShowPhilosophy] = useState(dbState.clubActivity?.showPhilosophy ?? true);
 const [caShowCaptainMandate, setCaShowCaptainMandate] = useState(dbState.clubActivity?.showCaptainMandate ?? true);
 const [caShowCompetitions, setCaShowCompetitions] = useState(dbState.clubActivity?.showCompetitions ?? true);
 const [caShowTraining, setCaShowTraining] = useState(dbState.clubActivity?.showTraining ?? true);
 const [caShowLegacy, setCaShowLegacy] = useState(dbState.clubActivity?.showLegacy ?? true);

  // Site Labels states
 const [editLabelsLanguage, setEditLabelsLanguage] = useState<"en" | "th">("en");
 const [labelNavHome, setLabelNavHome] = useState(dbState.siteLabels?.navHome ||"HOME");
 const [labelNavBlog, setLabelNavBlog] = useState(dbState.siteLabels?.navBlog ||"ACTIVITIES");
 const [labelNavRoster, setLabelNavRoster] = useState(dbState.siteLabels?.navRoster ||"TEAM ROSTER");

 const [labelNavStaff, setLabelNavStaff] = useState(dbState.siteLabels?.navStaff ||"STAFF & BOARD");
 const [labelNavScores, setLabelNavScores] = useState(dbState.siteLabels?.navScores ||"SCORES & STATS");
 const [labelNavSponsors, setLabelNavSponsors] = useState(dbState.siteLabels?.navSponsors ||"PARTNERS");
 const [labelNavAdmin, setLabelNavAdmin] = useState(dbState.siteLabels?.navAdmin ||"ADMIN CMS");
 const [labelNavBrandTitle, setLabelNavBrandTitle] = useState(dbState.siteLabels?.navBrandTitle ||"cugolfclub.");
 const [labelNavBrandSubtitle, setLabelNavBrandSubtitle] = useState(dbState.siteLabels?.navBrandSubtitle ||"[Official] Chulalongkorn University Golf Club");
 const [labelNavAdminActive, setLabelNavAdminActive] = useState(dbState.siteLabels?.navAdminActive ||"REGISTRY ACTIVE");
 const [labelNavAdminCms, setLabelNavAdminCms] = useState(dbState.siteLabels?.navAdminCms ||"ADMIN CMS");

 const [labelHomeBlogTitle, setLabelHomeBlogTitle] = useState(dbState.siteLabels?.homeBlogTitle ||"");
 const [labelHomeBlogSubtitle, setLabelHomeBlogSubtitle] = useState(dbState.siteLabels?.homeBlogSubtitle ||"");
 const [labelHomeWelcomeHeroTitle, setLabelHomeWelcomeHeroTitle] = useState(dbState.siteLabels?.homeWelcomeHeroTitle ||"");
 const [labelHomeWelcomeHeroSubtitle, setLabelHomeWelcomeHeroSubtitle] = useState(dbState.siteLabels?.homeWelcomeHeroSubtitle ||"Legacy");
 const [labelHomeWelcomeHeroSocial, setLabelHomeWelcomeHeroSocial] = useState(dbState.siteLabels?.homeWelcomeHeroSocial ||"cugolfclub @Student Government of Chulalongkorn University");
 const [labelHomeFeaturedActivityBadge, setLabelHomeFeaturedActivityBadge] = useState(dbState.siteLabels?.homeFeaturedActivityBadge ||"FEATURED ACTIVITY");
 const [labelHomeRecentUpdatesLabel, setLabelHomeRecentUpdatesLabel] = useState(dbState.siteLabels?.homeRecentUpdatesLabel ||"RECENT UPDATES");
 const [labelHomeReadCoverageButton, setLabelHomeReadCoverageButton] = useState(dbState.siteLabels?.homeReadCoverageButton ||"READ COVERAGE");
 const [labelHomeReadStoryButton, setLabelHomeReadStoryButton] = useState(dbState.siteLabels?.homeReadStoryButton ||"READ STORY");
 const [labelHomeLiveStandingsTitle, setLabelHomeLiveStandingsTitle] = useState(dbState.siteLabels?.homeLiveStandingsTitle ||"LIVE STANDINGS");
 const [labelHomeFullLeaderboardButton, setLabelHomeFullLeaderboardButton] = useState(dbState.siteLabels?.homeFullLeaderboardButton ||"FULL LEADERBOARD");
 const [labelHomeNoBlogs, setLabelHomeNoBlogs] = useState(dbState.siteLabels?.homeNoBlogs ||"No activities blogs published yet.");
 const [labelHomeActivityLabel, setLabelHomeActivityLabel] = useState(dbState.siteLabels?.homeActivityLabel ||"ACTIVITY");
 const [labelHomeNoScores, setLabelHomeNoScores] = useState(dbState.siteLabels?.homeNoScores ||"No tournament scores listed yet.");
 const [labelHomeModalOfficialBadge, setLabelHomeModalOfficialBadge] = useState(dbState.siteLabels?.homeModalOfficialBadge ||"OFFICIAL EDITORIAL");
 const [labelHomeModalEditorialBoard, setLabelHomeModalEditorialBoard] = useState(dbState.siteLabels?.homeModalEditorialBoard ||"CU GOLF CLUB SPORTS EDITORIAL BOARD");
 const [labelHomeModalLocation, setLabelHomeModalLocation] = useState(dbState.siteLabels?.homeModalLocation ||"BANGKOK, THAILAND");

 const [labelHomeMembershipTitle, setLabelHomeMembershipTitle] = useState(dbState.siteLabels?.homeMembershipTitle ||"Become a member of the CU GOLF CLUB.");
 const [labelHomeMembershipDescription, setLabelHomeMembershipDescription] = useState(dbState.siteLabels?.homeMembershipDescription ||"Expand your network and elevate your game.");
 const [labelHomeMembershipButtonText, setLabelHomeMembershipButtonText] = useState(dbState.siteLabels?.homeMembershipButtonText ||"REGISTER NOW");

 const [labelRosterTitle, setLabelRosterTitle] = useState(dbState.siteLabels?.rosterTitle ||"");
 const [labelRosterSubtitle, setLabelRosterSubtitle] = useState(dbState.siteLabels?.rosterSubtitle ||"");
 const [labelRosterVerifiedLabel, setLabelRosterVerifiedLabel] = useState(dbState.siteLabels?.rosterVerifiedLabel ||"");
 const [labelRosterSearchPlaceholder, setLabelRosterSearchPlaceholder] = useState(dbState.siteLabels?.rosterSearchPlaceholder ||"Search roster registry...");
 const [labelRosterFilterLabel, setLabelRosterFilterLabel] = useState(dbState.siteLabels?.rosterFilterLabel ||"CLASS YEAR:");
 const [labelRosterStatusLabel, setLabelRosterStatusLabel] = useState(dbState.siteLabels?.rosterStatusLabel ||"STATUS:");
 const [labelRosterNoResultsTitle, setLabelRosterNoResultsTitle] = useState(dbState.siteLabels?.rosterNoResultsTitle ||"No registrants found");
 const [labelRosterNoResultsDesc, setLabelRosterNoResultsDesc] = useState(dbState.siteLabels?.rosterNoResultsDesc ||"There are no players currently recorded matching your search parameters or select class year filters.");
 const [labelRosterSquadLeadBadge, setLabelRosterSquadLeadBadge] = useState(dbState.siteLabels?.rosterSquadLeadBadge ||"SQUAD LEAD");
 const [labelRosterIndexLabel, setLabelRosterIndexLabel] = useState(dbState.siteLabels?.rosterIndexLabel ||"INDEX");
 const [labelRosterAthleteLabel, setLabelRosterAthleteLabel] = useState(dbState.siteLabels?.rosterAthleteLabel ||"CU ATHLETE");
 const [labelRosterStatusActive, setLabelRosterStatusActive] = useState(dbState.siteLabels?.rosterStatusActive ||"STATUS: ACTIVE SQUAD");

 const [labelStaffTitle, setLabelStaffTitle] = useState(dbState.siteLabels?.staffTitle ||"");
 const [labelStaffSubtitle, setLabelStaffSubtitle] = useState(dbState.siteLabels?.staffSubtitle ||"");
 const [labelStaffVerifiedLabel, setLabelStaffVerifiedLabel] = useState(dbState.siteLabels?.staffVerifiedLabel ||"");
 const [labelScoresTitle, setLabelScoresTitle] = useState(dbState.siteLabels?.scoresTitle ||"");
 const [labelScoresSubtitle, setLabelScoresSubtitle] = useState(dbState.siteLabels?.scoresSubtitle ||"");
 const [labelScoresVerifiedLabel, setLabelScoresVerifiedLabel] = useState(dbState.siteLabels?.scoresVerifiedLabel ||"");
 const [labelScoresRecapTitle, setLabelScoresRecapTitle] = useState(dbState.siteLabels?.scoresRecapTitle ||"");
 const [labelScoresRecapSubtitle, setLabelScoresRecapSubtitle] = useState(dbState.siteLabels?.scoresRecapSubtitle ||"");
 const [labelScoresOfficialStatsBadge, setLabelScoresOfficialStatsBadge] = useState(dbState.siteLabels?.scoresOfficialStatsBadge ||"UNOFFICIAL STATS");
 const [labelScoresViewStandingsButton, setLabelScoresViewStandingsButton] = useState(dbState.siteLabels?.scoresViewStandingsButton ||"VIEW STANDINGS");
 const [labelScoresHideStandingsButton, setLabelScoresHideStandingsButton] = useState(dbState.siteLabels?.scoresHideStandingsButton ||"HIDE STANDINGS");
 const [labelScoresTablePlayerHeader, setLabelScoresTablePlayerHeader] = useState(dbState.siteLabels?.scoresTablePlayerHeader ||"PLAYER NAME");
 const [labelScoresTableScoreHeader, setLabelScoresTableScoreHeader] = useState(dbState.siteLabels?.scoresTableScoreHeader ||"STROKE SCORE");
 const [labelScoresTablePositionHeader, setLabelScoresTablePositionHeader] = useState(dbState.siteLabels?.scoresTablePositionHeader ||"POSITION");
 const [labelScoresAttestationLabel, setLabelScoresAttestationLabel] = useState(dbState.siteLabels?.scoresAttestationLabel ||"CU UNOFFICIAL GOLF SCORECARD ATTESTATION");
 const [labelScoresVerifiedDirectoryLabel, setLabelScoresVerifiedDirectoryLabel] = useState(dbState.siteLabels?.scoresVerifiedDirectoryLabel ||"COACH VERIFIED DIRECTORY");
 const [labelScoresDetailedLeaderboardTitle, setLabelScoresDetailedLeaderboardTitle] = useState(dbState.siteLabels?.scoresDetailedLeaderboardTitle ||"DETAILED COMPETITIVE LEADERBOARD");

 const [labelSponsorsTitle, setLabelSponsorsTitle] = useState(dbState.siteLabels?.sponsorsTitle ||"");
 const [labelSponsorsSubtitle, setLabelSponsorsSubtitle] = useState(dbState.siteLabels?.sponsorsSubtitle ||"");
 const [labelSponsorsVerifiedLabel, setLabelSponsorsVerifiedLabel] = useState(dbState.siteLabels?.sponsorsVerifiedLabel ||"");
 const [labelSponsorsContactTitle, setLabelSponsorsContactTitle] = useState(dbState.siteLabels?.sponsorsContactTitle ||"");
 const [labelSponsorsContactDescription, setLabelSponsorsContactDescription] = useState(dbState.siteLabels?.sponsorsContactDescription ||"");
 const [labelSponsorsOfficiallyAssociatedLabel, setLabelSponsorsOfficiallyAssociatedLabel] = useState(dbState.siteLabels?.sponsorsOfficiallyAssociatedLabel ||"OFFICIALLY ASSOCIATED 2026");

 const [labelFooterMissionTitle, setLabelFooterMissionTitle] = useState(dbState.siteLabels?.footerMissionTitle ||"");
 const [labelFooterMissionDescription, setLabelFooterMissionDescription] = useState(dbState.siteLabels?.footerMissionDescription ||"");
 const [labelFooterLegacyTitle, setLabelFooterLegacyTitle] = useState(dbState.siteLabels?.footerLegacyTitle ||"");
 const [labelFooterLegacyDescription, setLabelFooterLegacyDescription] = useState(dbState.siteLabels?.footerLegacyDescription ||"");
 const [labelFooterDirectoryTitle, setLabelFooterDirectoryTitle] = useState(dbState.siteLabels?.footerDirectoryTitle ||"DIRECTORY");
 const [labelFooterHeadquartersTitle, setLabelFooterHeadquartersTitle] = useState(dbState.siteLabels?.footerHeadquartersTitle ||"HEADQUARTERS");
 const [labelFooterAffiliationsTitle, setLabelFooterAffiliationsTitle] = useState(dbState.siteLabels?.footerAffiliationsTitle ||"AFFILIATIONS");
 const [labelFooterRightsReserved, setLabelFooterRightsReserved] = useState(dbState.siteLabels?.footerRightsReserved ||"© {year} CHULALONGKORN UNIVERSITY GOLF CLUB. ALL RIGHTS RESERVED.");
 const [labelFooterCmsLogin, setLabelFooterCmsLogin] = useState(dbState.siteLabels?.footerCmsLogin ||"CMS LOG-IN");
 const [labelFooterPrivacyDisclosure, setLabelFooterPrivacyDisclosure] = useState(dbState.siteLabels?.footerPrivacyDisclosure ||"PRIVACY DISCLOSURE");
 const [labelFooterTermsOfTradition, setLabelFooterTermsOfTradition] = useState(dbState.siteLabels?.footerTermsOfTradition ||"TERMS OF TRADITION");
 const [labelFooterDirectoryNewsRoom, setLabelFooterDirectoryNewsRoom] = useState(dbState.siteLabels?.footerDirectoryNewsRoom ||"NEWS ROOM");
 const [labelFooterDirectoryRoster, setLabelFooterDirectoryRoster] = useState(dbState.siteLabels?.footerDirectoryRoster ||"VARSITY ROSTER");
 const [labelFooterDirectoryScores, setLabelFooterDirectoryScores] = useState(dbState.siteLabels?.footerDirectoryScores ||"MATCH STATS");
 const [labelFooterAffiliationsChulaMain, setLabelFooterAffiliationsChulaMain] = useState(dbState.siteLabels?.footerAffiliationsChulaMain ||"CHULA MAIN");
 const [labelFooterAffiliationsSportsOffice, setLabelFooterAffiliationsSportsOffice] = useState(dbState.siteLabels?.footerAffiliationsSportsOffice ||"CU SPORTS OFFICE");

 const [labelWelcomeHeroTitle, setLabelWelcomeHeroTitle] = useState(dbState.siteLabels?.welcomeHeroTitle ||"Longstanding");
 const [labelWelcomeHeroSubtitle, setLabelWelcomeHeroSubtitle] = useState(dbState.siteLabels?.welcomeHeroSubtitle ||"Legacy");
 const [labelWelcomeHeroSocial, setLabelWelcomeHeroSocial] = useState(dbState.siteLabels?.welcomeHeroSocial ||"cugolfclub @Student Government of Chulalongkorn University");
 const [labelNavBlogSubBlog, setLabelNavBlogSubBlog] = useState(dbState.siteLabels?.navBlogSubBlog || "BLOG");
 const [labelNavBlogSubClub, setLabelNavBlogSubClub] = useState(dbState.siteLabels?.navBlogSubClub || "CLUB ACTIVITIES");
 const [labelNavFollowFb, setLabelNavFollowFb] = useState(dbState.siteLabels?.navFollowFb || "FOLLOW @CUGOLFCLUB (FB)");
 const [labelNavFollowIg, setLabelNavFollowIg] = useState(dbState.siteLabels?.navFollowIg || "FOLLOW @CUGOLFCLUB (IG)");
 const [labelNavFollowTiktok, setLabelNavFollowTiktok] = useState(dbState.siteLabels?.navFollowTiktok || "FOLLOW @CUGOLFCLUB (TIKTOK)");
 const [labelAboutClubHeroTitlePart1, setLabelAboutClubHeroTitlePart1] = useState(dbState.siteLabels?.aboutClubHeroTitlePart1 || "UPCOMING");
 const [labelAboutClubHeroTitlePart2, setLabelAboutClubHeroTitlePart2] = useState(dbState.siteLabels?.aboutClubHeroTitlePart2 || "ACTIVITIES");
 const [labelAboutClubHeroSubtitle, setLabelAboutClubHeroSubtitle] = useState(dbState.siteLabels?.aboutClubHeroSubtitle || "SCHEDULE & TOUR DATES FOR THE CHULALONGKORN SQUAD");
 const [labelAboutClubNoActivitiesTitle, setLabelAboutClubNoActivitiesTitle] = useState(dbState.siteLabels?.aboutClubNoActivitiesTitle || "No upcoming activities scheduled");
 const [labelAboutClubNoActivitiesDesc, setLabelAboutClubNoActivitiesDesc] = useState(dbState.siteLabels?.aboutClubNoActivitiesDesc || "Check back later for newly added tournaments and club matches.");
 const [labelBlogBackToBlog, setLabelBlogBackToBlog] = useState(dbState.siteLabels?.blogBackToBlog || "BACK TO BLOG");
 const [labelBlogPublishedBy, setLabelBlogPublishedBy] = useState(dbState.siteLabels?.blogPublishedBy || "PUBLISHED BY");
 const [labelBlogLocation, setLabelBlogLocation] = useState(dbState.siteLabels?.blogLocation || "LOCATION");
 const [labelRosterYearAll, setLabelRosterYearAll] = useState(dbState.siteLabels?.rosterYearAll || "ALL");
 const [labelRosterYearFreshman, setLabelRosterYearFreshman] = useState(dbState.siteLabels?.rosterYearFreshman || "FRESHMAN");
 const [labelRosterYearSophomore, setLabelRosterYearSophomore] = useState(dbState.siteLabels?.rosterYearSophomore || "SOPHOMORE");
 const [labelRosterYearJunior, setLabelRosterYearJunior] = useState(dbState.siteLabels?.rosterYearJunior || "JUNIOR");
 const [labelRosterYearSenior, setLabelRosterYearSenior] = useState(dbState.siteLabels?.rosterYearSenior || "SENIOR");
 const [labelHomeViewAllStoriesButton, setLabelHomeViewAllStoriesButton] = useState(dbState.siteLabels?.homeViewAllStoriesButton || "VIEW ALL STORIES");

 // Clear sync with outer state updates
  React.useEffect(() => {
  if (dbState?.welcomeSection) {
  setWelcomeImageUrl(dbState.welcomeSection?.imageUrl ||"");
  setWelcomeTitleThai(dbState.welcomeSection?.titleThai ||"");
  setWelcomeTitleEnglish(dbState.welcomeSection?.titleEnglish ||"");
  setWelcomeLegacyQuote(dbState.welcomeSection?.legacyQuote ||"");
  setWelcomeLegacyQuoteThai(dbState.welcomeSection?.legacyQuoteThai ||"");
  setWelcomeLegacyQuoteAuthor(dbState.welcomeSection?.legacyQuoteAuthor ||"");
  setWelcomeLegacyQuoteAuthorThai(dbState.welcomeSection?.legacyQuoteAuthorThai ||"");
  setWelcomeDescription(dbState.welcomeSection?.description ||"");
  setWelcomeDescriptionThai(dbState.welcomeSection?.descriptionThai ||"");
  }
  if (dbState?.siteSettings) {
  setSetsMarqueeText(dbState.siteSettings?.marqueeText ||"Chulalongkorn University Golf Club • Drive to Excellence");
  setSetsMarqueeTextThai(dbState.siteSettings?.marqueeTextThai ||"");
  setSetsContactPhone(dbState.siteSettings?.contactPhone ||"+66 (0) 2218-1916");
  setSetsContactEmail(dbState.siteSettings?.contactEmail ||"golf@chula.ac.th");
  setSetsContactAddress(dbState.siteSettings?.contactAddress ||"Chula Sports Complex, Phayathai Rd, Pathum Wan, Bangkok 10330, Thailand");
  setSetsContactAddressThai(dbState.siteSettings?.contactAddressThai ||"");
  setSetsAcademicAffiliation(dbState.siteSettings?.academicAffiliation ||"Thailand University Golf Association (TUGA)");
  setSetsAcademicAffiliationThai(dbState.siteSettings?.academicAffiliationThai ||"");
  
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
  setHomeSponTitle(dbState.homeSponsorSection?.title ||"");
  setHomeSponTitleThai(dbState.homeSponsorSection?.titleThai ||"");
  setHomeSponSubtitle(dbState.homeSponsorSection?.subtitle ||"");
  setHomeSponSubtitleThai(dbState.homeSponsorSection?.subtitleThai ||"");
  setHomeSponDescription(dbState.homeSponsorSection?.description ||"");
  setHomeSponDescriptionThai(dbState.homeSponsorSection?.descriptionThai ||"");
  setHomeSponMarqueeText(dbState.homeSponsorSection?.marqueeText ||"");
  setHomeSponMarqueeTextThai(dbState.homeSponsorSection?.marqueeTextThai ||"");
  setHomeSponImageUrl(dbState.homeSponsorSection?.imageUrl ||"");
  setHomeSponButtonText(dbState.homeSponsorSection?.buttonText ||"");
  setHomeSponButtonTextThai(dbState.homeSponsorSection?.buttonTextThai ||"");
  setHomeSponButtonUrl(dbState.homeSponsorSection?.buttonUrl ||"");
  setHomeSponShowSection(dbState.homeSponsorSection?.showSection ?? true);
  }
  if (dbState?.upcomingActivity) {
  setUpcomingTitle(dbState.upcomingActivity?.title ||"");
  setUpcomingTitleThai(dbState.upcomingActivity?.titleThai ||"");
  setUpcomingDescription(dbState.upcomingActivity?.description ||"");
  setUpcomingDescriptionThai(dbState.upcomingActivity?.descriptionThai ||"");
  setUpcomingImageUrl(dbState.upcomingActivity?.imageUrl ||"");
  setUpcomingDate(dbState.upcomingActivity?.date ||"");
  setUpcomingDateThai(dbState.upcomingActivity?.dateThai ||"");
  setUpcomingLocation(dbState.upcomingActivity?.location ||"");
  setUpcomingLocationThai(dbState.upcomingActivity?.locationThai ||"");
  setUpcomingRegUrl(dbState.upcomingActivity?.registrationUrl ||"");
  setUpcomingShowSection(dbState.upcomingActivity?.showSection ?? true);
  }
  if (dbState?.clubActivity) {
  setCaHeroImageUrl(dbState.clubActivity.heroImageUrl ||"");
  setCaPhilosophyTitle(dbState.clubActivity.philosophyTitle ||"");
  setCaPhilosophyTitleThai(dbState.clubActivity.philosophyTitleThai ||"");
  setCaPhilosophyQuote(dbState.clubActivity.philosophyQuote ||"");
  setCaPhilosophyQuoteThai(dbState.clubActivity.philosophyQuoteThai ||"");
  setCaPhilosophyDescription(dbState.clubActivity.philosophyDescription ||"");
  setCaPhilosophyDescriptionThai(dbState.clubActivity.philosophyDescriptionThai ||"");
  setCaTechnicalExcellenceDescription(dbState.clubActivity.technicalExcellenceDescription ||"");
  setCaTechnicalExcellenceDescriptionThai(dbState.clubActivity.technicalExcellenceDescriptionThai ||"");
  setCaCaptainName(dbState.clubActivity.captainName ||"");
  setCaCaptainNameThai(dbState.clubActivity.captainNameThai ||"");
  setCaCaptainRole(dbState.clubActivity.captainRole ||"");
  setCaCaptainRoleThai(dbState.clubActivity.captainRoleThai ||"");
  setCaCaptainImageUrl(dbState.clubActivity.captainImageUrl ||"");
  setCaCaptainPhilosophy(dbState.clubActivity.captainPhilosophy ||"");
  setCaCaptainPhilosophyThai(dbState.clubActivity.captainPhilosophyThai ||"");
  setCaCompetitions(dbState.clubActivity.competitions || []);
  setCaTrainingDescription(dbState.clubActivity.trainingDescription ||"");
  setCaTrainingDescriptionThai(dbState.clubActivity.trainingDescriptionThai ||"");
  setCaLegacyDescription(dbState.clubActivity.legacyDescription ||"");
  setCaLegacyDescriptionThai(dbState.clubActivity.legacyDescriptionThai ||"");
  setCaFoundedYear(dbState.clubActivity.foundedYear ||"");
  setCaActiveYears(dbState.clubActivity.activeYears ||"");
  setCaActiveYearsThai(dbState.clubActivity.activeYearsThai ||"");
  setCaShowPhilosophy(dbState.clubActivity.showPhilosophy ?? true);
  setCaShowCaptainMandate(dbState.clubActivity.showCaptainMandate ?? true);
  setCaShowCompetitions(dbState.clubActivity.showCompetitions ?? true);
  setCaShowTraining(dbState.clubActivity.showTraining ?? true);
  setCaShowLegacy(dbState.clubActivity.showLegacy ?? true);
  }
 }, [dbState]);

 React.useEffect(() => {
 const labelsSource = editLabelsLanguage === "th" 
 ? (dbState.siteLabelsThai || {}) 
 : (dbState.siteLabels || {});
 
 setLabelNavHome(labelsSource.navHome ||"HOME");
 setLabelNavBlog(labelsSource.navBlog ||"ACTIVITIES");
 setLabelNavRoster(labelsSource.navRoster ||"TEAM ROSTER");
 setLabelNavStaff(labelsSource.navStaff ||"STAFF & BOARD");
 setLabelNavScores(labelsSource.navScores ||"SCORES & STATS");
 setLabelNavSponsors(labelsSource.navSponsors ||"PARTNERS");
 setLabelNavAdmin(labelsSource.navAdmin ||"ADMIN CMS");
 setLabelNavBrandTitle(labelsSource.navBrandTitle ||"cugolfclub.");
 setLabelNavBrandSubtitle(labelsSource.navBrandSubtitle ||"[Official] Chulalongkorn University Golf Club");
 setLabelNavAdminActive(labelsSource.navAdminActive ||"REGISTRY ACTIVE");
 setLabelNavAdminCms(labelsSource.navAdminCms ||"ADMIN CMS");

 setLabelHomeBlogTitle(labelsSource.homeBlogTitle ||"");
 setLabelHomeBlogSubtitle(labelsSource.homeBlogSubtitle ||"");
 setLabelHomeWelcomeHeroTitle(labelsSource.homeWelcomeHeroTitle ||"");
 setLabelHomeWelcomeHeroSubtitle(labelsSource.homeWelcomeHeroSubtitle ||"Legacy");
 setLabelHomeWelcomeHeroSocial(labelsSource.homeWelcomeHeroSocial ||"cugolfclub @Student Government of Chulalongkorn University");
 setLabelHomeFeaturedActivityBadge(labelsSource.homeFeaturedActivityBadge ||"FEATURED ACTIVITY");
 setLabelHomeRecentUpdatesLabel(labelsSource.homeRecentUpdatesLabel ||"RECENT UPDATES");
 setLabelHomeReadCoverageButton(labelsSource.homeReadCoverageButton ||"READ COVERAGE");
 setLabelHomeReadStoryButton(labelsSource.homeReadStoryButton ||"READ STORY");
 setLabelHomeLiveStandingsTitle(labelsSource.homeLiveStandingsTitle ||"LIVE STANDINGS");
 setLabelHomeFullLeaderboardButton(labelsSource.homeFullLeaderboardButton ||"FULL LEADERBOARD");
 setLabelHomeNoBlogs(labelsSource.homeNoBlogs ||"No activities blogs published yet.");
 setLabelHomeActivityLabel(labelsSource.homeActivityLabel ||"ACTIVITY");
 setLabelHomeNoScores(labelsSource.homeNoScores ||"No tournament scores listed yet.");
 setLabelHomeModalOfficialBadge(labelsSource.homeModalOfficialBadge ||"OFFICIAL EDITORIAL");
 setLabelHomeModalEditorialBoard(labelsSource.homeModalEditorialBoard ||"CU GOLF CLUB SPORTS EDITORIAL BOARD");
 setLabelHomeModalLocation(labelsSource.homeModalLocation ||"BANGKOK, THAILAND");

 setLabelHomeMembershipTitle(labelsSource.homeMembershipTitle ||"Become a member of the CU GOLF CLUB.");
 setLabelHomeMembershipDescription(labelsSource.homeMembershipDescription ||"Expand your network and elevate your game.");
 setLabelHomeMembershipButtonText(labelsSource.homeMembershipButtonText ||"REGISTER NOW");

 setLabelRosterTitle(labelsSource.rosterTitle ||"");
 setLabelRosterSubtitle(labelsSource.rosterSubtitle ||"");
 setLabelRosterVerifiedLabel(labelsSource.rosterVerifiedLabel ||"");
 setLabelRosterSearchPlaceholder(labelsSource.rosterSearchPlaceholder ||"Search roster registry...");
 setLabelRosterFilterLabel(labelsSource.rosterFilterLabel ||"CLASS YEAR:");
 setLabelRosterStatusLabel(labelsSource.rosterStatusLabel ||"STATUS:");
 setLabelRosterNoResultsTitle(labelsSource.rosterNoResultsTitle ||"No registrants found");
 setLabelRosterNoResultsDesc(labelsSource.rosterNoResultsDesc ||"There are no players currently recorded matching your search parameters or select class year filters.");
 setLabelRosterSquadLeadBadge(labelsSource.rosterSquadLeadBadge ||"SQUAD LEAD");
 setLabelRosterIndexLabel(labelsSource.rosterIndexLabel ||"INDEX");
 setLabelRosterAthleteLabel(labelsSource.rosterAthleteLabel ||"CU ATHLETE");
 setLabelRosterStatusActive(labelsSource.rosterStatusActive ||"STATUS: ACTIVE SQUAD");

 setLabelStaffTitle(labelsSource.staffTitle ||"");
 setLabelStaffSubtitle(labelsSource.staffSubtitle ||"");
 setLabelStaffVerifiedLabel(labelsSource.staffVerifiedLabel ||"");
 setLabelScoresTitle(labelsSource.scoresTitle ||"");
 setLabelScoresSubtitle(labelsSource.scoresSubtitle ||"");
 setLabelScoresVerifiedLabel(labelsSource.scoresVerifiedLabel ||"");
 setLabelScoresRecapTitle(labelsSource.scoresRecapTitle ||"");
 setLabelScoresRecapSubtitle(labelsSource.scoresRecapSubtitle ||"");
 setLabelScoresOfficialStatsBadge(labelsSource.scoresOfficialStatsBadge ||"UNOFFICIAL STATS");
 setLabelScoresViewStandingsButton(labelsSource.scoresViewStandingsButton ||"VIEW STANDINGS");
 setLabelScoresHideStandingsButton(labelsSource.scoresHideStandingsButton ||"HIDE STANDINGS");
 setLabelScoresTablePlayerHeader(labelsSource.scoresTablePlayerHeader ||"PLAYER NAME");
 setLabelScoresTableScoreHeader(labelsSource.scoresTableScoreHeader ||"STROKE SCORE");
 setLabelScoresTablePositionHeader(labelsSource.scoresTablePositionHeader ||"POSITION");
 setLabelScoresAttestationLabel(labelsSource.scoresAttestationLabel ||"CU UNOFFICIAL GOLF SCORECARD ATTESTATION");
 setLabelScoresVerifiedDirectoryLabel(labelsSource.scoresVerifiedDirectoryLabel ||"COACH VERIFIED DIRECTORY");
 setLabelScoresDetailedLeaderboardTitle(labelsSource.scoresDetailedLeaderboardTitle ||"DETAILED COMPETITIVE LEADERBOARD");

 setLabelSponsorsTitle(labelsSource.sponsorsTitle ||"");
 setLabelSponsorsSubtitle(labelsSource.sponsorsSubtitle ||"");
 setLabelSponsorsVerifiedLabel(labelsSource.sponsorsVerifiedLabel ||"");
 setLabelSponsorsContactTitle(labelsSource.sponsorsContactTitle ||"");
 setLabelSponsorsContactDescription(labelsSource.sponsorsContactDescription ||"");
 setLabelSponsorsOfficiallyAssociatedLabel(labelsSource.sponsorsOfficiallyAssociatedLabel ||"OFFICIALLY ASSOCIATED 2026");

 setLabelFooterMissionTitle(labelsSource.footerMissionTitle ||"");
 setLabelFooterMissionDescription(labelsSource.footerMissionDescription ||"");
 setLabelFooterLegacyTitle(labelsSource.footerLegacyTitle ||"");
 setLabelFooterLegacyDescription(labelsSource.footerLegacyDescription ||"");
 setLabelFooterDirectoryTitle(labelsSource.footerDirectoryTitle ||"DIRECTORY");
 setLabelFooterHeadquartersTitle(labelsSource.footerHeadquartersTitle ||"HEADQUARTERS");
 setLabelFooterAffiliationsTitle(labelsSource.footerAffiliationsTitle ||"AFFILIATIONS");
 setLabelFooterRightsReserved(labelsSource.footerRightsReserved ||"© {year} CHULALONGKORN UNIVERSITY GOLF CLUB. ALL RIGHTS RESERVED.");
 setLabelFooterCmsLogin(labelsSource.footerCmsLogin ||"CMS LOG-IN");
 setLabelFooterPrivacyDisclosure(labelsSource.footerPrivacyDisclosure ||"PRIVACY DISCLOSURE");
 setLabelFooterTermsOfTradition(labelsSource.footerTermsOfTradition ||"TERMS OF TRADITION");
 setLabelFooterDirectoryNewsRoom(labelsSource.footerDirectoryNewsRoom ||"NEWS ROOM");
 setLabelFooterDirectoryRoster(labelsSource.footerDirectoryRoster ||"VARSITY ROSTER");
 setLabelFooterDirectoryScores(labelsSource.footerDirectoryScores ||"MATCH STATS");
 setLabelFooterAffiliationsChulaMain(labelsSource.footerAffiliationsChulaMain ||"CHULA MAIN");
 setLabelFooterAffiliationsSportsOffice(labelsSource.footerAffiliationsSportsOffice ||"CU SPORTS OFFICE");

 setLabelWelcomeHeroTitle(labelsSource.welcomeHeroTitle || "Longstanding");
 setLabelWelcomeHeroSubtitle(labelsSource.welcomeHeroSubtitle || "Legacy");
 setLabelWelcomeHeroSocial(labelsSource.welcomeHeroSocial ||"cugolfclub @Student Government of Chulalongkorn University");
 setLabelNavBlogSubBlog(labelsSource.navBlogSubBlog || "BLOG");
 setLabelNavBlogSubClub(labelsSource.navBlogSubClub || "CLUB ACTIVITIES");
 setLabelNavFollowFb(labelsSource.navFollowFb || "FOLLOW @CUGOLFCLUB (FB)");
 setLabelNavFollowIg(labelsSource.navFollowIg || "FOLLOW @CUGOLFCLUB (IG)");
 setLabelNavFollowTiktok(labelsSource.navFollowTiktok || "FOLLOW @CUGOLFCLUB (TIKTOK)");
 setLabelAboutClubHeroTitlePart1(labelsSource.aboutClubHeroTitlePart1 || "UPCOMING");
 setLabelAboutClubHeroTitlePart2(labelsSource.aboutClubHeroTitlePart2 || "ACTIVITIES");
 setLabelAboutClubHeroSubtitle(labelsSource.aboutClubHeroSubtitle || "SCHEDULE & TOUR DATES FOR THE CHULALONGKORN SQUAD");
 setLabelAboutClubNoActivitiesTitle(labelsSource.aboutClubNoActivitiesTitle || "No upcoming activities scheduled");
 setLabelAboutClubNoActivitiesDesc(labelsSource.aboutClubNoActivitiesDesc || "Check back later for newly added tournaments and club matches.");
 setLabelBlogBackToBlog(labelsSource.blogBackToBlog || "BACK TO BLOG");
 setLabelBlogPublishedBy(labelsSource.blogPublishedBy || "PUBLISHED BY");
 setLabelBlogLocation(labelsSource.blogLocation || "LOCATION");
 setLabelRosterYearAll(labelsSource.rosterYearAll || "ALL");
 setLabelRosterYearFreshman(labelsSource.rosterYearFreshman || "FRESHMAN");
 setLabelRosterYearSophomore(labelsSource.rosterYearSophomore || "SOPHOMORE");
 setLabelRosterYearJunior(labelsSource.rosterYearJunior || "JUNIOR");
 setLabelRosterYearSenior(labelsSource.rosterYearSenior || "SENIOR");
 setLabelHomeViewAllStoriesButton(labelsSource.homeViewAllStoriesButton || "VIEW ALL STORIES");
 }, [editLabelsLanguage, dbState]);

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
 setLoginError(result.message ||"Invalid passkey credentials.");
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
 titleThai: newsTitleThai,
 excerpt: newsExcerpt,
 excerptThai: newsExcerptThai,
 content: newsContent,
 contentThai: newsContentThai,
 imageUrl: newsImage ||"https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=1200",
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
 setNewsTitleThai("");
 setNewsExcerpt("");
 setNewsExcerptThai("");
 setNewsContent("");
 setNewsContentThai("");
 setNewsImage("");
 setNewsDate("");
 setNewsRank(0);
 setNewsIsVisible(true);
 refreshState();
 } catch (err: any) {
 triggerErrorMsg(err.message ||"Failed to save changes.");
 } finally {
 setIsMutating(false);
 }
 };

 const handleEditNewsTrigger = (item: NewsItem) => {
 setEditingNewsId(item.id);
 setNewsTitle(item.title);
 setNewsTitleThai(item.titleThai || "");
 setNewsExcerpt(item.excerpt);
 setNewsExcerptThai(item.excerptThai || "");
 setNewsContent(item.content);
 setNewsContentThai(item.contentThai || "");
 setNewsImage(item.imageUrl);
 setNewsDate(item.publishDate);
 setNewsRank(item.rank || 0);
 setNewsIsVisible(item.isVisible ?? true);
 window.scrollTo({ top: 0, behavior:"smooth"});
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
 nameThai: playerNameThai,
 handicap: playerHandicap,
 year: playerYear,
 yearThai: playerYearThai,
 faculty: playerFaculty ||"Faculty of Sports Science",
 facultyThai: playerFacultyThai,
 imageUrl: playerImage ||"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400",
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
 setPlayerNameThai("");
 setPlayerHandicap(1.5);
 setPlayerYear("Freshman");
 setPlayerYearThai("Freshman");
 setPlayerFaculty("");
 setPlayerFacultyThai("");
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
 setPlayerNameThai(item.nameThai || "");
 setPlayerHandicap(item.handicap);
 setPlayerYear(item.year);
 setPlayerYearThai(item.yearThai || "Freshman");
 setPlayerFaculty(item.faculty ||"");
 setPlayerFacultyThai(item.facultyThai || "");
 setPlayerImage(item.imageUrl);
 setPlayerIsFeatured(!!item.isFeatured);
 setPlayerIsVisible(item.isVisible ?? true);
 window.scrollTo({ top: 0, behavior:"smooth"});
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
 nameThai: staffNameThai,
 role: staffRole,
 roleThai: staffRoleThai,
 year: staffFaculty ||"Faculty of Sports Science",
 yearThai: staffFacultyThai,
 imageUrl: staffImage ||"https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400",
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
 setStaffNameThai("");
 setStaffRole("");
 setStaffRoleThai("");
 setStaffFaculty("");
 setStaffFacultyThai("");
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
 setStaffNameThai(item.nameThai || "");
 setStaffRole(item.role);
 setStaffRoleThai(item.roleThai || "");
 setStaffFaculty(item.year);
 setStaffFacultyThai(item.yearThai || "");
 setStaffImage(item.imageUrl);
 setStaffOrder(item.order);
 setStaffIsVisible(item.isVisible ?? true);
 window.scrollTo({ top: 0, behavior:"smooth"});
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
 tournamentNameThai: scoreTournamentNameThai,
 date: scoreDate,
 result: scoreResult,
 resultThai: scoreResultThai,
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
 setScoreTournamentNameThai("");
 setScoreDate("");
 setScoreResult("");
 setScoreResultThai("");
 setScoreList([{ playerName:"Methas 'Pete' Srisai", score: 71, position:"3rd"}]);
 setScoreIsVisible(true);
 refreshState();
 } catch (err) {
 triggerErrorMsg("Failed to save scoreboard.");
 } finally {
 setIsMutating(false);
 }
 };

 const handleAddPlayerScoreRow = () => {
 setScoreList([...scoreList, { playerName:"", score: 72, position:""}]);
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
 setScoreTournamentNameThai(item.tournamentNameThai || "");
 setScoreDate(item.date);
 setScoreResult(item.result);
 setScoreResultThai(item.resultThai || "");
 setScoreList(item.scoresList);
 setScoreIsVisible(item.isVisible ?? true);
 window.scrollTo({ top: 0, behavior:"smooth"});
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
 legacyQuoteThai: welcomeLegacyQuoteThai,
 legacyQuoteAuthor: welcomeLegacyQuoteAuthor,
 legacyQuoteAuthorThai: welcomeLegacyQuoteAuthorThai,
 description: welcomeDescription,
 descriptionThai: welcomeDescriptionThai
 });
 if (data.success) {
 triggerSuccessMsg("STATIC WELCOME PHOTOS & LEGACY QUOTE SETTINGS SUCCESSFULLY UPDATED.");
 refreshState();
 } else {
 triggerErrorMsg("UNABLE TO TRANSMIT REVISION DRAFT CORRECTION BACK TO SERVER STATE.");
 }
 } catch (err: any) {
 console.error(err);
 triggerErrorMsg(err.message ||"DATALINK ERROR UPDATING GREETING BLOCKS.");
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
 titleThai: upcomingTitleThai,
 description: upcomingDescription,
 descriptionThai: upcomingDescriptionThai,
 imageUrl: upcomingImageUrl,
 date: upcomingDate,
 dateThai: upcomingDateThai,
 location: upcomingLocation,
 locationThai: upcomingLocationThai,
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
 triggerErrorMsg(err.message ||"DATALINK ERROR UPDATING ACTIVITY BLOCKS.");
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
 nameThai: sponNameThai,
 description: sponDescription,
 descriptionThai: sponDescriptionThai,
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
 setSponNameThai("");
 setSponDescription("");
 setSponDescriptionThai("");
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
   setActiveView("sponsors");
   setEditingSponsorId(item.id);

 setSponName(item.name);
 setSponNameThai(item.nameThai || "");
 setSponDescription(item.description);
 setSponDescriptionThai(item.descriptionThai || "");
 setSponWebsiteUrl(item.websiteUrl ||"");
 setSponImageUrl(item.imageUrl ||"");
 setSponIsActive(!!item.isActive);
 window.scrollTo({ top: 0, behavior:"smooth"});
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
 const payload = {
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
 homeWelcomeHeroTitle: labelHomeWelcomeHeroTitle, homeWelcomeHeroSubtitle: labelHomeWelcomeHeroSubtitle,
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
 homeModalOfficialBadge: labelHomeModalOfficialBadge, homeModalEditorialBoard: labelHomeModalEditorialBoard,
 homeModalLocation: labelHomeModalLocation,
 homeMembershipTitle: labelHomeMembershipTitle,
 homeMembershipDescription: labelHomeMembershipDescription,
 homeMembershipButtonText: labelHomeMembershipButtonText,
 rosterTitle: labelRosterTitle, rosterSubtitle: labelRosterSubtitle,
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
 scoresDetailedLeaderboardTitle: labelScoresDetailedLeaderboardTitle, sponsorsTitle: labelSponsorsTitle,
 sponsorsSubtitle: labelSponsorsSubtitle,
 sponsorsVerifiedLabel: labelSponsorsVerifiedLabel,
 sponsorsContactTitle: labelSponsorsContactTitle,
 sponsorsContactDescription: labelSponsorsContactDescription,
 sponsorsOfficiallyAssociatedLabel: labelSponsorsOfficiallyAssociatedLabel, footerMissionTitle: labelFooterMissionTitle,
 footerMissionDescription: labelFooterMissionDescription,
 footerLegacyTitle: labelFooterLegacyTitle,
 footerLegacyDescription: labelFooterLegacyDescription,
 footerDirectoryTitle: labelFooterDirectoryTitle, footerHeadquartersTitle: labelFooterHeadquartersTitle,
 footerAffiliationsTitle: labelFooterAffiliationsTitle,
 footerRightsReserved: labelFooterRightsReserved,
 footerCmsLogin: labelFooterCmsLogin,
 footerPrivacyDisclosure: labelFooterPrivacyDisclosure,
 footerTermsOfTradition: labelFooterTermsOfTradition,
 footerDirectoryNewsRoom: labelFooterDirectoryNewsRoom, footerDirectoryRoster: labelFooterDirectoryRoster,
 footerDirectoryScores: labelFooterDirectoryScores,
 footerAffiliationsChulaMain: labelFooterAffiliationsChulaMain,
 footerAffiliationsSportsOffice: labelFooterAffiliationsSportsOffice,
 welcomeHeroTitle: labelWelcomeHeroTitle,
 welcomeHeroSubtitle: labelWelcomeHeroSubtitle,
 welcomeHeroSocial: labelWelcomeHeroSocial,
 navBlogSubBlog: labelNavBlogSubBlog,
 navBlogSubClub: labelNavBlogSubClub,
 navFollowFb: labelNavFollowFb,
 navFollowIg: labelNavFollowIg,
 navFollowTiktok: labelNavFollowTiktok,
 aboutClubHeroTitlePart1: labelAboutClubHeroTitlePart1,
 aboutClubHeroTitlePart2: labelAboutClubHeroTitlePart2,
 aboutClubHeroSubtitle: labelAboutClubHeroSubtitle,
 aboutClubNoActivitiesTitle: labelAboutClubNoActivitiesTitle,
 aboutClubNoActivitiesDesc: labelAboutClubNoActivitiesDesc,
 blogBackToBlog: labelBlogBackToBlog,
 blogPublishedBy: labelBlogPublishedBy,
 blogLocation: labelBlogLocation,
 rosterYearAll: labelRosterYearAll,
 rosterYearFreshman: labelRosterYearFreshman,
 rosterYearSophomore: labelRosterYearSophomore,
 rosterYearJunior: labelRosterYearJunior,
 rosterYearSenior: labelRosterYearSenior,
 homeViewAllStoriesButton: labelHomeViewAllStoriesButton,
 };

 const resVal = editLabelsLanguage === "th" 
   ? await updateSiteLabelsThai(payload)
   : await updateSiteLabels(payload);

 if (resVal.success) {
 triggerSuccessMsg("SITE CONTENT LABELS & EDITORIAL TEXT UPDATED SUCCESSFULLY.");
 refreshState();
 }
 } catch (err: any) {
 triggerErrorMsg(err.message ||"Failed to edit site content labels.");
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
 titleThai: homeSponTitleThai,
 subtitle: homeSponSubtitle,
 subtitleThai: homeSponSubtitleThai,
 description: homeSponDescription,
 descriptionThai: homeSponDescriptionThai,
 marqueeText: homeSponMarqueeText,
 marqueeTextThai: homeSponMarqueeTextThai,
 imageUrl: homeSponImageUrl,
 buttonText: homeSponButtonText,
 buttonTextThai: homeSponButtonTextThai,
 buttonUrl: homeSponButtonUrl,
 showSection: homeSponShowSection
 });
 if (res.success) {
 triggerSuccessMsg("HOME SPONSOR SHOWCASE UPDATED.");
 refreshState();
 }
 } catch (err: any) {
 triggerErrorMsg(err.message ||"Failed to update home sponsor section.");
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
 philosophyTitleThai: caPhilosophyTitleThai,
 philosophyQuote: caPhilosophyQuote,
 philosophyQuoteThai: caPhilosophyQuoteThai,
 philosophyDescription: caPhilosophyDescription,
 philosophyDescriptionThai: caPhilosophyDescriptionThai,
 technicalExcellenceDescription: caTechnicalExcellenceDescription,
 technicalExcellenceDescriptionThai: caTechnicalExcellenceDescriptionThai,
 captainName: caCaptainName,
 captainNameThai: caCaptainNameThai,
 captainRole: caCaptainRole,
 captainRoleThai: caCaptainRoleThai,
 captainImageUrl: caCaptainImageUrl,
 captainPhilosophy: caCaptainPhilosophy,
 captainPhilosophyThai: caCaptainPhilosophyThai,
 competitions: caCompetitions,
 trainingDescription: caTrainingDescription,
 trainingDescriptionThai: caTrainingDescriptionThai,
 legacyDescription: caLegacyDescription,
 legacyDescriptionThai: caLegacyDescriptionThai,
 foundedYear: caFoundedYear,
 activeYears: caActiveYears,
 activeYearsThai: caActiveYearsThai,
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
 triggerErrorMsg(err.message ||"Failed to update club activities content.");
 } finally {
 setIsMutating(false);
 }
 };

 const handleAddCompetition = () => {
  const newComp: Competition = {
   id: `comp-${Date.now()}`,
   title: "New Competition",
   description: "Brief description of the tournament.",
   difficulty: "NATIONAL LEVEL",
   imageUrl: "",
   date: new Date().toISOString().split("T")[0]
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
 marqueeTextThai: setsMarqueeTextThai,
 contactPhone: setsContactPhone,
 contactEmail: setsContactEmail,
 contactAddress: setsContactAddress,
 contactAddressThai: setsContactAddressThai,
 academicAffiliation: setsAcademicAffiliation,
 academicAffiliationThai: setsAcademicAffiliationThai,
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
 triggerErrorMsg(err.message ||"Failed to edit site general configuration.");
 } finally {
 setIsMutating(false);
 }
 };



 // --- RENDERING FOR LOGIN IF NOT LOGGED IN ---
 if (!adminToken) {
 return (
 <div className="mx-auto max-w-md py-24 px-4 animate-fade-in">
 <div className="border-2 border-brand-ink bg-brand-neutral p-8 md:p-12 space-y-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
 <div className="text-center space-y-4 border-b-2 border-brand-ink pb-8">
 <div className="mx-auto h-16 w-16 border-2 border-brand-ink flex items-center justify-center text-brand-neutral bg-brand-ink">
 <Lock size={28} />
 </div>
 <h2 className="font-thai text-4xl font-bold uppercase tracking-tight text-brand-ink leading-none pt-4">
 CMS ACCESS
 </h2>
 <p className="font-display text-[10px] text-neutral-400 tracking-[0.3em] uppercase font-black">
 AUTHORIZATION REQUIRED
 </p>
 </div>

 {loginError && (
 <div className="bg-red-50 border-2 border-brand-ink text-brand-ink p-3.5 text-xs font-black flex items-center gap-2 uppercase">
 <AlertCircle size={16} />
 <span>{loginError}</span>
 </div>
 )}

 <form onSubmit={handleLogin} className="space-y-4">
 <div className="space-y-1.5">
 <label htmlFor="passkey"className="font-display text-[9px] font-black text-brand-ink/60 uppercase block">
 VARSITY PASSKEY CODE
 </label>
 <input
 id="passkey"
 type="password"
 required
 placeholder="Enter Passkey"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 className="w-full bg-neutral-50 border-2 border-brand-ink py-2.5 px-3 font-display text-xs focus:outline-none focus:bg-brand-neutral text-brand-ink"
 />
 </div>
 <button
 type="submit"
 disabled={isAuthenticating}
 className="w-full bg-brand-ink py-3 text-xs font-black tracking-widest text-brand-neutral uppercase hover:bg-neutral-900 border-2 border-brand-ink transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
 >
 {isAuthenticating ? (
 <>
 <RefreshCw size={14} className="animate-spin"/>
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

 // --- RENDERING FORMS BASED ON activeView ---
 const renderForms = () => {
 switch (activeView) {
 case"home":
 return (
 <div className="space-y-12">
 {/* WELCOME HERO */}
 <div className="space-y-6">
 <h2 className="font-display text-lg font-bold uppercase tracking-wider text-brand-ink flex items-center gap-2 border-b border-brand-ink/10 pb-2">
 <Layout size={20} className="text-brand-pink"/> EDIT WELCOME HERO
 </h2>
 <div className="space-y-4">
 <ImageUploadWidget
 id="welcome_image"
 label="HERO BACKGROUND IMAGE"
 value={welcomeImageUrl}
 onChange={setWelcomeImageUrl}
 placeholder="https://images.unsplash.com/photo-..."
 helperText="A wide panoramic or landscape golf course photo works best."
 />
 <div className="space-y-1.5">
 <label className="font-display text-[9px] font-bold text-brand-ink/60 uppercase block">PRIMARY TITLE (THAI OR MAIN)</label>
 <input
 type="text"
 value={welcomeTitleThai}
 onChange={(e) => setWelcomeTitleThai(e.target.value)}
 className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs focus:outline-none focus:border-brand-pink text-brand-ink"
 />
 </div>
 <div className="space-y-1.5">
 <label className="font-display text-[9px] font-bold text-brand-ink/60 uppercase block">SECONDARY TITLE (ENGLISH / SUB)</label>
 <input
 type="text"
 value={welcomeTitleEnglish}
 onChange={(e) => setWelcomeTitleEnglish(e.target.value)}
 className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs focus:outline-none focus:border-brand-pink text-brand-ink"
 />
 </div>
 <div className="space-y-1.5">
 <label className="font-display text-[9px] font-bold text-brand-ink/60 uppercase block">WELCOME DESCRIPTION PARAGRAPH (EN)</label>
 <textarea
 rows={5}
 value={welcomeDescription}
 onChange={(e) => setWelcomeDescription(e.target.value)}
 className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs focus:outline-none leading-relaxed text-brand-ink"
 />
 </div>
 <div className="space-y-1.5">
 <label className="font-display text-[9px] font-bold text-brand-ink/60 uppercase block">WELCOME DESCRIPTION PARAGRAPH (TH)</label>
 <textarea
 rows={5}
 value={welcomeDescriptionThai}
 onChange={(e) => setWelcomeDescriptionThai(e.target.value)}
 className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs focus:outline-none leading-relaxed text-brand-ink"
 />
 </div>
 <div className="space-y-1.5">
 <label className="font-display text-[9px] font-bold text-brand-ink/60 uppercase block">LEGACY QUOTE (EN)</label>
 <textarea
 rows={3}
 value={welcomeLegacyQuote}
 onChange={(e) => setWelcomeLegacyQuote(e.target.value)}
 className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs focus:outline-none leading-relaxed text-brand-ink"
 />
 </div>
 <div className="space-y-1.5">
 <label className="font-display text-[9px] font-bold text-brand-ink/60 uppercase block">LEGACY QUOTE (TH)</label>
 <textarea
 rows={3}
 value={welcomeLegacyQuoteThai}
 onChange={(e) => setWelcomeLegacyQuoteThai(e.target.value)}
 className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs focus:outline-none leading-relaxed text-brand-ink"
 />
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-1.5">
 <label className="font-display text-[9px] font-bold text-brand-ink/60 uppercase block">LEGACY QUOTE AUTHOR (EN)</label>
 <input
 type="text"
 value={welcomeLegacyQuoteAuthor}
 onChange={(e) => setWelcomeLegacyQuoteAuthor(e.target.value)}
 className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs focus:outline-none focus:border-brand-pink text-brand-ink"
 />
 </div>
 <div className="space-y-1.5">
 <label className="font-display text-[9px] font-bold text-brand-ink/60 uppercase block">LEGACY QUOTE AUTHOR (TH)</label>
 <input
 type="text"
 value={welcomeLegacyQuoteAuthorThai}
 onChange={(e) => setWelcomeLegacyQuoteAuthorThai(e.target.value)}
 className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs focus:outline-none focus:border-brand-pink text-brand-ink"
 />
 </div>
 </div>
 <div className="pt-4 border-t border-brand-ink/10">
 <button
 onClick={handleUpdateWelcomeSection}
 className="w-full bg-brand-ink text-brand-neutral hover:bg-brand-pink px-6 py-3 font-display text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
 >
 <Save size={14} /> SAVE WELCOME SECTION
 </button>
 </div>
 </div>
 </div>

 {/* HOME SPONSORS */}
 <div className="space-y-6 pt-12 border-t-4 border-brand-ink">
 <h2 className="font-display text-lg font-bold uppercase tracking-wider text-brand-ink flex items-center gap-2 border-b border-brand-ink/10 pb-2">
 <Sparkles size={20} className="text-brand-pink"/> EDIT HOME SPONSORS
 </h2>
 <div className="space-y-4">
 <div className="flex items-center gap-2 py-1">
 <input
 id="home_spon_show"
 type="checkbox"
 checked={homeSponShowSection}
 onChange={(e) => setHomeSponShowSection(e.target.checked)}
 className="h-4 w-4 text-brand-pink accent-brand-pink"
 />
 <label htmlFor="home_spon_show"className="font-display text-[9px] font-bold text-brand-ink/75 uppercase">
 SHOW THIS SECTION ON HOMEPAGE
 </label>
 </div>
 <div className="space-y-1.5">
 <label className="font-display text-[9px] font-bold text-brand-ink/60 uppercase block">TITLE (EN)</label>
 <input
 type="text"
 value={homeSponTitle}
 onChange={(e) => setHomeSponTitle(e.target.value)}
 className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs focus:outline-none"
 />
 </div>
 <div className="space-y-1.5">
 <label className="font-display text-[9px] font-bold text-brand-ink/60 uppercase block">TITLE (TH)</label>
 <input
 type="text"
 value={homeSponTitleThai}
 onChange={(e) => setHomeSponTitleThai(e.target.value)}
 className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs focus:outline-none"
 />
 </div>
 <div className="space-y-1.5">
 <label className="font-display text-[9px] font-bold text-brand-ink/60 uppercase block">SUBTITLE (EN)</label>
 <input
 type="text"
 value={homeSponSubtitle}
 onChange={(e) => setHomeSponSubtitle(e.target.value)}
 className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs focus:outline-none"
 />
 </div>
 <div className="space-y-1.5">
 <label className="font-display text-[9px] font-bold text-brand-ink/60 uppercase block">SUBTITLE (TH)</label>
 <input
 type="text"
 value={homeSponSubtitleThai}
 onChange={(e) => setHomeSponSubtitleThai(e.target.value)}
 className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs focus:outline-none"
 />
 </div>
 <div className="space-y-1.5">
 <label className="font-display text-[9px] font-bold text-brand-ink/60 uppercase block">DESCRIPTION (EN)</label>
 <textarea
 rows={4}
 value={homeSponDescription}
 onChange={(e) => setHomeSponDescription(e.target.value)}
 className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs focus:outline-none leading-relaxed"
 />
 </div>
 <div className="space-y-1.5">
 <label className="font-display text-[9px] font-bold text-brand-ink/60 uppercase block">DESCRIPTION (TH)</label>
 <textarea
 rows={4}
 value={homeSponDescriptionThai}
 onChange={(e) => setHomeSponDescriptionThai(e.target.value)}
 className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs focus:outline-none leading-relaxed"
 />
 </div>
 <div className="space-y-1.5">
 <label className="font-display text-[9px] font-bold text-brand-ink/60 uppercase block">MARQUEE RUNNING TEXT (EN)</label>
 <input
 type="text"
 value={homeSponMarqueeText}
 onChange={(e) => setHomeSponMarqueeText(e.target.value)}
 className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs focus:outline-none font-display"
 />
 </div>
 <div className="space-y-1.5">
 <label className="font-display text-[9px] font-bold text-brand-ink/60 uppercase block">MARQUEE RUNNING TEXT (TH)</label>
 <input
 type="text"
 value={homeSponMarqueeTextThai}
 onChange={(e) => setHomeSponMarqueeTextThai(e.target.value)}
 className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs focus:outline-none font-display"
 />
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-1.5">
 <label className="font-display text-[9px] font-bold text-brand-ink/60 uppercase block">BUTTON TEXT (EN)</label>
 <input
 type="text"
 value={homeSponButtonText}
 onChange={(e) => setHomeSponButtonText(e.target.value)}
 className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs focus:outline-none"
 />
 </div>
 <div className="space-y-1.5">
 <label className="font-display text-[9px] font-bold text-brand-ink/60 uppercase block">BUTTON TEXT (TH)</label>
 <input
 type="text"
 value={homeSponButtonTextThai}
 onChange={(e) => setHomeSponButtonTextThai(e.target.value)}
 className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs focus:outline-none"
 />
 </div>
 </div>
 <ImageUploadWidget
 id="home_spon_image"
 label="FEATURED IMAGE"
 value={homeSponImageUrl}
 onChange={setHomeSponImageUrl}
 placeholder="https://images.unsplash.com/photo-..."
 />
 <div className="pt-4 border-t border-brand-ink/10">
 <button
 onClick={handleUpdateHomeSponsorSection}
 className="w-full bg-brand-ink text-brand-neutral hover:bg-brand-pink px-6 py-3 font-display text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
 >
 <Save size={14} /> SAVE SPONSOR SECTION
 </button>
 </div>
 </div>
 </div>
 </div>
 );
 
 case"blog":
 return (
 <div className="space-y-12">
 <div className="space-y-6">
 <h2 className="font-display text-lg font-bold uppercase tracking-wider text-brand-ink flex items-center gap-2 border-b border-brand-ink/10 pb-2">
 <FileText size={20} className="text-brand-pink"/> ACTIVITIES & STORIES
 </h2>
 
 <button 
 onClick={() => { 
 setEditingNewsId(null); setNewsTitle(""); setNewsTitleThai(""); setNewsExcerpt(""); setNewsExcerptThai(""); setNewsContent(""); setNewsContentThai(""); setNewsImage(""); setNewsDate(""); setNewsRank(0); setNewsIsVisible(true);
 window.scrollTo({ top: 0, behavior:"smooth"});
 }}
 className="w-full bg-brand-ink text-brand-neutral py-3 font-display text-[10px] font-bold uppercase flex items-center justify-center gap-2 hover:bg-brand-pink"
 >
 <Plus size={14} /> CREATE NEW STORY
 </button>

 <div className="space-y-6">
 <h3 className="font-display text-[11px] font-black text-brand-ink uppercase tracking-widest border-b border-brand-ink/10 pb-2 mt-8">
 {editingNewsId ?"EDITING STORY":"NEW STORY CONTENT"}
 </h3>
 
 <div className="space-y-4">
 <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Title (EN)</label><input type="text"value={newsTitle} onChange={(e) => setNewsTitle(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs"/></div>
 <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Title (TH)</label><input type="text"value={newsTitleThai} onChange={(e) => setNewsTitleThai(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs"/></div>
 <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Excerpt (EN)</label><textarea rows={3} value={newsExcerpt} onChange={(e) => setNewsExcerpt(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs"/></div>
 <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Excerpt (TH)</label><textarea rows={3} value={newsExcerptThai} onChange={(e) => setNewsExcerptThai(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs"/></div>
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Date (YYYY-MM-DD)</label><input type="text"value={newsDate} onChange={(e) => setNewsDate(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs font-display"/></div>
 <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Rank (Higher = First)</label><input type="number"value={newsRank} onChange={(e) => setNewsRank(parseInt(e.target.value) || 0)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs font-display"/></div>
 </div>
 <ImageUploadWidget id="news_img"label="COVER IMAGE"value={newsImage} onChange={setNewsImage} />
 <div className="space-y-1.5">
 <label className="font-display text-[9px] font-bold uppercase">Content (Markdown - EN)</label>
 <textarea rows={10} value={newsContent} onChange={(e) => setNewsContent(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs font-display leading-relaxed"/>
 </div>
 <div className="space-y-1.5">
 <label className="font-display text-[9px] font-bold uppercase">Content (Markdown - TH)</label>
 <textarea rows={10} value={newsContentThai} onChange={(e) => setNewsContentThai(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs font-display leading-relaxed"/>
 </div>
 <div className="flex items-center gap-2 py-2">
 <input type="checkbox"id="news_vis"checked={newsIsVisible} onChange={(e) => setNewsIsVisible(e.target.checked)} className="h-4 w-4 accent-brand-pink"/>
 <label htmlFor="news_vis"className="font-display text-[9px] font-bold uppercase">PUBLICLY VISIBLE</label>
 </div>
 </div>
 <div className="flex gap-4 pt-4 border-t border-brand-ink/10">
 <button onClick={() => { setEditingNewsId(null); setNewsTitle(""); setNewsTitleThai(""); setNewsExcerpt(""); setNewsExcerptThai(""); setNewsContent(""); setNewsContentThai(""); setNewsImage(""); setNewsDate(""); setNewsRank(0); setNewsIsVisible(true); }} className="flex-1 bg-brand-stone py-3 font-display text-[10px] font-bold uppercase hover:bg-stone-200">CLEAR FORM</button>
 <button onClick={handleSaveNews} className="flex-1 bg-brand-ink text-brand-neutral py-3 font-display text-[10px] font-bold uppercase hover:bg-brand-pink flex justify-center items-center gap-1.5"><Save size={12} /> SAVE STORY</button>
 </div>
 </div>

 <div className="pt-12">
 <h3 className="font-display text-[11px] font-black text-brand-ink uppercase tracking-widest border-b border-brand-ink/10 pb-2 mb-4">PUBLISHED STORIES</h3>
 <div className="space-y-3">
 {(dbState.news || []).map((item) => (
 <div key={item.id} className="border border-stone-200 p-4 bg-brand-neutral hover:border-brand-pink transition-colors">
 <div className="flex items-center justify-between mb-2">
 <span className="font-display text-[9px] text-stone-400">{item.publishDate}</span>
 {item.isVisible === false && <span className="text-red-500 font-display text-[9px] font-bold">HIDDEN</span>}
 </div>
 <h4 className="font-display text-xs font-bold uppercase line-clamp-1">{item.title}</h4>
 <div className="flex gap-2 mt-4">
 <button onClick={() => handleEditNewsTrigger(item)} className="flex-1 bg-brand-stone py-1.5 font-display text-[9px] font-bold uppercase hover:bg-stone-200 flex justify-center items-center gap-1"><Edit size={10} /> Edit</button>
 <button onClick={() => handleDeleteNewsCall(item.id)} className="flex-1 bg-red-50 text-red-600 py-1.5 font-display text-[9px] font-bold uppercase hover:bg-red-100 flex justify-center items-center gap-1"><Trash2 size={10} /> Delete</button>
 </div>
 </div>
 ))}
 </div>
 </div>

 </div>
 </div>
 );

 case"club":
 return (
 <div className="space-y-12">
 <div className="space-y-6">
 <h2 className="font-display text-lg font-bold uppercase tracking-wider text-brand-ink flex items-center gap-2 border-b border-brand-ink/10 pb-2">
 <Sparkles size={20} className="text-brand-pink"/> EDIT CLUB ACTIVITIES PAGE
 </h2>
 
 <div className="bg-brand-stone border border-brand-ink/5 p-4 space-y-4">
 <h3 className="font-display text-[10px] font-black text-brand-ink uppercase tracking-widest border-b border-brand-ink/10 pb-2">Visibility Toggles</h3>
 <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
 <div className="flex items-center gap-2"><input type="checkbox"id="show_philosophy"checked={caShowPhilosophy} onChange={(e) => setCaShowPhilosophy(e.target.checked)} className="h-3.5 w-3.5 accent-brand-pink"/><label htmlFor="show_philosophy"className="font-display text-[9px] font-bold uppercase">Philosophy</label></div>
 <div className="flex items-center gap-2"><input type="checkbox"id="show_captain"checked={caShowCaptainMandate} onChange={(e) => setCaShowCaptainMandate(e.target.checked)} className="h-3.5 w-3.5 accent-brand-pink"/><label htmlFor="show_captain"className="font-display text-[9px] font-bold uppercase">Captain</label></div>
 <div className="flex items-center gap-2"><input type="checkbox"id="show_competitions"checked={caShowCompetitions} onChange={(e) => setCaShowCompetitions(e.target.checked)} className="h-3.5 w-3.5 accent-brand-pink"/><label htmlFor="show_competitions"className="font-display text-[9px] font-bold uppercase">Tournaments</label></div>
 <div className="flex items-center gap-2"><input type="checkbox"id="show_training"checked={caShowTraining} onChange={(e) => setCaShowTraining(e.target.checked)} className="h-3.5 w-3.5 accent-brand-pink"/><label htmlFor="show_training"className="font-display text-[9px] font-bold uppercase">Training</label></div>
 <div className="flex items-center gap-2"><input type="checkbox"id="show_legacy"checked={caShowLegacy} onChange={(e) => setCaShowLegacy(e.target.checked)} className="h-3.5 w-3.5 accent-brand-pink"/><label htmlFor="show_legacy"className="font-display text-[9px] font-bold uppercase">Legacy</label></div>
 </div>
 </div>
 
 <div className="space-y-8">
 <div className="space-y-4">
 <h3 className="font-display text-[11px] font-black text-brand-ink uppercase tracking-widest border-b border-brand-ink/10 pb-2">Hero Section</h3>
 <ImageUploadWidget id="ca_hero_image"label="HERO BACKGROUND IMAGE"value={caHeroImageUrl} onChange={setCaHeroImageUrl} />
 </div>
 
 <div className="space-y-4">
  <h3 className="font-display text-[11px] font-black text-brand-ink uppercase tracking-widest border-b border-brand-ink/10 pb-2">Philosophy Section</h3>
  <div className="grid grid-cols-2 gap-4">
    <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Title (EN)</label><input type="text"value={caPhilosophyTitle} onChange={(e) => setCaPhilosophyTitle(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs focus:outline-none"/></div>
    <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Title (TH)</label><input type="text"value={caPhilosophyTitleThai} onChange={(e) => setCaPhilosophyTitleThai(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs focus:outline-none"/></div>
  </div>
  <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Quote (EN)</label><textarea rows={2} value={caPhilosophyQuote} onChange={(e) => setCaPhilosophyQuote(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs focus:outline-none italic"/></div>
  <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Quote (TH)</label><textarea rows={2} value={caPhilosophyQuoteThai} onChange={(e) => setCaPhilosophyQuoteThai(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs focus:outline-none italic"/></div>
  <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Description (EN)</label><textarea rows={4} value={caPhilosophyDescription} onChange={(e) => setCaPhilosophyDescription(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs focus:outline-none"/></div>
  <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Description (TH)</label><textarea rows={4} value={caPhilosophyDescriptionThai} onChange={(e) => setCaPhilosophyDescriptionThai(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs focus:outline-none"/></div>
  <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Technical Excellence (EN)</label><textarea rows={4} value={caTechnicalExcellenceDescription} onChange={(e) => setCaTechnicalExcellenceDescription(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs focus:outline-none"/></div>
  <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Technical Excellence (TH)</label><textarea rows={4} value={caTechnicalExcellenceDescriptionThai} onChange={(e) => setCaTechnicalExcellenceDescriptionThai(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs focus:outline-none"/></div>
  </div>

  <div className="space-y-4">
  <h3 className="font-display text-[11px] font-black text-brand-ink uppercase tracking-widest border-b border-brand-ink/10 pb-2">Captain's Mandate</h3>
  <div className="grid grid-cols-2 gap-4">
  <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Name (EN)</label><input type="text"value={caCaptainName} onChange={(e) => setCaCaptainName(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs focus:outline-none"/></div>
  <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Name (TH)</label><input type="text"value={caCaptainNameThai} onChange={(e) => setCaCaptainNameThai(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs focus:outline-none"/></div>
  <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Role (EN)</label><input type="text"value={caCaptainRole} onChange={(e) => setCaCaptainRole(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs focus:outline-none"/></div>
  <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Role (TH)</label><input type="text"value={caCaptainRoleThai} onChange={(e) => setCaCaptainRoleThai(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs focus:outline-none"/></div>
  </div>
  <ImageUploadWidget id="ca_captain_img"label="CAPTAIN IMAGE"value={caCaptainImageUrl} onChange={setCaCaptainImageUrl} />
  <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Philosophy (EN)</label><textarea rows={4} value={caCaptainPhilosophy} onChange={(e) => setCaCaptainPhilosophy(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs focus:outline-none"/></div>
  <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Philosophy (TH)</label><textarea rows={4} value={caCaptainPhilosophyThai} onChange={(e) => setCaCaptainPhilosophyThai(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs focus:outline-none"/></div>
  </div>

 <div className="space-y-4">
 <h3 className="font-display text-[11px] font-black text-brand-ink uppercase tracking-widest border-b border-brand-ink/10 pb-2 flex justify-between items-center">
 <span>Major Competitions</span>
 <button onClick={handleAddCompetition} className="bg-brand-ink text-brand-neutral px-3 py-1 font-display text-[8px] font-black uppercase flex items-center gap-1"><Plus size={10} /> ADD COMPETITION</button>
 </h3>
 <div className="space-y-4">
 {caCompetitions.map((comp) => (
 <div key={comp.id} className="border border-stone-200 p-4 space-y-3 bg-brand-stone relative text-left">
 <button onClick={() => handleDeleteCompetition(comp.id)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition-colors cursor-pointer"><Trash2 size={12} /></button>
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-1.5">
 <label className="font-display text-[9px] font-bold uppercase">Activity Title (EN)</label>
 <input type="text"value={comp.title} onChange={(e) => handleUpdateCompetition(comp.id, { title: e.target.value })} placeholder="Title"className="w-full bg-brand-neutral border border-brand-ink/10 p-2 text-xs focus:outline-none font-bold"/>
 </div>
 <div className="space-y-1.5">
 <label className="font-display text-[9px] font-bold uppercase">Activity Title (TH)</label>
 <input type="text"value={comp.titleThai || ""} onChange={(e) => handleUpdateCompetition(comp.id, { titleThai: e.target.value })} placeholder="ชื่อภาษาไทย"className="w-full bg-brand-neutral border border-brand-ink/10 p-2 text-xs focus:outline-none font-bold"/>
 </div>
 </div>
 <div className="grid grid-cols-3 gap-4">
 <div className="space-y-1.5">
 <label className="font-display text-[9px] font-bold uppercase">Difficulty (EN)</label>
 <input type="text"value={comp.difficulty} onChange={(e) => handleUpdateCompetition(comp.id, { difficulty: e.target.value })} placeholder="Difficulty/Level"className="w-full bg-brand-neutral border border-brand-ink/10 p-2 text-xs focus:outline-none font-display"/>
 </div>
 <div className="space-y-1.5">
 <label className="font-display text-[9px] font-bold uppercase">Difficulty (TH)</label>
 <input type="text"value={comp.difficultyThai || ""} onChange={(e) => handleUpdateCompetition(comp.id, { difficultyThai: e.target.value })} placeholder="ความยากภาษาไทย"className="w-full bg-brand-neutral border border-brand-ink/10 p-2 text-xs focus:outline-none font-display"/>
 </div>
 <div className="space-y-1.5">
 <label className="font-display text-[9px] font-bold uppercase">Activity Date</label>
 <input type="date"value={comp.date || ""} onChange={(e) => handleUpdateCompetition(comp.id, { date: e.target.value })} className="w-full bg-brand-neutral border border-brand-ink/10 p-2 text-xs focus:outline-none font-display"/>
 </div>
 </div>
 <ImageUploadWidget id={`comp_img_${comp.id}`}label="Activity Photo"value={comp.imageUrl || ""} onChange={(url) => handleUpdateCompetition(comp.id, { imageUrl: url })} />
 <div className="space-y-1.5">
 <label className="font-display text-[9px] font-bold uppercase">Description (EN)</label>
 <textarea rows={2} value={comp.description} onChange={(e) => handleUpdateCompetition(comp.id, { description: e.target.value })} placeholder="Description"className="w-full bg-brand-neutral border border-brand-ink/10 p-2 text-xs focus:outline-none"/>
 </div>
 <div className="space-y-1.5">
 <label className="font-display text-[9px] font-bold uppercase">Description (TH)</label>
 <textarea rows={2} value={comp.descriptionThai || ""} onChange={(e) => handleUpdateCompetition(comp.id, { descriptionThai: e.target.value })} placeholder="คำอธิบายภาษาไทย"className="w-full bg-brand-neutral border border-brand-ink/10 p-2 text-xs focus:outline-none"/>
 </div>
 </div>
 ))}
 </div>
 </div>

 <div className="space-y-4">
 <h3 className="font-display text-[11px] font-black text-brand-ink uppercase tracking-widest border-b border-brand-ink/10 pb-2">Training & Legacy</h3>
 <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Training Description (EN)</label><textarea rows={4} value={caTrainingDescription} onChange={(e) => setCaTrainingDescription(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs focus:outline-none"/></div>
 <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Training Description (TH)</label><textarea rows={4} value={caTrainingDescriptionThai} onChange={(e) => setCaTrainingDescriptionThai(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs focus:outline-none"/></div>
 <div className="space-y-1.5 mt-4"><label className="font-display text-[9px] font-bold uppercase">Legacy Description (EN)</label><textarea rows={3} value={caLegacyDescription} onChange={(e) => setCaLegacyDescription(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs focus:outline-none"/></div>
 <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Legacy Description (TH)</label><textarea rows={3} value={caLegacyDescriptionThai} onChange={(e) => setCaLegacyDescriptionThai(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs focus:outline-none"/></div>
 <div className="grid grid-cols-3 gap-4">
 <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Founded Year</label><input type="text"value={caFoundedYear} onChange={(e) => setCaFoundedYear(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs focus:outline-none font-display"/></div>
 <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Active Years (EN)</label><input type="text"value={caActiveYears} onChange={(e) => setCaActiveYears(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs focus:outline-none font-display"/></div>
 <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Active Years (TH)</label><input type="text"value={caActiveYearsThai} onChange={(e) => setCaActiveYearsThai(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs focus:outline-none font-display"/></div>
 </div>
 </div>

 </div>

 <div className="pt-8 border-t border-brand-ink/10">
 <button onClick={handleUpdateClubActivity} className="w-full bg-brand-ink text-brand-neutral hover:bg-brand-pink px-6 py-4 font-display text-sm font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-colors cursor-pointer">
 <Save size={16} /> SAVE CLUB ACTIVITIES
 </button>
 </div>
 </div>
 </div>
 );

 case"roster":
 return (
 <div className="space-y-12">
 <div className="space-y-6">
 <h2 className="font-display text-lg font-bold uppercase tracking-wider text-brand-ink flex items-center gap-2 border-b border-brand-ink/10 pb-2">
 <Users size={20} className="text-brand-pink"/> VARSITY ROSTER
 </h2>
 
 <button 
 onClick={() => { setEditingPlayerId(null); setPlayerName(""); setPlayerHandicap(1.5); setPlayerYear("Freshman"); setPlayerFaculty(""); setPlayerImage(""); setPlayerIsFeatured(false); setPlayerIsVisible(true); window.scrollTo({ top: 0, behavior:"smooth"}); }}
 className="w-full bg-brand-ink text-brand-neutral py-3 font-display text-[10px] font-bold uppercase flex items-center justify-center gap-2 hover:bg-brand-pink"
 >
 <Plus size={14} /> ADD NEW PLAYER
 </button>

 <div className="space-y-6 mt-8">
 <h3 className="font-display text-[11px] font-black text-brand-ink uppercase tracking-widest border-b border-brand-ink/10 pb-2">
 {editingPlayerId ?"EDITING PLAYER":"NEW PLAYER FORM"}
 </h3>
 <div className="space-y-4">
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Name (EN)</label><input type="text"value={playerName} onChange={(e) => setPlayerName(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs"/></div>
 <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Name (TH)</label><input type="text"value={playerNameThai} onChange={(e) => setPlayerNameThai(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs"/></div>
 </div>
 <div className="grid grid-cols-3 gap-4">
 <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Handicap</label><input type="number"step="0.1"value={playerHandicap} onChange={(e) => setPlayerHandicap(parseFloat(e.target.value) || 0)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs font-display"/></div>
 <div className="space-y-1.5">
 <label className="font-display text-[9px] font-bold uppercase">Year (EN)</label>
 <select value={playerYear} onChange={(e) => setPlayerYear(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs">
 <option value="Freshman">Freshman</option><option value="Sophomore">Sophomore</option><option value="Junior">Junior</option><option value="Senior">Senior</option><option value="Alumni">Alumni</option>
 </select>
 </div>
 <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Year (TH)</label><input type="text"value={playerYearThai} onChange={(e) => setPlayerYearThai(e.target.value)} placeholder="e.g. ปี 1" className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs"/></div>
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Faculty (EN)</label><input type="text"value={playerFaculty} onChange={(e) => setPlayerFaculty(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs"/></div>
 <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Faculty (TH)</label><input type="text"value={playerFacultyThai} onChange={(e) => setPlayerFacultyThai(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs"/></div>
 </div>
 <ImageUploadWidget id="player_img"label="HEADSHOT IMAGE"value={playerImage} onChange={setPlayerImage} />
 <div className="flex items-center gap-4 py-2">
 <div className="flex items-center gap-2"><input type="checkbox"id="p_feat"checked={playerIsFeatured} onChange={(e) => setPlayerIsFeatured(e.target.checked)} className="h-4 w-4 accent-brand-pink"/><label htmlFor="p_feat"className="font-display text-[9px] font-bold uppercase">FEATURED (LEAD)</label></div>
 <div className="flex items-center gap-2"><input type="checkbox"id="p_vis"checked={playerIsVisible} onChange={(e) => setPlayerIsVisible(e.target.checked)} className="h-4 w-4 accent-brand-pink"/><label htmlFor="p_vis"className="font-display text-[9px] font-bold uppercase">VISIBLE</label></div>
 </div>
 </div>
 <div className="flex gap-4 pt-4 border-t border-brand-ink/10">
 <button onClick={() => { setEditingPlayerId(null); setPlayerName(""); setPlayerHandicap(1.5); setPlayerYear("Freshman"); setPlayerFaculty(""); setPlayerImage(""); setPlayerIsFeatured(false); setPlayerIsVisible(true); }} className="flex-1 bg-brand-stone py-3 font-display text-[10px] font-bold uppercase hover:bg-stone-200">CLEAR FORM</button>
 <button onClick={handleSavePlayer} className="flex-1 bg-brand-ink text-brand-neutral py-3 font-display text-[10px] font-bold uppercase hover:bg-brand-pink flex justify-center items-center gap-1.5"><Save size={12} /> SAVE PLAYER</button>
 </div>
 </div>

 <div className="pt-12">
 <h3 className="font-display text-[11px] font-black text-brand-ink uppercase tracking-widest border-b border-brand-ink/10 pb-2 mb-4">ACTIVE SQUAD REGISTRY</h3>
 <div className="space-y-3">
 {(dbState.roster || []).map((player) => (
 <div key={player.id} className="border border-stone-200 p-4 bg-brand-neutral hover:border-brand-pink transition-colors flex items-center gap-4 group">
 <div className="h-12 w-12 overflow-hidden bg-brand-stone shrink-0"><img src={player.imageUrl} className="w-full h-full object-cover"alt={player.name} /></div>
 <div className="flex-grow">
 <h4 className="font-display text-xs font-bold uppercase">{player.name} {player.isVisible === false && <span className="text-red-500 font-display">(HIDDEN)</span>}</h4>
 <p className="font-display text-[9px] text-stone-500">{player.year} • HDCP {player.handicap}</p>
 </div>
 <div className="flex flex-col gap-1 shrink-0">
 <button onClick={() => handleEditPlayerTrigger(player)} className="p-1.5 bg-brand-stone hover:bg-stone-200"><Edit size={10} /></button>
 <button onClick={() => handleDeletePlayerCall(player.id)} className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100"><Trash2 size={10} /></button>
 </div>
 </div>
 ))}
 </div>
 </div>

 </div>
 </div>
 );

 case"staff":
 return (
 <div className="space-y-12">
 <div className="space-y-6">
 <h2 className="font-display text-lg font-bold uppercase tracking-wider text-brand-ink flex items-center gap-2 border-b border-brand-ink/10 pb-2">
 <Users size={20} className="text-brand-pink"/> STAFF & BOARD
 </h2>
 
 <button 
 onClick={() => { setEditingStaffId(null); setStaffName(""); setStaffRole(""); setStaffFaculty(""); setStaffImage(""); setStaffOrder(1); setStaffIsVisible(true); window.scrollTo({ top: 0, behavior:"smooth"}); }}
 className="w-full bg-brand-ink text-brand-neutral py-3 font-display text-[10px] font-bold uppercase flex items-center justify-center gap-2 hover:bg-brand-pink"
 >
 <Plus size={14} /> ADD STAFF MEMBER
 </button>

 <div className="space-y-6 mt-8">
 <h3 className="font-display text-[11px] font-black text-brand-ink uppercase tracking-widest border-b border-brand-ink/10 pb-2">
 {editingStaffId ?"EDITING STAFF":"NEW STAFF FORM"}
 </h3>
 <div className="space-y-4">
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Name (EN)</label><input type="text"value={staffName} onChange={(e) => setStaffName(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs"/></div>
 <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Name (TH)</label><input type="text"value={staffNameThai} onChange={(e) => setStaffNameThai(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs"/></div>
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Role (EN)</label><input type="text"value={staffRole} onChange={(e) => setStaffRole(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs"/></div>
 <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Role (TH)</label><input type="text"value={staffRoleThai} onChange={(e) => setStaffRoleThai(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs"/></div>
 </div>
 <div className="grid grid-cols-3 gap-4">
 <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Year / Faculty (EN)</label><input type="text"value={staffFaculty} onChange={(e) => setStaffFaculty(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs"/></div>
 <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Year / Faculty (TH)</label><input type="text"value={staffFacultyThai} onChange={(e) => setStaffFacultyThai(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs"/></div>
 <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Order (1=First)</label><input type="number"value={staffOrder} onChange={(e) => setStaffOrder(parseInt(e.target.value) || 1)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs font-display"/></div>
 </div>
 <ImageUploadWidget id="staff_img"label="HEADSHOT IMAGE"value={staffImage} onChange={setStaffImage} />
 <div className="flex items-center gap-2 py-2">
 <input type="checkbox"id="s_vis"checked={staffIsVisible} onChange={(e) => setStaffIsVisible(e.target.checked)} className="h-4 w-4 accent-brand-pink"/>
 <label htmlFor="s_vis"className="font-display text-[9px] font-bold uppercase">VISIBLE</label>
 </div>
 </div>
 <div className="flex gap-4 pt-4 border-t border-brand-ink/10">
 <button onClick={() => { setEditingStaffId(null); setStaffName(""); setStaffRole(""); setStaffFaculty(""); setStaffImage(""); setStaffOrder(1); setStaffIsVisible(true); }} className="flex-1 bg-brand-stone py-3 font-display text-[10px] font-bold uppercase hover:bg-stone-200">CLEAR FORM</button>
 <button onClick={handleSaveStaff} className="flex-1 bg-brand-ink text-brand-neutral py-3 font-display text-[10px] font-bold uppercase hover:bg-brand-pink flex justify-center items-center gap-1.5"><Save size={12} /> SAVE STAFF</button>
 </div>
 </div>

 <div className="pt-12">
 <h3 className="font-display text-[11px] font-black text-brand-ink uppercase tracking-widest border-b border-brand-ink/10 pb-2 mb-4">ACTIVE STAFF DIRECTORY</h3>
 <div className="space-y-3">
 {(dbState.staff || []).sort((a,b) => a.order - b.order).map((person) => (
 <div key={person.id} className="border border-stone-200 p-4 bg-brand-neutral hover:border-brand-pink transition-colors flex items-center gap-4 group">
 <div className="h-10 w-10 bg-brand-stone shrink-0"><img src={person.imageUrl} className="w-full h-full object-cover"alt={person.name} /></div>
 <div className="flex-grow">
 <h4 className="font-display text-xs font-bold uppercase">{person.name} {person.isVisible === false && <span className="text-red-500 font-display">(HIDDEN)</span>}</h4>
 <p className="font-display text-[9px] text-stone-500">{person.role} • {person.year}</p>
 </div>
 <div className="flex flex-col gap-1 shrink-0">
 <button onClick={() => handleEditStaffTrigger(person)} className="p-1.5 bg-brand-stone hover:bg-stone-200"><Edit size={10} /></button>
 <button onClick={() => handleDeleteStaffCall(person.id)} className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100"><Trash2 size={10} /></button>
 </div>
 </div>
 ))}
 </div>
 </div>

 </div>
 </div>
 );

 case"scores":
 return (
 <div className="space-y-12">
 <div className="space-y-6">
 <h2 className="font-display text-lg font-bold uppercase tracking-wider text-brand-ink flex items-center gap-2 border-b border-brand-ink/10 pb-2">
 <Trophy size={20} className="text-brand-pink"/> SCORES & STATS
 </h2>
 
 <button 
 onClick={() => { setEditingScoreId(null); setScoreTournamentName(""); setScoreDate(""); setScoreResult(""); setScoreList([{ playerName:"", score: 72, position:""}]); setScoreIsVisible(true); window.scrollTo({ top: 0, behavior:"smooth"}); }}
 className="w-full bg-brand-ink text-brand-neutral py-3 font-display text-[10px] font-bold uppercase flex items-center justify-center gap-2 hover:bg-brand-pink"
 >
 <Plus size={14} /> LOG NEW TOURNAMENT
 </button>

 <div className="space-y-6 mt-8">
 <h3 className="font-display text-[11px] font-black text-brand-ink uppercase tracking-widest border-b border-brand-ink/10 pb-2">
 {editingScoreId ?"EDITING TOURNAMENT":"NEW TOURNAMENT FORM"}
 </h3>
 <div className="space-y-4">
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Tournament Name (EN)</label><input type="text"value={scoreTournamentName} onChange={(e) => setScoreTournamentName(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs"/></div>
 <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Tournament Name (TH)</label><input type="text"value={scoreTournamentNameThai} onChange={(e) => setScoreTournamentNameThai(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs"/></div>
 </div>
 <div className="grid grid-cols-3 gap-4">
 <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Date (YYYY-MM-DD)</label><input type="text"value={scoreDate} onChange={(e) => setScoreDate(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs font-display"/></div>
 <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Overall Result (EN)</label><input type="text"value={scoreResult} onChange={(e) => setScoreResult(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs"/></div>
 <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Overall Result (TH)</label><input type="text"value={scoreResultThai} onChange={(e) => setScoreResultThai(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs"/></div>
 </div>
 <div className="flex items-center gap-2 py-1">
 <input type="checkbox"id="score_vis"checked={scoreIsVisible} onChange={(e) => setScoreIsVisible(e.target.checked)} className="h-4 w-4 accent-brand-pink"/>
 <label htmlFor="score_vis"className="font-display text-[9px] font-bold uppercase">VISIBLE</label>
 </div>
 
 <div className="border border-stone-200 p-4 bg-brand-stone space-y-4">
 <div className="flex justify-between items-center border-b border-stone-200 pb-2">
 <span className="font-display text-[10px] font-bold uppercase">Player Scores</span>
 <button onClick={handleAddPlayerScoreRow} className="bg-brand-ink text-brand-neutral px-2 py-1 font-display text-[8px] flex items-center gap-1"><Plus size={10}/> ADD ROW</button>
 </div>
 {scoreList.map((row, idx) => (
  <div key={idx} className="flex flex-col md:flex-row gap-2 items-start md:items-center bg-brand-neutral p-2 border border-stone-200 w-full">
  <div className="flex flex-1 gap-2 w-full">
  <input type="text"value={row.playerName} placeholder="Name (EN)"onChange={(e) => handleUpdatePlayerScoreRow(idx,"playerName", e.target.value)} className="flex-1 bg-brand-stone/40 text-xs p-1 focus:outline-none font-bold border border-stone-100"/>
  <input type="text"value={row.playerNameThai || ""} placeholder="Name (TH)"onChange={(e) => handleUpdatePlayerScoreRow(idx,"playerNameThai", e.target.value)} className="flex-1 bg-brand-stone/40 text-xs p-1 focus:outline-none font-bold border border-stone-100"/>
  </div>
  <div className="flex gap-2 w-full md:w-auto shrink-0 items-center justify-between">
  <input type="number"value={row.score} placeholder="Score"onChange={(e) => handleUpdatePlayerScoreRow(idx,"score", parseInt(e.target.value)||72)} className="w-16 bg-brand-stone/40 text-xs p-1 font-display text-center focus:outline-none border border-stone-100"/>
  <input type="text"value={row.position} placeholder="Pos (EN)"onChange={(e) => handleUpdatePlayerScoreRow(idx,"position", e.target.value)} className="w-20 bg-brand-stone/40 text-xs p-1 text-center text-brand-pink font-bold focus:outline-none border border-stone-100"/>
  <input type="text"value={row.positionThai || ""} placeholder="Pos (TH)"onChange={(e) => handleUpdatePlayerScoreRow(idx,"positionThai", e.target.value)} className="w-20 bg-brand-stone/40 text-xs p-1 text-center text-brand-pink font-bold focus:outline-none border border-stone-100"/>
  <button onClick={() => handleRemovePlayerScoreRow(idx)} className="text-red-500 p-1 hover:bg-red-50 rounded shrink-0"><X size={12}/></button>
  </div>
  </div>
  ))}
 </div>
 </div>
 <div className="flex gap-4 pt-4 border-t border-brand-ink/10">
 <button onClick={() => { setEditingScoreId(null); setScoreTournamentName(""); setScoreDate(""); setScoreResult(""); setScoreList([{ playerName:"", score: 72, position:""}]); setScoreIsVisible(true); }} className="flex-1 bg-brand-stone py-3 font-display text-[10px] font-bold uppercase hover:bg-stone-200">CLEAR FORM</button>
 <button onClick={handleSaveTournament} className="flex-1 bg-brand-ink text-brand-neutral py-3 font-display text-[10px] font-bold uppercase hover:bg-brand-pink flex justify-center items-center gap-1.5"><Save size={12} /> SAVE LEADERBOARD</button>
 </div>
 </div>

 <div className="pt-12">
 <h3 className="font-display text-[11px] font-black text-brand-ink uppercase tracking-widest border-b border-brand-ink/10 pb-2 mb-4">REGISTERED MATCH LOGS</h3>
 <div className="space-y-3">
 {(dbState.scores || []).map((score) => (
 <div key={score.id} className="border border-brand-ink/10 bg-brand-neutral p-4 space-y-3 flex flex-col justify-between hover:border-brand-ink">
 <div className="space-y-1.5">
 <span className="font-display text-[9px] text-brand-ink/40 block uppercase">
 {score.date} • {score.result}
 </span>
 </div>
 <h4 className="font-display text-xs font-bold uppercase text-brand-ink leading-tight">
 {score.tournamentName}
 {score.isVisible === false && <span className="text-red-500 ml-2 font-display text-[9px] font-bold">(HIDDEN)</span>}
 </h4>
 <div className="text-[10px] text-stone-500 font-display">
 Field size: {score.scoresList?.length || 0} players.
 </div>
 <div className="flex items-center gap-3 pt-2 border-t border-brand-ink/5">
 <button onClick={() => handleEditScoreTrigger(score)} className="inline-flex items-center gap-1 font-display text-[10px] text-blue-600 hover:underline cursor-pointer"><Edit size={11} /> REVISE</button>
 <span>•</span>
 <button onClick={() => handleDeleteScoreCall(score.id)} className="inline-flex items-center gap-1 font-display text-[10px] text-red-600 hover:underline cursor-pointer"><Trash2 size={11} /> DELETE</button>
 </div>
 </div>
 ))}
 </div>
 </div>

 </div>
 </div>
 );

 case "portal-events":
   return (
     <div className="space-y-12">
       <div className="space-y-6">
         <h2 className="font-display text-lg font-bold uppercase tracking-wider text-brand-ink flex items-center gap-2 border-b border-brand-ink/10 pb-2">
           <Calendar size={20} className="text-brand-pink" /> PORTAL EVENTS
         </h2>
         <button
           onClick={() => { clearEventForm(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
           className="w-full bg-brand-ink text-brand-neutral py-3 font-display text-[10px] font-bold uppercase flex items-center justify-center gap-2 hover:bg-brand-pink"
         >
           <Plus size={14} /> ADD NEW EVENT
         </button>

         <div className="space-y-6 mt-8">
           <h3 className="font-display text-[11px] font-black text-brand-ink uppercase tracking-widest border-b border-brand-ink/10 pb-2">
             {editingEventId ? "EDITING EVENT" : "NEW EVENT FORM"}
           </h3>
           <div className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Title (EN)</label><input type="text" value={evtTitle} onChange={e => setEvtTitle(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs font-bold" /></div>
               <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Title (TH)</label><input type="text" value={evtTitleThai} onChange={e => setEvtTitleThai(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs" /></div>
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Date (YYYY-MM-DD)</label><input type="date" value={evtDate} onChange={e => setEvtDate(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs" /></div>
               <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Time</label><input type="time" value={evtTime} onChange={e => setEvtTime(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs" /></div>
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Location (EN)</label><input type="text" value={evtLocation} onChange={e => setEvtLocation(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs" /></div>
               <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Location (TH)</label><input type="text" value={evtLocationThai} onChange={e => setEvtLocationThai(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs" /></div>
             </div>
             <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Description (EN)</label><textarea rows={3} value={evtDescription} onChange={e => setEvtDescription(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs" /></div>
             <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Description (TH)</label><textarea rows={3} value={evtDescriptionThai} onChange={e => setEvtDescriptionThai(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs" /></div>
             <ImageUploadWidget id="evt_img" label="EVENT IMAGE" value={evtImageUrl} onChange={setEvtImageUrl} />
             <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Google Form URL (Registration Link)</label><input type="url" value={evtGoogleFormUrl} onChange={e => setEvtGoogleFormUrl(e.target.value)} placeholder="https://docs.google.com/forms/..." className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs" /></div>
             <div className="space-y-1.5">
               <label className="font-display text-[9px] font-bold uppercase">Registration Status</label>
               <select value={evtRegistrationStatus} onChange={e => setEvtRegistrationStatus(e.target.value as any)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs font-bold">
                 <option value="open">Open — shows Register Now button</option>
                 <option value="not_open">Not Open Yet — coming soon</option>
                 <option value="delayed">Delayed — postponed</option>
                 <option value="closed">Closed — registration ended</option>
               </select>
             </div>
             <div className="flex items-center gap-2">
               <input type="checkbox" id="evt_visible" checked={evtIsVisible} onChange={e => setEvtIsVisible(e.target.checked)} className="h-4 w-4 accent-brand-pink" />
               <label htmlFor="evt_visible" className="font-display text-[9px] font-bold uppercase">VISIBLE TO MEMBERS</label>
             </div>
           </div>
           <div className="flex gap-4 pt-4 border-t border-brand-ink/10">
             <button onClick={clearEventForm} className="flex-1 bg-brand-stone py-3 font-display text-[10px] font-bold uppercase hover:bg-stone-200">CLEAR FORM</button>
             <button onClick={handleSaveEvent} className="flex-1 bg-brand-ink text-brand-neutral py-3 font-display text-[10px] font-bold uppercase hover:bg-brand-pink flex justify-center items-center gap-1.5"><Save size={12} /> SAVE EVENT</button>
           </div>
         </div>

         <div className="pt-12">
           <h3 className="font-display text-[11px] font-black text-brand-ink uppercase tracking-widest border-b border-brand-ink/10 pb-2 mb-4">ALL EVENTS</h3>
           <div className="space-y-3">
             {(dbState.memberEvents || []).map(evt => (
               <div key={evt.id} className="border border-stone-200 p-4 bg-brand-neutral flex items-start justify-between gap-4 hover:border-brand-pink transition-colors">
                 <div className="flex-grow space-y-1">
                   <div className="flex items-center gap-2 flex-wrap">
                     <h4 className="font-display text-xs font-bold uppercase">{evt.title}</h4>
                     <span className={`text-[8px] font-display font-bold px-1.5 py-0.5 ${
                       (evt.registrationStatus || (evt.registrationOpen ? "open" : "closed")) === "open" ? "bg-emerald-100 text-emerald-700" :
                       (evt.registrationStatus === "not_open") ? "bg-amber-100 text-amber-700" :
                       (evt.registrationStatus === "delayed") ? "bg-yellow-100 text-yellow-700" :
                       "bg-stone-100 text-stone-500"}`}>
                       {evt.registrationStatus === "not_open" ? "NOT OPEN YET" :
                        evt.registrationStatus === "delayed" ? "DELAYED" :
                        evt.registrationOpen || evt.registrationStatus === "open" ? "REG OPEN" : "REG CLOSED"}
                     </span>
                     <span className={`text-[8px] font-display font-bold px-1.5 py-0.5 ${evt.isVisible ? "bg-blue-100 text-blue-700" : "bg-stone-100 text-stone-500"}`}>
                       {evt.isVisible ? "VISIBLE" : "HIDDEN"}
                     </span>
                   </div>
                   <p className="font-display text-[9px] text-stone-500">
                     {evt.date ? fmtDate(evt.date) : "No date"}{evt.time ? ` · ${evt.time}` : ""}{evt.location ? ` · ${evt.location}` : ""}
                   </p>
                   {evt.googleFormUrl && <p className="font-display text-[9px] text-blue-500 truncate">{evt.googleFormUrl}</p>}
                 </div>
                 <div className="flex gap-1 shrink-0">
                   <button onClick={() => handleEditEventTrigger(evt)} className="p-1.5 bg-brand-stone hover:bg-stone-200"><Edit size={10} /></button>
                   <button onClick={() => handleDeleteEvent(evt.id)} className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100"><Trash2 size={10} /></button>
                 </div>
               </div>
             ))}
             {(dbState.memberEvents || []).length === 0 && (
               <p className="text-[10px] font-display text-stone-400 text-center py-8">No events yet. Add one above.</p>
             )}
           </div>
         </div>
       </div>
     </div>
   );

 case "sponsors":
   return (
     <div className="space-y-12">
       <div className="space-y-6">
         <h2 className="font-display text-lg font-bold uppercase tracking-wider text-brand-ink flex items-center gap-2 border-b border-brand-ink/10 pb-2">
           <Award size={20} className="text-brand-pink" /> SPONSORS & PARTNERS
         </h2>

         <button 
           onClick={() => { setEditingSponsorId(null); setSponName(""); setSponDescription(""); setSponWebsiteUrl(""); setSponImageUrl(""); setSponIsActive(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}
           className="w-full bg-brand-ink text-brand-neutral py-3 font-display text-[10px] font-bold uppercase flex items-center justify-center gap-2 hover:bg-brand-pink"
         >
           <Plus size={14} /> REGISTER CORPORATE PARTNER
         </button>

         <div className="space-y-6 mt-8">
           <h3 className="font-display text-[11px] font-black text-brand-ink uppercase tracking-widest border-b border-brand-ink/10 pb-2">
             {editingSponsorId ? "EDITING PARTNER" : "NEW PARTNER FORM"}
           </h3>
           <div className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Partner Name (EN)</label><input type="text" value={sponName} onChange={(e) => setSponName(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs font-bold" /></div>
               <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Partner Name (TH)</label><input type="text" value={sponNameThai} onChange={(e) => setSponNameThai(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs" /></div>
             </div>
             <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Description (EN)</label><textarea rows={3} value={sponDescription} onChange={(e) => setSponDescription(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs" /></div>
             <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Description (TH)</label><textarea rows={3} value={sponDescriptionThai} onChange={(e) => setSponDescriptionThai(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs" /></div>
             <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Website URL</label><input type="text" value={sponWebsiteUrl} onChange={(e) => setSponWebsiteUrl(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs" /></div>
             <ImageUploadWidget id="spon_logo" label="SPONSOR LOGO IMAGE URL" value={sponImageUrl} onChange={setSponImageUrl} helperText="Transparent PNG is required." />
             <div className="flex items-center gap-2 py-1">
               <input type="checkbox" id="spon_active" checked={sponIsActive} onChange={(e) => setSponIsActive(e.target.checked)} className="h-4 w-4 accent-brand-pink" />
               <label htmlFor="spon_active" className="font-display text-[9px] font-bold uppercase">ACTIVE CONTRACT (DISPLAYS ON SITE)</label>
             </div>
           </div>
           <div className="flex gap-4 pt-4 border-t border-brand-ink/10">
             <button onClick={() => { setEditingSponsorId(null); setSponName(""); setSponDescription(""); setSponWebsiteUrl(""); setSponImageUrl(""); setSponIsActive(true); }} className="flex-1 bg-brand-stone py-3 font-display text-[10px] font-bold uppercase hover:bg-stone-200">CLEAR FORM</button>
             <button onClick={handleSaveSponsor} className="flex-1 bg-brand-ink text-brand-neutral py-3 font-display text-[10px] font-bold uppercase hover:bg-brand-pink flex justify-center items-center gap-1.5"><Save size={12} /> SAVE PARTNER</button>
           </div>
         </div>

         <div className="pt-12">
           <h3 className="font-display text-[11px] font-black text-brand-ink uppercase tracking-widest border-b border-brand-ink/10 pb-2 mb-4">ACTIVE CORPORATE PARTNERS</h3>
           <div className="space-y-3">
             {(dbState.sponsors || []).map((spon) => (
               <div key={spon.id} className="border border-stone-200 p-4 bg-brand-neutral flex items-center justify-between group hover:border-brand-pink transition-colors gap-4">
                 <div className="flex items-center gap-4 w-full">
                   <div className="h-12 w-20 bg-brand-stone border border-stone-100 shrink-0 p-2">
                     {spon.imageUrl ? <img src={spon.imageUrl} className="w-full h-full object-contain" alt={spon.name} /> : <span className="text-[8px] text-stone-400">NO LOGO</span>}
                   </div>
                   <div className="flex-grow">
                     <h4 className="font-display text-xs font-bold uppercase">{spon.name}</h4>
                     <p className="font-display text-[9px] text-stone-500">{spon.isActive ? "ACTIVE" : "INACTIVE"} • {spon.websiteUrl || "No Link"}</p>
                   </div>
                   <div className="flex gap-1 shrink-0">
                     <button onClick={() => handleEditSponsorTrigger(spon)} className="p-1.5 bg-brand-stone hover:bg-stone-200"><Edit size={10} /></button>
                     <button onClick={() => handleDeleteSponsorCall(spon.id)} className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100"><Trash2 size={10} /></button>
                   </div>
                 </div>
               </div>
             ))}
           </div>
         </div>
       </div>
     </div>
   );

 case "gallery":
   return (
     <div className="space-y-12">
       <div className="space-y-6">
         <h2 className="font-display text-lg font-bold uppercase tracking-wider text-brand-ink flex items-center gap-2 border-b border-brand-ink/10 pb-2">
           <Image size={20} className="text-brand-pink" /> FIELD PHOTOGRAPHY
         </h2>
         <div className="space-y-6">
           <h3 className="font-display text-[11px] font-black text-brand-ink uppercase tracking-widest border-b border-brand-ink/10 pb-2">CURATE NEW PHOTO</h3>
           <div className="space-y-4">
             <div className="space-y-1.5">
               <label className="font-display text-[9px] font-bold uppercase">Caption Title</label>
               <input type="text" value={galTitle} onChange={(e) => setGalTitle(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs" />
             </div>
             <ImageUploadWidget id="gal_img" label="GALLERY PHOTO" value={galUrl} onChange={setGalUrl} />
             <div className="space-y-1.5">
               <label className="font-display text-[9px] font-bold uppercase">Category</label>
               <select value={galCategory} onChange={(e) => setGalCategory(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs">
                 <option value="Tournament">Tournament Action</option>
                 <option value="Practice">Practice Session</option>
                 <option value="Training">Training & Drills</option>
                 <option value="Tech Analysis">High-Tech Diagnostics</option>
               </select>
             </div>
           </div>
           <button onClick={handleSaveGalleryImage} className="w-full bg-brand-ink text-brand-neutral py-3 font-display text-[10px] font-bold uppercase flex items-center justify-center gap-2 hover:bg-brand-pink">
             <Plus size={14} /> CURATE IMAGE
           </button>
         </div>

         <div className="pt-12">
           <h3 className="font-display text-[11px] font-black text-brand-ink uppercase tracking-widest border-b border-brand-ink/10 pb-2 mb-4">CURATED CABINET</h3>
           <div className="grid grid-cols-2 gap-4">
             {(dbState.gallery || []).map((img) => (
               <div key={img.id} className="group relative aspect-square border border-brand-ink/15 bg-brand-stone overflow-hidden">
                 <img src={img.imageUrl} alt={img.title} className="w-full h-full object-cover" />
                 <div className="absolute inset-x-0 bottom-0 bg-brand-ink/90 p-2 transform translate-y-full group-hover:translate-y-0 transition-transform">
                   <p className="text-[8px] text-brand-neutral font-bold uppercase line-clamp-1">{img.title}</p>
                   <button onClick={() => handleDeleteGalleryCall(img.id)} className="text-red-400 text-[8px] font-bold hover:underline mt-1 flex items-center gap-1">
                     <Trash2 size={8} /> DELETE
                   </button>
                 </div>
               </div>
             ))}
           </div>
         </div>
       </div>
     </div>
   );

 case "instagram":
   return (
     <div className="space-y-12">
       <div className="space-y-6">
         <h2 className="font-display text-lg font-bold uppercase tracking-wider text-brand-ink flex items-center gap-2 border-b border-brand-ink/10 pb-2">
           <Image size={20} className="text-brand-pink" /> INSTAGRAM FEED
         </h2>
         <p className="font-sans text-[11px] text-stone-500 leading-relaxed">
           Upload screenshots or photos from @cugolfclub posts. Paste the Instagram post URL so clicking the image opens the real post. Posts display on the homepage in a grid below the sponsor section.
         </p>
         <div className="space-y-4">
           <ImageUploadWidget id="ig_img" label="POST IMAGE / SCREENSHOT" value={igImageUrl} onChange={setIgImageUrl} />
           <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Instagram Post URL (optional — makes image clickable)</label><input type="url" value={igPostUrl} onChange={e => setIgPostUrl(e.target.value)} placeholder="https://www.instagram.com/p/..." className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs" /></div>
           <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Caption / Alt Text (optional)</label><input type="text" value={igCaption} onChange={e => setIgCaption(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs" /></div>
         </div>
         <button onClick={handleSaveIgPost} className="w-full bg-brand-ink text-brand-neutral py-3 font-display text-[10px] font-bold uppercase flex items-center justify-center gap-2 hover:bg-brand-pink">
           <Plus size={14} /> ADD TO FEED
         </button>

         <div className="pt-12">
           <h3 className="font-display text-[11px] font-black text-brand-ink uppercase tracking-widest border-b border-brand-ink/10 pb-2 mb-4">FEED POSTS ({(dbState.instagramPosts || []).length})</h3>
           <div className="grid grid-cols-3 gap-3">
             {(dbState.instagramPosts || []).map(post => (
               <div key={post.id} className="group relative aspect-square border border-brand-ink/10 bg-brand-stone overflow-hidden">
                 <img src={post.imageUrl} alt={post.caption || "IG post"} className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-brand-ink/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                   {post.postUrl && <p className="text-[7px] text-brand-neutral font-display truncate w-full text-center">{post.postUrl}</p>}
                   <button onClick={() => handleDeleteIgPost(post.id)} className="text-red-400 text-[8px] font-bold flex items-center gap-1 hover:text-red-300"><Trash2 size={8} /> REMOVE</button>
                 </div>
               </div>
             ))}
             {(dbState.instagramPosts || []).length === 0 && <p className="col-span-3 text-[10px] font-display text-stone-400 text-center py-8">No posts yet.</p>}
           </div>
         </div>
       </div>
     </div>
   );

 case "upcoming":
   return (
     <div className="space-y-12">
       <div className="space-y-6">
         <h2 className="font-display text-lg font-bold uppercase tracking-wider text-brand-ink flex items-center gap-2 border-b border-brand-ink/10 pb-2">
           <Calendar size={20} className="text-brand-pink" /> UPCOMING ACTIVITY
         </h2>
         <form onSubmit={handleUpdateUpcomingActivity} className="space-y-6">
           <div className="flex items-center justify-between bg-brand-stone p-4 border border-brand-ink/5">
             <span className="font-display text-[10px] font-bold uppercase">Show Section on Home</span>
             <input type="checkbox" checked={upcomingShowSection} onChange={(e) => setUpcomingShowSection(e.target.checked)} className="accent-brand-pink h-4 w-4" />
           </div>
           <div className="space-y-4">
             <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Activity Title</label><input type="text" value={upcomingTitle} onChange={(e) => setUpcomingTitle(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs" /></div>
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Date</label><input type="text" value={upcomingDate} onChange={(e) => setUpcomingDate(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs font-display" /></div>
               <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Location</label><input type="text" value={upcomingLocation} onChange={(e) => setUpcomingLocation(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs" /></div>
             </div>
             <ImageUploadWidget id="up_img" label="ACTIVITY IMAGE" value={upcomingImageUrl} onChange={setUpcomingImageUrl} />
             <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Description</label><textarea rows={4} value={upcomingDescription} onChange={(e) => setUpcomingDescription(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs" /></div>
             <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">Registration URL</label><input type="text" value={upcomingRegUrl} onChange={(e) => setUpcomingRegUrl(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs font-display" /></div>
           </div>
           <button type="submit" className="w-full bg-brand-ink text-brand-neutral py-4 font-display text-xs font-bold uppercase flex items-center justify-center gap-2 hover:bg-brand-pink">
             <Save size={16} /> SAVE UPCOMING ACTIVITY
           </button>
         </form>
       </div>
     </div>
   );


 case"settings":
 return (
 <div className="space-y-12">
 <div className="space-y-6">
 <h2 className="font-display text-lg font-bold uppercase tracking-wider text-brand-ink flex items-center gap-2 border-b border-brand-ink/10 pb-2">
 <Type size={20} className="text-brand-pink"/> SITE CONTENT & SETTINGS
 </h2>
 
 {/* Note: In a full production system, we would render the massive labels form here. 
 Since it's extremely long, I am providing the basic settings toggles and a placeholder for the labels form 
 that was fully visible in the previous iteration. We will add the main toggles back. */}
 <form onSubmit={handleUpdateSiteSettings} className="space-y-6">
 <h3 className="font-display text-[11px] font-black text-brand-pink uppercase tracking-[0.2em] border-b border-brand-pink/20 pb-2">GLOBAL ANNOUNCEMENTS</h3>
 <div className="space-y-4">
 <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">MOVING MARQUEE ANNOUNCEMENT TEXT (EN)</label><textarea rows={2} value={setsMarqueeText} onChange={(e) => setSetsMarqueeText(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs"/></div>
 <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">MOVING MARQUEE ANNOUNCEMENT TEXT (TH)</label><textarea rows={2} value={setsMarqueeTextThai} onChange={(e) => setSetsMarqueeTextThai(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs"/></div>
 <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">CONTACT TELEPHONE</label><input type="text"value={setsContactPhone} onChange={(e) => setSetsContactPhone(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs font-display"/></div>
 <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">CONTACT EMAIL</label><input type="email"value={setsContactEmail} onChange={(e) => setSetsContactEmail(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs"/></div>
 <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">HEADQUARTERS ADDRESS (EN)</label><textarea rows={2} value={setsContactAddress} onChange={(e) => setSetsContactAddress(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs"/></div>
 <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">HEADQUARTERS ADDRESS (TH)</label><textarea rows={2} value={setsContactAddressThai} onChange={(e) => setSetsContactAddressThai(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs"/></div>
 <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">ACADEMIC AFFILIATION (EN)</label><input type="text"value={setsAcademicAffiliation} onChange={(e) => setSetsAcademicAffiliation(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs"/></div>
 <div className="space-y-1.5"><label className="font-display text-[9px] font-bold uppercase">ACADEMIC AFFILIATION (TH)</label><input type="text"value={setsAcademicAffiliationThai} onChange={(e) => setSetsAcademicAffiliationThai(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-xs"/></div>
 </div>

 <h3 className="font-display text-[11px] font-black text-brand-pink uppercase tracking-[0.2em] border-b border-brand-pink/20 pb-2 pt-6">FEATURE VISIBILITY TOGGLES</h3>
 <div className="grid grid-cols-2 gap-4">
 <div className="flex items-center justify-between p-3 bg-brand-stone border border-stone-200"><span className="font-display text-[9px] font-bold uppercase">Show Marquee</span><input type="checkbox"checked={setsShowMarquee} onChange={(e) => setSetsShowMarquee(e.target.checked)} className="accent-brand-ink"/></div>
 <div className="flex items-center justify-between p-3 bg-brand-stone border border-stone-200"><span className="font-display text-[9px] font-bold uppercase">Show Home Blog</span><input type="checkbox"checked={setsShowHomeBlog} onChange={(e) => setSetsShowHomeBlog(e.target.checked)} className="accent-brand-ink"/></div>
 <div className="flex items-center justify-between p-3 bg-brand-stone border border-stone-200"><span className="font-display text-[9px] font-bold uppercase">Show Home Welcome</span><input type="checkbox"checked={setsShowHomeWelcome} onChange={(e) => setSetsShowHomeWelcome(e.target.checked)} className="accent-brand-ink"/></div>
 <div className="flex items-center justify-between p-3 bg-brand-stone border border-stone-200"><span className="font-display text-[9px] font-bold uppercase">Show Home Scores</span><input type="checkbox"checked={setsShowHomeScores} onChange={(e) => setSetsShowHomeScores(e.target.checked)} className="accent-brand-ink"/></div>
 <div className="flex items-center justify-between p-3 bg-brand-stone border border-stone-200"><span className="font-display text-[9px] font-bold uppercase">Show Home Sponsors</span><input type="checkbox"checked={setsShowHomeSponsors} onChange={(e) => setSetsShowHomeSponsors(e.target.checked)} className="accent-brand-ink"/></div>
 <div className="flex items-center justify-between p-3 bg-brand-stone border border-stone-200"><span className="font-display text-[9px] font-bold uppercase">Nav: Roster</span><input type="checkbox"checked={setsShowNavbarRoster} onChange={(e) => setSetsShowNavbarRoster(e.target.checked)} className="accent-brand-ink"/></div>
 <div className="flex items-center justify-between p-3 bg-brand-stone border border-stone-200"><span className="font-display text-[9px] font-bold uppercase">Nav: Staff</span><input type="checkbox"checked={setsShowNavbarStaff} onChange={(e) => setSetsShowNavbarStaff(e.target.checked)} className="accent-brand-ink"/></div>
 <div className="flex items-center justify-between p-3 bg-brand-stone border border-stone-200"><span className="font-display text-[9px] font-bold uppercase">Nav: Scores</span><input type="checkbox"checked={setsShowNavbarScores} onChange={(e) => setSetsShowNavbarScores(e.target.checked)} className="accent-brand-ink"/></div>
 <div className="flex items-center justify-between p-3 bg-brand-stone border border-stone-200"><span className="font-display text-[9px] font-bold uppercase">Nav: Sponsors</span><input type="checkbox"checked={setsShowNavbarSponsors} onChange={(e) => setSetsShowNavbarSponsors(e.target.checked)} className="accent-brand-ink"/></div>
 </div>

 <div className="pt-8">
   <button type="submit" className="w-full bg-brand-ink text-brand-neutral hover:bg-brand-pink px-6 py-4 font-display text-sm font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-colors">
     <Save size={16} /> SAVE GLOBAL SETTINGS
   </button>
 </div>
 </form>

 <div className="pt-12 border-t-2 border-brand-ink/10">
 <h3 className="font-display text-[11px] font-black text-brand-pink uppercase tracking-[0.2em] border-b border-brand-pink/20 pb-2">SITE CONTENT LABELS</h3>
 <p className="text-[10px] text-stone-500 font-display uppercase mt-2 mb-6">Customize every text label across the platform for local context.</p>

 <form onSubmit={handleUpdateSiteLabels} className="space-y-10">
   {/* LANGUAGE SELECTOR FOR LABELS */}
   <div className="flex border border-brand-ink font-display text-xs font-bold overflow-hidden divide-x divide-brand-ink mb-6 bg-brand-neutral max-w-xs">
     <button
       type="button"
       onClick={() => setEditLabelsLanguage("en")}
       className={`flex-1 py-2 text-center transition-all duration-200 cursor-pointer uppercase ${editLabelsLanguage === "en" ? "bg-brand-ink text-brand-neutral" : "bg-brand-neutral text-stone-500 hover:bg-brand-stone hover:text-brand-ink"}`}
     >
       English Labels
     </button>
     <button
       type="button"
       onClick={() => setEditLabelsLanguage("th")}
       className={`flex-1 py-2 text-center transition-all duration-200 cursor-pointer uppercase ${editLabelsLanguage === "th" ? "bg-brand-ink text-brand-neutral" : "bg-brand-neutral text-stone-500 hover:bg-brand-stone hover:text-brand-ink"}`}
     >
       Thai Labels (แปลไทย)
     </button>
   </div>

   {/* NAVIGATION & BRANDING */}
   <div className="space-y-4">
     <h4 className="font-display text-[10px] font-black text-brand-ink uppercase bg-brand-stone p-2">NAVIGATION & BRANDING ({editLabelsLanguage === "th" ? "THAI" : "ENGLISH"})</h4>
     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
       <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Nav: Home</label><input type="text" value={labelNavHome} onChange={(e) => setLabelNavHome(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
       <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Nav: Activities (Parent)</label><input type="text" value={labelNavBlog} onChange={(e) => setLabelNavBlog(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
       <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Nav sub-menu: Blog</label><input type="text" value={labelNavBlogSubBlog} onChange={(e) => setLabelNavBlogSubBlog(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
       <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Nav sub-menu: Club Activities</label><input type="text" value={labelNavBlogSubClub} onChange={(e) => setLabelNavBlogSubClub(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
       <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Nav: Roster</label><input type="text" value={labelNavRoster} onChange={(e) => setLabelNavRoster(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
       <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Nav: Staff</label><input type="text" value={labelNavStaff} onChange={(e) => setLabelNavStaff(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
       <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Nav: Scores</label><input type="text" value={labelNavScores} onChange={(e) => setLabelNavScores(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
       <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Nav: Partners</label><input type="text" value={labelNavSponsors} onChange={(e) => setLabelNavSponsors(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
       <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Brand Title</label><input type="text" value={labelNavBrandTitle} onChange={(e) => setLabelNavBrandTitle(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px] font-bold" /></div>
       <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Brand Subtitle</label><input type="text" value={labelNavBrandSubtitle} onChange={(e) => setLabelNavBrandSubtitle(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
       <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Social Follow Fb</label><input type="text" value={labelNavFollowFb} onChange={(e) => setLabelNavFollowFb(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
       <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Social Follow Ig</label><input type="text" value={labelNavFollowIg} onChange={(e) => setLabelNavFollowIg(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
       <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Social Follow Tiktok</label><input type="text" value={labelNavFollowTiktok} onChange={(e) => setLabelNavFollowTiktok(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
       <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Nav: Admin active banner</label><input type="text" value={labelNavAdminActive} onChange={(e) => setLabelNavAdminActive(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
       <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Nav: Admin portal button</label><input type="text" value={labelNavAdmin} onChange={(e) => setLabelNavAdmin(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
       <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Nav: Admin CMS header</label><input type="text" value={labelNavAdminCms} onChange={(e) => setLabelNavAdminCms(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
     </div>
   </div>

   {/* HOME PAGE */}
   <div className="space-y-4">
     <h4 className="font-display text-[10px] font-black text-brand-ink uppercase bg-brand-stone p-2">HOMEPAGE CONTENT ({editLabelsLanguage === "th" ? "THAI" : "ENGLISH"})</h4>
     <div className="space-y-4">
       <div className="grid grid-cols-2 gap-4">
         <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Blog Title</label><input type="text" value={labelHomeBlogTitle} onChange={(e) => setLabelHomeBlogTitle(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
         <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Blog Subtitle</label><input type="text" value={labelHomeBlogSubtitle} onChange={(e) => setLabelHomeBlogSubtitle(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
         <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Activity Label</label><input type="text" value={labelHomeActivityLabel} onChange={(e) => setLabelHomeActivityLabel(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
         <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">View All Stories Button</label><input type="text" value={labelHomeViewAllStoriesButton} onChange={(e) => setLabelHomeViewAllStoriesButton(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
       </div>
       <div className="grid grid-cols-2 gap-4">
         <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Welcome Hero Title</label><input type="text" value={labelHomeWelcomeHeroTitle} onChange={(e) => setLabelHomeWelcomeHeroTitle(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
         <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Welcome Hero Subtitle</label><input type="text" value={labelHomeWelcomeHeroSubtitle} onChange={(e) => setLabelHomeWelcomeHeroSubtitle(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
         <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Welcome Hero Social</label><input type="text" value={labelHomeWelcomeHeroSocial} onChange={(e) => setLabelHomeWelcomeHeroSocial(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
         <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Featured Activity Badge</label><input type="text" value={labelHomeFeaturedActivityBadge} onChange={(e) => setLabelHomeFeaturedActivityBadge(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
       </div>
       <div className="grid grid-cols-2 gap-4">
         <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Recent Updates Label</label><input type="text" value={labelHomeRecentUpdatesLabel} onChange={(e) => setLabelHomeRecentUpdatesLabel(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
         <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Read Coverage Button</label><input type="text" value={labelHomeReadCoverageButton} onChange={(e) => setLabelHomeReadCoverageButton(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
         <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Read Story Button</label><input type="text" value={labelHomeReadStoryButton} onChange={(e) => setLabelHomeReadStoryButton(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
         <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">No Blogs Message</label><input type="text" value={labelHomeNoBlogs} onChange={(e) => setLabelHomeNoBlogs(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
       </div>
       <div className="grid grid-cols-2 gap-4">
         <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Standings Title</label><input type="text" value={labelHomeLiveStandingsTitle} onChange={(e) => setLabelHomeLiveStandingsTitle(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
         <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Full Leaderboard Button</label><input type="text" value={labelHomeFullLeaderboardButton} onChange={(e) => setLabelHomeFullLeaderboardButton(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
         <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">No Scores Message</label><input type="text" value={labelHomeNoScores} onChange={(e) => setLabelHomeNoScores(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
         <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Modal Official Badge</label><input type="text" value={labelHomeModalOfficialBadge} onChange={(e) => setLabelHomeModalOfficialBadge(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
       </div>
       <div className="grid grid-cols-2 gap-4">
         <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Modal Editorial Board</label><input type="text" value={labelHomeModalEditorialBoard} onChange={(e) => setLabelHomeModalEditorialBoard(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
         <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Modal Location</label><input type="text" value={labelHomeModalLocation} onChange={(e) => setLabelHomeModalLocation(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
       </div>
       <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Membership Title</label><input type="text" value={labelHomeMembershipTitle} onChange={(e) => setLabelHomeMembershipTitle(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
       <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Membership Description</label><textarea rows={2} value={labelHomeMembershipDescription} onChange={(e) => setLabelHomeMembershipDescription(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
       <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Membership Button Text</label><input type="text" value={labelHomeMembershipButtonText} onChange={(e) => setLabelHomeMembershipButtonText(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
     </div>
   </div>

   {/* CLUB ACTIVITIES PAGE */}
   <div className="space-y-4">
     <h4 className="font-display text-[10px] font-black text-brand-ink uppercase bg-brand-stone p-2">CLUB ACTIVITIES PAGE ({editLabelsLanguage === "th" ? "THAI" : "ENGLISH"})</h4>
     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
       <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Hero Title Part 1</label><input type="text" value={labelAboutClubHeroTitlePart1} onChange={(e) => setLabelAboutClubHeroTitlePart1(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
       <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Hero Title Part 2</label><input type="text" value={labelAboutClubHeroTitlePart2} onChange={(e) => setLabelAboutClubHeroTitlePart2(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
       <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Hero Subtitle</label><input type="text" value={labelAboutClubHeroSubtitle} onChange={(e) => setLabelAboutClubHeroSubtitle(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
       <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">No Activities Title</label><input type="text" value={labelAboutClubNoActivitiesTitle} onChange={(e) => setLabelAboutClubNoActivitiesTitle(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
       <div className="space-y-1.5 md:col-span-2"><label className="font-display text-[8px] font-bold uppercase">No Activities Description</label><textarea rows={2} value={labelAboutClubNoActivitiesDesc} onChange={(e) => setLabelAboutClubNoActivitiesDesc(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
     </div>
   </div>

   {/* BLOG DETAIL LABELS */}
   <div className="space-y-4">
     <h4 className="font-display text-[10px] font-black text-brand-ink uppercase bg-brand-stone p-2">BLOG DETAIL LABELS ({editLabelsLanguage === "th" ? "THAI" : "ENGLISH"})</h4>
     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
       <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Back to Blog button</label><input type="text" value={labelBlogBackToBlog} onChange={(e) => setLabelBlogBackToBlog(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
       <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Published By prefix</label><input type="text" value={labelBlogPublishedBy} onChange={(e) => setLabelBlogPublishedBy(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
       <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Location label</label><input type="text" value={labelBlogLocation} onChange={(e) => setLabelBlogLocation(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
     </div>
   </div>

   {/* ROSTER PAGE */}
   <div className="space-y-4">
     <h4 className="font-display text-[10px] font-black text-brand-ink uppercase bg-brand-stone p-2">ROSTER & TEAM LABELS ({editLabelsLanguage === "th" ? "THAI" : "ENGLISH"})</h4>
     <div className="space-y-4">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Roster Title</label><input type="text" value={labelRosterTitle} onChange={(e) => setLabelRosterTitle(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
         <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Roster Subtitle</label><input type="text" value={labelRosterSubtitle} onChange={(e) => setLabelRosterSubtitle(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
         <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Verified Label</label><input type="text" value={labelRosterVerifiedLabel} onChange={(e) => setLabelRosterVerifiedLabel(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
         <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Search Placeholder</label><input type="text" value={labelRosterSearchPlaceholder} onChange={(e) => setLabelRosterSearchPlaceholder(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
         <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Filter Label</label><input type="text" value={labelRosterFilterLabel} onChange={(e) => setLabelRosterFilterLabel(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
         <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Status Label</label><input type="text" value={labelRosterStatusLabel} onChange={(e) => setLabelRosterStatusLabel(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
         <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">No Results Title</label><input type="text" value={labelRosterNoResultsTitle} onChange={(e) => setLabelRosterNoResultsTitle(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
         <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Squad Lead Badge</label><input type="text" value={labelRosterSquadLeadBadge} onChange={(e) => setLabelRosterSquadLeadBadge(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
         <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Index Label</label><input type="text" value={labelRosterIndexLabel} onChange={(e) => setLabelRosterIndexLabel(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
         <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Athlete Label</label><input type="text" value={labelRosterAthleteLabel} onChange={(e) => setLabelRosterAthleteLabel(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
         <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Status Active Label</label><input type="text" value={labelRosterStatusActive} onChange={(e) => setLabelRosterStatusActive(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
         <div className="space-y-1.5 md:col-span-2"><label className="font-display text-[8px] font-bold uppercase">No Results Description</label><textarea rows={2} value={labelRosterNoResultsDesc} onChange={(e) => setLabelRosterNoResultsDesc(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
       </div>
       <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-2">
         <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Year Filter: All</label><input type="text" value={labelRosterYearAll} onChange={(e) => setLabelRosterYearAll(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
         <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Year Filter: Freshman</label><input type="text" value={labelRosterYearFreshman} onChange={(e) => setLabelRosterYearFreshman(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
         <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Year Filter: Sophomore</label><input type="text" value={labelRosterYearSophomore} onChange={(e) => setLabelRosterYearSophomore(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
         <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Year Filter: Junior</label><input type="text" value={labelRosterYearJunior} onChange={(e) => setLabelRosterYearJunior(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
         <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Year Filter: Senior</label><input type="text" value={labelRosterYearSenior} onChange={(e) => setLabelRosterYearSenior(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
       </div>
     </div>
   </div>

   {/* STAFF & BOARD */}
   <div className="space-y-4">
     <h4 className="font-display text-[10px] font-black text-brand-ink uppercase bg-brand-stone p-2">STAFF & BOARD LABELS ({editLabelsLanguage === "th" ? "THAI" : "ENGLISH"})</h4>
     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
       <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Staff Title</label><input type="text" value={labelStaffTitle} onChange={(e) => setLabelStaffTitle(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
       <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Staff Subtitle</label><input type="text" value={labelStaffSubtitle} onChange={(e) => setLabelStaffSubtitle(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
       <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Verified Label</label><input type="text" value={labelStaffVerifiedLabel} onChange={(e) => setLabelStaffVerifiedLabel(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
     </div>
   </div>

   {/* SCORES PAGE */}
   <div className="space-y-4">
     <h4 className="font-display text-[10px] font-black text-brand-ink uppercase bg-brand-stone p-2">SCORES & STATS LABELS ({editLabelsLanguage === "th" ? "THAI" : "ENGLISH"})</h4>
     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
       <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Scores Title</label><input type="text" value={labelScoresTitle} onChange={(e) => setLabelScoresTitle(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
       <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Scores Subtitle</label><input type="text" value={labelScoresSubtitle} onChange={(e) => setLabelScoresSubtitle(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
       <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Verified Label</label><input type="text" value={labelScoresVerifiedLabel} onChange={(e) => setLabelScoresVerifiedLabel(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
       <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Recap Title</label><input type="text" value={labelScoresRecapTitle} onChange={(e) => setLabelScoresRecapTitle(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
       <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Recap Subtitle</label><input type="text" value={labelScoresRecapSubtitle} onChange={(e) => setLabelScoresRecapSubtitle(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
       <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Official Stats Badge</label><input type="text" value={labelScoresOfficialStatsBadge} onChange={(e) => setLabelScoresOfficialStatsBadge(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
       <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">View Standings button</label><input type="text" value={labelScoresViewStandingsButton} onChange={(e) => setLabelScoresViewStandingsButton(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
       <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Hide Standings button</label><input type="text" value={labelScoresHideStandingsButton} onChange={(e) => setLabelScoresHideStandingsButton(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
       <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Table Header: Player</label><input type="text" value={labelScoresTablePlayerHeader} onChange={(e) => setLabelScoresTablePlayerHeader(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
       <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Table Header: Score</label><input type="text" value={labelScoresTableScoreHeader} onChange={(e) => setLabelScoresTableScoreHeader(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
       <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Table Header: Position</label><input type="text" value={labelScoresTablePositionHeader} onChange={(e) => setLabelScoresTablePositionHeader(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
       <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Attestation Label</label><input type="text" value={labelScoresAttestationLabel} onChange={(e) => setLabelScoresAttestationLabel(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
       <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Verified Directory Label</label><input type="text" value={labelScoresVerifiedDirectoryLabel} onChange={(e) => setLabelScoresVerifiedDirectoryLabel(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
       <div className="space-y-1.5 md:col-span-2"><label className="font-display text-[8px] font-bold uppercase">Detailed Leaderboard Header</label><input type="text" value={labelScoresDetailedLeaderboardTitle} onChange={(e) => setLabelScoresDetailedLeaderboardTitle(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
     </div>
   </div>

   {/* SPONSORS */}
   <div className="space-y-4">
     <h4 className="font-display text-[10px] font-black text-brand-ink uppercase bg-brand-stone p-2">SPONSORS PAGE LABELS ({editLabelsLanguage === "th" ? "THAI" : "ENGLISH"})</h4>
     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
       <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Sponsors Title</label><input type="text" value={labelSponsorsTitle} onChange={(e) => setLabelSponsorsTitle(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
       <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Sponsors Subtitle</label><input type="text" value={labelSponsorsSubtitle} onChange={(e) => setLabelSponsorsSubtitle(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
       <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Verified Label</label><input type="text" value={labelSponsorsVerifiedLabel} onChange={(e) => setLabelSponsorsVerifiedLabel(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
       <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Contact Section Title</label><input type="text" value={labelSponsorsContactTitle} onChange={(e) => setLabelSponsorsContactTitle(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
       <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Officially Associated Label</label><input type="text" value={labelSponsorsOfficiallyAssociatedLabel} onChange={(e) => setLabelSponsorsOfficiallyAssociatedLabel(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
       <div className="space-y-1.5 md:col-span-2"><label className="font-display text-[8px] font-bold uppercase">Contact Section Description</label><textarea rows={2} value={labelSponsorsContactDescription} onChange={(e) => setLabelSponsorsContactDescription(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
     </div>
   </div>

   {/* FOOTER */}
   <div className="space-y-4">
     <h4 className="font-display text-[10px] font-black text-brand-ink uppercase bg-brand-stone p-2">FOOTER SECTION LABELS ({editLabelsLanguage === "th" ? "THAI" : "ENGLISH"})</h4>
     <div className="space-y-4">
       <div className="grid grid-cols-2 gap-4">
         <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Mission Title</label><input type="text" value={labelFooterMissionTitle} onChange={(e) => setLabelFooterMissionTitle(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
         <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Legacy Title</label><input type="text" value={labelFooterLegacyTitle} onChange={(e) => setLabelFooterLegacyTitle(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
         <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Mission Description</label><textarea rows={2} value={labelFooterMissionDescription} onChange={(e) => setLabelFooterMissionDescription(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
         <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Legacy Description</label><textarea rows={2} value={labelFooterLegacyDescription} onChange={(e) => setLabelFooterLegacyDescription(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
       </div>
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Directory Section Title</label><input type="text" value={labelFooterDirectoryTitle} onChange={(e) => setLabelFooterDirectoryTitle(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
         <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Headquarters Section Title</label><input type="text" value={labelFooterHeadquartersTitle} onChange={(e) => setLabelFooterHeadquartersTitle(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
         <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Affiliations Section Title</label><input type="text" value={labelFooterAffiliationsTitle} onChange={(e) => setLabelFooterAffiliationsTitle(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
         <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Rights Reserved Notice</label><input type="text" value={labelFooterRightsReserved} onChange={(e) => setLabelFooterRightsReserved(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
         <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">CMS Login Link</label><input type="text" value={labelFooterCmsLogin} onChange={(e) => setLabelFooterCmsLogin(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
         <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Privacy Disclosure Link</label><input type="text" value={labelFooterPrivacyDisclosure} onChange={(e) => setLabelFooterPrivacyDisclosure(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
         <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Terms of Tradition Link</label><input type="text" value={labelFooterTermsOfTradition} onChange={(e) => setLabelFooterTermsOfTradition(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
         <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Directory Link: News Room</label><input type="text" value={labelFooterDirectoryNewsRoom} onChange={(e) => setLabelFooterDirectoryNewsRoom(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
         <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Directory Link: Varsity Roster</label><input type="text" value={labelFooterDirectoryRoster} onChange={(e) => setLabelFooterDirectoryRoster(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
         <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Directory Link: Match Stats</label><input type="text" value={labelFooterDirectoryScores} onChange={(e) => setLabelFooterDirectoryScores(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
         <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Affiliations Link: Chula Main</label><input type="text" value={labelFooterAffiliationsChulaMain} onChange={(e) => setLabelFooterAffiliationsChulaMain(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
         <div className="space-y-1.5"><label className="font-display text-[8px] font-bold uppercase">Affiliations Link: Sports Office</label><input type="text" value={labelFooterAffiliationsSportsOffice} onChange={(e) => setLabelFooterAffiliationsSportsOffice(e.target.value)} className="w-full bg-brand-neutral border border-brand-ink/20 p-2 text-[10px]" /></div>
       </div>
     </div>
   </div>

   <div className="pt-4">
     <button type="submit" className="w-full bg-brand-pink text-brand-neutral hover:bg-brand-ink px-6 py-4 font-display text-sm font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-colors">
       <Save size={16} /> SAVE {editLabelsLanguage === "th" ? "THAI" : "ENGLISH"} SITE LABELS
     </button>
   </div>
 </form>
 </div>

 </div>
 </div>
 );

 case "members":
 return (
   <div className="animate-fade-in py-6 space-y-6">
     {/* Edit Modal */}
     {editingMember && (
       <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
         <div className="bg-brand-neutral border-2 border-brand-ink shadow-[8px_8px_0px_rgba(0,0,0,1)] w-full max-w-md">
           <div className="border-b-2 border-brand-ink px-6 py-4 flex items-center justify-between">
             <h3 className="font-display text-sm font-bold uppercase tracking-wider">Edit Member</h3>
             <button onClick={() => setEditingMember(null)} className="text-stone-400 hover:text-brand-ink cursor-pointer"><X size={18} /></button>
           </div>
           <form onSubmit={handleUpdateMember} className="p-6 space-y-4">
             <div className="space-y-1">
               <label className="font-display text-[9px] font-bold uppercase text-neutral-400 block">คำนำหน้า / Prefix</label>
               <div className="grid grid-cols-2 gap-2">
                 {["นาย","นางสาว"].map(p => (
                   <button key={p} type="button" onClick={() => setEditPrefix(p)}
                     className={`py-2 text-xs font-display font-bold border transition-colors cursor-pointer ${editPrefix === p ? "bg-brand-ink text-brand-neutral border-brand-ink" : "bg-white text-brand-ink border-brand-ink hover:bg-brand-stone"}`}>
                     {p}
                   </button>
                 ))}
               </div>
             </div>
             <div className="space-y-1">
               <label className="font-display text-[9px] font-bold uppercase text-neutral-400 block">Full Name</label>
               <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full border border-brand-ink bg-white px-3 py-2 text-xs font-semibold focus:outline-none" required />
             </div>
             <div className="space-y-1">
               <label className="font-display text-[9px] font-bold uppercase text-neutral-400 block">Email</label>
               <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} className="w-full border border-brand-ink bg-white px-3 py-2 text-xs font-semibold focus:outline-none" required />
             </div>
             <div className="space-y-1">
               <label className="font-display text-[9px] font-bold uppercase text-neutral-400 block">Student ID</label>
               <input type="text" value={editStudentId} onChange={e => setEditStudentId(e.target.value)} className="w-full border border-brand-ink bg-white px-3 py-2 text-xs font-semibold focus:outline-none" required />
             </div>
             <div className="grid grid-cols-2 gap-3">
               <div className="space-y-1">
                 <label className="font-display text-[9px] font-bold uppercase text-neutral-400 block">Year</label>
                 <select value={editYear} onChange={e => setEditYear(e.target.value)} className="w-full border border-brand-ink bg-white px-3 py-2 text-xs font-semibold focus:outline-none cursor-pointer">
                   {["Year 1","Year 2","Year 3","Year 4","Year 5","Year 6"].map(y => <option key={y} value={y}>{y}</option>)}
                 </select>
               </div>
               <div className="space-y-1">
                 <label className="font-display text-[9px] font-bold uppercase text-neutral-400 block">Faculty</label>
                 <input type="text" value={editFaculty} onChange={e => setEditFaculty(e.target.value)} className="w-full border border-brand-ink bg-white px-3 py-2 text-xs font-semibold focus:outline-none" />
               </div>
             </div>
             <div className="grid grid-cols-2 gap-3">
               <div className="space-y-1">
                 <label className="font-display text-[9px] font-bold uppercase text-neutral-400 block">Instagram</label>
                 <input type="text" value={editInstagram} onChange={e => setEditInstagram(e.target.value)} placeholder="@username" className="w-full border border-brand-ink bg-white px-3 py-2 text-xs font-semibold focus:outline-none" />
               </div>
               <div className="space-y-1">
                 <label className="font-display text-[9px] font-bold uppercase text-neutral-400 block">Line ID</label>
                 <input type="text" value={editLineId} onChange={e => setEditLineId(e.target.value)} placeholder="line_id" className="w-full border border-brand-ink bg-white px-3 py-2 text-xs font-semibold focus:outline-none" />
               </div>
             </div>
             <div className="space-y-1">
               <label className="font-display text-[9px] font-bold uppercase text-neutral-400 block">New Password <span className="text-neutral-300">(leave blank to keep current)</span></label>
               <input type="password" value={editPassword} onChange={e => setEditPassword(e.target.value)} placeholder="••••••••" className="w-full border border-brand-ink bg-white px-3 py-2 text-xs font-semibold focus:outline-none" minLength={6} />
             </div>
             <div className="flex gap-3 pt-2">
               <button type="submit" className="flex-1 bg-brand-ink text-brand-neutral hover:bg-neutral-800 py-2.5 font-display text-xs font-black uppercase cursor-pointer transition-colors flex items-center justify-center gap-2">
                 <Save size={12} /> SAVE CHANGES
               </button>
               <button type="button" onClick={() => setEditingMember(null)} className="px-4 border-2 border-brand-ink font-display text-xs font-black uppercase cursor-pointer hover:bg-brand-stone transition-colors">
                 CANCEL
               </button>
             </div>
           </form>
         </div>
       </div>
     )}

     <div className="border-2 border-brand-ink bg-brand-neutral p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
       <div className="border-b-2 border-brand-ink pb-4 mb-6 flex items-center justify-between">
         <div>
           <h2 className="font-display text-lg font-bold uppercase tracking-wider text-brand-ink flex items-center gap-2">
             <Users size={20} className="text-brand-pink" /> REGISTERED MEMBERS
           </h2>
           <p className="font-display text-[9px] text-neutral-400 mt-1 uppercase font-bold">
             {membersList.length} TOTAL — EDIT PROFILE OR REMOVE ACCESS
           </p>
         </div>
         <button onClick={loadMembers} disabled={isLoadingMembers} className="border-2 border-brand-ink px-3 py-1.5 font-display text-[10px] font-black uppercase flex items-center gap-2 hover:bg-brand-stone transition-colors cursor-pointer disabled:opacity-50">
           <RefreshCw size={12} className={isLoadingMembers ? "animate-spin" : ""} /> REFRESH
         </button>
       </div>

       <div className="mb-4">
         <input
           type="text"
           placeholder="Search by name, email, or student ID..."
           value={memberSearch}
           onChange={e => setMemberSearch(e.target.value)}
           className="w-full border border-brand-ink/30 bg-white px-3 py-2 text-xs font-semibold focus:outline-none focus:border-brand-ink"
         />
       </div>

       {isLoadingMembers && membersList.length === 0 ? (
         <div className="flex items-center justify-center py-16"><RefreshCw size={24} className="animate-spin text-neutral-400" /></div>
       ) : (
         <div className="divide-y-2 divide-brand-ink/10 border-2 border-brand-ink">
           {membersList
             .filter(m => {
               const q = memberSearch.toLowerCase();
               return !q || m.name?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q) || (m.studentId || m.student_id || "").toLowerCase().includes(q);
             })
             .map(member => (
               <div key={member.id} className="flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors gap-4">
                 <div className="min-w-0 flex-1 space-y-0.5">
                   <p className="font-display text-xs font-black text-brand-ink truncate">{member.name}</p>
                   <p className="font-display text-[10px] text-stone-500 truncate">{member.email}</p>
                   <div className="flex items-center gap-3 flex-wrap">
                     <span className="font-display text-[9px] bg-brand-stone px-1.5 py-0.5 text-brand-ink font-bold">ID: {member.studentId || member.student_id || "—"}</span>
                     {member.year && <span className="font-display text-[9px] text-neutral-400">{member.year}</span>}
                     {member.faculty && <span className="font-display text-[9px] text-neutral-400 truncate">{member.faculty}</span>}
                   </div>
                 </div>
                 <div className="flex items-center gap-2 shrink-0">
                   <button onClick={() => openEditMember(member)} className="border border-brand-ink px-3 py-1.5 font-display text-[9px] font-black uppercase flex items-center gap-1.5 hover:bg-brand-ink hover:text-brand-neutral transition-colors cursor-pointer">
                     <Edit size={10} /> EDIT
                   </button>
                   <button onClick={() => handleDeleteMember(member)} className="border border-red-400 text-red-500 hover:bg-red-500 hover:text-white px-2 py-1.5 transition-colors cursor-pointer">
                     <Trash2 size={12} />
                   </button>
                 </div>
               </div>
             ))}
           {membersList.filter(m => {
             const q = memberSearch.toLowerCase();
             return !q || m.name?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q) || (m.studentId || m.student_id || "").toLowerCase().includes(q);
           }).length === 0 && (
             <div className="p-8 text-center font-display text-xs text-stone-400">
               {memberSearch ? "NO MEMBERS MATCH YOUR SEARCH" : "NO REGISTERED MEMBERS YET"}
             </div>
           )}
         </div>
       )}
     </div>
   </div>
 );

 case "admins":
 return (
   <div className="space-y-8 animate-fade-in max-w-2xl mx-auto py-6">
     <div className="border-2 border-brand-ink bg-brand-neutral p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
       <div className="border-b-2 border-brand-ink pb-4 mb-6">
         <h2 className="font-display text-lg font-bold uppercase tracking-wider text-brand-ink flex items-center gap-2">
           <Lock size={20} className="text-brand-pink" /> CMS ADMINISTRATOR EMAILS
         </h2>
         <p className="font-display text-[9px] text-neutral-400 mt-1 uppercase font-bold">
           MANAGE USER ACCOUNTS AUTHORIZED TO USE THE ADMIN PORTAL
         </p>
       </div>

       <form onSubmit={handleAddAdmin} className="flex gap-3 mb-8">
         <div className="flex-1 space-y-1.5">
           <label className="font-display text-[9px] font-black text-brand-ink/60 uppercase block">
             ADD NEW ADMIN EMAIL ADDRESS
           </label>
           <input
             type="email"
             required
             placeholder="e.g. member@chula.ac.th"
             value={newAdminEmail}
             onChange={(e) => setNewAdminEmail(e.target.value)}
             className="w-full bg-neutral-50 border-2 border-brand-ink py-2 px-3 font-display text-xs focus:outline-none focus:bg-brand-neutral text-brand-ink"
           />
         </div>
         <div className="flex items-end">
           <button
             type="submit"
             disabled={isLoadingAdmins || !newAdminEmail.trim()}
             className="bg-brand-ink text-brand-neutral hover:bg-neutral-800 border-2 border-brand-ink py-2 px-4 font-display text-xs font-black uppercase flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50 h-[38px]"
           >
             <Plus size={14} /> ADD ADMIN
           </button>
         </div>
       </form>

       {isLoadingAdmins && adminEmails.length === 0 ? (
         <div className="flex items-center justify-center py-12">
           <RefreshCw size={24} className="animate-spin text-neutral-400" />
         </div>
       ) : (
         <div className="border-2 border-brand-ink bg-white divide-y-2 divide-brand-ink">
           {adminEmails.map((email) => {
             const isDefault = email === "admin@cugolfclub.com";
             return (
               <div key={email} className="flex items-center justify-between p-3.5 hover:bg-neutral-50 transition-colors">
                 <span className="font-display text-xs text-brand-ink font-bold">{email}</span>
                 {isDefault ? (
                   <span className="font-display text-[8px] bg-neutral-100 text-neutral-400 px-2 py-0.5 border border-neutral-300 font-bold uppercase select-none">
                     SYSTEM DEFAULT
                   </span>
                 ) : (
                   <button
                     type="button"
                     onClick={() => handleRemoveAdmin(email)}
                     disabled={isLoadingAdmins}
                     className="text-stone-400 hover:text-red-600 p-1 cursor-pointer transition-colors"
                     title="Remove administrator privilege"
                   >
                     <Trash2 size={16} />
                   </button>
                 )}
               </div>
             );
           })}
           {adminEmails.length === 0 && (
             <div className="p-8 text-center font-display text-xs text-stone-400">
               NO ADMINISTRATOR EMAILS LOADED
             </div>
           )}
         </div>
       )}
     </div>

     {/* Google Sheets Sync Panel */}
     <div className="border-2 border-brand-ink bg-brand-neutral p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
       <div className="border-b-2 border-brand-ink pb-4 mb-6">
         <h2 className="font-display text-lg font-bold uppercase tracking-wider text-brand-ink flex items-center gap-2">
           <RefreshCw size={20} className="text-brand-pink" /> GOOGLE SHEETS SYNC
         </h2>
         <p className="font-display text-[9px] text-neutral-400 mt-1 uppercase font-bold">
           PUSH ALL REGISTERED MEMBERS TO THE LINKED SPREADSHEET
         </p>
       </div>

       <div className="space-y-4">
         <p className="font-sans text-[11px] text-stone-500 leading-relaxed">
           Manually sync all member records to Google Sheets. The server also runs this sync automatically every 24 hours.
           New registrations are pushed individually at the time of registration.
         </p>

         <button
           type="button"
           onClick={handleSyncSheets}
           disabled={isSyncing}
           className="bg-brand-ink text-brand-neutral hover:bg-neutral-800 border-2 border-brand-ink py-2.5 px-5 font-display text-xs font-black uppercase flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
         >
           <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
           {isSyncing ? "SYNCING..." : "SYNC ALL MEMBERS NOW"}
         </button>

         {syncResult && (
           <div className={`border-2 p-3 font-display text-xs ${syncResult.message ? "border-red-400 bg-red-50 text-red-700" : "border-emerald-500 bg-emerald-50 text-emerald-800"}`}>
             {syncResult.message
               ? `⚠️ ${syncResult.message}`
               : `✅ Synced ${syncResult.synced} of ${syncResult.total} members${syncResult.errors ? ` (${syncResult.errors} errors)` : ""}.`
             }
           </div>
         )}

         <div className="bg-neutral-50 border border-brand-ink/20 p-3 space-y-1">
           <p className="font-display text-[8px] text-neutral-400 uppercase font-bold tracking-wider">LINKED SPREADSHEET</p>
           <a
             href="https://docs.google.com/spreadsheets/d/1PHmxOGZl_rG816srgIOYkUXCFxJSnmISh8z78QdpPAg/edit"
             target="_blank"
             rel="noopener noreferrer"
             className="font-display text-[10px] text-brand-ink underline hover:text-brand-pink break-all transition-colors"
           >
             CU Golf Club — Member Registry Spreadsheet ↗
           </a>
         </div>
       </div>
     </div>
   </div>
 );

 default:
 return (
 <div className="flex flex-col items-center justify-center h-64 text-stone-400 space-y-4 text-center">
 <Layout size={32} className="opacity-20"/>
 <p className="font-display text-[10px] font-bold tracking-widest uppercase">Select a tab from the top menu to access CMS editors.</p>
 </div>
 );
 }
 };

 // --- RENDERING LIVE PREVIEW BASED ON activeView ---
 const renderPreview = () => {
 switch (activeView) {
 case"home":
 return (
 <HomeView
 news={dbState.news || []}
 scores={dbState.scores || []}
 roster={dbState.roster || []}
 gallery={dbState.gallery || []}
 welcomeSection={{
 ...dbState.welcomeSection,
 imageUrl: welcomeImageUrl,
 titleThai: welcomeTitleThai,
 titleEnglish: welcomeTitleEnglish,
 legacyQuote: welcomeLegacyQuote,
 legacyQuoteAuthor: welcomeLegacyQuoteAuthor,
 description: welcomeDescription
 }}
 upcomingActivity={dbState.upcomingActivity}
 homeSponsorSection={{
 ...dbState.homeSponsorSection,
 title: homeSponTitle,
 subtitle: homeSponSubtitle,
 description: homeSponDescription,
 marqueeText: homeSponMarqueeText,
 imageUrl: homeSponImageUrl,
 buttonText: homeSponButtonText,
 buttonUrl: homeSponButtonUrl,
 showSection: homeSponShowSection
 }}
 sponsors={dbState.sponsors || []}
 siteLabels={dbState.siteLabels}
 siteSettings={dbState.siteSettings}
 isAdmin={false} // Disable overlay clicks in this live preview to keep the UX clean
 />
 );
 case"blog":
 return (
 <BlogView news={dbState.news || []} siteLabels={dbState.siteLabels} siteSettings={dbState.siteSettings} isAdmin={false} />
 );
 case"club":
 return (
 <AboutClubView
 clubActivity={{
 ...dbState.clubActivity,
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
 }}
 scores={dbState.scores || []}
 siteLabels={dbState.siteLabels}
 siteSettings={dbState.siteSettings}
 isAdmin={false}
 />
 );
 case"roster":
 return (
 <RosterView roster={dbState.roster || []} siteLabels={dbState.siteLabels} isAdmin={false} />
 );
 case"staff":
 return (
 <StaffView staff={dbState.staff || []} siteLabels={dbState.siteLabels} isAdmin={false} />
 );
 case"scores":
 return (
 <ScoresView scores={dbState.scores || []} siteLabels={dbState.siteLabels} isAdmin={false} />
 );
 case "sponsors":
   return (
     <SponsorsView sponsors={dbState.sponsors || []} siteLabels={dbState.siteLabels} isAdmin={false} />
   );
 case "instagram":
   return (
     <div className="p-6">
       <p className="font-display text-[9px] uppercase tracking-widest text-stone-400 mb-4">INSTAGRAM FEED PREVIEW — {(dbState.instagramPosts || []).length} post(s)</p>
       <div className="grid grid-cols-3 gap-0.5">
         {(dbState.instagramPosts || []).map(post => (
           <div key={post.id} className="aspect-square bg-brand-stone overflow-hidden">
             <img src={post.imageUrl} alt={post.caption || ""} className="w-full h-full object-cover" />
           </div>
         ))}
       </div>
     </div>
   );

 case "portal-events":
   return (
     <div className="p-6 space-y-4 font-sans text-xs text-brand-ink">
       <p className="font-display text-[9px] uppercase tracking-widest text-stone-400">MEMBER PORTAL PREVIEW — {(dbState.memberEvents || []).length} event(s)</p>
       {(dbState.memberEvents || []).filter(e => e.isVisible).map(evt => (
         <div key={evt.id} className="border border-brand-ink/20 p-4 bg-brand-neutral space-y-1">
           <div className="flex items-center gap-2">
             <span className="font-bold uppercase">{evt.title}</span>
             <span className={`text-[8px] font-display px-1.5 py-0.5 ${
               (evt.registrationStatus || (evt.registrationOpen ? "open" : "closed")) === "open" ? "bg-emerald-100 text-emerald-700" :
               evt.registrationStatus === "not_open" ? "bg-amber-100 text-amber-700" :
               evt.registrationStatus === "delayed" ? "bg-yellow-100 text-yellow-700" :
               "bg-stone-100 text-stone-400"}`}>
               {evt.registrationStatus === "not_open" ? "NOT OPEN YET" : evt.registrationStatus === "delayed" ? "DELAYED" : evt.registrationOpen || evt.registrationStatus === "open" ? "OPEN" : "CLOSED"}
             </span>
           </div>
           {evt.date && <p className="text-[10px] text-stone-500">{fmtDate(evt.date)}{evt.time ? ` · ${evt.time}` : ""}</p>}
           {evt.location && <p className="text-[10px] text-stone-500">{evt.location}</p>}
         </div>
       ))}
     </div>
   );
 case "gallery":
 case "upcoming":
   return (
     <HomeView
       news={dbState.news || []}
       scores={dbState.scores || []}
       roster={dbState.roster || []}
       gallery={dbState.gallery || []}
       welcomeSection={dbState.welcomeSection}
       upcomingActivity={{
         ...dbState.upcomingActivity,
         title: upcomingTitle,
         description: upcomingDescription,
         imageUrl: upcomingImageUrl,
         date: upcomingDate,
         location: upcomingLocation,
         registrationUrl: upcomingRegUrl,
         showSection: upcomingShowSection
       }}
       sponsors={dbState.sponsors || []}
       siteLabels={dbState.siteLabels}
       siteSettings={dbState.siteSettings}
       isAdmin={false}
     />
   );

 default:

 return (
 <div className="flex items-center justify-center h-full">
 <span className="font-display text-xs text-stone-400">PREVIEW NOT AVAILABLE</span>
 </div>
 );
 }
 };

 return (
 <div id="admin_dashboard"className="animate-fade-in bg-brand-neutral min-h-screen flex flex-col overflow-hidden">
 
 {/* CMS UPPER DASHBOARD PANEL HEADER */}
 <section className="bg-brand-neutral border-b-2 border-brand-ink z-50 shrink-0">
 {/* Row 1: Title + Action Buttons */}
 <div className="px-6 py-4 flex items-center justify-between gap-4">
 <div className="space-y-1">
 <span className="font-display text-[9px] font-black text-brand-pink tracking-[0.3em] uppercase block">
 REGISTRY ACTIVE
 </span>
 <h1 className="font-thai text-3xl font-bold tracking-tight text-brand-ink leading-none">
 ADMIN CMS
 </h1>
 </div>
 <div className="flex items-center gap-3">
 <button
 onClick={refreshState}
 className="border-2 border-brand-ink hover:bg-neutral-50 px-3 py-1.5 text-[10px] font-display font-black text-brand-ink uppercase flex items-center gap-2 bg-brand-neutral transition-colors cursor-pointer"
 >
 <RefreshCw size={12} /> SYNC
 </button>
 <button
 onClick={handleLogout}
 className="border-2 border-brand-ink text-brand-neutral bg-brand-ink hover:bg-neutral-800 px-3 py-1.5 text-[10px] font-display font-black uppercase flex items-center gap-2 transition-colors cursor-pointer"
 >
 <LogOut size={12} /> EXIT
 </button>
 </div>
 </div>
 {/* Row 2: All Tabs (scrollable) */}
 <div className="border-t border-neutral-200 overflow-x-auto">
 <div className="flex items-center gap-0 px-6 min-w-max">
 {[
 { id:"home", label:"HOMEPAGE"},
 { id:"blog", label:"ACTIVITIES & BLOG"},
 { id:"club", label:"CLUB ACTIVITIES"},
 { id:"upcoming", label:"UPCOMING"},
 { id:"portal-events", label:"PORTAL EVENTS"},
 { id:"gallery", label:"GALLERY"},
 { id:"instagram", label:"INSTAGRAM"},
 { id:"roster", label:"ROSTER"},
 { id:"staff", label:"STAFF"},
 { id:"scores", label:"SCORES"},
 { id:"sponsors", label:"SPONSORS"},
 { id:"settings", label:"SETTINGS"},
 { id:"members", label:"MEMBERS"},
 { id:"admins", label:"ADMINS"},
 ].map((tab) => (
 <button
 key={tab.id}
 onClick={() => {
 setActiveView(tab.id as any);
 setActiveSectionId(null);
 }}
 className={`px-4 py-2.5 font-display text-[10px] font-black tracking-widest uppercase transition-all whitespace-nowrap ${
 activeView === tab.id
 ?"bg-brand-ink text-brand-neutral"
 :"text-stone-500 hover:text-brand-ink hover:bg-brand-stone"
 }`}
 >
 {tab.label}
 </button>
 ))}
 </div>
 </div>
 </section>

 {/* SUCCESS / ERROR TOAST CORES */}
 <div className="absolute top-20 right-6 z-[100] flex flex-col gap-2 max-w-sm pointer-events-none">
 {successMsg && (
 <div className="bg-emerald-50 text-emerald-800 border-2 border-emerald-800 px-4 py-3 text-[10px] flex items-center gap-2 animate-fade-in uppercase font-black tracking-wider">
 <Check size={14} /> <span>{successMsg}</span>
 </div>
 )}
 {errorMsg && (
 <div className="bg-red-50 text-red-800 border-2 border-red-800 px-4 py-3 text-[10px] flex items-center gap-2 animate-fade-in uppercase font-black tracking-wider">
 <AlertCircle size={14} /> <span>{errorMsg}</span>
 </div>
 )}
 {isMutating && (
 <div className="bg-brand-ink text-brand-neutral border-2 border-brand-ink px-4 py-3 text-[10px] flex items-center gap-2 animate-pulse uppercase font-black tracking-wider">
 <RefreshCw size={14} className="animate-spin"/> <span>SYNCING...</span>
 </div>
 )}
 </div>

 {/* FULL SPLIT SCREEN WORKSPACE */}
 <div className="flex-grow flex overflow-hidden">
 
 {/* FULL EDITOR PANEL (LEFT) */}
 <div className="w-full md:w-[45%] lg:w-[40%] bg-brand-neutral border-r-2 border-brand-ink overflow-y-auto custom-scrollbar flex-shrink-0 flex flex-col">
 <div className="p-4 md:p-6 lg:p-8 flex-grow">
 {renderForms()}
 </div>
 </div>

 {/* LIVE PREVIEW CANVAS (RIGHT) */}
 <div className="hidden md:block w-full md:w-[55%] lg:w-[60%] bg-brand-stone overflow-y-auto relative custom-scrollbar flex-shrink-0">
 <div className="sticky top-0 z-50 bg-stone-200/90 backdrop-blur-sm border-b border-stone-300 p-2 text-center text-[10px] font-display font-bold text-stone-600 tracking-widest flex items-center justify-center gap-2 uppercase">
 <Eye size={12} className="text-blue-500"/> LIVE PREVIEW FEEDBACK
 </div>
 <div className="pointer-events-none p-0 scale-[0.85] origin-top md:scale-[0.90] lg:scale-[0.95]">
 {/* 
 Note on pointer-events-none: 
 We disable clicks inside the preview on the right panel so it acts purely as a visual reflection 
 of the form data on the left, preventing accidental navigation away from the CMS context. 
 */}
 {renderPreview()}
 </div>
 </div>

 </div>
 </div>
 );
}
