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
 ? `relative transition-all duration-200 cursor-pointer ${isActive ? 'ring-4 ring-[#da5f8e] bg-[#da5f8e]/5 z-40' : 'hover:ring-4 hover:ring-[#da5f8e]/50 hover:bg-[#da5f8e]/5'}` 
 :"";

 return (
 <div 
 id="staff_view"
 className={`space-y-16 animate-fade-in px-4 md:px-0 bg-white pb-12 ${wrapperClasses}`}
 onClick={(e) => {
 if (isAdmin && onEditSection) {
 e.stopPropagation();
 onEditSection("staff_list");
 }
 }}
 >
 {isAdmin && (
 <div className={`absolute top-4 left-4 z-50 bg-[#da5f8e] text-white px-3 py-1.5 font-mono text-[10px] font-bold tracking-widest flex items-center gap-2 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
 <Edit size={12} /> EDIT STAFF COLLECTION
 </div>
 )}
 
 {/* Title */}
 <section className="mx-auto max-w-7xl pt-6 text-center md:text-left space-y-4">
 <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#121212] pb-4 gap-4">
 <div className="space-y-2">
   <h1 className="font-display text-3xl font-extrabold tracking-tight text-neutral-950 uppercase leading-none">
     {siteLabels?.staffTitle || "EXECUTIVE COMMITTEE & STAFF"}
   </h1>
 </div>
 <span className="font-mono text-[9.5px] font-bold text-stone-400 tracking-wider uppercase">
 {siteLabels?.staffVerifiedLabel ||"ADMINISTRATOR BOARD • ATHLETIC DEPARTMENT APPOINTMENTS"}
 </span>
 </div>
 </section>

 {/* Staff Bento Display */}
 <section className="mx-auto max-w-7xl">
 <div className="grid grid-cols-1 md:grid-cols-3 border border-[#121212] divide-y md:divide-y-0 md:divide-x divide-stone-200 overflow-hidden bg-white">
 {sortedStaff.map((person, index) => {
 // Give different icons to create a nice dynamic rhythm
 const Icons = [Star, Award, GraduationCap];
 const SelectIcon = Icons[index % Icons.length];

 return (
 <div
 key={person.id}
 className="p-8 flex flex-col justify-between group bg-white hover:bg-stone-50/50 transition-all duration-350"
 >
 <div className="space-y-6">
 {/* Photo frame */}
 <div className="relative aspect-square border border-[#121212] overflow-hidden bg-stone-50">
 <img
 src={person.imageUrl}
 alt={person.name}
 referrerPolicy="no-referrer"
 className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
 />
 </div>

 <div className="space-y-2">
 <span className="font-mono text-[9px] text-stone-400 font-bold uppercase tracking-wider block">
 {person.role}
 </span>
 <h3 className="font-display text-base font-bold text-neutral-950 uppercase leading-snug hover:underline">
 {person.name}
 </h3>
 </div>
 </div>

 <div className="mt-8 pt-4 border-t border-[#121212] flex justify-between items-center text-[10px] font-mono tracking-wider text-stone-400 uppercase font-bold">
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
