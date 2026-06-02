import { NewsItem, SiteLabels, SiteSettings } from"../types";
import { Calendar, User, ArrowLeft, Clock, MapPin } from"lucide-react";
import { Link, useParams, Navigate } from"react-router-dom";
import { useEffect } from"react";
import MarkdownRenderer from"./MarkdownRenderer";
import { AdminEditProps } from"../types";

interface ActivityDetailViewProps extends AdminEditProps {
 news: NewsItem[];
 siteLabels?: SiteLabels;
 siteSettings?: SiteSettings;
}

export default function ActivityDetailView({ news, siteLabels }: ActivityDetailViewProps) {
 const { id } = useParams<{ id: string }>();
 const article = news.find((item) => item.id === id);

 useEffect(() => {
 window.scrollTo(0, 0);
 }, [id]);

 if (!article) {
 return <Navigate to="/activities"replace />;
 }

 return (
 <div className="bg-brand-neutral min-h-screen pb-32">
 <article className="max-w-4xl mx-auto py-16 px-6 md:px-0 animate-fade-in">
 <Link
 to="/activities/blog"
 className="inline-flex items-center gap-3 text-brand-ink font-mono text-[10px] font-black uppercase tracking-[0.3em] hover:text-brand-pink mb-16 group transition-colors"
 >
 <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-2"/>
 BACK TO ARCHIVE
 </Link>

 <header className="space-y-12 mb-20">
 <div className="space-y-6">
 <div className="flex flex-wrap items-center gap-6">
 <span className="bg-brand-pink text-brand-neutral font-mono text-[10px] font-black px-4 py-1.5 tracking-[0.4em] uppercase shadow-lg">
 {siteLabels?.homeModalOfficialBadge ||"OFFICIAL EDITORIAL"}
 </span>
 <div className="flex items-center gap-3 font-mono text-[11px] text-stone-400 font-black uppercase tracking-[0.2em]">
 <Calendar size={14} className="text-brand-pink" />
 <span>{article.publishDate}</span>
 </div>
 </div>
 
 <h1 className="font-display text-5xl md:text-8xl font-black tracking-tighter text-brand-ink uppercase leading-[0.85]">
 {article.title}
 </h1>
 
 <div className="h-2 w-32 bg-brand-pink shadow-sm"/>
 </div>

 <p className="font-serif text-2xl md:text-3xl text-stone-500 italic leading-snug border-l-4 border-brand-stone pl-10 py-2 max-w-3xl">
 {article.excerpt}
 </p>

 <div className="aspect-[21/9] overflow-hidden border-2 border-brand-ink shadow-[16px_16px_0px_rgba(18,18,18,0.05)]">
 <img 
 src={article.imageUrl} 
 alt={article.title} 
 className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
 />
 </div>
 </header>

 <section className="prose prose-stone prose-xl max-w-none prose-headings:font-display prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-p:font-sans prose-p:text-lg prose-p:leading-relaxed prose-p:text-stone-700 prose-blockquote:border-brand-pink prose-blockquote:bg-brand-stone/30 prose-blockquote:p-8 prose-blockquote:italic prose-blockquote:font-serif prose-img:border-2 prose-img:border-brand-ink">
 <MarkdownRenderer text={article.content} />
 </section>

 <footer className="mt-32 pt-16 border-t-4 border-brand-ink flex flex-col sm:flex-row sm:items-center justify-between gap-12 bg-brand-stone/20 p-12">
 <div className="space-y-3">
 <span className="block font-mono text-[10px] font-black text-brand-pink uppercase tracking-[0.4em]">PUBLISHED BY</span>
 <span className="block font-display text-xl font-black text-brand-ink uppercase tracking-tight">
 {siteLabels?.homeModalEditorialBoard ||"CU GOLF CLUB SPORTS EDITORIAL BOARD"}
 </span>
 </div>
 <div className="space-y-3 text-left sm:text-right">
 <span className="block font-mono text-[10px] font-black text-brand-pink uppercase tracking-[0.4em]">LOCATION</span>
 <div className="flex items-center gap-3 justify-start sm:justify-end">
 <MapPin size={18} className="text-brand-ink opacity-20" />
 <span className="block font-display text-xl font-black text-brand-ink uppercase tracking-tight">
 {siteLabels?.homeModalLocation ||"BANGKOK, THAILAND"}
 </span>
 </div>
 </div>
 </footer>
 </article>
 </div>
 );
}
