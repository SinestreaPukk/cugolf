import { Staff, SiteLabels } from "../types";
import { Award, ShieldAlert, GraduationCap, Star } from "lucide-react";

interface StaffViewProps {
  staff: Staff[];
  siteLabels?: SiteLabels;
}

export default function StaffView({ staff, siteLabels }: StaffViewProps) {
  // Sort staff by order
  const sortedStaff = [...staff].sort((a, b) => a.order - b.order);

  return (
    <div id="staff_view" className="space-y-16 animate-fade-in px-4 md:px-0 bg-white">
      
      {/* Title */}
      <section className="mx-auto max-w-7xl pt-10 text-center md:text-left">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-neutral-950 pb-6 gap-6">
          <div className="space-y-2">
            <span className="inline-block bg-[#da5f8e] text-white font-mono text-[10px] px-3 py-1 tracking-[0.3em] uppercase font-black">
              {siteLabels?.staffSubtitle || "GOVERNANCE BOARD"}
            </span>
            <h1 className="font-thai text-5xl md:text-6xl font-bold tracking-tight text-neutral-950 leading-none">
              {siteLabels?.staffTitle || "EXECUTIVE COMMITTEE & STAFF"}
            </h1>
          </div>
          <span className="font-mono text-[10px] font-black text-neutral-400 tracking-[0.2em] uppercase">
            {siteLabels?.staffVerifiedLabel || "ADMINISTRATOR BOARD • ATHLETIC DEPARTMENT APPOINTMENTS"}
          </span>
        </div>
      </section>

      {/* Staff Bento Display */}
      <section className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 border border-neutral-950 divide-y md:divide-y-0 md:divide-x divide-neutral-950 overflow-hidden bg-white">
          {sortedStaff.map((person, index) => {
            return (
              <div
                key={person.id}
                className="p-10 flex flex-col justify-between group bg-white hover:bg-neutral-50/50 transition-all duration-500"
              >
                <div className="space-y-8">
                  {/* Photo frame */}
                  <div className="relative aspect-[4/5] border border-neutral-950 overflow-hidden bg-stone-100">
                    <img
                      src={person.imageUrl}
                      alt={person.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                    />
                  </div>

                  <div className="space-y-3">
                    <span className="font-mono text-[10px] text-[#da5f8e] font-black uppercase tracking-[0.2em] block">
                      {person.role}
                    </span>
                    <h3 className="font-thai text-3xl font-bold text-neutral-950 leading-none group-hover:text-[#da5f8e] transition-colors duration-300">
                      {person.name}
                    </h3>
                  </div>
                </div>

                <div className="mt-12 pt-6 border-t border-neutral-950/5 flex justify-between items-center text-[11px] font-mono tracking-[0.2em] text-neutral-400 uppercase font-black">
                  <span>{person.year}</span>
                  <Award size={16} className="text-[#da5f8e] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
