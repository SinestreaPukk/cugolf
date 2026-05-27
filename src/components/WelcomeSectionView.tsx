import { WelcomeSection, SiteLabels } from "../types";
import golfersSilhouette from "../assets/images/golfers_silhouette.png";
import defaultBanner from "../assets/images/regenerated_image_1779791459213.jpg";

interface WelcomeSectionViewProps {
  welcomeSection: WelcomeSection;
  setCurrentTab: (tab: string) => void;
  siteLabels?: SiteLabels;
}

export default function WelcomeSectionView({ welcomeSection, setCurrentTab, siteLabels }: WelcomeSectionViewProps) {
  if (!welcomeSection) return null;

  return (
    <section id="welcome_legacy_section" className="mx-auto max-w-7xl pt-2 animate-fade-in space-y-12">
      
      {/* 1. Large Wide Panoramic Team / Welcoming Photo (matching premium full-bleed imagery) */}
      <div className="relative w-screen left-1/2 -translate-x-1/2 -mt-10 md:-mt-14 border-b border-neutral-950 bg-neutral-950 overflow-hidden h-[400px] sm:h-[500px] md:h-[600px] shadow-sm transition-all duration-500">
        <img
          src={welcomeSection.imageUrl || defaultBanner}
          alt="Chulalongkorn University Golf Club Team welcoming banner"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover select-none object-center transition-transform duration-1000 hover:scale-[1.02] brightness-[0.45]"
        />
        {/* Subtle premium dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
        
        {/* Align overlay to max-w-7xl container bounds */}
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto max-w-7xl px-4 md:px-6 w-full pb-12 text-white space-y-4 z-10 drop-shadow-lg">
            <h1 className="font-thai text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold leading-[0.85] tracking-tight uppercase">
              {siteLabels?.welcomeHeroTitle || "Longstanding"}
              <br />
              <span className="text-[#da5f8e] italic">{siteLabels?.welcomeHeroSubtitle || "Legacy"}</span>
            </h1>
            <p className="text-[10px] md:text-[11px] text-stone-300 font-mono tracking-[0.4em] font-black uppercase pt-2">
              {siteLabels?.welcomeHeroSocial || "cugolfclub @Student Government of Chulalongkorn University"}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Structured Magazine Content Grid (Sleek minimalist Split block) */}
      <div className="grid grid-cols-1 md:grid-cols-6 bg-white border border-neutral-950 overflow-hidden">
        
        {/* Left Col (4/6 wide): Big Typography, Description and Quotes of Chula Golf legacy */}
        <div className="p-8 md:p-12 md:col-span-4 flex flex-col justify-center bg-white text-neutral-950 space-y-8">
          
          {/* Main Title Headers */}
          <div className="space-y-2">
            <h2 className="font-thai text-5xl md:text-6xl lg:text-7xl font-bold italic text-[#da5f8e] tracking-tight leading-none antialiased">
              {welcomeSection.titleThai || "น้ำใจน้องพี่สีชมพู"}
            </h2>
            <h3 className="font-mono text-xs md:text-sm font-black text-neutral-400 tracking-[0.3em] uppercase">
              {welcomeSection.titleEnglish || "CHULALONGKORN UNIVERSITY GOLF CLUB"}
            </h3>
          </div>

          {/* Secondary explanation of Chula golf legacy */}
          <p className="font-serif text-lg md:text-xl font-medium text-neutral-700 leading-relaxed text-justify whitespace-pre-line italic">
            {welcomeSection.description || `With a legacy of excellence on campus, the Chulalongkorn University Golf Club is actively expanding.\n\nWe are actively looking for new members to help shape the future of the club. Join us on the course to build lasting memories, enjoy your time at Chula University`}
          </p>
        </div>

        {/* Right Col (2/6 wide): 3-Golfers Premium Artwork Block */}
        <div 
          onClick={() => setCurrentTab("roster")}
          className="md:col-span-2 bg-neutral-50 flex items-center justify-center p-8 min-h-[300px] md:min-h-[400px] relative overflow-hidden cursor-pointer group transition-all duration-500 hover:bg-neutral-100 border-l border-neutral-950"
          title="Click to view our Varsity Squad Roster"
        >
          {/* Three Golfers PNG Silhouette Art */}
          <img
            src={golfersSilhouette}
            alt="Three Chula golfers in color silhouette overlays"
            referrerPolicy="no-referrer"
            className="w-full h-auto max-h-[300px] md:max-h-[350px] scale-[1.1] md:scale-[1.15] object-contain select-none relative z-10 transition-transform duration-700 group-hover:scale-[1.2] group-hover:rotate-1"
          />
          {/* Subtle vertical text accent */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 vertical-text font-mono text-[10px] font-black text-neutral-200 tracking-[0.5em] select-none group-hover:text-neutral-300 transition-colors uppercase">
            VARSITY ROSTER
          </div>
        </div>

      </div>

    </section>
  );
}
