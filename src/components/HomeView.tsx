import { NewsItem, TournamentScore, Player, WelcomeSection, UpcomingActivity, SiteLabels, SiteSettings, HomeSponsorSection, Sponsor, AdminEditProps, GalleryImage, ClubActivityContent } from "../types";
import { ArrowRight, Calendar, User, ChevronRight, BookOpen, Clock, Trophy, Target, MapPin, ArrowUpRight, Edit, Image } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import WelcomeSectionView from "./WelcomeSectionView";
import { useLanguage } from "../utils/LanguageContext";

interface HomeViewProps extends AdminEditProps {
  news: NewsItem[];
  scores: TournamentScore[];
  roster: Player[];
  gallery: GalleryImage[];
  welcomeSection: WelcomeSection;
  upcomingActivity: UpcomingActivity;
  clubActivity?: ClubActivityContent;
  homeSponsorSection?: HomeSponsorSection;
  sponsors: Sponsor[];
  siteLabels?: SiteLabels;
  siteSettings?: SiteSettings;
}

export default function HomeView({ news, scores, roster, gallery, welcomeSection, upcomingActivity, clubActivity, homeSponsorSection, sponsors, siteLabels, siteSettings, isAdmin, onEditSection, activeSectionId }: HomeViewProps) {
 const { language } = useLanguage();
 // Sort by rank (descending) and then by date (descending)

 const sortedNews = [...(news || [])].filter(n => n.isVisible !== false).sort((a, b) => {
 const rankA = a.rank || 0;
 const rankB = b.rank || 0;
 if (rankA !== rankB) return rankB - rankA;
 return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
 });

 const blogs = (sortedNews || []).slice(0, 3);
 const quickScores = (scores || []).filter(s => s.isVisible !== false).slice(0, 3);

 return (
 <div id="home_view"className="space-y-16 animate-fade-in px-4 md:px-0">
 
 {/* Dynamic Legacy welcome slider and photo layout */}
 {(siteSettings?.showHomeWelcome ?? true) && (
 <WelcomeSectionView 
 welcomeSection={welcomeSection} 
 siteLabels={siteLabels} 
 isAdmin={isAdmin} 
 onEditSection={onEditSection} 
 activeSectionId={activeSectionId} 
 />
 )}
 
 {/* 2. MEMBERSHIP CTA */}
 <section className="mx-auto max-w-7xl bg-brand-ink p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden relative">
   {/* Decorative pattern */}
   <div className="absolute top-0 right-0 w-64 h-64 bg-brand-pink/10 blur-3xl -mr-32 -mt-32" />
   <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-pink/5 blur-3xl -ml-24 -mb-24" />

   <div className="space-y-6 relative z-10">
     <h2 className="font-display text-3xl md:text-5xl font-black text-brand-neutral leading-none uppercase tracking-tight max-w-xl">
       {siteLabels?.homeMembershipTitle || "Become a member of the CU GOLF CLUB."}
     </h2>
     <p className="font-sans text-sm md:text-base text-stone-400 max-w-md leading-relaxed">
       {siteLabels?.homeMembershipDescription || "Expand your network and elevate your game. We are actively looking for new student members to join our representative squads and co-curricular programs."}
     </p>
   </div>

   <div className="shrink-0 relative z-10">
     <a
       href="https://docs.google.com/forms/d/e/1FAIpQLSdaKMAAJw0pSaf7k9atDaUiuws7zpuYg6-903oI2qt2Qk4UIg/viewform?usp=sharing&ouid=106138206988272329432"
       target="_blank"
       rel="noopener noreferrer"
       className="inline-flex items-center gap-3 bg-brand-neutral text-brand-ink px-10 py-5 font-mono text-xs font-black tracking-widest uppercase hover:bg-brand-pink hover:text-brand-neutral transition-all duration-350 shadow-[4px_4px_0px_rgba(218,95,142,1)] hover:shadow-none translate-y-0 hover:translate-y-1 hover:translate-x-1 border-2 border-transparent"
     >
       {siteLabels?.homeMembershipButtonText || "REGISTER NOW"} <ArrowRight size={16} />
     </a>
   </div>
 </section>



 {/* 4. LIVE STANDINGS WIDGET */}
 {(siteSettings?.showHomeScores ?? true) && (
   <section className="mx-auto max-w-7xl font-sans">
     <div className="border border-brand-ink bg-brand-neutral shadow-[4px_4px_0px_rgba(18,18,18,0.05)] p-6 md:p-8 space-y-6">
       <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-brand-ink pb-4 gap-4">
         <span className="font-display text-xl md:text-2xl font-bold text-brand-ink uppercase flex items-center gap-2.5">
           <Trophy size={20} className="text-brand-pink" />
           {siteLabels?.homeLiveStandingsTitle || "LIVE STANDINGS"}
         </span>
         <Link
           to="/scores"
           className="font-mono text-[10px] text-brand-pink hover:text-[#c24273] font-bold transition-colors uppercase tracking-widest bg-brand-stone/50 px-4 py-2 border border-brand-ink/10"
         >
           {siteLabels?.homeFullLeaderboardButton || "FULL LEADERBOARD"}
         </Link>
       </div>

       {quickScores[0] ? (
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start pt-2">
           <div className="md:col-span-1 space-y-2">
             <span className="font-mono text-[9px] text-stone-400 block font-bold uppercase tracking-widest">{quickScores[0].date}</span>
             <h5 className="font-display text-xl md:text-2xl font-black text-brand-ink uppercase leading-tight">
               {language === "th" && quickScores[0].tournamentNameThai ? quickScores[0].tournamentNameThai : quickScores[0].tournamentName}
             </h5>
             <div className="text-[9px] font-mono font-bold text-emerald-800 bg-emerald-50 py-1 px-2.5 border border-emerald-200 inline-block uppercase tracking-wider mt-2 shadow-[2px_2px_0_rgba(5,150,105,0.1)]">
               {siteLabels?.scoresOfficialStatsBadge || "UNOFFICIAL STATS"}
             </div>
           </div>

           <div className="md:col-span-2 space-y-2">
             <div className="grid grid-cols-12 gap-4 pb-2 border-b border-brand-ink/20 font-mono text-[9px] font-bold text-stone-400 uppercase tracking-widest">
               <div className="col-span-8">{siteLabels?.scoresTablePlayerHeader || "Player Name"}</div>
               <div className="col-span-2 text-center">{siteLabels?.scoresTableScoreHeader || "Score"}</div>
               <div className="col-span-2 text-right">{siteLabels?.scoresTablePositionHeader || "Pos"}</div>
             </div>
             <div className="space-y-2 pt-2">
               {(quickScores[0]?.scoresList || []).slice(0, 3).map((sl, index) => (
                 <div key={index} className="grid grid-cols-12 gap-4 items-center text-sm md:text-base bg-brand-stone/30 p-2.5 border border-brand-ink/5 hover:border-brand-ink/20 transition-colors">
                   <span className="col-span-8 font-semibold uppercase text-brand-ink truncate">
                     {language === "th" && sl.playerNameThai ? sl.playerNameThai : sl.playerName}
                   </span>
                   <span className="col-span-2 text-center font-mono font-black text-neutral-900">{sl.score}</span>
                   <span className="col-span-2 text-right font-mono font-bold text-brand-pink">
                     {language === "th" && sl.positionThai ? sl.positionThai : sl.position}
                   </span>
                 </div>
               ))}
             </div>
           </div>
         </div>
       ) : (
         <div className="text-center py-8 text-stone-400 font-mono text-xs uppercase tracking-widest border border-dashed border-brand-ink/20 bg-brand-stone/20">
           <span>{siteLabels?.homeNoScores || "No tournament scores listed yet."}</span>
         </div>
       )}
     </div>
   </section>
 )}

 {/* 5. ACTIVITIES BLOG & STORIES */}
 {(siteSettings?.showHomeBlog ?? true) && (
   <section className="mx-auto max-w-7xl pt-4 md:pt-6 font-sans">
     <div className="border-b border-brand-ink pb-4 flex items-center justify-between mb-8">
       <h2 className="font-display text-xl md:text-2xl font-bold tracking-tight text-brand-ink uppercase flex items-center gap-2.5">
         <BookOpen size={20} className="text-brand-pink" />
         {siteLabels?.homeBlogTitle || "ACTIVITIES BLOG & STORIES"}
       </h2>
       <Link
         to="/activities/blog"
         className="font-mono text-[9px] md:text-[10px] font-bold text-brand-pink hover:text-[#c24273] tracking-widest uppercase cursor-pointer hover:underline underline-offset-4"
       >
         {siteLabels?.homeViewAllStoriesButton || "VIEW ALL STORIES"}
       </Link>
     </div>

     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
       {blogs.length > 0 ? blogs.map((blog, idx) => (
         <Link key={blog.id} to={`/activities/${blog.id}`} className="group block flex flex-col h-full border border-brand-ink bg-brand-neutral shadow-[4px_4px_0px_rgba(18,18,18,0.05)] hover:shadow-none hover:translate-y-1 hover:translate-x-1 transition-all">
           <div className="relative aspect-[16/9] overflow-hidden bg-brand-stone border-b border-brand-ink shrink-0">
             <img 
               src={blog.imageUrl} 
               alt={blog.title} 
               className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105" 
             />
             {idx === 0 && (
               <div className="absolute top-3 left-3 bg-brand-pink text-brand-neutral font-mono text-[9px] font-black px-2 py-1 uppercase tracking-widest shadow-sm">
                 {siteLabels?.homeFeaturedActivityBadge || "FEATURED ACTIVITY"}
               </div>
             )}
           </div>
           <div className="p-6 space-y-4 flex flex-col flex-grow">
             <div className="flex items-center gap-2 text-stone-400 font-mono text-[9px] font-bold uppercase tracking-widest">
               <Calendar size={10} /> {blog.publishDate}
             </div>
             <h3 className="font-display text-lg font-black tracking-tight text-brand-ink leading-tight group-hover:text-brand-pink transition-colors line-clamp-2">
               {language === "th" && blog.titleThai ? blog.titleThai : blog.title}
             </h3>
             <p className="font-sans text-xs text-stone-600 leading-relaxed line-clamp-3 flex-grow">
               {language === "th" && blog.excerptThai ? blog.excerptThai : blog.excerpt}
             </p>
             <div className="pt-4 border-t border-brand-ink/10">
               <span className="inline-flex items-center gap-1.5 font-mono text-[9px] font-black tracking-widest uppercase text-brand-ink group-hover:text-brand-pink transition-colors">
                 {siteLabels?.homeReadStoryButton || "READ STORY"} <ChevronRight size={12} className="transition-transform group-hover:translate-x-1" />
               </span>
             </div>
           </div>
         </Link>
       )) : (
         <div className="md:col-span-3 border border-dashed border-brand-ink flex flex-col items-center justify-center p-12 text-stone-400 font-mono text-xs uppercase tracking-widest bg-brand-neutral">
           <BookOpen size={32} className="mb-4 text-stone-300" />
           <span>{siteLabels?.homeNoBlogs || "No activities blogs published yet."}</span>
         </div>
       )}
     </div>
   </section>
 )}

 {/* 7. SPONSOR SHOWCASE SECTION */}
 {(siteSettings?.showHomeSponsors ?? true) && (homeSponsorSection?.showSection ?? true) && (
   <section 
     className={`mx-auto max-w-7xl space-y-12 relative ${isAdmin ? 'transition-all duration-200 cursor-pointer' : ''} ${isAdmin && activeSectionId === 'home_sponsors' ? 'ring-4 ring-[#da5f8e] bg-brand-pink/5 z-40' : isAdmin ? 'hover:ring-4 hover:ring-[#da5f8e]/50 hover:bg-brand-pink/5' : ''}`}
     onClick={(e) => {
       if (isAdmin && onEditSection) {
         e.stopPropagation();
         onEditSection("home_sponsors");
       }
     }}
   >
     {isAdmin && (
       <div className={`absolute top-4 left-4 z-50 bg-brand-pink text-brand-neutral px-3 py-1.5 font-mono text-[10px] font-bold tracking-widest flex items-center gap-2 transition-opacity ${activeSectionId === 'home_sponsors' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
         <Edit size={12} /> EDIT SPONSORS SECTION
       </div>
     )}

     {/* Featured Sponsor Layout */}
     <div className="flex flex-col lg:flex-row bg-brand-neutral border border-brand-ink overflow-hidden group shadow-[8px_8px_0px_rgba(18,18,18,0.1)]">
       {/* Text Side */}
       <div className="lg:w-1/2 p-8 md:p-12 flex flex-col justify-between order-2 lg:order-1">
         <div className="space-y-6">
           <span className="font-mono text-[10px] font-bold text-brand-pink tracking-[0.3em] uppercase">
             {language === "th" && homeSponsorSection?.subtitleThai ? homeSponsorSection.subtitleThai : (homeSponsorSection?.subtitle || "CORPORATE PARTNERSHIP")}
           </span>
           <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-brand-ink leading-none">
             {language === "th" && homeSponsorSection?.titleThai ? homeSponsorSection.titleThai : (homeSponsorSection?.title || "SUPPORTING EXCELLENCE")}
           </h2>
           <p className="font-sans text-sm md:text-base text-stone-600 leading-relaxed max-w-lg">
             {language === "th" && homeSponsorSection?.descriptionThai ? homeSponsorSection.descriptionThai : (homeSponsorSection?.description || "Our sponsors provide the essential resources and infrastructure that empower our student athletes to compete at the highest collegiate level.")}
           </p>
         </div>
         <div className="flex items-center gap-6 mt-8">
           <Link
             to={homeSponsorSection?.buttonUrl || "/sponsors"}
             className="inline-flex items-center gap-2 bg-brand-ink text-brand-neutral px-8 py-4 font-mono text-xs font-black tracking-widest uppercase hover:bg-brand-pink transition-all duration-300 group/btn"
           >
             {language === "th" && homeSponsorSection?.buttonTextThai ? homeSponsorSection.buttonTextThai : (homeSponsorSection?.buttonText || "LEARN MORE")}
             <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
           </Link>
         </div>
       </div>
       {/* Feature Image */}
       <div className="lg:w-1/2 h-80 lg:h-auto relative overflow-hidden bg-brand-stone order-1 lg:order-2 border-b lg:border-b-0 lg:border-l border-brand-ink">
         <img 
           src={homeSponsorSection?.imageUrl || "https://images.unsplash.com/photo-1593111774240-d529f52ee4de?auto=format&fit=crop&q=80&w=1200"} 
           alt="Sponsor partnership" 
           className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
         />
       </div>
     </div>

     {/* Sponsor Marquee - Full Width */}
     <div className="w-screen left-1/2 -translate-x-1/2 relative border-y border-brand-ink py-8 overflow-hidden bg-brand-neutral">
       <div className="flex animate-marquee whitespace-nowrap gap-12 items-center" style={{ animationDuration: '40s' }}>
         {Array(6).fill(null).map((_, groupIdx) => (
           <div key={groupIdx} className="flex items-center gap-12 shrink-0">
             {(language === "th" && homeSponsorSection?.marqueeTextThai ? homeSponsorSection.marqueeTextThai : homeSponsorSection?.marqueeText) && (
               <span className="font-mono text-xs font-black text-brand-ink/50 tracking-widest uppercase px-8 border-x border-brand-ink/20">
                 {language === "th" && homeSponsorSection?.marqueeTextThai ? homeSponsorSection.marqueeTextThai : homeSponsorSection?.marqueeText}
               </span>
             )}
             {(sponsors || []).map((sponsor, idx) => (
               <div key={`${sponsor.id}-${groupIdx}-${idx}`} className="flex items-center gap-4 shrink-0 px-4">
                 {sponsor.imageUrl ? (
                   <img src={sponsor.imageUrl} alt={language === "th" && sponsor.nameThai ? sponsor.nameThai : sponsor.name} className="h-10 md:h-12 w-auto object-contain opacity-80 mix-blend-multiply" />
                 ) : (
                   <span className="font-display text-lg font-black text-stone-300 uppercase">{language === "th" && sponsor.nameThai ? sponsor.nameThai : sponsor.name}</span>
                 )}
               </div>
             ))}
           </div>
         ))}
       </div>
     </div>
   </section>
 )}

 </div>
 );
}
