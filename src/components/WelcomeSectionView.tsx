import { useNavigate } from "react-router-dom";
import { WelcomeSection, SiteLabels, AdminEditProps } from "../types";
import golfersSilhouette from "../assets/images/golfers_silhouette.png";
import defaultBanner from "../assets/images/regenerated_image_1779791459213.jpg";
import { Edit } from "lucide-react";

interface WelcomeSectionViewProps extends AdminEditProps {
  welcomeSection: WelcomeSection;
  siteLabels?: SiteLabels;
}

export default function WelcomeSectionView({ welcomeSection, siteLabels, isAdmin, onEditSection, activeSectionId }: WelcomeSectionViewProps) {
  const navigate = useNavigate();
  if (!welcomeSection) return null;

  const isActive = activeSectionId === "home_welcome";
  const hoverClasses = isAdmin 
    ? `relative transition-all duration-200 cursor-pointer ${isActive ? 'ring-4 ring-[#da5f8e] z-40' : 'hover:ring-4 hover:ring-[#da5f8e]/50'}` 
    : "";

  return (
    <section 
      id="welcome_legacy_section" 
      className={`mx-auto max-w-7xl pt-2 animate-fade-in space-y-10 ${hoverClasses}`}
      onClick={(e) => {
        if (isAdmin && onEditSection) {
          e.stopPropagation();
          onEditSection("home_welcome");
        }
      }}
    >
      {isAdmin && (
        <div className={`absolute top-4 left-4 z-50 bg-[#da5f8e] text-white px-3 py-1.5 font-mono text-[10px] font-bold tracking-widest flex items-center gap-2 shadow-lg transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <Edit size={12} /> EDIT WELCOME HERO
        </div>
      )}
      
      {/* 1. Large Wide Panoramic Team / Welcoming Photo (matching premium full-bleed imagery) */}
      <div className="relative w-screen left-1/2 -translate-x-1/2 -mt-10 md:-mt-14 border-b border-stone-200/80 bg-neutral-950 overflow-hidden h-[320px] sm:h-[400px] md:h-[480px] shadow-xs transition-all duration-500">
        <img
          src={welcomeSection.imageUrl || defaultBanner}
          alt="Chulalongkorn University Golf Club Team welcoming banner"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover select-none object-center transition-transform duration-700 hover:scale-[1.01] brightness-[0.4]"
        />
        {/* Subtle premium dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        
        {/* Align overlay to max-w-7xl container bounds */}
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto max-w-7xl px-4 md:px-6 w-full pb-8 text-white space-y-2 z-10 drop-shadow-md">
            <p className="font-sans text-5xl sm:text-6xl md:text-7xl font-black leading-[0.9] uppercase tracking-tighter border-0 border-[#000000]">
              {siteLabels?.welcomeHeroTitle || "Longstanding"}
              <br />
              <span className="text-[#da5f8e] text-[78px] italic font-['Georgia',serif] font-black">{siteLabels?.welcomeHeroSubtitle || "Legacy"}</span>
            </p>
            <p className="text-[9px] md:text-[10px] text-stone-200 font-['Verdana',sans-serif] tracking-[0.25em] font-bold pt-0">
              {siteLabels?.welcomeHeroSocial || "cugolfclub @Student Government of Chulalongkorn University"}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Structured Magazine Content Grid (Sleek minimalist Split block) */}
      <div className="grid grid-cols-1 md:grid-cols-6 bg-white overflow-hidden">
        
        {/* Left Col (4/6 wide): Big Typography, Description and Quotes of Chula Golf legacy */}
        <div className="p-6 md:p-8 pt-5 md:pt-6 md:col-span-4 flex flex-col justify-start bg-white text-stone-900 space-y-3.5">
          
          {/* Main Title Headers */}
          <div className="space-y-4">
            <h1 className="font-thai text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold italic text-[#da5f8e] tracking-wide leading-tight py-0 antialiased pb-2">
              {welcomeSection.titleThai || "น้ำใจน้องพี่สีชมพู"}
            </h1>
            <h2 className="font-display text-[14px] md:text-base font-bold text-neutral-500 tracking-widest leading-normal uppercase">
              {welcomeSection.titleEnglish || "CHULALONGKORN UNIVERSITY GOLF CLUB"}
            </h2>
          </div>

          {/* Secondary explanation of Chula golf legacy */}
          <p className="font-sans text-[12px] md:text-[13px] font-medium text-stone-600 leading-relaxed text-justify whitespace-pre-line">
            {welcomeSection.description || `With a legacy of excellence on campus, the Chulalongkorn University Golf Club is actively expanding.\n\nWe are actively looking for new members to help shape the future of the club. Join us on the course to build lasting memories, enjoy your time at Chula University`}
          </p>
        </div>

        {/* Right Col (2/6 wide): 3-Golfers Premium Artwork Block */}
        <div 
          onClick={() => navigate("/roster")}
          className="md:col-span-2 bg-white flex items-center justify-center p-3.5 min-h-[210px] md:min-h-[250px] relative overflow-hidden cursor-pointer group transition-all duration-300 hover:brightness-95"
          title="Click to view our Varsity Squad Roster"
        >
          {/* Three Golfers PNG Silhouette Art */}
          <img
            src={golfersSilhouette}
            alt="Three Chula golfers in color silhouette overlays"
            referrerPolicy="no-referrer"
            className="w-full h-auto max-h-[230px] md:max-h-[270px] scale-[1.12] md:scale-[1.18] object-contain select-none relative z-10 transition-transform duration-500 group-hover:scale-[1.25]"
          />
        </div>

      </div>

    </section>
  );
}
