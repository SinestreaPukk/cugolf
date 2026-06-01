import { Staff, SiteLabels, AdminEditProps } from"../types";
import { Award, ShieldAlert, GraduationCap, Star, Edit } from"lucide-react";

interface StaffViewProps extends AdminEditProps {
 staff: Staff[];
 siteLabels?: SiteLabels;
}

export default function StaffView({ staff, siteLabels, isAdmin, onEditSection, activeSectionId }: StaffViewProps) {
 // Sort staff by order
 const sortedStaff = [...(staff || [])].filter(s => s.isVisible !== false).sort((a, b) => a.order - b.order);

 const isActive = activeSectionId ==="staff_list";
 const wrapperClasses = isAdmin 
 ? `relative transition-all duration-200 cursor-pointer ${isActive ? 'ring-4 ring-[#da5f8e] bg-brand-pink/5 z-40' : 'hover:ring-4 hover:ring-[#da5f8e]/50 hover:bg-brand-pink/5'}` 
 :"";

 return (
 <div 
 id="staff_view"
 className={`space-y-16 animate-fade-in px-4 md:px-0 bg-brand-neutral pb-12 ${wrapperClasses}`}
 onClick={(e) => {
 if (isAdmin && onEditSection) {
 e.stopPropagation();
 onEditSection("staff_list");
 }
 }}
 >
 {isAdmin && (
 <div className={`absolute top-4 left-4 z-50 bg-brand-pink text-brand-neutral px-3 py-1.5 font-mono text-[10px] font-bold tracking-widest flex items-center gap-2 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
 <Edit size={12} /> EDIT STAFF COLLECTION
 </div>
 )}
 
 {/* Title */}
 <section className="mx-auto max-w-7xl pt-6 text-center md:text-left space-y-4">
 <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-brand-ink pb-4 gap-4">
 <div className="space-y-2">
 <span className="inline-block bg-neutral-900 text-stone-100 font-mono text-[8.5px] px-2.5 py-1 tracking-widest uppercase font-bold">
 &nbsp;
 </span>
 <h1 className="font-display text-3xl font-extrabold tracking-tight text-brand-ink uppercase leading-none">
 {siteLabels?.staffTitle ||"EXECUTIVE COMMITTEE & STAFF"}
 </h1>
 </div>
 <span className="font-mono text-[9.5px] font-bold text-stone-400 tracking-wider uppercase">
 {siteLabels?.staffVerifiedLabel ||"ADMINISTRATOR BOARD • ATHLETIC DEPARTMENT APPOINTMENTS"}
 </span>
 </div>
 </section>

 {/* Staff Bento Display */}
 <section className="mx-auto max-w-7xl">
   <div className="grid grid-cols-1 md:grid-cols-3 border border-brand-ink overflow-hidden bg-brand-neutral">
     {sortedStaff.map((person, index) => {
       // First item spans 2 cols for editorial rhythm
       const isFirst = index === 0;

       return (
         <div
           key={person.id}
           className={`p-8 flex flex-col justify-between group bg-brand-neutral hover:bg-brand-stone/50 transition-all duration-350 border-b border-r border-brand-ink ${isFirst ? 'md:col-span-2' : 'md:col-span-1'}`}
         >
           <div className={`space-y-6 flex flex-col ${isFirst ? 'md:flex-row md:items-start md:gap-12 md:space-y-0' : ''}`}>
             {/* Photo frame */}
             <div className={`relative border border-brand-ink overflow-hidden bg-brand-stone shrink-0 ${isFirst ? 'w-full md:w-1/2 aspect-[4/3]' : 'aspect-square w-full'}`}>
               <img
                 src={person.imageUrl}
                 alt={person.name}
                 referrerPolicy="no-referrer"
                 className="w-full h-full object-cover transition-transform duration-700 ease-out grayscale group-hover:grayscale-0 group-hover:scale-105"
               />
             </div>

             <div className={`space-y-4 flex flex-col justify-between h-full ${isFirst ? 'w-full md:w-1/2 py-4' : ''}`}>
               <div className="space-y-2">
                 <span className="font-mono text-[9px] text-brand-pink font-bold uppercase tracking-widest block">
                   {person.role}
                 </span>
                 <h3 className={`font-display font-black text-brand-ink uppercase leading-none ${isFirst ? 'text-4xl md:text-5xl' : 'text-xl'}`}>
                   {person.name}
                 </h3>
               </div>
               {isFirst && (
                 <p className="font-sans text-sm text-stone-600 leading-relaxed pt-4 border-t border-brand-ink/20">
                   Overseeing the strategic direction and athletic excellence of the Chulalongkorn University Golf Club for the current competitive season.
                 </p>
               )}
             </div>
           </div>

           <div className="mt-8 pt-4 border-t border-brand-ink flex justify-between items-center text-[10px] font-mono tracking-widest text-stone-500 uppercase font-bold">
             <span>{person.year}</span>
           </div>
         </div>
       );
     })}
   </div>
 </section>

 </div>
 );
}
