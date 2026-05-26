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
    <div id="roster_view" className="space-y-12 animate-fade-in px-4 md:px-0 bg-stone-50/30">
      
      {/* Editorial Title Banner */}
      <section className="mx-auto max-w-7xl pt-6 text-center md:text-left space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-stone-250/70 pb-4 gap-4">
          <div className="space-y-2">
            <span className="inline-block bg-neutral-900 text-stone-100 font-mono text-[8.5px] px-2.5 py-1 tracking-widest uppercase font-bold rounded-xs">
              {siteLabels?.rosterSubtitle || "ACTIVE PLAYERS MATRIX"}
            </span>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-neutral-950 uppercase leading-none">
              {siteLabels?.rosterTitle || "THE 2026 VARSITY SQUAD"}
            </h1>
          </div>
          <span className="font-mono text-[9.5px] font-bold text-stone-400 tracking-wider uppercase">
            {siteLabels?.rosterVerifiedLabel || "HANDICAP REGISTRATION RECORD VERIFIED • THAILAND AMATEUR INDEX"}
          </span>
        </div>
      </section>

      {/* Modern Filter Board */}
      <section className="mx-auto max-w-7xl bg-white border border-stone-200/80 p-5 rounded-lg shadow-2xs grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Search Input bar */}
        <div className="md:col-span-6 relative">
          <label htmlFor="player_search" className="sr-only">Search player registry</label>
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={15} />
          <input
            id="player_search"
            type="text"
            placeholder={siteLabels?.rosterSearchPlaceholder || "Search roster registry..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-stone-50 border border-stone-150 rounded-md py-2 pl-10 pr-4 font-sans text-xs font-semibold focus:outline-none focus:bg-white focus:border-stone-400 text-stone-900 transition-colors uppercase outline-none"
          />
        </div>

        {/* Filter items */}
        <div className="md:col-span-6 flex flex-wrap gap-2 justify-start md:justify-end">
          <div className="flex items-center gap-1.5 mr-2 text-stone-400 font-mono text-[9px] uppercase font-bold tracking-widest">
            <Filter size={11} className="text-stone-400" />
            <span>{siteLabels?.rosterFilterLabel || "CLASS YEAR:"}</span>
          </div>
          {yearsList.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-3 py-1.5 font-mono text-[9px] uppercase font-bold tracking-wider border rounded-sm transition-all duration-200 cursor-pointer ${
                selectedYear.toLowerCase() === year.toLowerCase()
                  ? "border-neutral-900 bg-neutral-900 text-stone-100 shadow-3xs"
                  : "border-stone-200 bg-white text-stone-500 hover:bg-stone-50 hover:text-neutral-950"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredPlayers.map((player) => (
              <div
                key={player.id}
                className="group relative border border-stone-200 bg-white rounded-lg overflow-hidden shadow-2xs hover:shadow-xs transition-all duration-300 flex flex-col justify-between"
              >
                {/* Image Showcase */}
                <div className="relative aspect-square border-b border-stone-150 overflow-hidden bg-stone-50">
                  <img
                    src={player.imageUrl}
                    alt={player.name}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  
                  {/* Featured Badge */}
                  {player.isFeatured && (
                    <div className="absolute top-3 left-3 bg-neutral-950 text-[#ffffff] border border-stone-800 font-mono text-[8px] font-bold px-2 py-0.5 tracking-wider uppercase flex items-center gap-1 rounded-xs">
                      <ShieldCheck size={10} />
                      {siteLabels?.rosterSquadLeadBadge || "SQUAD LEAD"}
                    </div>
                  )}
                </div>

                {/* Info parameters */}
                <div className="p-5 flex-grow flex flex-col justify-between bg-white">
                  <div className="space-y-1.5">
                    <h3 className="font-display text-sm font-bold text-neutral-950 tracking-tight hover:underline transition-colors uppercase leading-tight">
                      {player.name}
                    </h3>
                    <div className="flex justify-between items-center text-[9.5px] font-mono font-bold text-stone-450 uppercase">
                      <span>{player.year} class</span>
                      <span className="text-right truncate max-w-[120px]">{player.faculty || "Faculty of Sports Science"}</span>
                    </div>
                  </div>

                  <hr className="border-stone-100 my-4" />

                  <div className="flex items-center justify-between font-mono text-[8.5px] uppercase tracking-wider text-stone-500 bg-stone-50/50 py-1.5 px-3 border border-stone-150 rounded-sm">
                    <span>{siteLabels?.rosterStatusActive || "STATUS: ACTIVE SQUAD"}</span>
                    <ChevronRight size={10} className="text-stone-400" />
                  </div>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-stone-250/80 p-16 text-center max-w-md mx-auto bg-white rounded-lg">
            <User size={30} className="mx-auto text-stone-300 mb-4" />
            <h3 className="font-display text-sm font-bold uppercase text-neutral-950 mb-1">
              {siteLabels?.rosterNoResultsTitle || "No registrants found"}
            </h3>
            <p className="font-sans text-xs text-stone-500">
              {siteLabels?.rosterNoResultsDesc || "There are no players currently recorded matching your search parameters or select class year filters."}
            </p>
          </div>
        )}
      </section>

    </div>
  );
}
