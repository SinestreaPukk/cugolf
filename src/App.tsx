import { useEffect, useState } from "react";
import { DatabaseState } from "./types";
import { getDatabaseState } from "./utils/api";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomeView from "./components/HomeView";
import RosterView from "./components/RosterView";
import StaffView from "./components/StaffView";
import ScoresView from "./components/ScoresView";
import SponsorsView from "./components/SponsorsView";
import AdminView from "./components/AdminView";
import { ShieldCheck, RefreshCw, AlertCircle } from "lucide-react";

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>("home");
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

  // Back to top scroll effect on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentTab]);

  const renderActiveTab = () => {
    if (!dbState) return null;

    switch (currentTab) {
      case "home":
        return (
          <HomeView
            news={dbState.news}
            scores={dbState.scores}
            roster={dbState.roster}
            welcomeSection={dbState.welcomeSection}
            upcomingActivity={dbState.upcomingActivity}
            setCurrentTab={setCurrentTab}
            siteLabels={dbState.siteLabels}
            siteSettings={dbState.siteSettings}
          />
        );
      case "roster":
        return <RosterView roster={dbState.roster} siteLabels={dbState.siteLabels} />;
      case "staff":
        return <StaffView staff={dbState.staff} siteLabels={dbState.siteLabels} />;
      case "scores":
        return <ScoresView scores={dbState.scores} siteLabels={dbState.siteLabels} />;
      case "sponsors":
        return <SponsorsView sponsors={dbState.sponsors} siteLabels={dbState.siteLabels} />;
      case "admin":
        return (
          <AdminView
            dbState={dbState}
            refreshState={refreshState}
            adminToken={adminToken}
            setAdminToken={syncAdminToken}
          />
        );
      default:
        return (
          <HomeView
            news={dbState.news}
            scores={dbState.scores}
            roster={dbState.roster}
            welcomeSection={dbState.welcomeSection}
            upcomingActivity={dbState.upcomingActivity}
            setCurrentTab={setCurrentTab}
            siteLabels={dbState.siteLabels}
            siteSettings={dbState.siteSettings}
          />
        );
    }
  };

  // 1. Loading screen matching Meiji Golf high-end magazine designs
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white text-neutral-950 font-sans antialiased">
        <div className="space-y-6 text-center">
          <div className="font-thai text-6xl md:text-7xl font-bold tracking-tight uppercase leading-none">
            CU <span className="text-[#da5f8e] italic">GOLF</span>
          </div>
          <div className="h-0.5 w-24 bg-[#da5f8e] mx-auto" />
          <p className="font-mono text-[10px] tracking-[0.4em] text-neutral-400 uppercase font-black">
            SYNCHRONIZING LEGACY ARCHIVES
          </p>
          <div className="flex items-center justify-center pt-8">
            <RefreshCw size={24} className="animate-spin text-[#da5f8e]" />
          </div>
        </div>
      </div>
    );
  }

  // 2. Fatal load error page
  if (errorMsg) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 p-8 text-neutral-950 font-sans text-center">
        <div className="border-2 border-neutral-950 bg-white p-12 max-w-xl space-y-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
          <AlertCircle size={48} className="mx-auto text-[#da5f8e]" />
          <h2 className="font-thai text-3xl font-bold uppercase tracking-tight">DATALINK CONNECTION FAILURE</h2>
          <p className="font-serif text-lg leading-relaxed text-neutral-600 italic">
            {errorMsg}
          </p>
          <button
            onClick={() => {
              setLoading(true);
              refreshState();
            }}
            className="inline-flex items-center gap-4 bg-neutral-950 text-white px-10 py-5 text-[11px] font-mono uppercase font-black tracking-[0.3em] hover:bg-[#da5f8e] transition-all cursor-pointer shadow-lg"
          >
            RETRY DIRECTORY SYNC
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-stone-50 text-neutral-900">
      {/* Dynamic Navigation elements */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isAdminLoggedIn={!!adminToken}
        siteLabels={dbState?.siteLabels}
        siteSettings={dbState?.siteSettings}
      />

      {/* Moving Marquee Banner (Right to Left) */}
      {(dbState?.siteSettings?.showMarquee ?? true) && (
        <div className="w-full bg-transparent text-neutral-900 py-1 overflow-hidden border-b border-stone-200 select-none relative z-30 flex items-center h-11 md:h-14">
          <div className="w-full overflow-hidden whitespace-nowrap flex items-center">
            <div className="animate-marquee inline-flex shrink-0 font-sans text-2xl md:text-3xl uppercase font-black tracking-tighter gap-6 leading-none">
              {Array(10).fill(null).map((_, index) => {
                const text = dbState?.siteSettings?.marqueeText || "Chulalongkorn University Golf Club • Drive to Excellence";
                // Split by bullet, dash, or divider if present, otherwise treat as one
                const parts = text.includes("•") 
                  ? text.split("•") 
                  : text.includes("-") 
                    ? text.split("-") 
                    : [text];
                
                return (
                  <span key={index} className="inline-flex items-center gap-6">
                    {parts.map((part, pIdx) => (
                      <span key={pIdx} className="inline-flex items-center gap-6">
                        <span>{part.trim()}</span>
                        <span className="text-[#ec4899] font-sans font-black text-2xl md:text-3xl leading-none">•</span>
                      </span>
                    ))}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Container screen content wrapper */}
      <main className="flex-grow py-8 md:py-12 bg-white">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          
          {/* Stark Admin strip banner if logged in */}
          {adminToken && (
            <div className="mb-8 border-2 border-black text-black bg-neutral-100 p-4 flex items-center justify-between font-mono text-[10px] uppercase font-bold tracking-wider">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-[#000000]" />
                <span>CHULALONGKORN GOLF SQUAD CMS ACTIVE</span>
              </div>
              <button
                onClick={() => setCurrentTab("admin")}
                className="hover:underline text-[10px] font-black tracking-widest uppercase cursor-pointer decoration-2 underline-offset-4"
              >
                GOTO CONTROL ROOT
              </button>
            </div>
          )}

          {renderActiveTab()}
        </div>
      </main>

      {/* Luxury magazine Footer layout */}
      <Footer setCurrentTab={setCurrentTab} siteSettings={dbState?.siteSettings} siteLabels={dbState?.siteLabels} />
    </div>
  );
}

