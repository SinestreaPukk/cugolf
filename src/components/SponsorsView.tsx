import { Target, ArrowUpRight, Award, Shield, CheckCircle, Edit, Handshake } from"lucide-react";
import { Sponsor, SiteLabels, AdminEditProps } from"../types";

interface SponsorsViewProps extends AdminEditProps {
 sponsors?: Sponsor[];
 siteLabels?: SiteLabels;
}

export default function SponsorsView({ sponsors, siteLabels, isAdmin, onEditSection, activeSectionId }: SponsorsViewProps) {
 const corporateSponsors = sponsors && sponsors.length > 0 ? sponsors : [];

 const isActive = activeSectionId ==="sponsors_list";
 const wrapperClasses = isAdmin 
 ? `relative transition-all duration-200 cursor-pointer ${isActive ? 'ring-4 ring-brand-pink bg-brand-pink/5 z-40' : 'hover:ring-4 hover:ring-brand-pink/50 hover:bg-brand-pink/5'}` 
 :"";

 return (
 <div 
 id="sponsors_view"
 className={`space-y-20 animate-fade-in px-4 md:px-0 bg-brand-neutral min-h-screen pb-32 ${wrapperClasses}`}
 onClick={(e) => {
 if (isAdmin && onEditSection) {
 e.stopPropagation();
 onEditSection("sponsors_list");
 }
 }}
 >
 {isAdmin && (
 <div className={`absolute top-4 left-4 z-50 bg-brand-pink text-brand-neutral px-3 py-1.5 font-mono text-[10px] font-bold tracking-widest flex items-center gap-2 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
 <Edit size={12} /> EDIT SPONSORS COLLECTION
 </div>
 )}
 
 {/* Editorial Title Banner */}
 <section className="mx-auto max-w-7xl pt-16 md:pt-24">
 <div className="flex flex-col md:flex-row md:items-end justify-between border-b-4 border-brand-ink pb-8 gap-8">
 <div className="space-y-4">
 <span className="inline-block bg-brand-ink text-brand-neutral font-mono text-[10px] px-4 py-1.5 tracking-[0.4em] uppercase font-black">
 {siteLabels?.sponsorsSubtitle ||"CORPORATE ALIGNMENT"}
 </span>
 <h1 className="font-display text-4xl md:text-6xl font-black tracking-tighter text-brand-ink uppercase leading-[0.85]">
 {siteLabels?.sponsorsTitle ||"OFFICIAL PARTNERS"}
 </h1>
 </div>
 <div className="font-mono text-[10px] font-black text-stone-400 tracking-[0.2em] uppercase flex items-center gap-4 bg-brand-stone px-6 py-3 border border-brand-ink/10">
 <Handshake size={14} className="text-brand-pink" /> ESTABLISHED CONTRACTS
 </div>
 </div>
 </section>

 {/* Grid Partner Board */}
 <section className="mx-auto max-w-7xl font-sans animate-fade-in">
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
 {corporateSponsors.filter(s => s.isActive).map((brand) => (
 <div
 key={brand.id}
 className="group bg-brand-neutral border-2 border-brand-ink transition-all duration-500 overflow-hidden flex flex-col shadow-[12px_12px_0px_rgba(18,18,18,0.05)] hover:shadow-none hover:translate-x-2 hover:translate-y-2"
 >
 <div className="aspect-[16/9] w-full bg-brand-stone/30 border-b-2 border-brand-ink flex items-center justify-center p-12 relative overflow-hidden">
 <div className="absolute inset-0 bg-brand-pink/5 opacity-0 group-hover:opacity-100 transition-opacity" />
 {brand.imageUrl ? (
 <img 
 src={brand.imageUrl} 
 alt={brand.name} 
 className="max-h-full max-w-full object-contain relative z-10 transition-transform duration-700 group-hover:scale-110"
 />
 ) : (
 <div className="text-stone-300 font-display text-3xl font-black uppercase select-none tracking-tighter relative z-10">{brand.name}</div>
 )}
 </div>
 
 <div className="p-8 flex flex-col flex-grow space-y-6">
 <div className="flex items-center justify-between gap-4">
 <h3 className="font-display text-2xl font-black tracking-tight text-brand-ink uppercase leading-[0.85] group-hover:text-brand-pink transition-colors">
 {brand.name}
 </h3>
 {brand.websiteUrl && (
 <a 
 href={brand.websiteUrl} 
 target="_blank" 
 rel="noopener noreferrer"
 className="h-10 w-10 border-2 border-brand-ink flex items-center justify-center text-brand-ink hover:bg-brand-ink hover:text-brand-neutral transition-all group/link"
 title={`Visit ${brand.name} website`}
 >
 <ArrowUpRight size={18} className="transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
 </a>
 )}
 </div>

 <p className="font-sans text-sm text-stone-600 leading-relaxed text-left flex-grow italic border-l-2 border-brand-stone pl-6">
 {brand.description}
 </p>

 <div className="pt-6 border-t-2 border-brand-stone flex items-center gap-3 font-mono text-[9px] text-stone-400 uppercase font-black tracking-[0.2em]">
 <CheckCircle size={12} className="text-emerald-500"/>
 <span>{siteLabels?.sponsorsOfficiallyAssociatedLabel ||"OFFICIALLY ASSOCIATED"}</span>
 </div>
 </div>
 </div>
 ))}
 </div>
 </section>

 {/* Contact Us Section for Partners */}
 <section className="mx-auto max-w-5xl border-2 border-brand-ink p-12 md:p-20 text-center bg-brand-stone/20 space-y-10 relative overflow-hidden">
 <div className="absolute top-0 left-0 w-full h-1 bg-brand-pink" />
 <div className="flex flex-col items-center gap-6 relative z-10">
 <span className="font-mono text-[10px] font-black text-brand-pink tracking-[0.4em] uppercase">INQUIRIES</span>
 <h2 className="font-display text-3xl md:text-5xl font-black uppercase tracking-tighter text-brand-ink leading-none">
 {siteLabels?.sponsorsContactTitle ||"ESTABLISH PARTNERSHIP"}
 </h2>
 </div>
 
 <p className="font-sans text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed whitespace-pre-line italic relative z-10">
 {siteLabels?.sponsorsContactDescription ||"For partnership inquiries, commercial alignment, or facility support, please reach out to our executive board."}
 </p>

 <div className="pt-6 relative z-10">
 <button className="bg-brand-ink text-brand-neutral px-12 py-5 font-mono text-[11px] font-black tracking-[0.3em] uppercase hover:bg-brand-pink transition-all shadow-xl">
 CONTACT THE BOARD
 </button>
 </div>
 </section>

 </div>
 );
}
