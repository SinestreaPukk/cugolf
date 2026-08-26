import { Suspense, lazy, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { ShellContent } from "./types";
import { getMemberProfile, ApiError } from "./utils/api";
import { usePageContent } from "./utils/contentClient";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import {
  HomePage,
  BlogPage,
  ClubPage,
  ActivityPage,
  RosterPage,
  StaffPage,
  ScoresPage,
  SponsorsPage,
  MembershipPage,
  AdminPage,
  PageSkeleton
} from "./pages";
import { ShieldCheck, AlertCircle } from "lucide-react";
import { LanguageProvider, useLanguage } from "./utils/LanguageContext";

const PrivacyView = lazy(() => import("./components/PrivacyView"));

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();

  // Only the chrome (navbar, marquee, footer) loads at app start. Everything else is
  // fetched by the route that actually needs it.
  const shell = usePageContent<ShellContent>("shell");

  // Persistent authenticated administrator token in local storage
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return localStorage.getItem("cu-golf-club-admin-token");
  });

  // Set when an admin request is rejected, so /membership can explain the sudden logout
  const [adminSessionExpired, setAdminSessionExpired] = useState(false);

  const syncAdminToken = (token: string | null) => {
    setAdminToken(token);
    if (token) {
      localStorage.setItem("cu-golf-club-admin-token", token);
      setAdminSessionExpired(false);
    } else {
      localStorage.removeItem("cu-golf-club-admin-token");
    }
  };

  // Persistent member user and token state
  const [memberToken, setMemberToken] = useState<string | null>(() => {
    return localStorage.getItem("cu-golf-club-member-token");
  });
  const [memberUser, setMemberUser] = useState<any>(() => {
    const cached = localStorage.getItem("cu-golf-club-member-user");
    return cached ? JSON.parse(cached) : null;
  });

  const syncMemberToken = (token: string | null) => {
    setMemberToken(token);
    if (token) {
      localStorage.setItem("cu-golf-club-member-token", token);
    } else {
      localStorage.removeItem("cu-golf-club-member-token");
      setAdminToken(null);
      localStorage.removeItem("cu-golf-club-admin-token");
    }
  };

  const syncMemberUser = (user: any) => {
    setMemberUser(user);
    if (user) {
      localStorage.setItem("cu-golf-club-member-user", JSON.stringify(user));
      if (!user.isAdmin) {
        setAdminToken(null);
        localStorage.removeItem("cu-golf-club-admin-token");
      }
    } else {
      localStorage.removeItem("cu-golf-club-member-user");
      setAdminToken(null);
      localStorage.removeItem("cu-golf-club-admin-token");
    }
  };

  // Verify member session on token change or app startup
  const verifyMemberSession = async () => {
    if (!memberToken) return;
    try {
      const res = await getMemberProfile(memberToken);
      if (res.success && res.user) {
        syncMemberUser(res.user);
      } else {
        syncMemberToken(null);
      }
    } catch (err) {
      // Only a rejection from the server itself means the session is gone. A network
      // failure must stay silent, or a brief connectivity blip logs the member out.
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        syncMemberToken(null);
        syncMemberUser(null);
      }
    }
  };

  useEffect(() => {
    verifyMemberSession();
  }, [memberToken]);

  // The admin token is the member token re-used as an editing credential, so a 403 from
  // any admin route means that shared session is no longer accepted. Drop the editing
  // credential, flag the notice for /membership, and re-check the member session to see
  // whether the whole login died or only the admin privilege was revoked.
  useEffect(() => {
    const onAuthExpired = () => {
      syncAdminToken(null);
      setAdminSessionExpired(true);
      verifyMemberSession();
    };
    window.addEventListener("admin-auth-expired", onAuthExpired);
    return () => window.removeEventListener("admin-auth-expired", onAuthExpired);
  }, [memberToken]);

  // Back to top scroll effect on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  // Fatal load error page — only the shell failing is fatal; a single section failing
  // is handled by that route.
  if (shell.error && !shell.data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-brand-neutral p-6 text-brand-ink font-sans text-center">
        <div className="border border-red-500/20 bg-red-500/5 p-8 max-w-md space-y-4">
          <AlertCircle size={36} className="mx-auto text-red-600" />
          <h2 className="font-display text-base font-bold uppercase tracking-tight">DATALINK CONNECTION FAILURE</h2>
          <p className="text-xs leading-relaxed text-brand-ink/70">
            Failed to synchronize with localized database service. Check server.ts running status.
          </p>
          <button
            onClick={() => void shell.refresh()}
            className="inline-flex items-center gap-2 bg-brand-ink text-brand-neutral px-5 py-2 text-xs font-display uppercase font-bold hover:bg-brand-pink transition-all cursor-pointer"
          >
            RETRY DIRECTORY SYNC
          </button>
        </div>
      </div>
    );
  }

  if (!shell.data) return null;

  const { siteSettings, siteLabels, siteLabelsThai } = shell.data;

  // Resolve labels based on language, merging with siteLabels as fallback
  const labels = (language === "th" && siteLabelsThai && Object.keys(siteLabelsThai).length > 0)
    ? { ...siteLabels, ...siteLabelsThai }
    : siteLabels;

  // Resolve marqueeText based on language
  const marqueeText = (language === "th" && siteSettings?.marqueeTextThai)
    ? siteSettings.marqueeTextThai
    : siteSettings?.marqueeText;

  // Chrome-level props shared by every route.
  const chrome = {
    siteLabels: labels,
    siteSettings,
    isAdmin: !!adminToken,
    onEditSection: (id: string) => navigate(`/admin?edit=${id}`)
  };

  return (
    <div className="flex min-h-screen flex-col bg-brand-stone text-neutral-900">
      <Navbar
        currentTab={location.pathname.substring(1) || "home"}
        isAdminLoggedIn={!!adminToken}
        siteLabels={labels}
        siteSettings={siteSettings}
        memberUser={memberUser}
        onLogout={() => {
          syncMemberToken(null);
          syncMemberUser(null);
        }}
      />

      {(siteSettings?.showMarquee ?? true) && (
        <div className="w-full bg-brand-neutral text-brand-ink py-2 overflow-hidden border-b border-brand-ink select-none relative z-30 flex items-center h-11 md:h-14">
          <div className="w-full overflow-hidden whitespace-nowrap flex items-center">
            <div className="animate-marquee inline-flex shrink-0 font-sans text-2xl md:text-3xl uppercase font-black tracking-tighter gap-6 leading-none" style={{ animationDuration: '45s' }}>
              {Array(10).fill(null).map((_, index) => {
                const text = marqueeText || "Chulalongkorn University Golf Club • Drive to Excellence";
                const parts = text.includes("•") ? text.split("•") : text.includes("-") ? text.split("-") : [text];
                return (
                  <span key={index} className="inline-flex items-center gap-6">
                    {parts.map((part, pIdx) => (
                      <span key={pIdx} className="inline-flex items-center gap-6 text-brand-ink">
                        <span>{part.trim()}</span>
                        <span className="text-brand-pink font-sans font-black text-2xl md:text-3xl leading-none">•</span>
                      </span>
                    ))}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <main className="flex-grow py-8 md:py-12 bg-brand-neutral">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          {adminToken && (
            <div className="mb-8 border-2 border-brand-ink text-brand-ink bg-neutral-100 p-4 flex items-center justify-between font-display text-[10px] uppercase font-bold tracking-wider">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-[#000000]" />
                <span>CHULALONGKORN GOLF SQUAD CMS ACTIVE</span>
              </div>
              <button
                onClick={() => navigate("/admin")}
                className="hover:underline text-[10px] font-black tracking-widest uppercase cursor-pointer decoration-2 underline-offset-4"
              >
                GOTO CONTROL ROOT
              </button>
            </div>
          )}

          <Suspense fallback={<PageSkeleton />}>
            <Routes>
              <Route path="/" element={<HomePage {...chrome} />} />
              <Route path="/blog" element={<BlogPage {...chrome} />} />
              <Route path="/activities" element={<BlogPage {...chrome} />} />
              <Route path="/activities/blog" element={<BlogPage {...chrome} />} />
              <Route path="/activities/club" element={<ClubPage {...chrome} />} />
              <Route path="/activities/:id" element={<ActivityPage {...chrome} />} />
              <Route path="/roster" element={<RosterPage {...chrome} />} />
              <Route path="/staff" element={<StaffPage {...chrome} />} />
              <Route path="/scores" element={<ScoresPage {...chrome} />} />
              <Route path="/sponsors" element={<SponsorsPage {...chrome} />} />
              <Route path="/membership" element={
                <MembershipPage
                  memberUser={memberUser}
                  setMemberUser={syncMemberUser}
                  memberToken={memberToken}
                  setMemberToken={syncMemberToken}
                  siteSettings={siteSettings}
                  adminToken={adminToken}
                  setAdminToken={syncAdminToken}
                  adminSessionExpired={adminSessionExpired}
                  dismissAdminSessionExpired={() => setAdminSessionExpired(false)}
                />
              } />
              <Route path="/admin" element={
                adminToken
                  ? <AdminPage adminToken={adminToken} setAdminToken={syncAdminToken} />
                  : <Navigate to="/membership" replace />
              } />
              <Route path="/privacy" element={<PrivacyView />} />
              {/* Fallback */}
              <Route path="*" element={<HomePage {...chrome} />} />
            </Routes>
          </Suspense>
        </div>
      </main>

      <Footer siteSettings={siteSettings} siteLabels={labels} />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <Router>
        <AppContent />
      </Router>
    </LanguageProvider>
  );
}
