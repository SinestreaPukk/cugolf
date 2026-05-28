import { NewsItem, SiteLabels, SiteSettings } from "../types";
import { ArrowRight, Calendar, Clock, BookOpen, ChevronRight } from "lucide-react";
import { useState } from "react";

interface BlogViewProps {
  news: NewsItem[];
  siteLabels?: SiteLabels;
  siteSettings?: SiteSettings;
}

export default function BlogView({ news, siteLabels, siteSettings }: BlogViewProps) {
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);

  // Sort by rank (descending) and then by date (descending)
  const sortedNews = [...news].sort((a, b) => {
    const rankA = a.rank || 0;
    const rankB = b.rank || 0;
    if (rankA !== rankB) return rankB - rankA;
    return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
  });

  // Simple, ultra-robust Markdown parser for editorial rendering
  const renderMarkdown = (text: string) => {
    return text.split("\n").map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("### ")) {
        return (
          <h3 key={idx} className="font-display text-lg font-bold tracking-tight text-[#121212] mt-6 mb-3 border-b border-[#121212]/10 pb-1">
            {trimmed.replace("### ", "")}
          </h3>
        );
      }
      if (trimmed.startsWith("#### ")) {
        return (
          <h4 key={idx} className="font-display text-sm font-black uppercase tracking-wider text-black mt-4 mb-2">
            {trimmed.replace("#### ", "")}
          </h4>
        );
      }
      if (trimmed.startsWith("> ")) {
        return (
          <blockquote key={idx} className="border-l-4 border-black pl-4 italic my-4 font-serif text-black/85 bg-neutral-100 py-2 pr-2">
            {trimmed.replace("> ", "")}
          </blockquote>
        );
      }
      if (trimmed.startsWith("- ")) {
        return (
          <li key={idx} className="list-disc ml-6 my-1.5 text-xs text-[#121212]/85">
            {trimmed.replace("- ", "")}
          </li>
        );
      }
      if (trimmed === "") {
        return <div key={idx} className="h-4" />;
      }
      return (
        <p key={idx} className="text-xs leading-relaxed text-[#121212]/80 my-2 text-justify">
          {trimmed}
        </p>
      );
    });
  };

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
            CHRONICLES OF THE PINK ELEPHANTS
          </span>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="mx-auto max-w-7xl pb-24">
        {sortedNews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {sortedNews.map((blog) => (
              <div
                key={blog.id}
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
                    <button
                      onClick={() => setSelectedArticle(blog)}
                      className="group inline-flex items-center gap-2 font-mono text-[10px] font-bold tracking-widest text-[#da5f8e] uppercase cursor-pointer hover:underline"
                    >
                      READ STORY <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>

              </div>
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

      {/* DETAILS MODAL OVERLAY (Copied from HomeView for consistency) */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/75 p-4 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-2xl border border-stone-200 bg-white text-stone-900 flex flex-col max-h-[90vh] rounded-lg shadow-xl overflow-hidden">
            
            <div className="border-b border-stone-150 p-4 md:p-5 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[9px] bg-neutral-900 text-stone-100 font-bold px-2.5 py-1 tracking-widest uppercase rounded-xs">
                  {siteLabels?.homeModalOfficialBadge || "OFFICIAL EDITORIAL"}
                </span>
                <span className="font-mono text-[9.5px] font-bold text-stone-400">{selectedArticle.publishDate}</span>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="font-mono text-[10px] font-bold border border-stone-200 hover:bg-neutral-950 hover:text-white px-4 py-2 hover:border-neutral-950 rounded-xs transition-all cursor-pointer uppercase tracking-wider"
              >
                CLOSE [X]
              </button>
            </div>

            <div className="p-5 md:p-8 overflow-y-auto space-y-6">
              <div className="h-44 md:h-60 border border-stone-150 overflow-hidden relative bg-stone-50 rounded-sm">
                <img
                  src={selectedArticle.imageUrl}
                  alt={selectedArticle.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h2 className="font-display text-2xl font-extrabold leading-tight tracking-tight text-neutral-950 uppercase mb-3">
                  {selectedArticle.title}
                </h2>
                <p className="font-sans text-xs italic text-stone-500 border-l-2 border-stone-900 pl-3 leading-relaxed mb-6">
                  {selectedArticle.excerpt}
                </p>
              </div>

              <div className="font-sans text-stone-700 text-xs space-y-4">
                {renderMarkdown(selectedArticle.content)}
              </div>
            </div>

            <div className="border-t border-stone-150 p-4 bg-stone-50 flex justify-between items-center font-mono text-[9px] font-bold text-stone-400">
              <span>{siteLabels?.homeModalEditorialBoard || "CU GOLF CLUB SPORTS EDITORIAL BOARD"}</span>
              <span>{siteLabels?.homeModalLocation || "BANGKOK, THAILAND"}</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
