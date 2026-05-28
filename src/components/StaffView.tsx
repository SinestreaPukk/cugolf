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
    <div id="staff_view" className="space-y-16 animate-fade-in px-4 md:px-0 bg-stone-50/20">
      
      {/* Title */}
      <section className="mx-auto max-w-7xl pt-6 text-center md:text-left space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-stone-250/70 pb-4 gap-4">
          <div className="space-y-2">
            <span className="inline-block bg-neutral-900 text-stone-100 font-mono text-[8.5px] px-2.5 py-1 tracking-widest uppercase font-bold rounded-xs">
              &nbsp;
            </span>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-neutral-950 uppercase leading-none">
              {siteLabels?.staffTitle || "EXECUTIVE COMMITTEE & STAFF"}
            </h1>
          </div>
          <span className="font-mono text-[9.5px] font-bold text-stone-400 tracking-wider uppercase">
            {siteLabels?.staffVerifiedLabel || "ADMINISTRATOR BOARD • ATHLETIC DEPARTMENT APPOINTMENTS"}
          </span>
        </div>
      </section>

      {/* Staff Bento Display */}
      <section className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 border border-stone-200 divide-y md:divide-y-0 md:divide-x divide-stone-200 rounded-lg overflow-hidden bg-white shadow-2xs">
          {sortedStaff.map((person, index) => {
            // Give different icons to create a nice dynamic rhythm
            const Icons = [Star, Award, GraduationCap];
            const SelectIcon = Icons[index % Icons.length];

            return (
              <div
                key={person.id}
                className="p-8 flex flex-col justify-between group bg-white hover:bg-stone-50/50 transition-all duration-350"
              >
                <div className="space-y-6">
                  {/* Photo frame */}
                  <div className="relative aspect-square border border-stone-150 rounded-md overflow-hidden bg-stone-50">
                    <img
                      src={person.imageUrl}
                      alt={person.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    />
                  </div>

                  <div className="space-y-2">
                    <span className="font-mono text-[9px] text-stone-400 font-bold uppercase tracking-wider block">
                      {person.role}
                    </span>
                    <h3 className="font-display text-base font-bold text-neutral-950 uppercase leading-snug hover:underline">
                      {person.name}
                    </h3>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-stone-150 flex justify-between items-center text-[10px] font-mono tracking-wider text-stone-400 uppercase font-bold">
                  <span>{person.year}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
