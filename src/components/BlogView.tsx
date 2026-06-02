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
 ? `relative transition-all duration-200 cursor-pointer ${isActive ? 'ring-4 ring-brand-pink bg-brand-pink/5 z-40' : 'hover:ring-4 hover:ring-brand-pink/50 hover:bg-brand-pink/5'}` 
 :"";

 return (
 <div 
 id="blog_view"
 className={`space-y-20 animate-fade-in px-4 md:px-0 bg-brand-neutral min-h-screen ${wrapperClasses}`}
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
 <section className="mx-auto max-w-7xl pt-16 md:pt-24">
 <div className="flex flex-col md:flex-row md:items-end justify-between border-b-4 border-brand-ink pb-8 gap-8">
 <div className="space-y-4">
 <span className="inline-block bg-brand-pink text-brand-neutral font-mono text-[11px] px-4 py-1.5 tracking-[0.4em] uppercase font-black shadow-lg">
 {siteLabels?.homeBlogSubtitle ||"OFFICIAL ARCHIVE"}
 </span>
 <h1 className="font-display text-4xl md:text-7xl font-black tracking-tighter text-brand-ink leading-[0.85] uppercase">
 {siteLabels?.homeBlogTitle ||"ACTIVITIES BLOG & STORIES"}
 </h1>
 </div>
 <div className="font-mono text-[10px] font-black text-stone-400 tracking-[0.3em] uppercase flex items-center gap-4 bg-brand-stone px-6 py-3 border border-brand-ink/10">
 <Clock size={14} className="text-brand-pink" /> LATEST UPDATES: {sortedNews[0]?.publishDate || "N/A"}
 </div>
 </div>
 </section>

 {/* Blog Grid with Editorial Rhythm */}
 <section className="mx-auto max-w-7xl pb-32">
 {sortedNews.length > 0 ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
 {sortedNews.map((blog, idx) => (
 <Link
 key={blog.id}
 to={`/activities/${blog.id}`}
 className={`group relative border-2 border-brand-ink bg-brand-neutral overflow-hidden transition-all duration-500 flex flex-col justify-between shadow-[8px_8px_0px_rgba(18,18,18,0.05)] hover:shadow-none hover:translate-y-2 hover:translate-x-2 ${idx % 3 === 1 ? 'md:mt-12' : ''}`}
 >
 {/* Image Showcase */}
 <div className="relative aspect-[3/2] border-b-2 border-brand-ink overflow-hidden bg-brand-stone">
 <img
 src={blog.imageUrl}
 alt={blog.title}
 referrerPolicy="no-referrer"
 className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
 />
 <div className="absolute top-4 left-4">
 <span className="bg-brand-ink text-brand-neutral font-mono text-[9px] font-black px-3 py-1.5 tracking-[0.2em] uppercase shadow-xl">
 {blog.rank && blog.rank > 0 ?"FEATURED STORY":"REGISTRY LOG"}
 </span>
 </div>
 </div>

 {/* Info parameters */}
 <div className="p-8 flex-grow flex flex-col justify-between space-y-6">
 <div className="space-y-4">
 <div className="flex items-center gap-2 font-mono text-[10px] text-stone-400 font-black uppercase tracking-widest">
 <Calendar size={12} className="text-brand-pink"/>
 <span>{blog.publishDate}</span>
 </div>
 <h3 className="font-display text-2xl font-black text-brand-ink tracking-tight group-hover:text-brand-pink transition-colors uppercase leading-[0.9] line-clamp-2">
 {blog.title}
 </h3>
 <p className="font-sans text-sm text-stone-600 leading-relaxed line-clamp-3 italic">
 {blog.excerpt}
 </p>
 </div>

 <div className="pt-6 border-t-2 border-brand-stone flex items-center">
 <span
 className="group inline-flex items-center gap-3 font-mono text-[11px] font-black tracking-[0.2em] text-brand-ink group-hover:text-brand-pink transition-colors uppercase"
 >
 READ COVERAGE <ChevronRight size={16} className="transition-transform group-hover:translate-x-2"/>
 </span>
 </div>
 </div>

 </Link>
 ))}
 </div>
 ) : (
 <div className="border-4 border-dashed border-brand-ink p-32 text-center max-w-3xl mx-auto bg-brand-stone/10">
 <BookOpen size={64} strokeWidth={1} className="mx-auto text-brand-pink opacity-20 mb-8"/>
 <h3 className="font-display text-2xl font-black uppercase text-brand-ink tracking-widest">
 {siteLabels?.homeNoBlogs ||"No activities blogs published yet."}
 </h3>
 <p className="font-mono text-xs text-stone-400 uppercase tracking-widest mt-4">Database link active • Registry empty</p>
 </div>
 )}
 </section>

 </div>
 );
}

