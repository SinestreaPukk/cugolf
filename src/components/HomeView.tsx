import { NewsItem, TournamentScore, Player, WelcomeSection, UpcomingActivity, SiteLabels, SiteSettings, HomeSponsorSection, Sponsor, AdminEditProps, GalleryImage } from"../types";
import { ArrowRight, Calendar, User, ChevronRight, BookOpen, Clock, Trophy, Target, MapPin, ArrowUpRight, Edit, Image } from"lucide-react";
import { useState } from"react";
import { Link } from"react-router-dom";
import WelcomeSectionView from"./WelcomeSectionView";

interface HomeViewProps extends AdminEditProps {
 news: NewsItem[];
 scores: TournamentScore[];
 roster: Player[];
 gallery: GalleryImage[];
 welcomeSection: WelcomeSection;
 upcomingActivity: UpcomingActivity;
 homeSponsorSection?: HomeSponsorSection;
 sponsors: Sponsor[];
 siteLabels?: SiteLabels;
 siteSettings?: SiteSettings;
}

export default function HomeView({ news, scores, roster, gallery, welcomeSection, upcomingActivity, homeSponsorSection, sponsors, siteLabels, siteSettings, isAdmin, onEditSection, activeSectionId }: HomeViewProps) {

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
     <h2 className="font-thai text-4xl md:text-6xl font-bold text-brand-neutral leading-[0.9] uppercase tracking-tighter max-w-xl">
       {siteLabels?.homeMembershipTitle || "Become a member of the CU GOLF CLUB."}
     </h2>
     <p className="font-sans text-sm md:text-base text-stone-400 max-w-md leading-relaxed border-l border-brand-pink/30 pl-6 py-2">
       {siteLabels?.homeMembershipDescription || "Expand your network and elevate your game. We are actively looking for new student members to join our representative squads and co-curricular programs."}
     </p>
   </div>

   <div className="shrink-0 relative z-10">
     <a
       href="https://docs.google.com/forms/d/e/1FAIpQLSdaKMAAJw0pSaf7k9atDaUiuws7zpuYg6-903oI2qt2Qk4UIg/viewform?usp=sharing&ouid=106138206988272329432"
       target="_blank"
       rel="noopener noreferrer"
       className="inline-flex items-center gap-3 bg-brand-pink text-brand-neutral px-10 py-5 font-mono text-[10px] font-black tracking-[0.2em] uppercase hover:bg-brand-neutral hover:text-brand-ink transition-all duration-350 shadow-[6px_6px_0px_rgba(18,18,18,0.2)] hover:shadow-none translate-y-0 hover:translate-y-1.5 hover:translate-x-1.5 border-2 border-transparent group"
     >
       {siteLabels?.homeMembershipButtonText || "REGISTER NOW"} <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
     </a>
   </div>
 </section>

 {/* 3. UPCOMING ACTIVITY SECTION */}
 {upcomingActivity?.showSection && (
   <section className="mx-auto max-w-7xl animate-fade-in">
     <div className="flex flex-col md:flex-row bg-brand-neutral border border-brand-ink overflow-hidden shadow-[12px_12px_0px_rgba(218,95,142,0.05)]">
       {/* Image Side */}
       <div className="md:w-1/2 h-80 md:h-auto relative overflow-hidden bg-brand-stone border-b md:border-b-0 md:border-r border-brand-ink">
         <img 
           src={upcomingActivity.imageUrl || "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=1200"} 
           alt="Upcoming Activity"
           className="w-full h-full object-cover transition-transform duration-1000 hover:scale-110"
         />
         <div className="absolute top-6 left-6 bg-brand-pink text-brand-neutral font-mono text-[9px] font-black px-4 py-2 uppercase tracking-[0.2em] shadow-lg">
           NEXT OFFICIAL ENGAGEMENT
         </div>
       </div>

       {/* Content Side */}
       <div className="md:w-1/2 p-10 md:p-16 flex flex-col justify-center space-y-8">
         <div className="space-y-6">
           <div className="flex flex-wrap gap-6 text-stone-400 font-mono text-[10px] font-black uppercase tracking-[0.15em]">
             <div className="flex items-center gap-2 bg-brand-stone px-3 py-1">
               <Calendar size={12} className="text-brand-pink" />
               <span>{upcomingActivity.date || "TBD"}</span>
             </div>
             <div className="flex items-center gap-2 bg-brand-stone px-3 py-1">
               <MapPin size={12} className="text-brand-pink" />
               <span>{upcomingActivity.location || "TBD"}</span>
             </div>
           </div>

           <h2 className="font-display text-3xl md:text-5xl font-black tracking-tight text-brand-ink uppercase leading-[0.9]">
             {upcomingActivity.title || "UPCOMING ACTIVITY"}
           </h2>

           <p className="font-sans text-base text-stone-600 leading-relaxed border-l-2 border-brand-stone pl-6 py-1">
             {upcomingActivity.description || "Stay tuned for our next competitive or social engagement. Updates are published here regularly."}
           </p>
         </div>

         {upcomingActivity.registrationUrl && (
           <div className="pt-4">
             <a
               href={upcomingActivity.registrationUrl}
               target="_blank"
               rel="noopener noreferrer"
               className="inline-flex items-center gap-2 border-2 border-brand-ink bg-brand-ink text-brand-neutral px-8 py-4 font-mono text-[10px] font-black tracking-[0.2em] uppercase hover:bg-brand-pink hover:border-brand-pink transition-all duration-300"
             >
               SECURE YOUR SPOT <ArrowUpRight size={14} />
             </a>
           </div>
         )}
       </div>
     </div>
   </section>
 )}

 {/* 4. LIVE STANDINGS WIDGET */}
 {(siteSettings?.showHomeScores ?? true) && (
   <section className="mx-auto max-w-7xl font-sans">
     <div className="border border-brand-ink bg-brand-neutral shadow-[12px_12px_0px_rgba(18,18,18,0.03)] p-8 md:p-12 space-y-8">
       <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-brand-ink/10 pb-6 gap-6">
         <div className="space-y-1">
           <span className="font-mono text-[10px] font-black text-brand-pink tracking-[0.3em] uppercase block">MATCH LOGS</span>
           <h2 className="font-display text-3xl md:text-4xl font-black text-brand-ink uppercase flex items-center gap-3">
             <Trophy size={28} className="text-brand-pink opacity-20" />
             {siteLabels?.homeLiveStandingsTitle || "LIVE STANDINGS"}
           </h2>
         </div>
         <Link
           to="/scores"
           className="font-mono text-[10px] text-brand-ink hover:text-brand-neutral hover:bg-brand-ink font-black transition-all uppercase tracking-[0.2em] bg-brand-stone px-6 py-3 border border-brand-ink group flex items-center gap-2"
         >
           FULL LEADERBOARD <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
         </Link>
       </div>

       {quickScores[0] ? (
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start pt-4">
           <div className="lg:col-span-4 space-y-6">
             <div className="space-y-2">
               <span className="font-mono text-[9px] text-stone-400 block font-black uppercase tracking-[0.2em]">{quickScores[0].date}</span>
               <h5 className="font-display text-2xl md:text-3xl font-black text-brand-ink uppercase leading-none">
                 {quickScores[0].tournamentName}
               </h5>
             </div>
             <div className="text-[10px] font-mono font-black text-emerald-800 bg-emerald-50 py-2 px-4 border border-emerald-200 inline-flex items-center gap-2 uppercase tracking-widest shadow-sm">
               <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
               UNOFFICIAL STATS
             </div>
             <p className="font-sans text-xs text-stone-500 leading-relaxed italic">
               Final verification from the tournament committee is still pending for the latest scorecards.
             </p>
           </div>

           <div className="lg:col-span-8 space-y-4">
             <div className="grid grid-cols-12 gap-4 pb-3 border-b-2 border-brand-ink font-mono text-[10px] font-black text-brand-ink uppercase tracking-[0.15em]">
               <div className="col-span-8">VARISTY REPRESENTATIVE</div>
               <div className="col-span-2 text-center">SCORE</div>
               <div className="col-span-2 text-right">POS</div>
             </div>
             <div className="space-y-3 pt-2">
               {(quickScores[0]?.scoresList || []).slice(0, 3).map((sl, index) => (
                 <div key={index} className="grid grid-cols-12 gap-4 items-center text-sm md:text-base bg-brand-stone/20 p-4 border border-brand-ink/5 hover:border-brand-pink/20 transition-all hover:translate-x-1 group/row">
                   <span className="col-span-8 font-display font-black uppercase text-brand-ink truncate group-hover/row:text-brand-pink transition-colors">{sl.playerName}</span>
                   <span className="col-span-2 text-center font-mono font-black text-neutral-900 bg-brand-neutral py-1 border border-brand-ink/10">{sl.score}</span>
                   <span className="col-span-2 text-right font-mono font-black text-brand-pink text-lg">{sl.position}</span>
                 </div>
               ))}
             </div>
           </div>
         </div>
       ) : (
         <div className="text-center py-16 text-stone-400 font-mono text-xs uppercase tracking-[0.3em] border-2 border-dashed border-brand-ink/10 bg-brand-stone/10">
           <span>{siteLabels?.homeNoScores || "No tournament scores listed yet."}</span>
         </div>
       )}
     </div>
   </section>
 )}

 {/* 5. ACTIVITIES BLOG & STORIES */}
 {(siteSettings?.showHomeBlog ?? true) && (
   <section className="mx-auto max-w-7xl pt-4 md:pt-6 font-sans">
     <div className="border-b-2 border-brand-ink pb-6 flex items-end justify-between mb-12">
       <div className="space-y-1">
         <span className="font-mono text-[10px] font-black text-brand-pink tracking-[0.3em] uppercase block">EDITORIAL</span>
         <h2 className="font-display text-3xl md:text-5xl font-black tracking-tight text-brand-ink uppercase leading-none">
           {siteLabels?.homeBlogTitle || "ACTIVITIES BLOG & STORIES"}
         </h2>
       </div>
       <Link
         to="/activities/blog"
         className="font-mono text-[10px] font-black text-brand-ink hover:text-brand-pink tracking-[0.2em] uppercase cursor-pointer flex items-center gap-2 group border-b border-brand-ink pb-1"
       >
         ARCHIVE <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
       </Link>
     </div>

     <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
       {blogs.length > 0 ? blogs.map((blog, idx) => (
         <Link key={blog.id} to={`/activities/${blog.id}`} className="group block flex flex-col h-full border border-brand-ink bg-brand-neutral shadow-[8px_8px_0px_rgba(18,18,18,0.05)] hover:shadow-none hover:translate-y-2 hover:translate-x-2 transition-all">
           <div className="relative aspect-[4/3] overflow-hidden bg-brand-stone border-b border-brand-ink shrink-0">
             <img 
               src={blog.imageUrl} 
               alt={blog.title} 
               className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110" 
             />
             {idx === 0 && (
               <div className="absolute top-4 left-4 bg-brand-pink text-brand-neutral font-mono text-[10px] font-black px-4 py-2 uppercase tracking-[0.2em] shadow-xl">
                 {siteLabels?.homeFeaturedActivityBadge || "FEATURED STORY"}
               </div>
             )}
           </div>
           <div className="p-8 space-y-6 flex flex-col flex-grow">
             <div className="flex items-center gap-2 text-stone-400 font-mono text-[9px] font-black uppercase tracking-[0.2em]">
               <Clock size={12} className="text-brand-pink" /> {blog.publishDate}
             </div>
             <h3 className="font-display text-xl md:text-2xl font-black tracking-tighter text-brand-ink leading-[0.9] group-hover:text-brand-pink transition-colors line-clamp-2 uppercase">
               {blog.title}
             </h3>
             <p className="font-sans text-sm text-stone-600 leading-relaxed line-clamp-3 flex-grow italic">
               {blog.excerpt}
             </p>
             <div className="pt-6 border-t border-brand-ink/10">
               <span className="inline-flex items-center gap-2 font-mono text-[10px] font-black tracking-[0.2em] uppercase text-brand-ink group-hover:text-brand-pink transition-colors">
                 {siteLabels?.homeReadStoryButton || "READ COVERAGE"} <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
               </span>
             </div>
           </div>
         </Link>
       )) : (
         <div className="md:col-span-3 border-2 border-dashed border-brand-ink flex flex-col items-center justify-center p-20 text-stone-400 font-mono text-xs uppercase tracking-[0.3em] bg-brand-stone/10">
           <BookOpen size={48} className="mb-6 text-brand-pink opacity-20" />
           <span>{siteLabels?.homeNoBlogs || "No activities blogs published yet."}</span>
         </div>
       )}
     </div>
   </section>
 )}

 {/* 6. FIELD PHOTOGRAPHY GALLERY */}
 {(gallery && gallery.length > 0) && (
   <section 
     className={`mx-auto max-w-7xl pt-12 md:pt-20 font-sans relative ${isAdmin ? 'transition-all duration-200 cursor-pointer' : ''} ${isAdmin && activeSectionId === 'home_gallery' ? 'ring-4 ring-[#da5f8e] bg-brand-pink/5 z-40' : isAdmin ? 'hover:ring-4 hover:ring-[#da5f8e]/50 hover:bg-brand-pink/5' : ''}`}
     onClick={(e) => {
       if (isAdmin && onEditSection) {
         e.stopPropagation();
         onEditSection("home_gallery");
       }
     }}
   >
     {isAdmin && (
       <div className={`absolute top-4 left-4 z-50 bg-brand-pink text-brand-neutral px-3 py-1.5 font-mono text-[10px] font-bold tracking-widest flex items-center gap-2 transition-opacity ${activeSectionId === 'home_gallery' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
         <Edit size={12} /> EDIT GALLERY
       </div>
     )}

     <div className="border-b-2 border-brand-ink pb-6 flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
       <div className="space-y-1">
         <span className="font-mono text-[10px] font-black text-brand-pink tracking-[0.3em] uppercase block">PHOTOGRAPHY</span>
         <h2 className="font-display text-3xl md:text-5xl font-black tracking-tight text-brand-ink uppercase leading-none flex items-center gap-4">
           {siteLabels?.homeActivityLabel || "FIELD PHOTOGRAPHY"}
         </h2>
       </div>
       <span className="font-mono text-[10px] font-black text-stone-400 tracking-[0.3em] uppercase bg-brand-stone px-4 py-2 border border-brand-ink/10">
         {(gallery || []).length} CURATED MOMENTS
       </span>
     </div>

     <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
       {(gallery || []).slice(0, 10).map((img, idx) => (
         <div key={img.id} className="group relative aspect-square overflow-hidden border border-brand-ink bg-brand-stone shadow-[6px_6px_0px_rgba(18,18,18,0.05)] hover:shadow-none hover:translate-y-1.5 hover:translate-x-1.5 transition-all">
           <img 
             src={img.imageUrl} 
             alt={img.title} 
             className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-125" 
           />
           <div className="absolute inset-0 bg-brand-ink/80 p-6 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end">
             <p className="font-display text-[10px] font-black text-brand-neutral uppercase tracking-widest line-clamp-2 leading-tight">{img.title}</p>
             <p className="font-mono text-[8px] text-brand-pink font-black uppercase mt-2 tracking-[0.2em]">{img.category || "General"}</p>
           </div>
         </div>
       ))}
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
     <div className="flex flex-col lg:flex-row bg-brand-neutral border-2 border-brand-ink overflow-hidden group shadow-[16px_16px_0px_rgba(218,95,142,0.08)]">
       {/* Text Side */}
       <div className="lg:w-1/2 p-12 md:p-20 flex flex-col justify-between order-2 lg:order-1">
         <div className="space-y-8">
           <span className="font-mono text-[10px] font-black text-brand-pink tracking-[0.4em] uppercase">
             {homeSponsorSection?.subtitle || "CORPORATE PARTNERSHIP"}
           </span>
           <h2 className="font-display text-4xl md:text-6xl font-black tracking-tighter text-brand-ink leading-[0.85] uppercase">
             {homeSponsorSection?.title || "SUPPORTING EXCELLENCE"}
           </h2>
           <p className="font-sans text-base md:text-lg text-stone-600 leading-relaxed max-w-lg border-l-4 border-brand-stone pl-8 py-2">
             {homeSponsorSection?.description || "Our sponsors provide the essential resources and infrastructure that empower our student athletes to compete at the highest collegiate level."}
           </p>
         </div>
         <div className="flex items-center gap-6 mt-12">
           <Link
             to={homeSponsorSection?.buttonUrl || "/sponsors"}
             className="inline-flex items-center gap-3 bg-brand-ink text-brand-neutral px-10 py-5 font-mono text-[10px] font-black tracking-[0.2em] uppercase hover:bg-brand-pink transition-all duration-300 group/btn shadow-lg"
           >
             {homeSponsorSection?.buttonText || "DIRECTORY"}
             <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-1.5" />
           </Link>
         </div>
       </div>
       {/* Feature Image */}
       <div className="lg:w-1/2 h-96 lg:h-auto relative overflow-hidden bg-brand-stone order-1 lg:order-2 border-b-2 lg:border-b-0 lg:border-l-2 border-brand-ink">
         <img 
           src={homeSponsorSection?.imageUrl || "https://images.unsplash.com/photo-1593111774240-d529f52ee4de?auto=format&fit=crop&q=80&w=1200"} 
           alt="Sponsor partnership" 
           className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
         />
         <div className="absolute inset-0 bg-brand-pink/10 mix-blend-overlay group-hover:bg-transparent transition-all duration-700" />
       </div>
     </div>

     {/* Sponsor Marquee - Full Width */}
     <div className="w-screen left-1/2 -translate-x-1/2 relative border-y-2 border-brand-ink py-12 overflow-hidden bg-brand-stone/40">
       <div className="flex animate-marquee whitespace-nowrap gap-20 items-center" style={{ animationDuration: '40s' }}>
         {Array(6).fill(null).map((_, groupIdx) => (
           <div key={groupIdx} className="flex items-center gap-20 shrink-0">
             {homeSponsorSection?.marqueeText && (
               <span className="font-mono text-[11px] font-black text-brand-pink tracking-[0.4em] uppercase px-12 border-x border-brand-ink/10">
                 {homeSponsorSection.marqueeText}
               </span>
             )}
             {(sponsors || []).map((sponsor, idx) => (
               <div key={`${sponsor.id}-${groupIdx}-${idx}`} className="flex items-center gap-6 shrink-0 px-8">
                 {sponsor.imageUrl ? (
                   <img src={sponsor.imageUrl} alt={sponsor.name} className="h-12 md:h-16 w-auto object-contain opacity-100 mix-blend-multiply transition-transform hover:scale-110 duration-500" />
                 ) : (
                   <span className="font-display text-xl font-black text-brand-ink/20 uppercase tracking-tighter">{sponsor.name}</span>
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
