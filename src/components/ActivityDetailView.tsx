import { NewsItem, SiteLabels, SiteSettings } from"../types";
import { ArrowLeft } from"lucide-react";
import { Link, Navigate } from"react-router-dom";
import { useEffect } from"react";
import MarkdownRenderer from"./MarkdownRenderer";
import OptimizedImage from "./OptimizedImage";
import { AdminEditProps } from"../types";
import { useLanguage } from "../utils/LanguageContext";

interface ActivityDetailViewProps extends AdminEditProps {
 /** A single article, fetched by id — this page no longer receives the whole archive. */
 article: NewsItem | null;
 siteLabels?: SiteLabels;
 siteSettings?: SiteSettings;
}

export default function ActivityDetailView({ article, siteLabels }: ActivityDetailViewProps) {
 const { language } = useLanguage();

 useEffect(() => {
 window.scrollTo(0, 0);
 }, [article?.id]);

 if (!article) {
 return <Navigate to="/activities"replace />;
 }

 return (
 <article className="max-w-3xl mx-auto py-12 px-4 md:px-0 animate-fade-in">
 <Link
 to="/activities/blog"
 className="inline-flex items-center gap-2 text-brand-pink font-display text-xs font-bold uppercase tracking-widest hover:underline mb-12 group"
 >
 <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1"/>
 {siteLabels?.blogBackToBlog || "BACK TO BLOG"}
 </Link>

 <header className="space-y-8 mb-12">
 <div className="space-y-4">
 <h1 className="font-display text-4xl md:text-6xl font-black tracking-tight text-brand-ink uppercase leading-[0.9] md:leading-[0.85]">
 {language === "th" && article.titleThai ? article.titleThai : article.title}
 </h1>
 
 <div className="h-1.5 w-24 bg-brand-pink"/>
 </div>

 <p className="font-sans text-xl text-stone-500 italic leading-relaxed border-l-4 border-stone-200 pl-6 py-2">
 {language === "th" && article.excerptThai ? article.excerptThai : article.excerpt}
 </p>

 <div className="aspect-video overflow-hidden border border-stone-200">
 <OptimizedImage
 src={article.imageUrl}
 alt={language === "th" && article.titleThai ? article.titleThai : article.title}
 width={1280}
 sizes="(min-width: 768px) 768px, 100vw"
 priority
 className="w-full h-full object-cover"
 />
 </div>
 </header>

 <section className="prose prose-stone prose-lg max-w-none">
 <MarkdownRenderer text={language === "th" && article.contentThai ? article.contentThai : article.content} />
 </section>

 <footer className="mt-20 pt-10 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
 <div className="space-y-1">
 <span className="block font-display text-[10px] font-black text-stone-300 uppercase tracking-[0.2em]">{siteLabels?.blogPublishedBy || "PUBLISHED BY"}</span>
 <span className="block font-display text-[11px] font-bold text-stone-600 uppercase tracking-widest">
 {siteLabels?.homeModalEditorialBoard ||"CU GOLF CLUB SPORTS EDITORIAL BOARD"}
 </span>
 </div>
 <div className="space-y-1 text-left sm:text-right">
 <span className="block font-display text-[10px] font-black text-stone-300 uppercase tracking-[0.2em]">{siteLabels?.blogLocation || "LOCATION"}</span>
 <span className="block font-display text-[11px] font-bold text-stone-600 uppercase tracking-widest">
 {siteLabels?.homeModalLocation ||"BANGKOK, THAILAND"}
 </span>
 </div>
 </footer>
 </article>
 );
}
