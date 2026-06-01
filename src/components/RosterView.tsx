import { Player, SiteLabels, AdminEditProps } from"../types";
import { useState } from"react";
import { User, Search, Filter, ShieldCheck, ChevronRight, Edit } from"lucide-react";

interface RosterViewProps extends AdminEditProps {
 roster: Player[];
 siteLabels?: SiteLabels;
}

export default function RosterView({ roster, siteLabels, isAdmin, onEditSection, activeSectionId }: RosterViewProps) {
 const [searchQuery, setSearchQuery] = useState("");
 const [selectedYear, setSelectedYear] = useState("All");

 const yearsList = ["All","Freshman","Sophomore","Junior","Senior"];

 const filteredPlayers = (roster || []).filter((player) => {
 if (player.isVisible === false) return false;
 const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase());
 const matchesYear = selectedYear ==="All"|| player.year.toLowerCase() === selectedYear.toLowerCase();
 return matchesSearch && matchesYear;
 });

 const isActive = activeSectionId ==="roster_list";
 const wrapperClasses = isAdmin 
 ? `relative transition-all duration-200 cursor-pointer ${isActive ? 'ring-4 ring-[#da5f8e] bg-brand-pink/5 z-40' : 'hover:ring-4 hover:ring-[#da5f8e]/50 hover:bg-brand-pink/5'}` 
 :"";

 return (
 <div 
 id="roster_view"
 className={`space-y-12 animate-fade-in px-4 md:px-0 bg-brand-neutral pb-12 ${wrapperClasses}`}
 onClick={(e) => {
 if (isAdmin && onEditSection) {
 e.stopPropagation();
 onEditSection("roster_list");
 }
 }}
 >
 {isAdmin && (
 <div className={`absolute top-4 left-4 z-50 bg-brand-pink text-brand-neutral px-3 py-1.5 font-mono text-[10px] font-bold tracking-widest flex items-center gap-2 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
 <Edit size={12} /> EDIT ROSTER COLLECTION
 </div>
 )}
 
 {/* Editorial Title Banner */}
 <section className="mx-auto max-w-7xl pt-6 text-center md:text-left space-y-4">
 <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-brand-ink pb-4 gap-4">
 <div className="space-y-2">
 <span className="inline-block bg-neutral-900 text-stone-100 font-mono text-[8.5px] px-2.5 py-1 tracking-widest uppercase font-bold">
 {siteLabels?.rosterSubtitle ||"ACTIVE PLAYERS MATRIX"}
 </span>
 <h1 className="font-display text-3xl font-extrabold tracking-tight text-brand-ink uppercase leading-none">
 {siteLabels?.rosterTitle ||"THE 2026 VARSITY SQUAD"}
 </h1>
 </div>
 <span className="font-mono text-[9.5px] font-bold text-stone-400 tracking-wider uppercase">
 {siteLabels?.rosterVerifiedLabel ||"HANDICAP REGISTRATION RECORD VERIFIED • THAILAND AMATEUR INDEX"}
 </span>
 </div>
 </section>

 {/* Modern Filter Board */}
 <section className="mx-auto max-w-7xl bg-brand-neutral border border-brand-ink/80 p-5 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
 
 {/* Search Input bar */}
 <div className="md:col-span-6 relative">
 <label htmlFor="player_search"className="sr-only">Search player registry</label>
 <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"size={15} />
 <input
 id="player_search"
 type="text"
 placeholder={siteLabels?.rosterSearchPlaceholder ||"Search roster registry..."}
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full bg-brand-stone border border-brand-ink py-2 pl-10 pr-4 font-sans text-xs font-semibold focus:outline-none focus:bg-brand-neutral focus:border-stone-400 text-stone-900 transition-colors uppercase outline-none"
 />
 </div>

 {/* Filter items */}
 <div className="md:col-span-6 flex flex-wrap gap-2 justify-start md:justify-end">
 <div className="flex items-center gap-1.5 mr-2 text-stone-400 font-mono text-[9px] uppercase font-bold tracking-widest">
 <Filter size={11} className="text-stone-400"/>
 <span>{siteLabels?.rosterFilterLabel ||"CLASS YEAR:"}</span>
 </div>
 {yearsList.map((year) => (
 <button
 key={year}
 onClick={() => setSelectedYear(year)}
 className={`px-3 py-1.5 font-mono text-[9px] uppercase font-bold tracking-wider border transition-all duration-200 cursor-pointer ${
 selectedYear.toLowerCase() === year.toLowerCase()
 ?"border-neutral-900 bg-neutral-900 text-stone-100"
 :"border-brand-ink bg-brand-neutral text-stone-500 hover:bg-brand-stone hover:text-brand-ink"
 }`}
 >
 {year}
 </button>
 ))}
 </div>

 </section>

 {/* Roster Grid & Directory */}
 <section className="mx-auto max-w-7xl">
   {filteredPlayers.length > 0 ? (
     <div className="space-y-24">

       {/* Squad Leads (Featured) */}
       {filteredPlayers.filter(p => p.isFeatured).length > 0 && (
         <div className="space-y-16">
           {filteredPlayers.filter(p => p.isFeatured).map((player, idx) => (
             <div key={player.id} className={`flex flex-col md:flex-row gap-8 items-center group ${idx % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
               <div className="w-full md:w-1/2 relative aspect-[4/5] border border-brand-ink overflow-hidden bg-brand-stone">
                 <img src={player.imageUrl} alt={player.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                 <div className="absolute top-4 left-4 bg-brand-ink text-brand-neutral font-mono text-[9px] font-bold px-3 py-1.5 uppercase tracking-widest flex items-center gap-1.5">
                   <ShieldCheck size={12} /> {siteLabels?.rosterSquadLeadBadge || "SQUAD LEAD"}
                 </div>
               </div>
               <div className="w-full md:w-1/2 space-y-6 px-4 md:px-8">
                 <h3 className="font-display text-4xl md:text-5xl lg:text-6xl font-black text-brand-ink tracking-tight uppercase leading-none group-hover:text-brand-pink transition-colors">
                   {player.name}
                 </h3>
                 <div className="flex flex-col gap-3 font-mono text-xs uppercase tracking-widest text-stone-500">
                   <span className="flex items-center gap-2"><strong className="text-brand-ink">CLASS:</strong> {player.year}</span>
                   <span className="flex items-center gap-2"><strong className="text-brand-ink">FACULTY:</strong> {player.faculty || "Faculty of Sports Science"}</span>
                   <span className="flex items-center gap-2"><strong className="text-brand-ink">INDEX:</strong> <span className="text-brand-pink text-sm font-black">{player.handicap}</span></span>
                 </div>
                 <div className="pt-6 border-t border-brand-ink">
                   <span className="inline-flex items-center gap-2 font-mono text-[10px] font-bold text-brand-ink uppercase hover:text-brand-pink transition-colors cursor-pointer tracking-widest">
                     VIEW FULL STATISTICS <ChevronRight size={12} className="transition-transform group-hover:translate-x-1" />
                   </span>
                 </div>
               </div>
             </div>
           ))}
         </div>
       )}

       {/* General Roster List (Non-Featured) */}
       {filteredPlayers.filter(p => !p.isFeatured).length > 0 && (
         <div className="border border-brand-ink bg-white">
           <div className="bg-brand-ink text-brand-neutral font-mono text-[10px] font-bold px-4 py-3 uppercase tracking-widest flex justify-between items-center">
             <span>ACTIVE REGISTRY DIRECTORY</span>
             <span>{filteredPlayers.filter(p => !p.isFeatured).length} PLAYERS</span>
           </div>
           <div className="divide-y divide-brand-ink">
             {filteredPlayers.filter(p => !p.isFeatured).map((player) => (
               <div key={player.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-brand-stone transition-colors gap-4">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 border border-brand-ink overflow-hidden bg-brand-stone shrink-0">
                     <img src={player.imageUrl} alt={player.name} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-300" />
                   </div>
                   <div className="space-y-1">
                     <h4 className="font-display text-sm lg:text-base font-bold text-brand-ink uppercase leading-none">{player.name}</h4>
                     <p className="font-mono text-[9px] text-stone-500 uppercase tracking-widest">{player.faculty || "Faculty of Sports Science"}</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-6 md:gap-12 font-mono text-[10px] uppercase font-bold text-brand-ink">
                   <span className="text-stone-400 w-20 text-right">{player.year}</span>
                   <span className="bg-brand-stone px-3 py-1.5 border border-brand-ink shadow-[2px_2px_0_0_rgba(18,18,18,1)]">HDCP: {player.handicap}</span>
                 </div>
               </div>
             ))}
           </div>
         </div>
       )}

     </div>
   ) : (
 <div className="border border-dashed border-brand-ink p-16 text-center max-w-md mx-auto bg-brand-neutral">
 <User size={30} className="mx-auto text-stone-300 mb-4"/>
 <h3 className="font-display text-sm font-bold uppercase text-brand-ink mb-1">
 {siteLabels?.rosterNoResultsTitle ||"No registrants found"}
 </h3>
 <p className="font-sans text-xs text-stone-500">
 {siteLabels?.rosterNoResultsDesc ||"There are no players currently recorded matching your search parameters or select class year filters."}
 </p>
 </div>
 )}
 </section>

 </div>
 );
}
