import { Player, SiteLabels, AdminEditProps } from"../types";
import { useState } from"react";
import { User, Search, Filter, ShieldCheck, ChevronRight, Edit, LayoutGrid } from"lucide-react";

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
 ? `relative transition-all duration-200 cursor-pointer ${isActive ? 'ring-4 ring-brand-pink bg-brand-pink/5 z-40' : 'hover:ring-4 hover:ring-brand-pink/50 hover:bg-brand-pink/5'}` 
 :"";

 return (
 <div 
 id="roster_view"
 className={`space-y-16 animate-fade-in px-4 md:px-0 bg-brand-neutral min-h-screen pb-24 ${wrapperClasses}`}
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
 <section className="mx-auto max-w-7xl pt-12 md:pt-20">
 <div className="flex flex-col md:flex-row md:items-end justify-between border-b-4 border-brand-ink pb-8 gap-8">
 <div className="space-y-4">
 <span className="inline-block bg-brand-ink text-brand-neutral font-mono text-[10px] px-4 py-1.5 tracking-[0.4em] uppercase font-black">
 {siteLabels?.rosterSubtitle ||"ACTIVE REPRESENTATIVES"}
 </span>
 <h1 className="font-display text-4xl md:text-6xl font-black tracking-tighter text-brand-ink uppercase leading-[0.85]">
 {siteLabels?.rosterTitle ||"THE VARSITY SQUAD"}
 </h1>
 </div>
 <div className="font-mono text-[10px] font-black text-stone-400 tracking-[0.2em] uppercase flex items-center gap-4 bg-brand-stone px-6 py-3 border border-brand-ink/10">
 <ShieldCheck size={14} className="text-brand-pink" /> {siteLabels?.rosterVerifiedLabel ||"REGISTRATION VERIFIED"}
 </div>
 </div>
 </section>

 {/* Modern Filter Board */}
 <section className="mx-auto max-w-7xl bg-brand-stone/30 border-2 border-brand-ink p-8 flex flex-col md:flex-row gap-10 items-center justify-between shadow-[8px_8px_0px_rgba(18,18,18,0.05)]">
 
 {/* Search Input bar */}
 <div className="w-full md:max-w-md relative">
 <label htmlFor="player_search"className="sr-only">Search player registry</label>
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-pink"size={16} />
 <input
 id="player_search"
 type="text"
 placeholder={siteLabels?.rosterSearchPlaceholder ||"SEARCH REGISTRY..."}
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full bg-brand-neutral border-2 border-brand-ink py-4 pl-12 pr-6 font-mono text-[10px] font-black focus:outline-none focus:bg-white focus:border-brand-pink text-brand-ink transition-all uppercase outline-none"
 />
 </div>

 {/* Filter items */}
 <div className="flex flex-wrap gap-3 justify-center md:justify-end">
 <div className="flex items-center gap-2 mr-4 text-stone-400 font-mono text-[10px] uppercase font-black tracking-[0.2em]">
 <Filter size={12} className="text-brand-pink"/>
 <span>FILTERS:</span>
 </div>
 {yearsList.map((year) => (
 <button
 key={year}
 onClick={() => setSelectedYear(year)}
 className={`px-6 py-2.5 font-mono text-[10px] uppercase font-black tracking-widest border-2 transition-all duration-300 cursor-pointer ${
 selectedYear.toLowerCase() === year.toLowerCase()
 ?"border-brand-ink bg-brand-ink text-brand-neutral shadow-lg"
 :"border-brand-ink/20 bg-brand-neutral text-stone-500 hover:border-brand-pink hover:text-brand-pink"
 }`}
 >
 {year}
 </button>
 ))}
 </div>

 </section>

 {/* Roster Grid */}
 <section className="mx-auto max-w-7xl">
 {filteredPlayers.length > 0 ? (
 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
 {filteredPlayers.map((player) => (
 <div
 key={player.id}
 className="group relative border-2 border-brand-ink bg-brand-neutral overflow-hidden transition-all duration-500 flex flex-col justify-between shadow-[8px_8px_0px_rgba(18,18,18,0.03)] hover:shadow-none hover:translate-y-2 hover:translate-x-2"
 >
 {/* Image Showcase */}
 <div className="relative aspect-[4/5] border-b-2 border-brand-ink overflow-hidden bg-brand-stone">
 <img
 src={player.imageUrl}
 alt={player.name}
 referrerPolicy="no-referrer"
 className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
 />
 
 {/* Featured Badge */}
 {player.isFeatured && (
 <div className="absolute top-4 left-4 bg-brand-ink text-brand-neutral border-2 border-brand-neutral/20 font-mono text-[9px] font-black px-3 py-1 tracking-[0.2em] uppercase flex items-center gap-2 shadow-2xl">
 <ShieldCheck size={12} className="text-brand-pink" />
 {siteLabels?.rosterSquadLeadBadge ||"SQUAD LEAD"}
 </div>
 )}
 </div>

 {/* Info parameters */}
 <div className="p-8 flex-grow flex flex-col justify-between bg-brand-neutral space-y-6">
 <div className="space-y-4">
 <h3 className="font-display text-2xl font-black text-brand-ink tracking-tight group-hover:text-brand-pink transition-colors uppercase leading-[0.85]">
 {player.name}
 </h3>
 <div className="flex flex-col gap-2 font-mono text-[10px] font-black text-stone-400 uppercase tracking-widest">
 <div className="flex items-center gap-2">
 <span className="h-1.5 w-1.5 rounded-full bg-brand-pink" />
 <span>{player.year} class</span>
 </div>
 <div className="flex items-center gap-2">
 <span className="h-1.5 w-1.5 rounded-full bg-brand-pink" />
 <span className="truncate">{player.faculty ||"Sports Science"}</span>
 </div>
 </div>
 </div>

 <div className="pt-6 border-t-2 border-brand-stone flex items-center justify-between font-mono text-[9px] font-black uppercase tracking-[0.2em] text-stone-400 group-hover:text-brand-ink transition-colors">
 <span>{siteLabels?.rosterStatusActive ||"STATUS: ACTIVE"}</span>
 <ChevronRight size={14} className="text-brand-pink"/>
 </div>
 </div>

 </div>
 ))}
 </div>
 ) : (
 <div className="border-4 border-dashed border-brand-ink p-32 text-center max-w-3xl mx-auto bg-brand-stone/10">
 <LayoutGrid size={64} className="mx-auto text-brand-pink opacity-20 mb-8"/>
 <h3 className="font-display text-2xl font-black uppercase text-brand-ink tracking-widest">
 {siteLabels?.rosterNoResultsTitle ||"NO REGISTRANTS FOUND"}
 </h3>
 <p className="font-mono text-xs text-stone-400 uppercase tracking-widest mt-4">
 {siteLabels?.rosterNoResultsDesc ||"REISTRY LINK ACTIVE • SEARCH FILTER RETURNED NULL"}
 </p>
 </div>
 )}
 </section>

 </div>
 );
}
