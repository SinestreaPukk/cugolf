import { NewsItem, SiteLabels, SiteSettings, AdminEditProps } from"../types";
import { ArrowRight, Calendar, Clock, BookOpen, ChevronRight, Edit } from"lucide-react";
import { Link } from"react-router-dom";

interface BlogViewProps extends AdminEditProps {
 news: NewsItem[];
 siteLabels?: SiteLabels;
 siteSettings?: SiteSettings;
}

export default function BlogView({ news, siteLabels, siteSettings, isAdmin, onEditSection, activeSectionId }: BlogViewProps) {
 // Sort by rank (descending) and then by date (descending)
 const sortedNews = [...news].filter(n => n.isVisible !== false).sort((a, b) => {
 const rankA = a.rank || 0;
 const rankB = b.rank || 0;
 if (rankA !== rankB) return rankB - rankA;
 return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
 });

 const isActive = activeSectionId ==="news_list";
 const wrapperClasses = isAdmin 
 ? `relative transition-all duration-200 cursor-pointer ${isActive ? 'ring-4 ring-[#da5f8e] bg-brand-pink/5 z-40' : 'hover:ring-4 hover:ring-[#da5f8e]/50 hover:bg-brand-pink/5'}` 
 :"";

 return (
 <div 
 id="blog_view"
 className={`space-y-12 animate-fade-in px-4 md:px-0 bg-brand-neutral ${wrapperClasses}`}
 onClick={(e) => {
 if (isAdmin && onEditSection) {
 e.stopPropagation();
 onEditSection("news_list");
 }
 }}
 >
 {isAdmin && (
 <div className={`absolute top-4 left-4 z-50 bg-brand-pink text-brand-neutral px-3 py-1.5 font-mono text-[10px] font-bold tracking-widest flex items-center gap-2 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
 <Edit size={12} /> EDIT BLOG COLLECTION
 </div>
 )}
 
 {/* Editorial Title Banner */}
 <section className="mx-auto max-w-7xl pt-10 text-center md:text-left">
 <div className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-brand-ink pb-6 gap-6">
 <div className="space-y-2">
 <span className="inline-block bg-brand-pink text-brand-neutral font-mono text-[10px] px-3 py-1 tracking-[0.3em] uppercase font-black">
 {siteLabels?.homeBlogSubtitle ||"C.U.G.C. LATEST LOGS"}
 </span>
 <h1 className="font-display text-5xl md:text-6xl font-bold tracking-tight text-brand-ink leading-none uppercase">
 {siteLabels?.homeBlogTitle ||"ACTIVITIES BLOG & STORIES"}
 </h1>
 </div>
 <span className="font-mono text-[10px] font-black text-neutral-400 tracking-[0.2em] uppercase">
 &nbsp;
 </span>
 </div>
 </section>

 {/* Blog Layout */}
 <section className="mx-auto max-w-7xl pb-24">
   {sortedNews.length > 0 ? (
     <div className="space-y-24">
       {/* Featured Post (first one) */}
       {sortedNews[0] && (
         <Link to={`/activities/${sortedNews[0].id}`} className="group block space-y-6">
           <div className="relative w-full aspect-[21/9] border-b border-brand-ink overflow-hidden bg-brand-stone">
             <img src={sortedNews[0].imageUrl} alt={sortedNews[0].title} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
             <div className="absolute top-6 left-6">
               <span className="bg-brand-ink text-brand-neutral font-mono text-[10px] font-bold px-3 py-1.5 tracking-widest uppercase">
                 {sortedNews[0].rank && sortedNews[0].rank > 0 ? "FEATURED COVERAGE" : "LATEST DISPATCH"}
               </span>
             </div>
           </div>
           <div className="max-w-4xl space-y-4">
             <div className="flex items-center gap-2 font-mono text-[10px] text-stone-500 uppercase tracking-widest">
               <Calendar size={12} /> <span>{sortedNews[0].publishDate}</span>
             </div>
             <h3 className="font-display text-4xl md:text-5xl font-black text-brand-ink tracking-tighter uppercase leading-none group-hover:underline decoration-2 underline-offset-8">
               {sortedNews[0].title}
             </h3>
             <p className="font-sans text-lg text-stone-600 leading-relaxed max-w-2xl">
               {sortedNews[0].excerpt}
             </p>
             <div className="pt-4">
               <span className="inline-flex items-center gap-2 border-b-2 border-brand-ink pb-1 font-mono text-[10px] font-black tracking-widest uppercase text-brand-ink group-hover:border-brand-pink group-hover:text-brand-pink transition-colors">
                 READ FULL STORY <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
               </span>
             </div>
           </div>
         </Link>
       )}

       {/* Sub-grid for remaining posts */}
       {sortedNews.length > 1 && (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-16 border-t border-brand-ink pt-16">
           {sortedNews.slice(1).map((blog) => (
             <Link key={blog.id} to={`/activities/${blog.id}`} className="group flex flex-col md:flex-row gap-6 items-start">
               <div className="w-full md:w-2/5 aspect-[4/3] border border-brand-ink overflow-hidden bg-brand-stone shrink-0">
                 <img src={blog.imageUrl} alt={blog.title} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]" />
               </div>
               <div className="w-full md:w-3/5 space-y-3">
                 <div className="flex items-center gap-1.5 font-mono text-[9px] text-stone-400 uppercase tracking-widest">
                   <Calendar size={10} /> <span>{blog.publishDate}</span>
                 </div>
                 <h4 className="font-display text-xl font-black text-brand-ink tracking-tight uppercase leading-none group-hover:text-brand-pink transition-colors">
                   {blog.title}
                 </h4>
                 <p className="font-sans text-xs text-stone-600 leading-relaxed line-clamp-3">
                   {blog.excerpt}
                 </p>
                 <div className="pt-2">
                   <span className="inline-flex items-center gap-1 font-mono text-[9px] font-bold text-stone-400 uppercase group-hover:text-brand-ink transition-colors">
                     VIEW DISPATCH <ArrowRight size={10} className="transition-transform group-hover:translate-x-1" />
                   </span>
                 </div>
               </div>
             </Link>
           ))}
         </div>
       )}
     </div>
   ) : (
 <div className="border border-dashed border-brand-ink p-20 text-center max-w-xl mx-auto bg-neutral-50">
 <BookOpen size={48} strokeWidth={1} className="mx-auto text-neutral-300 mb-6"/>
 <h3 className="font-display text-xl font-bold uppercase text-brand-ink mb-3">
 {siteLabels?.homeNoBlogs ||"No activities blogs published yet."}
 </h3>
 </div>
 )}
 </section>

 </div>
 );
}

