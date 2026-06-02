import { SiteLabels, SiteSettings, TournamentScore, ClubActivityContent, AdminEditProps } from"../types";
import { Trophy, Target, Award, Shield, Clock, BookOpen, Star, Users, Edit, GraduationCap, MapPin } from"lucide-react";
import { useEffect } from"react";

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
 className={`absolute inset-0 z-40 transition-all duration-200 cursor-pointer ${isActive ? 'ring-4 ring-brand-pink bg-brand-pink/5' : 'hover:ring-4 hover:ring-brand-pink/50 hover:bg-brand-pink/5'}`}
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

 return (
 <div className="space-y-32 animate-fade-in pb-24 bg-brand-neutral min-h-screen">
 {/* 1. HERO SECTION */}
 <section className="relative h-[80vh] flex flex-col items-center justify-center text-center overflow-hidden bg-brand-ink">
 {renderEditOverlay("ca_hero","EDIT HERO SECTION")}
 <div className="absolute inset-0">
 <img 
 src={clubActivity.heroImageUrl ||"/uploads/windsor_team_legacy.png"} 
 className="w-full h-full object-cover grayscale opacity-30 transition-transform duration-1000 group-hover:scale-105"
 alt="CU Golf Club Team"
 />
 <div className="absolute inset-0 bg-gradient-to-b from-brand-ink/80 via-transparent to-brand-ink"/>
 </div>
 
 <div className="relative z-10 space-y-8 px-6 max-w-5xl">
 <div className="space-y-2">
 <span className="inline-block bg-brand-pink text-brand-neutral font-mono text-[11px] px-4 py-1.5 tracking-[0.4em] uppercase font-black shadow-2xl">
 EST. {clubActivity.foundedYear || "1923"} • TRADITION OF EXCELLENCE
 </span>
 <h1 className="font-display text-6xl md:text-9xl font-black text-brand-neutral uppercase tracking-tighter leading-[0.8]">
 CLUB <br /> <span className="text-brand-pink">ACTIVITIES</span>
 </h1>
 </div>
 <p className="font-sans text-stone-400 text-base md:text-lg max-w-2xl mx-auto uppercase tracking-widest leading-relaxed border-t border-brand-neutral/20 pt-8">
 {siteLabels?.navBrandSubtitle || "Official Digital Archive of Chulalongkorn University Golf Club"}
 </p>
 </div>

 <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 text-brand-neutral opacity-30 animate-bounce">
 <span className="font-mono text-[9px] font-black uppercase tracking-[0.3em]">EXPLORE LEGACY</span>
 <div className="w-px h-12 bg-brand-neutral" />
 </div>
 </section>

 {/* 2. PHILOSOPHY & VISION */}
 {(clubActivity.showPhilosophy ?? true) && (
 <section className="mx-auto max-w-6xl px-6 grid grid-cols-1 lg:grid-cols-12 gap-20 items-start relative">
 {renderEditOverlay("ca_philosophy","EDIT PHILOSOPHY")}
 <div className="lg:col-span-5 space-y-10 sticky top-32">
 <div className="space-y-4">
 <span className="font-mono text-[10px] font-black text-brand-pink tracking-[0.4em] uppercase">MISSION STATEMENT</span>
 <h2 className="font-display text-4xl md:text-6xl font-black text-brand-ink uppercase leading-[0.9] tracking-tighter">
 {clubActivity.philosophyTitle ||"OUR PHILOSOPHY"}
 </h2>
 </div>
 <div className="relative">
 <span className="absolute -top-8 -left-8 text-8xl font-serif text-brand-pink opacity-10">“</span>
 <p className="font-serif italic text-2xl md:text-3xl text-stone-500 leading-tight relative z-10">
 {clubActivity.philosophyQuote}
 </p>
 <span className="absolute -bottom-16 -right-4 text-8xl font-serif text-brand-pink opacity-10">”</span>
 </div>
 </div>
 
 <div className="lg:col-span-7 space-y-20 pt-4">
 <div className="space-y-8">
 <div className="flex items-center gap-4">
 <div className="h-10 w-10 rounded-full bg-brand-pink flex items-center justify-center text-brand-neutral shadow-lg">
 <Shield size={20} />
 </div>
 <h3 className="font-thai text-3xl font-bold text-brand-ink uppercase tracking-tight">
 น้ำใจน้องพี่สีชมพู (THE PINK SPIRIT)
 </h3>
 </div>
 <p className="font-sans text-lg text-stone-600 leading-relaxed text-justify whitespace-pre-line border-l-4 border-brand-stone pl-8 py-2">
 {clubActivity.philosophyDescription}
 </p>
 </div>

 <div className="space-y-8">
 <div className="flex items-center gap-4">
 <div className="h-10 w-10 rounded-full bg-brand-pink flex items-center justify-center text-brand-neutral shadow-lg">
 <Target size={20} />
 </div>
 <h3 className="font-display text-3xl font-black text-brand-ink uppercase tracking-tight">
 TECHNICAL EXCELLENCE
 </h3>
 </div>
 <p className="font-sans text-lg text-stone-600 leading-relaxed text-justify whitespace-pre-line border-l-4 border-brand-stone pl-8 py-2">
 {clubActivity.technicalExcellenceDescription}
 </p>
 </div>
 </div>
 </section>
 )}

 {/* 3. CAPTAIN'S POLICY */}
 {(clubActivity.showCaptainMandate ?? true) && (
 <section className="bg-brand-stone/30 py-32 border-y-2 border-brand-ink relative overflow-hidden">
 {renderEditOverlay("ca_captain","EDIT CAPTAIN'S MANDATE")}
 {/* Background large letter */}
 <span className="absolute -bottom-20 -right-20 text-[30rem] font-display font-black text-brand-pink/5 select-none pointer-events-none">C</span>
 
 <div className="mx-auto max-w-6xl px-6 grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
 <div className="lg:col-span-5 relative group">
 <div className="absolute inset-0 bg-brand-pink translate-x-4 translate-y-4 -z-10 group-hover:translate-x-6 group-hover:translate-y-6 transition-transform duration-500" />
 <div className="aspect-[3/4] overflow-hidden bg-brand-ink border-2 border-brand-ink">
 <img 
 src={clubActivity.captainImageUrl ||"/uploads/Screenshot_2026-05-26_at_21_44_02-1779806963893.png"} 
 className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
 alt="Club Captain"
 />
 </div>
 </div>
 
 <div className="lg:col-span-7 space-y-12">
 <div className="space-y-6">
 <span className="font-mono text-[11px] font-black text-brand-pink tracking-[0.4em] uppercase flex items-center gap-3">
 <span className="h-px w-8 bg-brand-pink" />
 {new Date().getFullYear()} SEASON MANDATE
 </span>
 <h2 className="font-display text-5xl md:text-7xl font-black text-brand-ink uppercase leading-[0.85] tracking-tighter">
 CAPTAIN'S <br /> MANDATE
 </h2>
 </div>
 
 <div className="prose prose-stone prose-xl italic font-serif text-stone-700 leading-relaxed whitespace-pre-line border-l-4 border-brand-pink pl-10 py-4">
 {clubActivity.captainPhilosophy}
 </div>
 
 <div className="pt-10 flex items-center gap-6">
 <div className="h-16 w-16 rounded-full bg-brand-ink flex items-center justify-center text-brand-neutral shadow-xl">
 <GraduationCap size={32} />
 </div>
 <div className="space-y-1">
 <span className="block font-display text-2xl font-black text-brand-ink uppercase tracking-tight">{clubActivity.captainName}</span>
 <span className="block font-mono text-[10px] font-black text-stone-400 uppercase tracking-[0.3em]">{clubActivity.captainRole}</span>
 </div>
 </div>
 </div>
 </div>
 </section>
 )}

 {/* 4. MAJOR COMPETITIONS */}
 {(clubActivity.showCompetitions ?? true) && (
 <section className="mx-auto max-w-6xl px-6 space-y-24 relative">
 {renderEditOverlay("ca_competitions","EDIT COMPETITIONS")}
 <div className="flex flex-col md:flex-row md:items-end justify-between border-b-4 border-brand-ink pb-10 gap-8">
 <div className="space-y-4">
 <span className="font-mono text-[10px] font-black text-brand-pink tracking-[0.4em] uppercase block">CALENDAR</span>
 <h2 className="font-display text-4xl md:text-7xl font-black text-brand-ink uppercase leading-none tracking-tighter">
 MAJOR <br /> <span className="text-brand-pink">ENGAGEMENTS</span>
 </h2>
 </div>
 <div className="font-mono text-[10px] font-black text-stone-400 tracking-[0.2em] uppercase flex items-center gap-4 bg-brand-stone px-6 py-3 border border-brand-ink/10">
 <Trophy size={14} className="text-brand-pink" /> ANNUAL COMPETITIVE LOG
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
 {(clubActivity.competitions || []).map((comp, idx) => (
 <div key={idx} className={`border-2 border-brand-ink p-10 space-y-8 hover:border-brand-pink transition-all duration-500 group bg-brand-neutral shadow-[12px_12px_0px_rgba(18,18,18,0.03)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 ${idx % 2 === 1 ? 'md:mt-16' : ''}`}>
 <div className="flex justify-between items-start">
 {idx % 4 === 0 ? <Trophy className="text-brand-pink group-hover:scale-110 transition-transform duration-500"size={40} /> : 
 idx % 4 === 1 ? <Award className="text-brand-pink group-hover:scale-110 transition-transform duration-500"size={40} /> :
 idx % 4 === 2 ? <Star className="text-brand-pink group-hover:scale-110 transition-transform duration-500"size={40} /> :
 <Users className="text-brand-pink group-hover:scale-110 transition-transform duration-500"size={40} />}
 <span className="font-mono text-[10px] font-black bg-brand-stone px-4 py-1.5 text-stone-500 group-hover:bg-brand-pink group-hover:text-brand-neutral transition-all uppercase tracking-widest">
 {comp.difficulty}
 </span>
 </div>
 <div className="space-y-4">
 <h4 className="font-display text-2xl font-black text-brand-ink uppercase leading-none tracking-tight group-hover:text-brand-pink transition-colors">
 {comp.title}
 </h4>
 <p className="font-sans text-base text-stone-500 leading-relaxed italic">
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
 <section className="mx-auto max-w-6xl px-6 relative">
 {renderEditOverlay("ca_training","EDIT TRAINING GROUNDS")}
 <div className="bg-brand-ink text-brand-neutral p-16 md:p-24 overflow-hidden relative shadow-[24px_24px_0px_rgba(218,95,142,0.1)] border-2 border-brand-ink">
 <div className="absolute top-0 right-0 w-96 h-96 bg-brand-pink/10 blur-[100px] -mr-48 -mt-48 animate-pulse"/>
 
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center relative z-10">
 <div className="lg:col-span-6 space-y-10">
 <div className="space-y-4">
 <span className="font-mono text-[10px] font-black text-brand-pink tracking-[0.4em] uppercase block">INFRASTRUCTURE</span>
 <h2 className="font-display text-4xl md:text-6xl font-black uppercase leading-[0.85] tracking-tighter">
 WORLD-CLASS <br /> <span className="text-brand-pink">GROUNDS</span>
 </h2>
 </div>
 <p className="font-sans text-lg text-stone-400 leading-relaxed text-justify whitespace-pre-line border-l border-brand-pink/30 pl-8">
 {clubActivity.trainingDescription}
 </p>
 </div>
 
 <div className="lg:col-span-6">
 <div className="grid grid-cols-2 gap-6 w-full">
 {[
 { label: "Weekly Team Sessions", value: "3x", sub: "Mandatory" },
 { label: "Primary Home Base", value: "AMATA", sub: "World Class" },
 { label: "Coach Consultations", value: "Pro-Led", sub: "Elite Dev" },
 { label: "Athlete Dedication", value: "100%", sub: "Committed" }
 ].map((item, i) => (
 <div key={i} className="bg-brand-neutral/5 p-8 border border-white/10 space-y-3 hover:bg-brand-pink/5 transition-colors group/stat">
 <span className="block font-display text-4xl font-black text-brand-pink group-hover/stat:scale-110 transition-transform">{item.value}</span>
 <div className="space-y-1">
 <span className="block font-mono text-[10px] font-black text-brand-neutral uppercase tracking-widest opacity-80">{item.label}</span>
 <span className="block font-mono text-[8px] font-black text-brand-pink uppercase tracking-[0.2em] opacity-40">{item.sub}</span>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 </section>
 )}

 {/* 6. CLUB HISTORY SUMMARY */}
 {(clubActivity.showLegacy ?? true) && (
 <section className="mx-auto max-w-4xl px-6 text-center space-y-12 relative pt-20">
 {renderEditOverlay("ca_legacy","EDIT LEGACY SECTION")}
 <div className="flex flex-col items-center gap-4">
 <span className="font-mono text-[10px] font-black text-brand-pink tracking-[0.4em] uppercase">CENTENNIAL</span>
 <div className="h-1 w-24 bg-brand-ink"/>
 </div>
 <h2 className="font-display text-4xl md:text-7xl font-black text-brand-ink uppercase leading-none tracking-tighter">OUR LEGACY</h2>
 <p className="font-sans text-xl text-stone-600 leading-relaxed whitespace-pre-line italic max-w-3xl mx-auto">
 {clubActivity.legacyDescription}
 </p>
 
 <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-12 items-center">
 <div className="space-y-2">
 <span className="block font-display text-5xl font-black text-brand-ink">{clubActivity.foundedYear}</span>
 <span className="block font-mono text-[10px] font-black text-stone-400 uppercase tracking-[0.3em]">FOUNDED</span>
 </div>
 <div className="hidden md:block h-20 w-px bg-brand-ink/10 mx-auto"/>
 <div className="space-y-2">
 <span className="block font-display text-5xl font-black text-brand-ink">{clubActivity.activeYears}</span>
 <span className="block font-mono text-[10px] font-black text-stone-400 uppercase tracking-[0.3em]">ACTIVE YEARS</span>
 </div>
 <div className="hidden md:block h-20 w-px bg-brand-ink/10 mx-auto"/>
 <div className="space-y-2">
 <div className="flex flex-col items-center">
 <div className="h-1 w-12 bg-brand-pink mb-4" />
 <span className="block font-display text-5xl font-black text-brand-ink">#1</span>
 <span className="block font-mono text-[10px] font-black text-stone-400 uppercase tracking-[0.3em]">TRADITION</span>
 </div>
 </div>
 </div>

 <div className="pt-20 flex justify-center">
 <div className="flex items-center gap-4 bg-brand-stone px-8 py-4 border-2 border-brand-ink">
 <MapPin size={18} className="text-brand-pink" />
 <span className="font-mono text-[11px] font-black text-brand-ink uppercase tracking-[0.3em]">BANGKOK, THAILAND</span>
 </div>
 </div>
 </section>
 )}
 </div>
 );
}
