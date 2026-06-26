import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { DatabaseState } from "./types";
import { getDatabaseState } from "./utils/api";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomeView from "./components/HomeView";
import RosterView from "./components/RosterView";
import StaffView from "./components/StaffView";
import ScoresView from "./components/ScoresView";
import SponsorsView from "./components/SponsorsView";
import BlogView from "./components/BlogView";
import AboutClubView from "./components/AboutClubView";
import ActivityDetailView from "./components/ActivityDetailView";
import AdminView from "./components/AdminView";
import { ShieldCheck, RefreshCw, AlertCircle } from "lucide-react";
import { LanguageProvider, useLanguage } from "./utils/LanguageContext";

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [dbState, setDbState] = useState<DatabaseState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Persistent authenticated administrator token in local storage
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return localStorage.getItem("cu-golf-club-admin-token");
  });

  const syncAdminToken = (token: string | null) => {
    setAdminToken(token);
    if (token) {
      localStorage.setItem("cu-golf-club-admin-token", token);
    } else {
      localStorage.removeItem("cu-golf-club-admin-token");
    }
  };

  // Service state fetching
  const refreshState = async () => {
    try {
      const data = await getDatabaseState();
      setDbState(data);
      setErrorMsg("");
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to synchronize with localized database service. Check server.ts running status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshState();
  }, []);

  // Back to top scroll effect on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  // Fatal load error page
  if (errorMsg && !dbState) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-brand-neutral p-6 text-brand-ink font-sans text-center">
        <div className="border border-red-500/20 bg-red-500/5 p-8 max-w-md space-y-4">
          <AlertCircle size={36} className="mx-auto text-red-600" />
          <h2 className="font-display text-base font-bold uppercase tracking-tight">DATALINK CONNECTION FAILURE</h2>
          <p className="text-xs leading-relaxed text-brand-ink/70">
            {errorMsg}
          </p>
          <button
            onClick={() => {
              setLoading(true);
              refreshState();
            }}
            className="inline-flex items-center gap-2 bg-brand-ink text-brand-neutral px-5 py-2 text-xs font-mono uppercase font-bold hover:bg-brand-pink transition-all cursor-pointer"
          >
            RETRY DIRECTORY SYNC
          </button>
        </div>
      </div>
    );
  }

  // Allow app to run if we have cached or initial state, otherwise show a "waking up" screen for Render sleep mitigation
  if (!dbState && loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-brand-neutral p-6 text-brand-ink font-sans text-center">
        <div className="space-y-6 max-w-xs animate-fade-in">
          <div className="relative h-0.5 w-48 bg-brand-ink/10 mx-auto overflow-hidden">
            <div className="absolute inset-y-0 left-0 bg-brand-pink animate-loading-bar w-1/4"></div>
          </div>
          <div className="space-y-3">
            <h2 className="font-display text-xs font-bold uppercase tracking-[0.2em]">Waking Up Squad Registry</h2>
            <p className="text-[9px] font-mono uppercase text-brand-ink/40 tracking-tight leading-relaxed">
              Establishing secure datalink connection to archive...<br/>
              Free-tier instances may require ~30s to initialize.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!dbState) return null;

  const { language } = useLanguage();

  // Resolve labels based on language, merging with siteLabels as fallback
  const labels = (language === "th" && dbState.siteLabelsThai && Object.keys(dbState.siteLabelsThai).length > 0)
    ? { ...dbState.siteLabels, ...dbState.siteLabelsThai }
    : dbState.siteLabels;

  // Resolve marqueeText based on language
  const marqueeText = (language === "th" && dbState.siteSettings?.marqueeTextThai)
    ? dbState.siteSettings.marqueeTextThai
    : dbState.siteSettings?.marqueeText;

  return (
    <div className="flex min-h-screen flex-col bg-brand-stone text-neutral-900">
      <Navbar
        currentTab={location.pathname.substring(1) || "home"}
        isAdminLoggedIn={!!adminToken}
        siteLabels={labels}
        siteSettings={dbState?.siteSettings}
      />

      {(dbState?.siteSettings?.showMarquee ?? true) && (
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
            <div className="mb-8 border-2 border-brand-ink text-brand-ink bg-neutral-100 p-4 flex items-center justify-between font-mono text-[10px] uppercase font-bold tracking-wider">
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

          <Routes>
            <Route path="/" element={
              <HomeView
                news={dbState.news || []}
                scores={dbState.scores || []}
                roster={dbState.roster || []}
                gallery={dbState.gallery || []}
                welcomeSection={dbState.welcomeSection}
                upcomingActivity={dbState.upcomingActivity}
                clubActivity={dbState.clubActivity}
                homeSponsorSection={dbState.homeSponsorSection}
                sponsors={dbState.sponsors || []}
                siteLabels={labels}
                siteSettings={dbState.siteSettings}
                isAdmin={!!adminToken}
                onEditSection={(id) => navigate(`/admin?edit=${id}`)}
              />
            } />
            <Route path="/blog" element={<BlogView news={dbState.news || []} siteLabels={labels} siteSettings={dbState.siteSettings} isAdmin={!!adminToken} onEditSection={(id) => navigate(`/admin?edit=${id}`)} />} />
            <Route path="/activities" element={<BlogView news={dbState.news || []} siteLabels={labels} siteSettings={dbState.siteSettings} isAdmin={!!adminToken} onEditSection={(id) => navigate(`/admin?edit=${id}`)} />} />
            <Route path="/activities/blog" element={<BlogView news={dbState.news || []} siteLabels={labels} siteSettings={dbState.siteSettings} isAdmin={!!adminToken} onEditSection={(id) => navigate(`/admin?edit=${id}`)} />} />
            <Route path="/activities/club" element={<AboutClubView clubActivity={dbState.clubActivity} scores={dbState.scores || []} siteLabels={labels} siteSettings={dbState.siteSettings} isAdmin={!!adminToken} onEditSection={(id) => navigate(`/admin?edit=${id}`)} />} />
            <Route path="/activities/:id" element={<ActivityDetailView news={dbState.news || []} siteLabels={labels} siteSettings={dbState.siteSettings} isAdmin={!!adminToken} />} />
            <Route path="/roster" element={<RosterView roster={dbState.roster || []} siteLabels={labels} isAdmin={!!adminToken} onEditSection={(id) => navigate(`/admin?edit=${id}`)} />} />
            <Route path="/staff" element={<StaffView staff={dbState.staff || []} siteLabels={labels} isAdmin={!!adminToken} onEditSection={(id) => navigate(`/admin?edit=${id}`)} />} />
            <Route path="/scores" element={<ScoresView scores={dbState.scores || []} siteLabels={labels} isAdmin={!!adminToken} onEditSection={(id) => navigate(`/admin?edit=${id}`)} />} />
            <Route path="/sponsors" element={<SponsorsView sponsors={dbState.sponsors || []} siteLabels={labels} isAdmin={!!adminToken} />} />
            <Route path="/admin" element={
              <AdminView
                dbState={dbState}
                refreshState={refreshState}
                adminToken={adminToken}
                setAdminToken={syncAdminToken}
              />
            } />
            {/* Fallback */}
            <Route path="*" element={
              <HomeView
                news={dbState.news || []}
                scores={dbState.scores || []}
                roster={dbState.roster || []}
                gallery={dbState.gallery || []}
                welcomeSection={dbState.welcomeSection}
                upcomingActivity={dbState.upcomingActivity}
                clubActivity={dbState.clubActivity}
                homeSponsorSection={dbState.homeSponsorSection}
                sponsors={dbState.sponsors || []}
                siteLabels={labels}
                siteSettings={dbState.siteSettings}
                isAdmin={!!adminToken}
                onEditSection={(id) => navigate(`/admin?edit=${id}`)}
              />
            } />
          </Routes>
        </div>
      </main>

      <Footer siteSettings={dbState?.siteSettings} siteLabels={labels} />
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

