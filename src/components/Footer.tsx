import { Mail, Phone, MapPin, Globe, ExternalLink } from "lucide-react";
import { SiteSettings, SiteLabels } from "../types";
import Logo from "./Logo";

interface FooterProps {
  setCurrentTab: (tab: string) => void;
  siteSettings?: SiteSettings;
  siteLabels?: SiteLabels;
}

export default function Footer({ setCurrentTab, siteSettings, siteLabels }: FooterProps) {
  return (
    <footer className="border-t border-stone-200 bg-white text-stone-900 mt-24">
      {/* Prime Editorial Banner */}
      <div className="grid grid-cols-1 border-b border-stone-200 md:grid-cols-2">
        {(siteSettings?.showFooterMission ?? true) && (
          <div className="border-b border-stone-200 p-8 md:border-b-0 md:border-r md:border-stone-200 md:p-12 bg-stone-50/50">
            <h4 className="font-display text-sm font-bold tracking-widest text-neutral-950 mb-4 uppercase">{siteLabels?.footerMissionTitle || "OUR MISSION"}</h4>
            <p className="font-sans text-xs leading-relaxed text-stone-600">
              {siteLabels?.footerMissionDescription || "Through rigorous practice, biomechanical assessment, and sporting integrity, the Chulalongkorn University Golf Club promotes elite varsity performance while instilling collegiate camaraderie and academic excellence."}
            </p>
          </div>
        )}
        {(siteSettings?.showFooterLegacy ?? true) && (
          <div className="border-b border-stone-200 p-8 md:border-b-0 md:p-12">
            <h4 className="font-display text-sm font-bold tracking-widest text-neutral-950 mb-4 uppercase">{siteLabels?.footerLegacyTitle || "THE PINK BLAZER"}</h4>
            <p className="font-sans text-xs leading-relaxed text-stone-600">
              {siteLabels?.footerLegacyDescription || "Since the early chapters of Thailand university golf sports, wearing Chulalongkorn's pale-pink athletic blazer represents high sporting distinction, absolute integrity, and competitive peak performance."}
            </p>
          </div>
        )}
      </div>

      {/* Main Directory & Links Grid */}
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          
          <div className="flex flex-col gap-4">
            <Logo showText={true} size="lg" className="self-start" />
          </div>

          <div>
            <h5 className="font-mono text-[10px] font-bold tracking-widest text-stone-400 uppercase mb-4">{siteLabels?.footerDirectoryTitle || "DIRECTORY"}</h5>
            <ul className="flex flex-col gap-2.5 font-sans text-xs font-bold uppercase">
              <li>
                <button onClick={() => setCurrentTab("home")} className="text-stone-700 hover:text-neutral-950 hover:underline transition-all cursor-pointer">
                  {siteLabels?.footerDirectoryNewsRoom || "NEWS ROOM"}
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab("roster")} className="text-stone-700 hover:text-neutral-950 hover:underline transition-all cursor-pointer">
                  {siteLabels?.footerDirectoryRoster || "VARSITY ROSTER"}
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab("scores")} className="text-stone-700 hover:text-neutral-950 hover:underline transition-all cursor-pointer">
                  {siteLabels?.footerDirectoryScores || "MATCH STATS"}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-mono text-[10px] font-bold tracking-widest text-stone-400 uppercase mb-4">{siteLabels?.footerHeadquartersTitle || "HEADQUARTERS"}</h5>
            <div className="flex flex-col gap-3 text-xs text-stone-600 font-semibold uppercase">
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-stone-400 shrink-0 mt-0.5" />
                <span className="normal-case text-stone-650">
                  {siteSettings?.contactAddress || "Chula Sports Complex, Phayathai Rd, Pathum Wan, Bangkok 10330, Thailand"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-stone-400 shrink-0" />
                <span>{siteSettings?.contactPhone || "+66 (0) 2218-1916"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-stone-400 shrink-0" />
                <span className="lowercase font-normal">{siteSettings?.contactEmail || "golf@chula.ac.th"}</span>
              </div>
            </div>
          </div>

          <div>
            <h5 className="font-mono text-[10px] font-bold tracking-widest text-stone-400 uppercase mb-4">{siteLabels?.footerAffiliationsTitle || "AFFILIATIONS"}</h5>
            <ul className="flex flex-col gap-2 text-xs text-stone-600 font-semibold">
              <li className="flex items-center gap-1 uppercase">
                <Globe size={13} className="text-stone-400" />
                <a href="https://www.chula.ac.th" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-neutral-950 flex items-center gap-0.5 font-bold">
                  {siteLabels?.footerAffiliationsChulaMain || "CHULA MAIN"} <ExternalLink size={10} />
                </a>
              </li>
              <li className="flex items-center gap-1 uppercase">
                <Globe size={13} className="text-stone-400" />
                <a href="https://www.cusports.chula.ac.th" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-neutral-950 flex items-center gap-0.5 font-bold">
                  {siteLabels?.footerAffiliationsSportsOffice || "CU SPORTS OFFICE"} <ExternalLink size={10} />
                </a>
              </li>
              <li className="flex items-center gap-1 uppercase">
                <Globe size={13} className="text-stone-400" />
                <span className="normal-case font-medium">
                  {siteSettings?.academicAffiliation || "Thailand University Golf Association (TUGA)"}
                </span>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-stone-200 mt-12 pt-6 flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="font-mono text-[9px] text-stone-400 font-bold uppercase">
            {(siteLabels?.footerRightsReserved || "© {year} CHULALONGKORN UNIVERSITY GOLF CLUB. ALL RIGHTS RESERVED.").replace("{year}", new Date().getFullYear().toString())}
          </p>
          <div className="flex items-center gap-6 font-mono text-[9px] text-stone-400 font-bold uppercase">
            <button onClick={() => setCurrentTab("admin")} className="hover:underline hover:text-neutral-950 font-bold cursor-pointer">
              {siteLabels?.footerCmsLogin || "CMS LOG-IN"}
            </button>
            <span>•</span>
            <span>{siteLabels?.footerPrivacyDisclosure || "PRIVACY DISCLOSURE"}</span>
            <span>•</span>
            <span>{siteLabels?.footerTermsOfTradition || "TERMS OF TRADITION"}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
