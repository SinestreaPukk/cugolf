import { Player, SiteLabels } from "../types";
import { useState } from "react";
import { User, Search, Filter, ShieldCheck, ChevronRight } from "lucide-react";

interface RosterViewProps {
  roster: Player[];
  siteLabels?: SiteLabels;
}

export default function RosterView({ roster, siteLabels }: RosterViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("All");

  const yearsList = ["All", "Freshman", "Sophomore", "Junior", "Senior"];

  const filteredPlayers = roster.filter((player) => {
    const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesYear = selectedYear === "All" || player.year.toLowerCase() === selectedYear.toLowerCase();
    return matchesSearch && matchesYear;
  });

  return (
    <div id="roster_view" className="space-y-16 animate-fade-in px-4 md:px-0 bg-white">
      
      {/* Editorial Title Banner */}
      <section className="mx-auto max-w-7xl pt-10 text-center md:text-left">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-neutral-950 pb-6 gap-6">
          <div className="space-y-2">
            <span className="inline-block bg-[#da5f8e] text-white font-mono text-[10px] px-3 py-1 tracking-[0.3em] uppercase font-black">
              {siteLabels?.rosterSubtitle || "ACTIVE PLAYERS MATRIX"}
            </span>
            <h1 className="font-thai text-5xl md:text-6xl font-bold tracking-tight text-neutral-950 leading-none">
              {siteLabels?.rosterTitle || "THE 2026 VARSITY SQUAD"}
            </h1>
          </div>
          <span className="font-mono text-[10px] font-black text-neutral-400 tracking-[0.2em] uppercase">
            {siteLabels?.rosterVerifiedLabel || "HANDICAP REGISTRATION RECORD VERIFIED • THAILAND AMATEUR INDEX"}
          </span>
        </div>
      </section>

      {/* Modern Filter Board */}
      <section className="mx-auto max-w-7xl bg-neutral-50 border border-neutral-950 p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        
        {/* Search Input bar */}
        <div className="md:col-span-6 relative">
          <label htmlFor="player_search" className="sr-only">Search player registry</label>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
          <input
            id="player_search"
            type="text"
            placeholder={siteLabels?.rosterSearchPlaceholder || "Search roster registry..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-neutral-950/20 py-3 pl-12 pr-4 font-mono text-xs font-bold focus:outline-none focus:border-neutral-950 text-neutral-950 transition-all uppercase placeholder:text-neutral-300"
          />
        </div>

        {/* Filter items */}
        <div className="md:col-span-6 flex flex-wrap gap-3 justify-start md:justify-end">
          <div className="flex items-center gap-2 mr-4 text-neutral-400 font-mono text-[10px] uppercase font-black tracking-widest">
            <Filter size={12} />
            <span>{siteLabels?.rosterFilterLabel || "CLASS YEAR:"}</span>
          </div>
          {yearsList.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-5 py-2.5 font-mono text-[10px] uppercase font-black tracking-widest border transition-all duration-300 cursor-pointer ${
                selectedYear.toLowerCase() === year.toLowerCase()
                  ? "border-neutral-950 bg-neutral-950 text-white shadow-[4px_4px_0px_0px_#da5f8e]"
                  : "border-neutral-950/10 bg-white text-neutral-400 hover:border-neutral-950 hover:text-neutral-950"
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
                className="group relative border border-neutral-950 bg-white overflow-hidden transition-all duration-500 flex flex-col justify-between hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,0.05)]"
              >
                {/* Image Showcase */}
                <div className="relative aspect-[4/5] border-b border-neutral-950 overflow-hidden bg-stone-100">
                  <img
                    src={player.imageUrl}
                    alt={player.name}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                  />
                  
                  {/* Featured Badge */}
                  {player.isFeatured && (
                    <div className="absolute top-4 left-4 bg-neutral-950 text-white font-mono text-[9px] font-black px-3 py-1.5 tracking-[0.2em] uppercase flex items-center gap-2">
                      <ShieldCheck size={12} className="text-[#da5f8e]" />
                      {siteLabels?.rosterSquadLeadBadge || "SQUAD LEAD"}
                    </div>
                  )}
                </div>

                {/* Info parameters */}
                <div className="p-6 space-y-6 flex-grow flex flex-col justify-between">
                  <div className="space-y-3">
                    <h3 className="font-thai text-3xl font-bold text-neutral-950 leading-none group-hover:text-[#da5f8e] transition-colors duration-300">
                      {player.name}
                    </h3>
                    <div className="flex flex-col gap-1 font-mono text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                      <span>{player.year} class</span>
                      <span className="text-[#da5f8e] truncate">{player.faculty || "Faculty of Sports Science"}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between font-mono text-[9px] font-black uppercase tracking-[0.2em] text-neutral-950 border-t border-neutral-950/5 pt-4">
                    <span>{siteLabels?.rosterStatusActive || "STATUS: ACTIVE SQUAD"}</span>
                    <ChevronRight size={14} className="text-[#da5f8e] group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="border border-neutral-950/5 p-20 text-center max-w-xl mx-auto bg-neutral-50">
            <User size={48} strokeWidth={1} className="mx-auto text-neutral-950/20 mb-6" />
            <h3 className="font-thai text-2xl font-bold uppercase text-neutral-950 mb-3">
              {siteLabels?.rosterNoResultsTitle || "No registrants found"}
            </h3>
            <p className="font-serif text-lg text-neutral-500 italic">
              {siteLabels?.rosterNoResultsDesc || "There are no players currently recorded matching your search parameters or select class year filters."}
            </p>
          </div>
        )}
      </section>

    </div>
  );
}
