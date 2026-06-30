import { SiteLabels, SiteSettings, TournamentScore, ClubActivityContent, AdminEditProps } from "../types";
import { Trophy, Edit, Calendar } from "lucide-react";
import { useEffect } from "react";
import { useLanguage } from "../utils/LanguageContext";

interface AboutClubViewProps extends AdminEditProps {
  clubActivity: ClubActivityContent;
  scores?: TournamentScore[];
  siteLabels?: SiteLabels;
  siteSettings?: SiteSettings;
}

export default function AboutClubView({ clubActivity, siteLabels, isAdmin, onEditSection, activeSectionId }: AboutClubViewProps) {
  const { language } = useLanguage();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!clubActivity) return null;

  const renderEditOverlay = (sectionId: string, label: string) => {
    if (!isAdmin || !onEditSection) return null;
    const isActive = activeSectionId === sectionId;
    return (
      <div 
        className={`absolute inset-0 z-40 transition-all duration-200 cursor-pointer ${isActive ? 'ring-4 ring-[#da5f8e] bg-brand-pink/5' : 'hover:ring-4 hover:ring-[#da5f8e]/50 hover:bg-brand-pink/5'}`}
        onClick={(e) => {
          e.stopPropagation();
          onEditSection(sectionId);
        }}
      >
        <div className={`absolute top-4 left-4 bg-brand-pink text-brand-neutral px-3 py-1.5 font-mono text-[10px] font-bold tracking-widest flex items-center gap-2 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <Edit size={12} /> {label}
        </div>
      </div>
    );
  };

  // Get current date in local time zone (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split("T")[0];

  // Filter activities to show only upcoming ones (from now on)
  const upcomingActivities = (clubActivity.competitions || [])
    .filter(comp => {
      if (!comp.date) return true;
      return comp.date >= todayStr;
    })
    .sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return a.date.localeCompare(b.date);
    });

  return (
    <div className="space-y-16 animate-fade-in pb-24">
      {/* 1. HERO SECTION */}
      <section className="relative h-[40vh] w-screen left-1/2 -translate-x-1/2 flex flex-col items-center justify-center text-center overflow-hidden bg-brand-ink">
        {renderEditOverlay("ca_hero", "EDIT HERO IMAGE")}
        <div className="absolute inset-0 opacity-60">
          <img 
            src={clubActivity.heroImageUrl || "/uploads/windsor_team_legacy.png"} 
            alt="CU Golf Club Team"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-brand-ink/50 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-ink via-transparent to-brand-ink/40" />
        </div>
        
        <div className="relative z-10 space-y-4 px-4">
          <h1 className="font-display text-4xl md:text-7xl font-black text-brand-neutral uppercase tracking-tighter leading-none">
            {siteLabels?.aboutClubHeroTitlePart1 || "UPCOMING"} <span className="text-brand-pink">{siteLabels?.aboutClubHeroTitlePart2 || "ACTIVITIES"}</span>
          </h1>
          <p className="font-sans text-stone-400 text-xs md:text-sm max-w-lg mx-auto uppercase tracking-wider leading-relaxed">
            {siteLabels?.aboutClubHeroSubtitle || "SCHEDULE & TOUR DATES FOR THE CHULALONGKORN SQUAD"}
          </p>
        </div>
      </section>

      {/* 2. ACTIVITIES LIST */}
      <section className="mx-auto max-w-5xl px-4 space-y-12 relative min-h-[40vh]">
        {renderEditOverlay("ca_competitions", "EDIT ACTIVITIES")}
        
        {upcomingActivities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {upcomingActivities.map((comp) => {
              // Format date nicely
              let formattedDate = comp.date || "Upcoming";
              try {
                if (comp.date) {
                  const d = new Date(comp.date);
                  formattedDate = d.toLocaleDateString(language === "th" ? "th-TH" : "en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  }).toUpperCase();
                }
              } catch (e) {
                // fallback
              }

              const diffVal = language === "th" && comp.difficultyThai ? comp.difficultyThai : comp.difficulty;

              return (
                <div 
                  key={comp.id} 
                  className="border border-brand-ink bg-brand-neutral overflow-hidden flex flex-col justify-between group transition-all duration-300 hover:border-brand-pink"
                >
                  {/* Activity Image Showcase */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-brand-stone border-b border-brand-ink">
                    <img
                      src={comp.imageUrl || "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=800"}
                      alt={language === "th" && comp.titleThai ? comp.titleThai : comp.title}
                      className="w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-105"
                    />
                    {diffVal && (
                      <span className="absolute top-4 right-4 font-mono text-[9px] font-black bg-brand-ink px-2.5 py-1 text-brand-neutral uppercase tracking-wider z-10">
                        {diffVal}
                      </span>
                    )}
                  </div>

                  {/* Activity Info Details */}
                  <div className="p-6 flex-grow flex flex-col justify-between space-y-6">
                    <div className="space-y-3">
                      <h3 className="font-display text-xl font-bold text-brand-ink uppercase leading-tight group-hover:text-brand-pink transition-colors">
                        {language === "th" && comp.titleThai ? comp.titleThai : comp.title}
                      </h3>
                      
                      <p className="font-sans text-xs text-stone-600 leading-relaxed">
                        {language === "th" && comp.descriptionThai ? comp.descriptionThai : comp.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="border border-dashed border-brand-ink/30 p-20 text-center max-w-xl mx-auto bg-brand-stone/30">
            <Trophy size={48} strokeWidth={1} className="mx-auto text-stone-300 mb-6"/>
            <h3 className="font-display text-xl font-bold uppercase text-brand-ink mb-3">
              {siteLabels?.aboutClubNoActivitiesTitle || "No upcoming activities scheduled"}
            </h3>
            <p className="font-sans text-xs text-stone-500 leading-relaxed uppercase tracking-wider">
              {siteLabels?.aboutClubNoActivitiesDesc || "Check back later for newly added tournaments and club matches."}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
