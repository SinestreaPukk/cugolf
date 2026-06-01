import { SiteLabels, SiteSettings, TournamentScore, ClubActivityContent, AdminEditProps } from "../types";
import { Trophy, Target, Award, Shield, Clock, BookOpen, Star, Users, Edit } from "lucide-react";
import { useEffect } from "react";

interface AboutClubViewProps extends AdminEditProps {
  clubActivity: ClubActivityContent;
  scores: TournamentScore[];
  siteLabels?: SiteLabels;
  siteSettings?: SiteSettings;
}

export default function AboutClubView({ clubActivity, scores, siteLabels, isAdmin, onEditSection, activeSectionId }: AboutClubViewProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!clubActivity) return null;

  const renderEditOverlay = (sectionId: string, label: string) => {
    if (!isAdmin || !onEditSection) return null;
    const isActive = activeSectionId === sectionId;
    return (
      <div 
        className={`absolute inset-0 z-40 transition-all duration-200 cursor-pointer ${isActive ? 'ring-4 ring-[#da5f8e] bg-[#da5f8e]/5' : 'hover:ring-4 hover:ring-[#da5f8e]/50 hover:bg-[#da5f8e]/5'}`}
        onClick={(e) => {
          e.stopPropagation();
          onEditSection(sectionId);
        }}
      >
        <div className={`absolute top-4 left-4 bg-[#da5f8e] text-white px-3 py-1.5 font-mono text-[10px] font-bold tracking-widest flex items-center gap-2 shadow-lg transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <Edit size={12} /> {label}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-24 animate-fade-in pb-24">
      {/* 1. HERO SECTION */}
      <section className="relative h-[60vh] flex flex-col items-center justify-center text-center overflow-hidden bg-neutral-950">
        {renderEditOverlay("ca_hero", "EDIT HERO SECTION")}
        <div className="absolute inset-0 opacity-40">
           <img 
            src={clubActivity.heroImageUrl || "/uploads/windsor_team_legacy.png"} 
            className="w-full h-full object-cover grayscale" 
            alt="CU Golf Club Team"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-neutral-950/50" />
        </div>
        
        <div className="relative z-10 space-y-6 px-4">
          <h1 className="font-display text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-[0.85]">
            CLUB <br /> <span className="text-[#da5f8e]">ACTIVITIES</span>
          </h1>
          <p className="font-sans text-stone-400 text-sm md:text-base max-w-xl mx-auto uppercase tracking-wide leading-relaxed">
            The definitive home for competitive excellence and traditional sportsmanship at Chulalongkorn University.
          </p>
        </div>
      </section>

      {/* 2. PHILOSOPHY & VISION */}
      {(clubActivity.showPhilosophy ?? true) && (
        <section className="mx-auto max-w-5xl px-4 grid grid-cols-1 md:grid-cols-12 gap-12 items-start relative">
          {renderEditOverlay("ca_philosophy", "EDIT PHILOSOPHY")}
          <div className="md:col-span-5 space-y-6 sticky top-32">
            <div className="h-1.5 w-20 bg-[#da5f8e]" />
            <h2 className="font-display text-4xl font-black text-neutral-950 uppercase leading-none">
              {clubActivity.philosophyTitle || "OUR PHILOSOPHY"}
            </h2>
            <p className="font-serif italic text-xl text-stone-500 leading-relaxed">
              "{clubActivity.philosophyQuote}"
            </p>
          </div>
          
          <div className="md:col-span-7 space-y-12">
            <div className="space-y-6">
              <h3 className="font-display text-lg font-bold text-neutral-950 uppercase flex items-center gap-3">
                <Shield className="text-[#da5f8e]" size={20} />
                น้ำใจน้องพี่สีชมพู (THE PINK SPIRIT)
              </h3>
              <p className="font-sans text-stone-600 leading-relaxed text-justify whitespace-pre-line">
                {clubActivity.philosophyDescription}
              </p>
            </div>

            <div className="space-y-6">
              <h3 className="font-display text-lg font-bold text-neutral-950 uppercase flex items-center gap-3">
                <Target className="text-[#da5f8e]" size={20} />
                TECHNICAL EXCELLENCE
              </h3>
              <p className="font-sans text-stone-600 leading-relaxed text-justify whitespace-pre-line">
                {clubActivity.technicalExcellenceDescription}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* 3. CAPTAIN'S POLICY */}
      {(clubActivity.showCaptainMandate ?? true) && (
        <section className="bg-stone-50 py-24 border-y border-stone-200 relative">
          {renderEditOverlay("ca_captain", "EDIT CAPTAIN'S MANDATE")}
          <div className="mx-auto max-w-5xl px-4 grid grid-cols-1 md:grid-cols-12 gap-16 items-center">
            <div className="md:col-span-4 aspect-[3/4] overflow-hidden bg-neutral-950 border-4 border-white shadow-2xl rotate-[-2deg]">
               <img 
                 src={clubActivity.captainImageUrl || "/uploads/Screenshot_2026-05-26_at_21_44_02-1779806963893.png"} 
                 className="w-full h-full object-cover"
                 alt="Club Captain"
               />
            </div>
            
            <div className="md:col-span-8 space-y-8">
              <div className="space-y-2">
                <span className="font-mono text-[10px] font-black text-[#da5f8e] tracking-widest uppercase">
                  {new Date().getFullYear()} SEASON MANDATE
                </span>
                <h2 className="font-display text-4xl md:text-5xl font-black text-neutral-950 uppercase leading-none">
                  CAPTAIN'S <br /> PHILOSOPHY
                </h2>
              </div>
              
              <div className="prose prose-stone prose-lg italic font-serif text-stone-700 leading-relaxed whitespace-pre-line">
                {clubActivity.captainPhilosophy}
              </div>
              
              <div className="pt-4 border-t border-stone-200">
                <span className="block font-display text-lg font-black text-neutral-950 uppercase">{clubActivity.captainName}</span>
                <span className="block font-mono text-[10px] font-bold text-stone-400 uppercase tracking-widest">{clubActivity.captainRole}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. MAJOR COMPETITIONS */}
      {(clubActivity.showCompetitions ?? true) && (
        <section className="mx-auto max-w-5xl px-4 space-y-16 relative">
          {renderEditOverlay("ca_competitions", "EDIT COMPETITIONS")}
          <div className="text-center space-y-4">
            <h2 className="font-display text-4xl md:text-6xl font-black text-neutral-950 uppercase leading-none">
              MAJOR <br /> <span className="text-[#da5f8e]">COMPETITIONS</span>
            </h2>
            <p className="font-mono text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">
              OUR ANNUAL COMPETITIVE CALENDAR
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {(clubActivity.competitions || []).map((comp, idx) => (
              <div key={idx} className="border border-stone-200 p-8 space-y-6 hover:border-[#da5f8e] transition-colors group bg-white">
                <div className="flex justify-between items-start">
                  {idx % 4 === 0 ? <Trophy className="text-[#da5f8e]" size={32} /> : 
                   idx % 4 === 1 ? <Award className="text-[#da5f8e]" size={32} /> :
                   idx % 4 === 2 ? <Star className="text-[#da5f8e]" size={32} /> :
                   <Users className="text-[#da5f8e]" size={32} />}
                  <span className="font-mono text-[9px] font-black bg-stone-100 px-2 py-1 text-stone-500 group-hover:bg-[#da5f8e] group-hover:text-white transition-colors">
                    {comp.difficulty}
                  </span>
                </div>
                <div className="space-y-3">
                  <h4 className="font-display text-xl font-black text-neutral-950 uppercase leading-tight">
                    {comp.title}
                  </h4>
                  <p className="font-sans text-sm text-stone-500 leading-relaxed">
                    {comp.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. TRAINING & INFRASTRUCTURE (Summary) */}
      {(clubActivity.showTraining ?? true) && (
        <section className="mx-auto max-w-5xl px-4 grid grid-cols-1 md:grid-cols-12 gap-12 bg-neutral-950 text-white p-12 overflow-hidden relative">
           {renderEditOverlay("ca_training", "EDIT TRAINING GROUNDS")}
           <div className="absolute top-0 right-0 w-64 h-64 bg-[#da5f8e]/10 blur-3xl rounded-full -mr-32 -mt-32" />
           
           <div className="md:col-span-6 space-y-6 relative z-10">
              <h2 className="font-display text-3xl font-black uppercase leading-tight">
                WORLD-CLASS <br /> TRAINING GROUNDS
              </h2>
              <p className="font-sans text-sm text-stone-400 leading-relaxed text-justify whitespace-pre-line">
                {clubActivity.trainingDescription}
              </p>
           </div>
           
           <div className="md:col-span-6 flex items-center justify-center relative z-10">
              <div className="grid grid-cols-2 gap-4 w-full">
                 <div className="bg-white/5 p-6 border border-white/10 space-y-2">
                    <span className="block font-display text-2xl font-black text-[#da5f8e]">3x</span>
                    <span className="block font-mono text-[9px] font-bold text-stone-500 uppercase">Weekly Team Sessions</span>
                 </div>
                 <div className="bg-white/5 p-6 border border-white/10 space-y-2">
                    <span className="block font-display text-2xl font-black text-[#da5f8e]">AMATA</span>
                    <span className="block font-mono text-[9px] font-bold text-stone-500 uppercase">Primary Home Base</span>
                 </div>
                 <div className="bg-white/5 p-6 border border-white/10 space-y-2">
                    <span className="block font-display text-2xl font-black text-[#da5f8e]">Pro-Led</span>
                    <span className="block font-mono text-[9px] font-bold text-stone-500 uppercase">Coach Consultations</span>
                 </div>
                 <div className="bg-white/5 p-6 border border-white/10 space-y-2">
                    <span className="block font-display text-2xl font-black text-[#da5f8e]">100%</span>
                    <span className="block font-mono text-[9px] font-bold text-stone-500 uppercase">Athlete Dedication</span>
                 </div>
              </div>
           </div>
        </section>
      )}

      {/* 6. CLUB HISTORY SUMMARY */}
      {(clubActivity.showLegacy ?? true) && (
        <section className="mx-auto max-w-3xl px-4 text-center space-y-8 relative">
          {renderEditOverlay("ca_legacy", "EDIT LEGACY SECTION")}
          <div className="h-1 w-24 bg-[#da5f8e] mx-auto" />
          <h2 className="font-display text-3xl font-black text-neutral-950 uppercase">OUR LEGACY</h2>
          <p className="font-sans text-stone-600 leading-relaxed whitespace-pre-line">
            {clubActivity.legacyDescription}
          </p>
          <div className="flex justify-center items-center gap-8 pt-8">
             <div className="text-center">
               <span className="block font-display text-3xl font-black text-neutral-950">{clubActivity.foundedYear}</span>
               <span className="block font-mono text-[9px] font-bold text-stone-400 uppercase">FOUNDED</span>
             </div>
             <div className="h-12 w-px bg-stone-200" />
             <div className="text-center">
               <span className="block font-display text-3xl font-black text-neutral-950">{clubActivity.activeYears}</span>
               <span className="block font-mono text-[9px] font-bold text-stone-400 uppercase">ACTIVE YEARS</span>
             </div>
             <div className="h-12 w-px bg-stone-200" />
             <div className="text-center">
               <span className="block font-display text-3xl font-black text-neutral-950">#1</span>
               <span className="block font-mono text-[9px] font-bold text-stone-400 uppercase">TRADITION</span>
             </div>
          </div>
        </section>
      )}
    </div>
  );
}

