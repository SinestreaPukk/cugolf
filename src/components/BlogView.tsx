import { NewsItem, SiteLabels, SiteSettings, AdminEditProps } from"../types";
import { BookOpen, ChevronRight, Edit, Loader2 } from"lucide-react";
import { Link } from"react-router-dom";
import OptimizedImage from "./OptimizedImage";
import { useLanguage } from "../utils/LanguageContext";

interface BlogViewProps extends AdminEditProps {
 news: NewsItem[];
 siteLabels?: SiteLabels;
 siteSettings?: SiteSettings;
 /** Set when the archive has more pages than the ones already fetched. */
 hasMore?: boolean;
 loadingMore?: boolean;
 onLoadMore?: () => void;
}

export default function BlogView({ news, siteLabels, hasMore, loadingMore, onLoadMore, isAdmin, onEditSection, activeSectionId }: BlogViewProps) {
 const { language } = useLanguage();
 // Sort by rank (descending) and then by date (descending)
 const sortedNews = [...news].filter(n => n.isVisible !== false).sort((a, b) => {
 const rankA = a.rank || 0;
 const rankB = b.rank || 0;
 if (rankA !== rankB) return rankB - rankA;
 return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
 });

 const isActive = activeSectionId ==="news_list";
 const wrapperClasses = isAdmin 
 ? `relative transition-all duration-200 cursor-pointer ${isActive ? 'ring-4 ring-[#da5f8e] bg-[#da5f8e]/5 z-40' : 'hover:ring-4 hover:ring-[#da5f8e]/50 hover:bg-[#da5f8e]/5'}` 
 :"";

 return (
 <div 
 id="blog_view"
 className={`space-y-12 animate-fade-in px-4 md:px-0 bg-white ${wrapperClasses}`}
 onClick={(e) => {
 if (isAdmin && onEditSection) {
 e.stopPropagation();
 onEditSection("news_list");
 }
 }}
 >
 {isAdmin && (
 <div className={`absolute top-4 left-4 z-50 bg-[#da5f8e] text-white px-3 py-1.5 font-display text-[10px] font-bold tracking-widest flex items-center gap-2 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
 <Edit size={12} /> EDIT BLOG COLLECTION
 </div>
 )}
 
 {/* Editorial Title Banner */}
 <section className="mx-auto max-w-7xl pt-10 text-center md:text-left">
 <div className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-neutral-950 pb-6 gap-6">
 <div className="space-y-2">
   <h1 className="font-display text-5xl md:text-6xl font-bold tracking-tight text-neutral-950 leading-none uppercase">
     {siteLabels?.homeBlogTitle || "ACTIVITIES BLOG & STORIES"}
   </h1>
 </div>
 <span className="font-display text-[10px] font-black text-neutral-400 tracking-[0.2em] uppercase">
 &nbsp;
 </span>
 </div>
 </section>

 {/* Blog Grid */}
 <section className="mx-auto max-w-7xl pb-24">
 {sortedNews.length > 0 ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
 {sortedNews.map((blog) => (
 <Link
 key={blog.id}
 to={`/activities/${blog.id}`}
 className="group relative border border-[#121212] bg-white overflow-hidden transition-all duration-300 flex flex-col justify-between"
 >
 {/* Image Showcase */}
 <div className="relative aspect-[16/9] border-b border-neutral-100 overflow-hidden bg-stone-50">
 <OptimizedImage
   src={blog.imageUrl}
   alt={language === "th" && blog.titleThai ? blog.titleThai : blog.title}
   referrerPolicy="no-referrer"
   width={640}
   sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
   className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
 />
 </div>

 {/* Info parameters */}
 <div className="p-6 flex-grow flex flex-col justify-between">
 <div className="space-y-3">
 <h3 className="font-display text-lg font-bold text-neutral-950 tracking-tight hover:underline transition-colors uppercase leading-tight line-clamp-2">
 {language === "th" && blog.titleThai ? blog.titleThai : blog.title}
 </h3>
 <p className="font-sans text-xs text-stone-600 leading-relaxed line-clamp-3">
 {language === "th" && blog.excerptThai ? blog.excerptThai : blog.excerpt}
 </p>
 </div>

 <div className="mt-6 pt-4 border-t border-neutral-50 flex items-center justify-between">
 <span
 className="group inline-flex items-center gap-2 font-display text-[10px] font-bold tracking-widest text-[#da5f8e] uppercase cursor-pointer hover:underline"
 >
 {siteLabels?.homeReadStoryButton || "READ STORY"} <ChevronRight size={14} className="transition-transform group-hover:translate-x-1"/>
 </span>
 </div>
 </div>

 </Link>
 ))}
 </div>
 ) : null}

 {sortedNews.length > 0 && hasMore && (
 <div className="flex justify-center pt-12">
 <button
 onClick={onLoadMore}
 disabled={loadingMore}
 className="inline-flex items-center gap-2 border-2 border-[#121212] bg-white px-10 py-4 font-display text-[10px] font-black tracking-widest uppercase text-neutral-950 transition-all hover:bg-[#da5f8e] hover:text-white disabled:opacity-50 cursor-pointer"
 >
 {loadingMore && <Loader2 size={14} className="animate-spin" />}
 {loadingMore ? "LOADING…" : "LOAD MORE STORIES"}
 </button>
 </div>
 )}

 {sortedNews.length === 0 && (
 <div className="border border-dashed border-[#121212] p-20 text-center max-w-xl mx-auto bg-neutral-50">
 <BookOpen size={48} strokeWidth={1} className="mx-auto text-neutral-300 mb-6"/>
 <h3 className="font-display text-xl font-bold uppercase text-neutral-950 mb-3">
 {siteLabels?.homeNoBlogs ||"No activities blogs published yet."}
 </h3>
 </div>
 )}
 </section>

 </div>
 );
}
