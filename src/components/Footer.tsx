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
    <footer className="border-t-2 border-neutral-950 bg-white text-neutral-950 mt-24">
      {/* Prime Editorial Banner */}
      <div className="grid grid-cols-1 border-b border-neutral-950 md:grid-cols-2">
        {(siteSettings?.showFooterMission ?? true) && (
          <div className="border-b border-neutral-950 p-10 md:border-b-0 md:border-r md:p-16 bg-neutral-50">
            <h4 className="font-mono text-[10px] font-black tracking-[0.3em] text-[#da5f8e] mb-6 uppercase">{siteLabels?.footerMissionTitle || "OUR MISSION"}</h4>
            <p className="font-serif text-lg leading-relaxed text-neutral-600 italic">
              {siteLabels?.footerMissionDescription || "Through rigorous practice, biomechanical assessment, and sporting integrity, the Chulalongkorn University Golf Club promotes elite varsity performance while instilling collegiate camaraderie and academic excellence."}
            </p>
          </div>
        )}
        {(siteSettings?.showFooterLegacy ?? true) && (
          <div className="p-10 md:p-16 bg-white">
            <h4 className="font-mono text-[10px] font-black tracking-[0.3em] text-[#da5f8e] mb-6 uppercase">{siteLabels?.footerLegacyTitle || "THE PINK BLAZER"}</h4>
            <p className="font-serif text-lg leading-relaxed text-neutral-600 italic">
              {siteLabels?.footerLegacyDescription || "Since the early chapters of Thailand university golf sports, wearing Chulalongkorn's pale-pink athletic blazer represents high sporting distinction, absolute integrity, and competitive peak performance."}
            </p>
          </div>
        )}
      </div>

      {/* Main Directory & Links Grid */}
      <div className="mx-auto max-w-7xl px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-4">
          
          <div className="flex flex-col gap-6">
            <Logo showText={true} size="lg" className="self-start" />
            <p className="font-thai text-xl font-bold leading-tight">
              จุฬาลงกรณ์มหาวิทยาลัย<br/>กอล์ฟคลับ
            </p>
          </div>

          <div>
            <h5 className="font-mono text-[11px] font-black tracking-[0.3em] text-neutral-400 uppercase mb-8">{siteLabels?.footerDirectoryTitle || "DIRECTORY"}</h5>
            <ul className="flex flex-col gap-4 font-mono text-[11px] font-black uppercase tracking-widest">
              <li>
                <button onClick={() => setCurrentTab("home")} className="text-neutral-600 hover:text-[#da5f8e] transition-all cursor-pointer">
                  {siteLabels?.footerDirectoryNewsRoom || "NEWS ROOM"}
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab("roster")} className="text-neutral-600 hover:text-[#da5f8e] transition-all cursor-pointer">
                  {siteLabels?.footerDirectoryRoster || "VARSITY ROSTER"}
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab("scores")} className="text-neutral-600 hover:text-[#da5f8e] transition-all cursor-pointer">
                  {siteLabels?.footerDirectoryScores || "MATCH STATS"}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-mono text-[11px] font-black tracking-[0.3em] text-neutral-400 uppercase mb-8">{siteLabels?.footerHeadquartersTitle || "HEADQUARTERS"}</h5>
            <div className="flex flex-col gap-6 text-[11px] text-neutral-600 font-black uppercase tracking-widest font-mono">
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-[#da5f8e] shrink-0" />
                <span className="leading-relaxed">
                  {siteSettings?.contactAddress || "Chula Sports Complex, Phayathai Rd, Pathum Wan, Bangkok 10330, Thailand"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-[#da5f8e] shrink-0" />
                <span>{siteSettings?.contactPhone || "+66 (0) 2218-1916"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-[#da5f8e] shrink-0" />
                <span className="lowercase">{siteSettings?.contactEmail || "golf@chula.ac.th"}</span>
              </div>
            </div>
          </div>

          <div>
            <h5 className="font-mono text-[11px] font-black tracking-[0.3em] text-neutral-400 uppercase mb-8">{siteLabels?.footerAffiliationsTitle || "AFFILIATIONS"}</h5>
            <ul className="flex flex-col gap-4 text-[11px] text-neutral-600 font-black uppercase tracking-widest font-mono">
              <li className="flex items-center gap-3">
                <Globe size={16} className="text-[#da5f8e]" />
                <a href="https://www.chula.ac.th" target="_blank" rel="noopener noreferrer" className="hover:text-[#da5f8e] flex items-center gap-1">
                  {siteLabels?.footerAffiliationsChulaMain || "CHULA MAIN"} <ExternalLink size={12} />
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Globe size={16} className="text-[#da5f8e]" />
                <a href="https://www.cusports.chula.ac.th" target="_blank" rel="noopener noreferrer" className="hover:text-[#da5f8e] flex items-center gap-1">
                  {siteLabels?.footerAffiliationsSportsOffice || "CU SPORTS OFFICE"} <ExternalLink size={12} />
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Globe size={16} className="text-[#da5f8e]" />
                <span className="text-neutral-400">
                  {siteSettings?.academicAffiliation || "TUGA MEMBER"}
                </span>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-neutral-950/5 mt-20 pt-10 flex flex-col items-center justify-between gap-8 md:flex-row">
          <p className="font-mono text-[10px] text-neutral-400 font-black uppercase tracking-[0.2em]">
            {(siteLabels?.footerRightsReserved || "© {year} CHULALONGKORN UNIVERSITY GOLF CLUB. ALL RIGHTS RESERVED.").replace("{year}", new Date().getFullYear().toString())}
          </p>
          <div className="flex items-center gap-8 font-mono text-[10px] text-neutral-400 font-black uppercase tracking-[0.2em]">
            <button onClick={() => setCurrentTab("admin")} className="hover:text-[#da5f8e] transition-colors cursor-pointer">
              {siteLabels?.footerCmsLogin || "CMS LOG-IN"}
            </button>
            <span>•</span>
            <span className="hover:text-neutral-950 transition-colors cursor-pointer">PRIVACY</span>
            <span>•</span>
            <span className="hover:text-neutral-950 transition-colors cursor-pointer">TERMS</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
