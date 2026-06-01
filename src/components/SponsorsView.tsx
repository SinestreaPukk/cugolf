import { Target, ArrowUpRight, Award, Shield, CheckCircle, Edit } from"lucide-react";
import { Sponsor, SiteLabels, AdminEditProps } from"../types";

interface SponsorsViewProps extends AdminEditProps {
 sponsors?: Sponsor[];
 siteLabels?: SiteLabels;
}

export default function SponsorsView({ sponsors, siteLabels, isAdmin, onEditSection, activeSectionId }: SponsorsViewProps) {
 const corporateSponsors = sponsors && sponsors.length > 0 ? sponsors : [];

 const isActive = activeSectionId ==="sponsors_list";
 const wrapperClasses = isAdmin 
 ? `relative transition-all duration-200 cursor-pointer ${isActive ? 'ring-4 ring-[#da5f8e] bg-brand-pink/5 z-40' : 'hover:ring-4 hover:ring-[#da5f8e]/50 hover:bg-brand-pink/5'}` 
 :"";

 return (
 <div 
 id="sponsors_view"
 className={`space-y-16 animate-fade-in px-4 md:px-0 bg-brand-neutral pb-12 ${wrapperClasses}`}
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
 
 {/* Editorial Title */}
 <section className="mx-auto max-w-7xl pt-6 text-center md:text-left space-y-4">
 <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-brand-ink pb-4 gap-4">
 <div className="space-y-2">
 <span className="inline-block bg-neutral-900 text-stone-100 font-mono text-[8.5px] px-2.5 py-1 tracking-widest uppercase font-bold">
 &nbsp;
 </span>
 <h1 className="font-display text-3xl font-extrabold tracking-tight text-brand-ink uppercase leading-none">
 {siteLabels?.sponsorsTitle ||"OUR SPONSORS & PARTNERS"}
 </h1>
 </div>
 <span className="font-mono text-[9.5px] font-bold text-stone-400 tracking-wider uppercase">
 &nbsp;
 </span>
 </div>
 </section>

 {/* Grid Partner Board */}
 <section className="mx-auto max-w-7xl font-sans animate-fade-in">
   {corporateSponsors.filter(s => s.isActive).length > 0 && (
     <div className="space-y-12">

       {/* Lead Sponsor / Platinum Partner (First item) */}
       {corporateSponsors.filter(s => s.isActive)[0] && (
         <div className="group bg-brand-neutral border border-brand-ink transition-all duration-300 overflow-hidden flex flex-col md:flex-row items-stretch">
           <div className="w-full md:w-1/2 aspect-[16/9] md:aspect-auto bg-brand-stone border-b md:border-b-0 md:border-r border-brand-ink flex items-center justify-center p-12 shrink-0">
             {corporateSponsors.filter(s => s.isActive)[0].imageUrl ? (
               <img 
                 src={corporateSponsors.filter(s => s.isActive)[0].imageUrl} 
                 alt={corporateSponsors.filter(s => s.isActive)[0].name} 
                 className="max-h-full max-w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500"
               />
             ) : (
               <div className="text-stone-300 font-display text-4xl font-bold uppercase select-none">{corporateSponsors.filter(s => s.isActive)[0].name}</div>
             )}
           </div>

           <div className="p-8 md:p-12 flex flex-col justify-center space-y-6 w-full">
             <div className="space-y-2">
               <span className="font-mono text-[9px] font-black text-brand-pink tracking-[0.2em] uppercase block">
                 PLATINUM PARTNER
               </span>
               <div className="flex items-center justify-between">
                 <h3 className="font-display text-3xl font-black tracking-tight text-brand-ink uppercase leading-none">
                   {corporateSponsors.filter(s => s.isActive)[0].name}
                 </h3>
                 {corporateSponsors.filter(s => s.isActive)[0].websiteUrl && (
                   <a 
                     href={corporateSponsors.filter(s => s.isActive)[0].websiteUrl} 
                     target="_blank"
                     rel="noopener noreferrer"
                     className="text-stone-400 hover:text-brand-ink transition-colors"
                     title={`Visit ${corporateSponsors.filter(s => s.isActive)[0].name} website`}
                   >
                     <ArrowUpRight size={24} />
                   </a>
                 )}
               </div>
             </div>

             <p className="text-sm text-stone-600 leading-relaxed text-left">
               {corporateSponsors.filter(s => s.isActive)[0].description}
             </p>

             <div className="pt-6 border-t border-brand-ink/20 flex items-center gap-2 font-mono text-[9px] text-stone-500 uppercase font-bold tracking-wider">
               <CheckCircle size={14} className="text-emerald-500"/>
               <span>{siteLabels?.sponsorsOfficiallyAssociatedLabel || "OFFICIALLY ASSOCIATED 2026"}</span>
             </div>
           </div>
         </div>
       )}

       {/* Remaining Sponsors Grid */}
       {corporateSponsors.filter(s => s.isActive).length > 1 && (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-brand-ink pt-12">
           {corporateSponsors.filter(s => s.isActive).slice(1).map((brand) => (
             <div
               key={brand.id}
               className="group bg-brand-neutral border border-brand-ink hover: transition-all duration-300 overflow-hidden flex flex-col sm:flex-row items-stretch"
             >
               <div className="aspect-[4/3] sm:aspect-square w-full sm:w-1/3 bg-brand-stone border-b sm:border-b-0 sm:border-r border-brand-ink flex items-center justify-center p-6 shrink-0">
                 {brand.imageUrl ? (
                   <img 
                     src={brand.imageUrl} 
                     alt={brand.name} 
                     className="max-h-full max-w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500"
                   />
                 ) : (
                   <div className="text-stone-300 font-display text-lg font-bold uppercase select-none">{brand.name}</div>
                 )}
               </div>

               <div className="p-6 flex flex-col justify-center space-y-3 w-full">
                 <div className="flex items-center justify-between">
                   <h3 className="font-display text-lg font-bold tracking-tight text-brand-ink uppercase leading-none">
                     {brand.name}
                   </h3>
                   {brand.websiteUrl && (
                     <a 
                       href={brand.websiteUrl} 
                       target="_blank"
                       rel="noopener noreferrer"
                       className="text-stone-400 hover:text-brand-ink transition-colors"
                       title={`Visit ${brand.name} website`}
                     >
                       <ArrowUpRight size={16} />
                     </a>
                   )}
                 </div>

                 <p className="text-xs text-stone-600 leading-relaxed text-left line-clamp-3 flex-grow">
                   {brand.description}
                 </p>
               </div>
             </div>
           ))}
         </div>
       )}

     </div>
   )}
 </section>

 {/* Contact Us Section for Partners */}
 <section className="mx-auto max-w-4xl border border-brand-ink p-8 md:p-12 text-center bg-brand-neutral space-y-6">
 <div className="flex flex-col items-center gap-4">
 <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-brand-ink">
 {siteLabels?.sponsorsContactTitle ||"GET IN TOUCH WITH US"}
 </h2>
 <div className="h-1 w-12 bg-neutral-900"></div>
 </div>
 
 <p className="font-sans text-sm text-stone-600 max-w-xl mx-auto leading-relaxed whitespace-pre-line">
 {siteLabels?.sponsorsContactDescription ||"For partnership inquiries, commercial alignment, or facility support, please reach out to our executive board."}
 </p>
 </section>

 </div>
 );
}
