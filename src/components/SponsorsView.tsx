import { Target, ArrowUpRight, Award, Shield, CheckCircle } from "lucide-react";
import { Sponsor, SiteLabels } from "../types";

interface SponsorsViewProps {
  sponsors?: Sponsor[];
  siteLabels?: SiteLabels;
}

export default function SponsorsView({ sponsors, siteLabels }: SponsorsViewProps) {
  const corporateSponsors = sponsors && sponsors.length > 0 ? sponsors : [];

  return (
    <div id="sponsors_view" className="space-y-16 animate-fade-in px-4 md:px-0 bg-stone-50/20">
      
      {/* Editorial Title */}
      <section className="mx-auto max-w-7xl pt-6 text-center md:text-left space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-stone-250/70 pb-4 gap-4">
          <div className="space-y-2">
            <span className="inline-block bg-neutral-900 text-stone-100 font-mono text-[8.5px] px-2.5 py-1 tracking-widest uppercase font-bold rounded-xs">
              {siteLabels?.sponsorsSubtitle || "CORPORATE FELLOWSHIP"}
            </span>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-neutral-950 uppercase leading-none">
              {siteLabels?.sponsorsTitle || "OUR SPONSORS & PARTNERS"}
            </h1>
          </div>
          <span className="font-mono text-[9.5px] font-bold text-stone-400 tracking-wider uppercase">
            {siteLabels?.sponsorsVerifiedLabel || "CORPORATE ALIGNMENT • ENABLING ATHLETIC MILESTONES"}
          </span>
        </div>
      </section>

      {/* Grid Partner Board */}
      <section className="mx-auto max-w-7xl font-sans animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {corporateSponsors.filter(s => s.isActive).map((brand) => (
            <div
              key={brand.id}
              className="group bg-white border border-stone-200 shadow-2xs hover:shadow-xs rounded-lg transition-all duration-300 overflow-hidden flex flex-col"
            >
              <div className="aspect-[16/9] w-full bg-stone-50 border-b border-stone-100 flex items-center justify-center p-8">
                {brand.imageUrl ? (
                  <img 
                    src={brand.imageUrl} 
                    alt={brand.name} 
                    className="max-h-full max-w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                ) : (
                  <div className="text-stone-300 font-display text-2xl font-bold uppercase select-none">{brand.name}</div>
                )}
              </div>
              
              <div className="p-6 flex flex-col flex-grow space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-bold tracking-tight text-neutral-950 uppercase leading-none">
                    {brand.name}
                  </h3>
                  {brand.websiteUrl && (
                    <a 
                      href={brand.websiteUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-stone-400 hover:text-neutral-950 transition-colors"
                      title={`Visit ${brand.name} website`}
                    >
                      <ArrowUpRight size={16} />
                    </a>
                  )}
                </div>

                <p className="text-xs text-stone-600 leading-relaxed text-left line-clamp-3 flex-grow">
                  {brand.description}
                </p>

                <div className="pt-4 border-t border-stone-100 flex items-center gap-2 font-mono text-[9px] text-stone-400 uppercase font-bold tracking-wider">
                  <CheckCircle size={11} className="text-emerald-500" />
                  <span>{siteLabels?.sponsorsOfficiallyAssociatedLabel || "OFFICIALLY ASSOCIATED 2026"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Us Section for Partners */}
      <section className="mx-auto max-w-4xl border border-stone-200 rounded-lg p-8 md:p-12 text-center bg-white space-y-6 shadow-sm">
        <div className="flex flex-col items-center gap-4">
          <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-neutral-950">
            {siteLabels?.sponsorsContactTitle || "GET IN TOUCH WITH US"}
          </h2>
          <div className="h-1 w-12 bg-neutral-900"></div>
        </div>
        
        <p className="font-sans text-sm text-stone-600 max-w-xl mx-auto leading-relaxed whitespace-pre-line">
          {siteLabels?.sponsorsContactDescription || "For partnership inquiries, commercial alignment, or facility support, please reach out to our executive board."}
        </p>
      </section>

    </div>
  );
}
