import { Target, ArrowUpRight, Award, Shield, CheckCircle } from "lucide-react";
import { Sponsor, SiteLabels } from "../types";

interface SponsorsViewProps {
  sponsors?: Sponsor[];
  siteLabels?: SiteLabels;
}

export default function SponsorsView({ sponsors, siteLabels }: SponsorsViewProps) {
  const corporateSponsors = sponsors && sponsors.length > 0 ? sponsors : [];

  return (
    <div id="sponsors_view" className="space-y-16 animate-fade-in px-4 md:px-0 bg-white">
      
      {/* Editorial Title */}
      <section className="mx-auto max-w-7xl pt-10 text-center md:text-left">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-neutral-950 pb-6 gap-6">
          <div className="space-y-2">
            <span className="inline-block bg-[#da5f8e] text-white font-mono text-[10px] px-3 py-1 tracking-[0.3em] uppercase font-black">
              {siteLabels?.sponsorsSubtitle || "CORPORATE FELLOWSHIP"}
            </span>
            <h1 className="font-thai text-5xl md:text-6xl font-bold tracking-tight text-neutral-950 leading-none">
              {siteLabels?.sponsorsTitle || "OUR SPONSORS & PARTNERS"}
            </h1>
          </div>
          <span className="font-mono text-[10px] font-black text-neutral-400 tracking-[0.2em] uppercase">
            {siteLabels?.sponsorsVerifiedLabel || "CORPORATE ALIGNMENT • ENABLING ATHLETIC MILESTONES"}
          </span>
        </div>
      </section>

      {/* Grid Partner Board */}
      <section className="mx-auto max-w-7xl animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {corporateSponsors.filter(s => s.isActive).map((brand) => (
            <div
              key={brand.id}
              className="group bg-white border border-neutral-950 transition-all duration-500 overflow-hidden flex flex-col hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,0.05)]"
            >
              <div className="aspect-[16/9] w-full bg-stone-50 border-b border-neutral-950 flex items-center justify-center p-12 overflow-hidden">
                {brand.imageUrl ? (
                  <img 
                    src={brand.imageUrl} 
                    alt={brand.name} 
                    className="max-h-full max-w-full object-contain grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                  />
                ) : (
                  <div className="text-stone-300 font-thai text-3xl font-bold uppercase select-none">{brand.name}</div>
                )}
              </div>
              
              <div className="p-8 flex flex-col flex-grow space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-thai text-3xl font-bold tracking-tight text-neutral-950 leading-none group-hover:text-[#da5f8e] transition-colors duration-300">
                    {brand.name}
                  </h3>
                  {brand.websiteUrl && (
                    <a 
                      href={brand.websiteUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-neutral-400 hover:text-[#da5f8e] transition-colors"
                      title={`Visit ${brand.name} website`}
                    >
                      <ArrowUpRight size={20} />
                    </a>
                  )}
                </div>

                <p className="font-serif text-base text-neutral-600 leading-relaxed text-left line-clamp-4 flex-grow italic">
                  {brand.description}
                </p>

                <div className="pt-6 border-t border-neutral-950/5 flex items-center gap-3 font-mono text-[10px] text-neutral-400 uppercase font-black tracking-[0.2em]">
                  <CheckCircle size={14} className="text-[#da5f8e]" />
                  <span>{siteLabels?.sponsorsOfficiallyAssociatedLabel || "OFFICIALLY ASSOCIATED 2026"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Us Section for Partners */}
      <section className="mx-auto max-w-4xl border-2 border-neutral-950 p-12 md:p-20 text-center bg-neutral-50 space-y-10">
        <div className="flex flex-col items-center gap-6">
          <h2 className="font-thai text-4xl md:text-5xl font-bold tracking-tight text-neutral-950">
            {siteLabels?.sponsorsContactTitle || "GET IN TOUCH WITH US"}
          </h2>
          <div className="h-0.5 w-24 bg-[#da5f8e]"></div>
        </div>
        
        <p className="font-serif text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed whitespace-pre-line italic">
          {siteLabels?.sponsorsContactDescription || "For partnership inquiries, commercial alignment, or facility support, please reach out to our executive board."}
        </p>
      </section>

    </div>
  );
}
