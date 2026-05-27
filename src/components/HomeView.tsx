import { NewsItem, TournamentScore, Player, WelcomeSection, UpcomingActivity, SiteLabels, SiteSettings } from "../types";
import { ArrowRight, Calendar, User, ChevronRight, BookOpen, Clock, Trophy, Target, MapPin, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import WelcomeSectionView from "./WelcomeSectionView";

interface HomeViewProps {
  news: NewsItem[];
  scores: TournamentScore[];
  roster: Player[];
  welcomeSection: WelcomeSection;
  upcomingActivity: UpcomingActivity;
  setCurrentTab: (tab: string) => void;
  siteLabels?: SiteLabels;
  siteSettings?: SiteSettings;
}

export default function HomeView({ news, scores, roster, welcomeSection, upcomingActivity, setCurrentTab, siteLabels, siteSettings }: HomeViewProps) {
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);

  const blogs = news.slice(0, 3);
  const quickScores = scores.slice(0, 3);

  // Impeccable editorial Markdown parser
  const renderMarkdown = (text: string) => {
    return text.split("\n").map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("### ")) {
        return (
          <h3 key={idx} className="font-thai text-3xl md:text-4xl font-bold tracking-tight text-neutral-950 mt-10 mb-5 border-b-2 border-neutral-950/10 pb-2">
            {trimmed.replace("### ", "")}
          </h3>
        );
      }
      if (trimmed.startsWith("#### ")) {
        return (
          <h4 key={idx} className="font-mono text-xs font-black uppercase tracking-[0.2em] text-[#da5f8e] mt-8 mb-4">
            {trimmed.replace("#### ", "")}
          </h4>
        );
      }
      if (trimmed.startsWith("> ")) {
        return (
          <blockquote key={idx} className="border-l-4 border-[#da5f8e] pl-8 italic my-10 font-serif text-xl md:text-2xl text-neutral-600 bg-neutral-50/50 py-6 pr-6">
            {trimmed.replace("> ", "")}
          </blockquote>
        );
      }
      if (trimmed.startsWith("- ")) {
        return (
          <li key={idx} className="list-none relative pl-8 my-4 text-base md:text-lg font-serif text-neutral-800 flex items-start gap-4">
            <span className="text-[#da5f8e] mt-1.5">•</span>
            <span>{trimmed.replace("- ", "")}</span>
          </li>
        );
      }
      if (trimmed === "") {
        return <div key={idx} className="h-6" />;
      }
      return (
        <p key={idx} className="text-base md:text-lg font-serif leading-relaxed text-neutral-700 my-4 text-justify">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div id="home_view" className="space-y-24 animate-fade-in px-4 md:px-0 bg-white">
      
      {/* Dynamic Legacy welcome slider and photo layout */}
      {(siteSettings?.showHomeWelcome ?? true) && (
        <div className="mb-20">
          <WelcomeSectionView welcomeSection={welcomeSection} setCurrentTab={setCurrentTab} siteLabels={siteLabels} />
        </div>
      )}
      
      {/* 1. ACTIVITIES BLOG & STORIES - Showing exactly 3 blogs */}
      {(siteSettings?.showHomeBlog ?? true) && (
        <section className="mx-auto max-w-7xl pt-4 md:pt-6">
          <div className="border-b-2 border-neutral-950 pb-6 flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div className="space-y-1">
              <span className="font-mono text-[10px] font-bold text-[#da5f8e] tracking-[0.3em] uppercase">
                {siteLabels?.homeBlogSubtitle || "C.U.G.C. LATEST LOGS"}
              </span>
              <h2 className="font-thai text-5xl md:text-6xl font-bold tracking-tight text-neutral-950 leading-none">
                {siteLabels?.homeBlogTitle || "ACTIVITIES BLOG & STORIES"}
              </h2>
            </div>
            <div className="hidden md:block">
              <BookOpen size={32} strokeWidth={1.5} className="text-neutral-950/20" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            <div className="lg:col-span-8 flex flex-col justify-between">
              {blogs[0] ? (
                <div className="border border-neutral-950 bg-white overflow-hidden transition-all duration-500 group flex flex-col justify-between h-full hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)]">
                  <div>
                    <div className="relative min-h-[350px] md:min-h-[450px] overflow-hidden bg-stone-100 border-b border-neutral-950">
                      <img
                        src={blogs[0].imageUrl}
                        alt={blogs[0].title}
                        referrerPolicy="no-referrer"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                      <div className="absolute top-6 left-6">
                        <span className="bg-neutral-950 text-white font-mono text-[10px] font-bold px-4 py-2 tracking-[0.2em] uppercase">
                          {siteLabels?.homeFeaturedActivityBadge || "FEATURED ACTIVITY"}
                        </span>
                      </div>
                    </div>

                    <div className="p-8 md:p-12 space-y-6">
                      <div className="flex items-center gap-3 font-mono text-[11px] text-[#da5f8e] font-bold uppercase tracking-wider">
                        <Calendar size={14} />
                        <span>{blogs[0].publishDate}</span>
                      </div>
                      <h3 className="font-thai text-4xl md:text-5xl font-bold leading-[1.1] text-neutral-950 group-hover:text-[#da5f8e] transition-colors duration-300">
                        {blogs[0].title}
                      </h3>
                      <p className="font-serif text-base md:text-lg leading-relaxed text-neutral-700 normal-case line-clamp-4 italic text-justify">
                        {blogs[0].excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="p-8 md:p-12 pt-0">
                    <button
                      onClick={() => setSelectedArticle(blogs[0])}
                      className="group inline-flex items-center gap-4 font-mono text-[11px] font-black tracking-[0.2em] text-white bg-neutral-950 hover:bg-[#da5f8e] px-8 py-5 uppercase transition-all duration-300 cursor-pointer"
                    >
                      {siteLabels?.homeReadCoverageButton || "READ COVERAGE"}
                      <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform duration-300" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-neutral-950/10 aspect-[16/9] flex flex-col items-center justify-center p-8 text-neutral-950/40 font-mono text-xs uppercase h-full min-h-[400px]">
                  <BookOpen size={48} strokeWidth={1} className="mb-4 opacity-20" />
                  <span>{siteLabels?.homeNoBlogs || "No activities blogs published yet."}</span>
                </div>
              )}
            </div>

            <div className="lg:col-span-4 flex flex-col gap-12">
              <div className="space-y-8 flex-grow flex flex-col">
                <span className="font-mono text-[11px] font-bold tracking-[0.25em] text-neutral-400 uppercase block border-b border-neutral-950/10 pb-2">
                  {siteLabels?.homeRecentUpdatesLabel || "RECENT UPDATES"}
                </span>

                <div className="space-y-10 flex-grow flex flex-col justify-start">
                  {blogs.slice(1, 3).map((blog) => (
                    <div key={blog.id} className="group flex flex-col justify-between min-h-[140px] cursor-pointer" onClick={() => setSelectedArticle(blog)}>
                      <div>
                        <div className="flex items-center justify-between text-neutral-400 font-mono text-[10px] mb-4 font-bold tracking-wider">
                          <span className="flex items-center gap-2 uppercase">
                            <Clock size={12} className="text-[#da5f8e]" />
                            {blog.publishDate}
                          </span>
                          <span className="text-neutral-950/30 uppercase tracking-[0.2em] font-bold text-[9px]">{siteLabels?.homeActivityLabel || "ACTIVITY"}</span>
                        </div>
                        <h4 className="font-thai text-2xl font-bold leading-tight text-neutral-950 mb-3 group-hover:text-[#da5f8e] transition-colors duration-300 line-clamp-2">
                          {blog.title}
                        </h4>
                        <p className="font-serif text-sm text-neutral-600 leading-relaxed mb-4 line-clamp-2 italic">
                          {blog.excerpt}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-2 font-mono text-[10px] font-black uppercase text-neutral-950 group-hover:text-[#da5f8e] transition-colors duration-300 tracking-widest pt-2 w-max">
                        {siteLabels?.homeReadStoryButton || "READ STORY"} <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  ))}

                  {blogs.length < 3 && Array(Math.max(0, 3 - blogs.length)).fill(null).map((_, idx) => (
                    <div key={idx} className="border border-neutral-950/5 p-8 flex flex-col items-center justify-center min-h-[160px] text-center bg-stone-50/30 text-neutral-900/20 font-mono text-[11px] uppercase tracking-widest flex-grow">
                      <BookOpen size={24} strokeWidth={1} className="mb-3 opacity-20" />
                      <span>{siteLabels?.homeNoBlogs || "Story Slot Empty"}</span>
                    </div>
                  ))}
                </div>
              </div>

              {(siteSettings?.showHomeScores ?? true) && (
                <div className="border border-neutral-950 bg-neutral-50 p-8 space-y-6">
                  <div className="flex items-center justify-between border-b border-neutral-950/10 pb-4">
                    <span className="font-thai text-xl font-bold text-neutral-950 flex items-center gap-3">
                      <Trophy size={20} strokeWidth={1.5} className="text-[#da5f8e]" />
                      {siteLabels?.homeLiveStandingsTitle || "LIVE STANDINGS"}
                    </span>
                    <button
                      onClick={() => setCurrentTab("scores")}
                      className="font-mono text-[10px] text-neutral-950 hover:text-[#da5f8e] font-black transition-colors uppercase tracking-widest border-b border-neutral-950 hover:border-[#da5f8e] pb-0.5 cursor-pointer"
                    >
                      {siteLabels?.homeFullLeaderboardButton || "VIEW ALL"}
                    </button>
                  </div>

                  {quickScores[0] ? (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <span className="font-mono text-[10px] text-neutral-400 block font-bold tracking-widest uppercase">{quickScores[0].date}</span>
                        <h5 className="font-thai text-lg font-bold text-neutral-950 leading-tight">
                          {quickScores[0].tournamentName}
                        </h5>
                        <div className="text-[10px] font-mono font-black text-white bg-neutral-950 py-1.5 px-3 inline-block uppercase tracking-[0.2em] mt-2">
                          OFFICIAL RECORD
                        </div>
                      </div>
                      <div className="space-y-3 pt-4 border-t border-neutral-950/5">
                        {quickScores[0].scoresList.slice(0, 3).map((sl, index) => (
                          <div key={index} className="flex justify-between items-center text-sm text-neutral-800">
                            <span className="font-bold uppercase tracking-wide truncate max-w-[130px]">{sl.playerName}</span>
                            <div className="flex items-center gap-3 font-mono font-black shrink-0">
                              <span className="text-neutral-950/30 text-[11px]">{sl.position}</span>
                              <span className="text-neutral-950 bg-white border border-neutral-950 px-2 py-0.5 min-w-[32px] text-center">{sl.score}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-neutral-950/20 font-mono text-[11px] uppercase tracking-widest">
                      <span>{siteLabels?.homeNoScores || "No tournament scores listed yet."}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 2. MEMBERSHIP INVITATION SECTION */}
      <section className="mx-auto max-w-7xl">
        <div className="bg-neutral-950 border border-neutral-950 p-12 md:p-20 relative overflow-hidden group">
          {/* Decorative Background Text */}
          <div className="absolute right-[-2%] bottom-[-5%] text-[180px] md:text-[240px] font-display font-black leading-none text-white/[0.04] select-none uppercase tracking-tighter transition-all duration-1000 group-hover:translate-x-4">
            LEGACY
          </div>
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-16">
            <div className="space-y-8 md:max-w-2xl text-left">
              <span className="inline-block bg-[#da5f8e] text-white font-mono text-[11px] px-4 py-2 tracking-[0.3em] uppercase font-black">
                VARSITY REGISTRATION
              </span>
              <h2 className="font-thai text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.1]">
                {siteLabels?.homeMembershipTitle || "Become a member of the CU GOLF CLUB."}
              </h2>
              <p className="font-serif text-lg md:text-xl text-neutral-400 leading-relaxed max-w-xl italic">
                {siteLabels?.homeMembershipDescription || "Expand your network and elevate your game. We are actively looking for new student members to join our representative squads."}
              </p>
            </div>

            <div className="shrink-0">
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSdaKMAAJw0pSaf7k9atDaUiuws7zpuYg6-903oI2qt2Qk4UIg/viewform?usp=sharing&ouid=106138206988272329432"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-4 bg-white text-neutral-950 px-10 py-6 font-mono text-[11px] font-black tracking-[0.3em] uppercase hover:bg-[#da5f8e] hover:text-white transition-all duration-500 group/btn shadow-xl"
              >
                {siteLabels?.homeMembershipButtonText || "REGISTER NOW"}
                <ArrowRight size={18} className="transition-transform duration-300 group-hover/btn:translate-x-2" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 4. UPCOMING ACTIVITY SECTION */}
      {upcomingActivity?.showSection && (
        <section className="mx-auto max-w-7xl animate-fade-in">
          <div className="flex flex-col lg:flex-row bg-white border-2 border-neutral-950 overflow-hidden">
            {/* Image Side */}
            <div className="lg:w-1/2 h-80 lg:h-auto relative overflow-hidden bg-stone-100 border-b lg:border-b-0 lg:border-r-2 border-neutral-950">
              <img 
                src={upcomingActivity.imageUrl || "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=1200"} 
                alt="Upcoming Activity" 
                className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
              />
              <div className="absolute top-8 left-8 bg-neutral-950 text-white font-mono text-[10px] font-bold px-4 py-2 uppercase tracking-[0.3em]">
                NEXT EVENT
              </div>
            </div>

            {/* Content Side */}
            <div className="lg:w-1/2 p-10 md:p-16 flex flex-col justify-center space-y-10">
              <div className="space-y-6">
                <div className="flex flex-wrap gap-8 text-neutral-400 font-mono text-[11px] font-black uppercase tracking-[0.2em]">
                  <div className="flex items-center gap-3">
                    <Calendar size={14} className="text-[#da5f8e]" />
                    <span>{upcomingActivity.date || "TBD"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin size={14} className="text-[#da5f8e]" />
                    <span>{upcomingActivity.location || "TBD"}</span>
                  </div>
                </div>

                <h2 className="font-thai text-4xl md:text-5xl font-bold tracking-tight text-neutral-950 leading-none">
                  {upcomingActivity.title || "UPCOMING ACTIVITY"}
                </h2>
                
                <p className="font-serif text-lg text-neutral-600 leading-relaxed italic">
                  {upcomingActivity.description || "Stay tuned for our next competitive or social engagement. Updates are published here regularly."}
                </p>
              </div>

              {upcomingActivity.registrationUrl && (
                <div>
                  <a
                    href={upcomingActivity.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-4 border-2 border-neutral-950 text-neutral-950 px-8 py-5 font-mono text-[11px] font-black tracking-[0.3em] uppercase hover:bg-neutral-950 hover:text-white transition-all duration-300 rounded-none cursor-pointer"
                  >
                    SECURE YOUR SPOT <ArrowUpRight size={18} />
                  </a>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 3. DETAILS MODAL OVERLAY */}
      {selectedArticle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-950/90 p-4 md:p-8 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-4xl border-2 border-neutral-950 bg-white text-neutral-950 flex flex-col max-h-[95vh] shadow-2xl overflow-hidden">
            
            <div className="border-b-2 border-neutral-950 p-6 md:p-8 flex items-center justify-between bg-white">
              <div className="flex items-center gap-6">
                <span className="font-mono text-[10px] bg-[#da5f8e] text-white font-black px-4 py-2 tracking-[0.3em] uppercase">
                  {siteLabels?.homeModalOfficialBadge || "OFFICIAL EDITORIAL"}
                </span>
                <span className="font-mono text-[11px] font-black text-neutral-400 tracking-widest">{selectedArticle.publishDate}</span>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="group font-mono text-[11px] font-black text-neutral-950 hover:text-[#da5f8e] transition-colors cursor-pointer uppercase tracking-[0.3em] flex items-center gap-2"
              >
                CLOSE <span className="text-lg">[×]</span>
              </button>
            </div>

            <div className="p-8 md:p-12 overflow-y-auto">
              <div className="space-y-12 max-w-3xl mx-auto">
                <div className="aspect-[16/9] border-2 border-neutral-950 overflow-hidden relative bg-stone-100">
                  <img
                    src={selectedArticle.imageUrl}
                    alt={selectedArticle.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-6">
                  <h2 className="font-thai text-5xl md:text-6xl font-bold leading-none text-neutral-950">
                    {selectedArticle.title}
                  </h2>
                  <p className="font-serif text-xl md:text-2xl italic text-neutral-500 border-l-4 border-[#da5f8e] pl-8 py-2 leading-relaxed">
                    {selectedArticle.excerpt}
                  </p>
                </div>

                <div className="font-serif text-neutral-800 text-lg md:text-xl space-y-8 leading-relaxed">
                  {renderMarkdown(selectedArticle.content)}
                </div>
              </div>
            </div>

            <div className="border-t-2 border-neutral-950 p-6 md:p-8 bg-neutral-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 font-mono text-[10px] font-black text-neutral-400 tracking-[0.2em] uppercase">
              <span>{siteLabels?.homeModalEditorialBoard || "CU GOLF CLUB SPORTS EDITORIAL BOARD"}</span>
              <span>{siteLabels?.homeModalLocation || "BANGKOK, THAILAND"}</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
