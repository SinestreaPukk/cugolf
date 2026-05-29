import { NewsItem, SiteLabels, SiteSettings } from "../types";
import { ArrowRight, Calendar, Clock, BookOpen, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface BlogViewProps {
  news: NewsItem[];
  siteLabels?: SiteLabels;
  siteSettings?: SiteSettings;
}

export default function BlogView({ news, siteLabels, siteSettings }: BlogViewProps) {
  // Sort by rank (descending) and then by date (descending)
  const sortedNews = [...news].filter(n => n.isVisible !== false).sort((a, b) => {
    const rankA = a.rank || 0;
    const rankB = b.rank || 0;
    if (rankA !== rankB) return rankB - rankA;
    return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
  });

  return (
    <div id="blog_view" className="space-y-12 animate-fade-in px-4 md:px-0 bg-white">
      
      {/* Editorial Title Banner */}
      <section className="mx-auto max-w-7xl pt-10 text-center md:text-left">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-neutral-950 pb-6 gap-6">
          <div className="space-y-2">
            <span className="inline-block bg-[#da5f8e] text-white font-mono text-[10px] px-3 py-1 tracking-[0.3em] uppercase font-black">
              {siteLabels?.homeBlogSubtitle || "C.U.G.C. LATEST LOGS"}
            </span>
            <h1 className="font-display text-5xl md:text-6xl font-bold tracking-tight text-neutral-950 leading-none uppercase">
              {siteLabels?.homeBlogTitle || "ACTIVITIES BLOG & STORIES"}
            </h1>
          </div>
          <span className="font-mono text-[10px] font-black text-neutral-400 tracking-[0.2em] uppercase">
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
                className="group relative border border-neutral-200 bg-white overflow-hidden transition-all duration-300 flex flex-col justify-between hover:shadow-md rounded-lg"
              >
                {/* Image Showcase */}
                <div className="relative aspect-[16/9] border-b border-neutral-100 overflow-hidden bg-stone-50">
                  <img
                    src={blog.imageUrl}
                    alt={blog.title}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-neutral-900 text-stone-100 font-mono text-[9px] font-bold px-2.5 py-1 tracking-widest uppercase rounded-xs">
                      {blog.rank && blog.rank > 0 ? "FEATURED" : "ACTIVITY"}
                    </span>
                  </div>
                </div>

                {/* Info parameters */}
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 font-mono text-[10px] text-stone-400 font-semibold uppercase">
                      <Calendar size={12} className="text-stone-300" />
                      <span>{blog.publishDate}</span>
                    </div>
                    <h3 className="font-display text-lg font-bold text-neutral-950 tracking-tight hover:underline transition-colors uppercase leading-tight line-clamp-2">
                      {blog.title}
                    </h3>
                    <p className="font-sans text-xs text-stone-600 leading-relaxed line-clamp-3">
                      {blog.excerpt}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-neutral-50 flex items-center justify-between">
                    <span
                      className="group inline-flex items-center gap-2 font-mono text-[10px] font-bold tracking-widest text-[#da5f8e] uppercase cursor-pointer hover:underline"
                    >
                      READ STORY <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>

              </Link>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-stone-200 p-20 text-center max-w-xl mx-auto bg-neutral-50 rounded-lg">
            <BookOpen size={48} strokeWidth={1} className="mx-auto text-neutral-300 mb-6" />
            <h3 className="font-display text-xl font-bold uppercase text-neutral-950 mb-3">
              {siteLabels?.homeNoBlogs || "No activities blogs published yet."}
            </h3>
          </div>
        )}
      </section>

    </div>
  );
}

