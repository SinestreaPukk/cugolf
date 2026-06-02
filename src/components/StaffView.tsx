import { Staff, SiteLabels, AdminEditProps } from"../types";
import { Award, ShieldAlert, GraduationCap, Star, Edit, Users } from"lucide-react";

interface StaffViewProps extends AdminEditProps {
 staff: Staff[];
 siteLabels?: SiteLabels;
}

export default function StaffView({ staff, siteLabels, isAdmin, onEditSection, activeSectionId }: StaffViewProps) {
 // Sort staff by order
 const sortedStaff = [...(staff || [])].filter(s => s.isVisible !== false).sort((a, b) => a.order - b.order);

 const isActive = activeSectionId ==="staff_list";
 const wrapperClasses = isAdmin 
 ? `relative transition-all duration-200 cursor-pointer ${isActive ? 'ring-4 ring-brand-pink bg-brand-pink/5 z-40' : 'hover:ring-4 hover:ring-brand-pink/50 hover:bg-brand-pink/5'}` 
 :"";

 return (
 <div 
 id="staff_view"
 className={`space-y-20 animate-fade-in px-4 md:px-0 bg-brand-neutral min-h-screen pb-32 ${wrapperClasses}`}
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
 
 {/* Editorial Title Banner */}
 <section className="mx-auto max-w-7xl pt-16 md:pt-24">
 <div className="flex flex-col md:flex-row md:items-end justify-between border-b-4 border-brand-ink pb-8 gap-8">
 <div className="space-y-4">
 <span className="inline-block bg-brand-ink text-brand-neutral font-mono text-[10px] px-4 py-1.5 tracking-[0.4em] uppercase font-black">
 {siteLabels?.staffSubtitle ||"EXECUTIVE COMMITTEE"}
 </span>
 <h1 className="font-display text-4xl md:text-6xl font-black tracking-tighter text-brand-ink uppercase leading-[0.85]">
 {siteLabels?.staffTitle ||"LEADERSHIP & BOARD"}
 </h1>
 </div>
 <div className="font-mono text-[10px] font-black text-stone-400 tracking-[0.3em] uppercase flex items-center gap-4 bg-brand-stone px-6 py-3 border border-brand-ink/10">
 <Users size={14} className="text-brand-pink" /> OFFICIAL APPOINTMENTS
 </div>
 </div>
 </section>

 {/* Staff Display with Magazine Rhythm */}
 <section className="mx-auto max-w-7xl">
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-2 border-brand-ink divide-y md:divide-y-0 md:divide-x-2 divide-brand-ink overflow-hidden bg-brand-neutral">
 {sortedStaff.map((person, index) => (
 <div
 key={person.id}
 className="p-10 flex flex-col justify-between group bg-brand-neutral hover:bg-brand-stone/30 transition-all duration-500"
 >
 <div className="space-y-8">
 {/* Photo frame */}
 <div className="relative aspect-square border-2 border-brand-ink overflow-hidden bg-brand-stone shadow-[8px_8px_0px_rgba(18,18,18,0.05)] group-hover:shadow-none transition-all">
 <img
 src={person.imageUrl}
 alt={person.name}
 referrerPolicy="no-referrer"
 className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
 />
 <div className="absolute inset-0 bg-brand-pink/5 mix-blend-overlay opacity-100 group-hover:opacity-0 transition-opacity" />
 </div>

 <div className="space-y-3">
 <span className="font-mono text-[10px] text-brand-pink font-black uppercase tracking-[0.2em] block">
 {person.role}
 </span>
 <h3 className="font-display text-2xl font-black text-brand-ink uppercase leading-none tracking-tight group-hover:text-brand-pink transition-colors">
 {person.name}
 </h3>
 </div>
 </div>

 <div className="mt-12 pt-6 border-t border-brand-ink/10 flex justify-between items-center text-[10px] font-mono tracking-[0.3em] text-stone-400 uppercase font-black">
 <span>{person.year}</span>
 <div className="h-1.5 w-1.5 rounded-full bg-brand-ink/20 group-hover:bg-brand-pink transition-colors" />
 </div>
 </div>
 ))}
 </div>
 </section>

 </div>
 );
}
