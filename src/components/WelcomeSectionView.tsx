import { useNavigate } from"react-router-dom";
import { WelcomeSection, SiteLabels, AdminEditProps } from"../types";
// WebP re-encodes of the original PNG/JPEG artwork: 1.1MB -> 135KB and 1.0MB -> 307KB.
import golfersSilhouette from"../assets/images/golfers_silhouette.webp";
import defaultBanner from"../assets/images/regenerated_image_1779791459213.webp";
import { Edit } from"lucide-react";
import OptimizedImage from "./OptimizedImage";
import { useLanguage } from "../utils/LanguageContext";

interface WelcomeSectionViewProps extends AdminEditProps {
 welcomeSection: WelcomeSection;
 siteLabels?: SiteLabels;
}

export default function WelcomeSectionView({ welcomeSection, siteLabels, isAdmin, onEditSection, activeSectionId }: WelcomeSectionViewProps) {
 const navigate = useNavigate();
 const { language } = useLanguage();
 if (!welcomeSection) return null;

 const isActive = activeSectionId ==="home_welcome";
 const hoverClasses = isAdmin
 ? `relative transition-all duration-200 cursor-pointer ${isActive ? 'ring-4 ring-[#da5f8e] z-40' : 'hover:ring-4 hover:ring-[#da5f8e]/50'}`
 :"";

 return (
 <section
 id="welcome_legacy_section"
 className={`mx-auto max-w-7xl pt-2 animate-fade-in space-y-10 ${hoverClasses}`}
 onClick={(e) => {
 if (isAdmin && onEditSection) {
 e.stopPropagation();
 onEditSection("home_welcome");
 }
 }}
 >
 {isAdmin && (
 <div className={`absolute top-4 left-4 z-50 bg-brand-pink text-brand-neutral px-3 py-1.5 font-display text-[10px] font-bold tracking-widest flex items-center gap-2 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
 <Edit size={12} /> EDIT WELCOME HERO
 </div>
 )}

 <div className="relative w-screen left-1/2 -translate-x-1/2 -mt-10 md:-mt-14 border-b border-stone-200/80 bg-brand-ink overflow-hidden h-[320px] sm:h-[400px] md:h-[480px] transition-all duration-500">
 <OptimizedImage
 src={welcomeSection.imageUrl || defaultBanner}
 alt="Chulalongkorn University Golf Club Team welcoming banner"
 referrerPolicy="no-referrer"
 width={1920}
 priority
 className="w-full h-full object-cover select-none object-center transition-transform duration-700 hover:scale-[1.01] brightness-[0.4]"
 />
 <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"/>
 <div className="absolute inset-0 flex items-end">
 <div className="mx-auto max-w-7xl px-4 md:px-6 w-full pb-8 text-brand-neutral space-y-2 z-10 drop-shadow-none">
 <p className="font-sans text-5xl sm:text-6xl md:text-7xl font-black leading-[0.9] uppercase tracking-tighter border-0 border-[#000000]">
 {siteLabels?.welcomeHeroTitle || "Longstanding"}
 <br />
 <span className="text-brand-pink text-[78px] italic font-['Georgia',serif] font-black">{siteLabels?.welcomeHeroSubtitle || "Legacy"}</span>
 </p>
 <p className="text-[9px] md:text-[10px] text-stone-200 font-['Verdana',sans-serif] tracking-[0.25em] font-bold pt-0">
 {siteLabels?.welcomeHeroSocial ||"cugolfclub @Student Government of Chulalongkorn University"}
 </p>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-6 bg-brand-neutral overflow-hidden">
 <div className="p-6 md:p-8 pt-5 md:pt-6 md:col-span-4 flex flex-col justify-start bg-brand-neutral text-stone-900 space-y-3.5">
 <div className="space-y-4">
 <h1 className="font-thai text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold italic text-brand-pink tracking-wide leading-tight py-0 antialiased pb-2">
 {welcomeSection.titleThai ||"น้ำใจน้องพี่สีชมพู"}
 </h1>
 <h2 className="font-display text-[14px] md:text-base font-bold text-neutral-500 tracking-widest leading-normal uppercase">
 {welcomeSection.titleEnglish ||"CHULALONGKORN UNIVERSITY GOLF CLUB"}
 </h2>
 </div>

 <p className="font-sans text-[12px] md:text-[13px] font-medium text-stone-600 leading-relaxed text-justify whitespace-pre-line">
 {language === "th" && welcomeSection.descriptionThai ? welcomeSection.descriptionThai : (welcomeSection.description || `With a legacy of excellence on campus, the Chulalongkorn University Golf Club is actively expanding.\n\nWe are actively looking for new members to help shape the future of the club. Join us on the course to build lasting memories, enjoy your time at Chula University`)}
 </p>
 </div>

 <div
 onClick={() => navigate("/roster")}
 className="md:col-span-2 bg-brand-neutral flex items-center justify-center p-3.5 min-h-[210px] md:min-h-[250px] relative overflow-hidden cursor-pointer group transition-all duration-300 hover:brightness-95"
 title="Click to view our Varsity Squad Roster"
 >
 {/* Already a fingerprinted WebP bundle asset — no need to route it through /api/img. */}
 <img
 src={golfersSilhouette}
 alt="Three Chula golfers in color silhouette overlays"
 referrerPolicy="no-referrer"
 loading="lazy"
 decoding="async"
 className="w-full h-auto max-h-[230px] md:max-h-[270px] scale-[1.12] md:scale-[1.18] object-contain select-none relative z-10 transition-transform duration-500 group-hover:scale-[1.25]"
 />
 </div>

 </div>

 </section>
 );
}
