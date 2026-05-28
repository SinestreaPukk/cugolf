import { NewsItem, TournamentScore, Player, WelcomeSection, UpcomingActivity, SiteLabels, SiteSettings, HomeSponsorSection, Sponsor } from "../types";
import { ArrowRight, Calendar, User, ChevronRight, BookOpen, Clock, Trophy, Target, MapPin, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import WelcomeSectionView from "./WelcomeSectionView";

interface HomeViewProps {
  news: NewsItem[];
  scores: TournamentScore[];
  roster: Player[];
  welcomeSection: WelcomeSection;
  upcomingActivity: UpcomingActivity;
  homeSponsorSection?: HomeSponsorSection;
  sponsors: Sponsor[];
  siteLabels?: SiteLabels;
  siteSettings?: SiteSettings;
}

export default function HomeView({ news, scores, roster, welcomeSection, upcomingActivity, homeSponsorSection, sponsors, siteLabels, siteSettings }: HomeViewProps) {

  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);

  // Sort by rank (descending) and then by date (descending)
  const sortedNews = [...(news || [])].sort((a, b) => {
    const rankA = a.rank || 0;
    const rankB = b.rank || 0;
    if (rankA !== rankB) return rankB - rankA;
    return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
  });

  const blogs = (sortedNews || []).slice(0, 3);
  const quickScores = (scores || []).slice(0, 3);

  // Simple, ultra-robust Markdown parser for editorial rendering
  const renderMarkdown = (text: string) => {
    if (!text) return null;
    return text.split("\n").map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("### ")) {
        return (
          <h3 key={idx} className="font-display text-lg font-bold tracking-tight text-[#121212] mt-6 mb-3 border-b border-[#121212]/10 pb-1">
            {trimmed.replace("### ", "")}
          </h3>
        );
      }
      if (trimmed.startsWith("#### ")) {
        return (
          <h4 key={idx} className="font-display text-sm font-black uppercase tracking-wider text-black mt-4 mb-2">
            {trimmed.replace("#### ", "")}
          </h4>
        );
      }
      if (trimmed.startsWith("> ")) {
        return (
          <blockquote key={idx} className="border-l-4 border-black pl-4 italic my-4 font-serif text-black/85 bg-neutral-100 py-2 pr-2">
            {trimmed.replace("> ", "")}
          </blockquote>
        );
      }
      if (trimmed.startsWith("- ")) {
        return (
          <li key={idx} className="list-disc ml-6 my-1.5 text-xs text-[#121212]/85">
            {trimmed.replace("- ", "")}
          </li>
        );
      }
      if (trimmed === "") {
        return <div key={idx} className="h-4" />;
      }
      return (
        <p key={idx} className="text-xs leading-relaxed text-[#121212]/80 my-2 text-justify">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div id="home_view" className="space-y-16 animate-fade-in px-4 md:px-0">
      
      {/* Dynamic Legacy welcome slider and photo layout */}
      {(siteSettings?.showHomeWelcome ?? true) && (
        <WelcomeSectionView welcomeSection={welcomeSection} siteLabels={siteLabels} />
      )}
      
      {/* 1. ACTIVITIES BLOG & STORIES - Showing exactly 3 blogs */}
      {(siteSettings?.showHomeBlog ?? true) && (
        <section className="mx-auto max-w-7xl pt-4 md:pt-6 font-sans">
          <div className="border-b border-stone-200 pb-4 flex items-center justify-between mb-8">
            <h2 className="font-display text-xl md:text-2xl font-bold tracking-tight text-neutral-950 uppercase flex items-center gap-2.5">
              <BookOpen size={20} className="text-[#da5f8e]" />
              {siteLabels?.homeBlogTitle || "ACTIVITIES BLOG & STORIES"}
            </h2>
            <Link
              to="/activities"
              className="font-mono text-[9px] md:text-[10px] font-bold text-[#da5f8e] hover:text-[#c24273] tracking-widest uppercase cursor-pointer hover:underline underline-offset-4"
            >
              VIEW ALL STORIES
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Featured Big Post */}
            <div className="lg:col-span-8 group cursor-pointer" onClick={() => blogs[0] && setSelectedArticle(blogs[0])}>
              {blogs[0] ? (
                <div className="space-y-6">
                  <div className="relative aspect-[16/9] overflow-hidden bg-stone-100 border border-stone-200 shadow-xs">
                    <img 
                      src={blogs[0].imageUrl} 
                      alt={blogs[0].title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" 
                    />
                    <div className="absolute top-4 left-4 bg-[#da5f8e] text-white font-mono text-[9px] font-black px-3 py-1 uppercase tracking-widest">
                      {siteLabels?.homeFeaturedActivityBadge || "FEATURED ACTIVITY"}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-stone-400 font-mono text-[10px] font-bold uppercase tracking-widest">
                      <Calendar size={12} /> {blogs[0].publishDate}
                      <span className="h-1 w-1 rounded-full bg-stone-300" />
                      <User size={12} /> OFFICIAL COVERAGE
                    </div>
                    <h3 className="font-display text-3xl md:text-4xl font-black tracking-tight text-neutral-950 leading-none group-hover:underline decoration-2 underline-offset-8">
                      {blogs[0].title}
                    </h3>
                    <p className="font-sans text-sm md:text-base text-stone-600 leading-relaxed max-w-2xl">
                      {blogs[0].excerpt}
                    </p>
                    <div className="pt-2">
                      <button className="inline-flex items-center gap-2 border-b-2 border-[#121212] pb-1 font-mono text-[10px] font-black tracking-widest uppercase hover:text-[#da5f8e] hover:border-[#da5f8e] transition-all">
                        {siteLabels?.homeReadCoverageButton || "READ COVERAGE"} <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full border border-dashed border-stone-200 rounded-lg flex flex-col items-center justify-center p-12 text-stone-400 font-mono text-xs uppercase tracking-widest bg-stone-50/30">
                  <BookOpen size={32} className="mb-4 text-stone-300" />
                  <span>{siteLabels?.homeNoBlogs || "No activities blogs published yet."}</span>
                </div>
              )}
            </div>

            {/* Sidebar Secondary Posts */}
            <div className="lg:col-span-4 flex flex-col gap-8">
              <div className="border-l-2 border-[#121212] pl-6 space-y-8">
                <span className="font-mono text-[10px] font-black text-stone-400 uppercase tracking-widest block">
                  {siteLabels?.homeRecentUpdatesLabel || "RECENT UPDATES"}
                </span>
                
                <div className="space-y-8 flex flex-col">
                  {blogs.slice(1, 3).map((blog) => (
                    <div key={blog.id} className="group cursor-pointer space-y-3 flex-grow" onClick={() => setSelectedArticle(blog)}>
                      <div className="flex items-center gap-2 text-[#da5f8e] font-mono text-[9px] font-black uppercase tracking-widest">
                        <span className="h-px w-4 bg-[#da5f8e]" />
                        {siteLabels?.homeActivityLabel || "ACTIVITY"} • {blog.publishDate}
                      </div>
                      <h4 className="font-display text-lg font-bold text-neutral-950 uppercase leading-snug group-hover:text-[#da5f8e] transition-colors">
                        {blog.title}
                      </h4>
                      <p className="text-[11px] text-stone-500 leading-relaxed line-clamp-2 uppercase font-semibold">
                        {blog.excerpt}
                      </p>
                      <button className="flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase tracking-wider text-neutral-400 group-hover:text-neutral-950 transition-colors">
                        {siteLabels?.homeReadStoryButton || "READ STORY"} <ChevronRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                      </button>
                    </div>
                  ))}

                  {blogs.length < 3 && Array(Math.max(0, 3 - (blogs?.length || 0))).fill(null).map((_, idx) => (
                    <div key={idx} className="border border-dashed border-stone-200 rounded-lg p-5 flex flex-col items-center justify-center min-h-[130px] text-center bg-stone-50/20 text-stone-400 font-mono text-[10px] uppercase tracking-wider flex-grow">
                      <BookOpen size={20} className="mb-2 text-stone-300" />
                      <span>{siteLabels?.homeNoBlogs || "Story Slot Empty"}</span>
                    </div>
                  ))}
                </div>
              </div>

              {(siteSettings?.showHomeScores ?? true) && (
                <div className="border border-stone-200 bg-stone-50 p-5 rounded-lg shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                    <span className="font-display text-xs font-bold text-neutral-950 uppercase flex items-center gap-1.5">
                      <Trophy size={14} className="text-[#da5f8e]" />
                      {siteLabels?.homeLiveStandingsTitle || "LIVE STANDINGS"}
                    </span>
                    <Link
                      to="/scores"
                      className="font-mono text-[8.5px] text-[#da5f8e] hover:text-[#c24273] font-bold transition-colors uppercase tracking-wider"
                    >
                      FULL LEADERBOARD
                    </Link>
                  </div>

                  {quickScores[0] ? (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <span className="font-mono text-[8px] text-stone-400 block font-semibold uppercase">{quickScores[0].date}</span>
                        <h5 className="font-display text-xs font-bold text-neutral-950 uppercase leading-snug truncate">
                          {quickScores[0].tournamentName}
                        </h5>
                        <div className="text-[8.5px] font-mono font-bold text-emerald-800 bg-emerald-50 py-0.5 px-2 border border-emerald-150 inline-block uppercase tracking-wider rounded-xs mt-1">
                          UNOFFICIAL STATS
                        </div>
                      </div>
                      <div className="space-y-1.5 pt-2 border-t border-stone-200/50">
                        {(quickScores[0]?.scoresList || []).slice(0, 2).map((sl, index) => (
                          <div key={index} className="flex justify-between items-center text-[11px] text-stone-700">
                            <span className="font-semibold uppercase truncate max-w-[130px]">{sl.playerName}</span>
                            <div className="flex items-center gap-1.5 font-mono font-bold shrink-0">
                              <span className="text-stone-400 text-[10px]">{sl.position}</span>
                              <span className="text-neutral-900">{sl.score}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-2 text-stone-400 font-mono text-[10px] uppercase">
                      <span>{siteLabels?.homeNoScores || "No tournament scores listed yet."}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 2. SPONSOR SHOWCASE SECTION */}
      {(siteSettings?.showHomeSponsors ?? true) && (homeSponsorSection?.showSection ?? true) && (
        <section className="mx-auto max-w-7xl space-y-12">
          {/* Sponsor Marquee */}
          <div className="border-y border-stone-200 py-8 overflow-hidden bg-stone-50/50">
            <div className="flex animate-marquee whitespace-nowrap gap-12 items-center">
              {Array(6).fill(null).map((_, groupIdx) => (
                <div key={groupIdx} className="flex items-center gap-12 shrink-0">
                  {homeSponsorSection?.marqueeText && (
                    <span className="font-mono text-xs font-black text-[#da5f8e] tracking-widest uppercase px-8 border-x border-stone-200">
                      {homeSponsorSection.marqueeText}
                    </span>
                  )}
                  {(sponsors || []).map((sponsor, idx) => (
                    <div key={`${sponsor.id}-${groupIdx}-${idx}`} className="flex items-center gap-4 shrink-0 px-4">
                      {sponsor.imageUrl ? (
                        <img src={sponsor.imageUrl} alt={sponsor.name} className="h-12 md:h-16 w-auto object-contain grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100" />
                      ) : (
                        <span className="font-display text-xl font-black text-stone-300 uppercase">{sponsor.name}</span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Featured Sponsor Layout */}
          <div className="flex flex-col lg:flex-row bg-white border border-stone-200 overflow-hidden shadow-xs group">
             {/* Text Side */}
             <div className="lg:w-1/2 p-8 md:p-12 flex flex-col justify-between order-2 lg:order-1">
                <div className="space-y-6">
                  <span className="font-mono text-[10px] font-bold text-[#da5f8e] tracking-[0.3em] uppercase">
                    {homeSponsorSection?.subtitle || "CORPORATE PARTNERSHIP"}
                  </span>
                  <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-neutral-950 leading-none">
                    {homeSponsorSection?.title || "SUPPORTING EXCELLENCE"}
                  </h2>
                  <p className="font-sans text-sm md:text-base text-stone-600 leading-relaxed max-w-lg">
                    {homeSponsorSection?.description || "Our sponsors provide the essential resources and infrastructure that empower our student athletes to compete at the highest collegiate level."}
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <Link
                    to={homeSponsorSection?.buttonUrl || "/sponsors"}
                    className="inline-flex items-center gap-2 bg-neutral-950 text-white px-8 py-4 font-mono text-xs font-black tracking-widest uppercase hover:bg-[#da5f8e] transition-all duration-300 shadow-lg group/btn"
                  >
                    {homeSponsorSection?.buttonText || "LEARN MORE"}
                    <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </div>
             </div>
             {/* Feature Image */}
             <div className="lg:w-1/2 h-80 lg:h-auto relative overflow-hidden bg-stone-100 order-1 lg:order-2 border-b lg:border-b-0 lg:border-l border-stone-200">
               <img 
                 src={homeSponsorSection?.imageUrl || "https://images.unsplash.com/photo-1593111774240-d529f52ee4de?auto=format&fit=crop&q=80&w=1200"} 
                 alt="Sponsor partnership" 
                 className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
               />
             </div>
          </div>
        </section>
      )}

      {/* 4. UPCOMING ACTIVITY SECTION */}
      {upcomingActivity?.showSection && (
        <section className="mx-auto max-w-7xl animate-fade-in">
          <div className="flex flex-col md:flex-row bg-white border border-stone-200 rounded-lg overflow-hidden shadow-sm">
            {/* Image Side */}
            <div className="md:w-1/2 h-64 md:h-auto relative overflow-hidden bg-stone-100">
              <img 
                src={upcomingActivity.imageUrl || "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=1200"} 
                alt="Upcoming Activity" 
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute top-4 left-4 bg-neutral-950 text-white font-mono text-[9px] font-bold px-3 py-1.5 uppercase tracking-widest rounded-xs">
                Next Event
              </div>
            </div>

            {/* Content Side */}
            <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center space-y-6">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-4 text-stone-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={12} className="text-[#da5f8e]" />
                    <span>{upcomingActivity.date || "TBD"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={12} className="text-[#da5f8e]" />
                    <span>{upcomingActivity.location || "TBD"}</span>
                  </div>
                </div>

                <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight text-neutral-950 uppercase leading-tight">
                  {upcomingActivity.title || "UPCOMING ACTIVITY"}
                </h2>
                
                <p className="font-sans text-sm text-stone-600 leading-relaxed">
                  {upcomingActivity.description || "Stay tuned for our next competitive or social engagement. Updates are published here regularly."}
                </p>
              </div>

              {upcomingActivity.registrationUrl && (
                <div>
                  <a
                    href={upcomingActivity.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border-2 border-neutral-950 text-neutral-950 px-6 py-3 font-mono text-xs font-black tracking-widest uppercase hover:bg-neutral-950 hover:text-white transition-all duration-300 rounded-xs"
                  >
                    SECURE YOUR SPOT <ArrowUpRight size={14} />
                  </a>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 5. MEMBERSHIP CTA */}
      <section className="mx-auto max-w-7xl bg-[#121212] p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden relative shadow-2xl">
        {/* Decorative pattern */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#da5f8e]/10 blur-3xl rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#da5f8e]/5 blur-3xl rounded-full -ml-24 -mb-24" />

        <div className="space-y-6 relative z-10">
          <h2 className="font-display text-3xl md:text-5xl font-black text-white leading-none uppercase tracking-tight max-w-xl">
            {siteLabels?.homeMembershipTitle || "Become a member of the CU GOLF CLUB."}
          </h2>
          <p className="font-sans text-sm md:text-base text-stone-400 max-w-md leading-relaxed">
            {siteLabels?.homeMembershipDescription || "Expand your network and elevate your game. We are actively looking for new student members to join our representative squads and co-curricular programs."}
          </p>
        </div>

        <div className="shrink-0 relative z-10">
          <a
            href="https://forms.gle/your-link"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-white text-[#121212] px-10 py-5 font-mono text-xs font-black tracking-widest uppercase hover:bg-[#da5f8e] hover:text-white transition-all duration-350 shadow-xl"
          >
            {siteLabels?.homeMembershipButtonText || "REGISTER NOW"} <ArrowRight size={16} />
          </a>
        </div>
      </section>

      {/* ARTICLE MODAL */}
      {selectedArticle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-neutral-950/95 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-5xl max-h-full bg-white shadow-2xl overflow-hidden flex flex-col">
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-4 right-4 z-50 p-2 bg-white/90 hover:bg-white text-black border border-stone-200 transition-all rounded-full shadow-lg"
            >
              <ChevronRight size={24} className="rotate-90" />
            </button>

            <div className="flex-grow overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-12">
                <div className="md:col-span-5 h-[300px] md:h-auto sticky top-0">
                  <img src={selectedArticle.imageUrl} alt={selectedArticle.title} className="w-full h-full object-cover" />
                </div>
                <div className="md:col-span-7 p-6 md:p-12 space-y-8 bg-white">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="bg-black text-white font-mono text-[8px] font-black px-2 py-0.5 tracking-widest uppercase">
                        {siteLabels?.homeModalOfficialBadge || "OFFICIAL EDITORIAL"}
                      </span>
                      <span className="font-mono text-[9px] text-stone-400 font-bold uppercase tracking-widest">{selectedArticle.publishDate}</span>
                    </div>
                    <h2 className="font-display text-3xl md:text-5xl font-black tracking-tight text-neutral-950 uppercase leading-[0.95]">
                      {selectedArticle.title}
                    </h2>
                    <div className="h-1 w-20 bg-[#da5f8e]" />
                  </div>

                  <div className="prose prose-stone prose-sm md:prose-base max-w-none text-stone-700 leading-relaxed font-sans">
                    {renderMarkdown(selectedArticle.content)}
                  </div>

                  <div className="pt-8 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[9px] font-mono font-bold text-stone-400 uppercase tracking-[0.2em]">
                    <span>{siteLabels?.homeModalEditorialBoard || "CU GOLF CLUB SPORTS EDITORIAL BOARD"}</span>
                    <span>{siteLabels?.homeModalLocation || "BANGKOK, THAILAND"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
