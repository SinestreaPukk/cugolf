import { ArrowRight, Menu, X, Instagram, Facebook, ChevronDown, LogOut } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "./Logo";
import { SiteLabels, SiteSettings } from "../types";
import { useLanguage } from "../utils/LanguageContext";

const ThaiFlag = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={Math.round(size * 2/3)} viewBox="0 0 90 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="select-none pointer-events-none">
    <rect width="90" height="10" fill="#A51931" />
    <rect y="10" width="90" height="10" fill="#F4F5F8" />
    <rect y="20" width="90" height="20" fill="#2D2A4A" />
    <rect y="40" width="90" height="10" fill="#F4F5F8" />
    <rect y="50" width="90" height="10" fill="#A51931" />
  </svg>
);

const UKFlag = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={Math.round(size * 2/3)} viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="select-none pointer-events-none">
    <rect width="60" height="40" fill="#012169" />
    <path d="M0,0 L60,40 M60,0 L0,40" stroke="#FFFFFF" strokeWidth="6" />
    <path d="M0,0 L30,20" stroke="#C8102E" strokeWidth="2.5" />
    <path d="M60,40 L30,20" stroke="#C8102E" strokeWidth="2.5" />
    <path d="M60,0 L30,20" stroke="#C8102E" strokeWidth="2.5" />
    <path d="M0,40 L30,20" stroke="#C8102E" strokeWidth="2.5" />
    <path d="M30,0 v40 M0,20 h60" stroke="#FFFFFF" strokeWidth="10" />
    <path d="M30,0 v40 M0,20 h60" stroke="#C8102E" strokeWidth="6" />
  </svg>
);

const TikTokIcon = ({ size = 24, className =""}: { size?: number, className?: string }) => (
 <svg 
 role="img"
 viewBox="0 0 24 24"
 width={size} 
 height={size} 
 fill="currentColor"
 className={className}
 xmlns="http://www.w3.org/2000/svg"
 >
 <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.13-1.47V18c0 1.94-.66 3.82-1.88 5.23-1.65 1.91-4.21 2.82-6.65 2.5-2.43-.31-4.57-1.85-5.69-4.06-1.12-2.21-1.07-4.9.14-7.06 1.21-2.16 3.51-3.56 5.97-3.66.02 1.34-.01 2.68.01 4.02-1.39.06-2.81.71-3.6 1.83-.8 1.12-1 2.6-.53 3.91.47 1.3 1.64 2.29 2.97 2.58 1.32.29 2.76-.11 3.73-1.05.97-.94 1.48-2.3 1.48-3.64V0l.01.02Z"/>
 </svg>
);

interface NavbarProps {
 currentTab: string;
 isAdminLoggedIn: boolean;
 siteLabels?: SiteLabels;
 siteSettings?: SiteSettings;
 memberUser?: any;
 onLogout?: () => void;
}

export default function Navbar({ currentTab, isAdminLoggedIn, siteLabels, siteSettings, memberUser, onLogout }: NavbarProps) {
 const { language, setLanguage } = useLanguage();
 const [isOpen, setIsOpen] = useState(false);
 const [isActivitiesOpen, setIsActivitiesOpen] = useState(false);
 const [isMobileActivitiesOpen, setIsMobileActivitiesOpen] = useState(false);
 const location = useLocation();
 const dropdownRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
 function handleClickOutside(event: MouseEvent) {
 if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
 setIsActivitiesOpen(false);
 }
 }
 document.addEventListener("mousedown", handleClickOutside);
 return () => document.removeEventListener("mousedown", handleClickOutside);
 }, []);

 const navLinks = [
 { 
 id:"activities", 
 label: siteLabels?.navBlog ||"ACTIVITIES", 
 path:"/activities", 
 show: true,
 dropdown: [
 { label: siteLabels?.navBlogSubBlog || "BLOG", path:"/activities/blog"},
 { label: siteLabels?.navBlogSubClub || "CLUB ACTIVITIES", path:"/activities/club"},
 ]
 },
 { id:"roster", label: siteLabels?.navRoster ||"TEAM ROSTER", path:"/roster", show: siteSettings?.showNavbarRoster ?? true },
 { id:"staff", label: siteLabels?.navStaff ||"STAFF & BOARD", path:"/staff", show: siteSettings?.showNavbarStaff ?? true },
 { id:"scores", label: siteLabels?.navScores ||"SCORES & STATS", path:"/scores", show: siteSettings?.showNavbarScores ?? true },
 { id:"sponsors", label: siteLabels?.navSponsors ||"PARTNERS", path:"/sponsors", show: siteSettings?.showNavbarSponsors ?? true },
 { id:"membership", label: memberUser ? (language === "th" ? "พอร์ทัลสมาชิก" : "MY PORTAL") : (language === "th" ? "สมัครสมาชิก" : "MEMBERSHIP"), path:"/membership", show: true },
 ].filter(link => link.show);

 const isActive = (path: string) => {
 if (path ==="/"&& location.pathname ==="/") return true;
 if (path !=="/"&& location.pathname.startsWith(path)) return true;
 return false;
 };

 return (
 <header className="sticky top-0 z-50 border-b border-brand-ink bg-brand-neutral/90 backdrop-blur-md transition-all duration-350">
 <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:py-5">
 {/* Logo / Brand Name in impact editorial typography */}
 <Link
 to="/"
 onClick={() => setIsOpen(false)}
 className="group flex items-center gap-3 text-left cursor-pointer transition-all hover:opacity-90"
 >
 <Logo showText={false} size="md"/>
 <div className="flex flex-col">
 <span className="font-display text-2xl md:text-3xl font-extrabold tracking-tight text-brand-ink leading-none">
 {siteLabels?.navBrandTitle ||"cugolfclub."}
 </span>
 <span className="font-mono text-[7.5px] font-bold tracking-wider text-neutral-400 mt-1">
 {siteLabels?.navBrandSubtitle ||"[Official] Chulalongkorn University Golf Club"}
 </span>
 </div>
 </Link>

 {/* Desktop Navigation Links */}
 <nav className="hidden items-center gap-8 md:flex">
 {navLinks.map((link) => (
 link.dropdown ? (
 <div key={link.id} className="relative group"ref={dropdownRef}>
 <button
 onClick={() => setIsActivitiesOpen(!isActivitiesOpen)}
 onMouseEnter={() => setIsActivitiesOpen(true)}
 className={`flex items-center gap-1 py-1 font-sans text-[11px] font-bold tracking-widest uppercase transition-all duration-200 cursor-pointer ${
 isActive(link.path)
 ?"text-brand-ink border-b border-neutral-900"
 :"text-stone-400 hover:text-neutral-900 hover:opacity-100"
 }`}
 >
 {link.label} <ChevronDown size={12} className={`transition-transform duration-200 ${isActivitiesOpen ?"rotate-180":""}`} />
 </button>
 
 {isActivitiesOpen && (
 <div 
 className="absolute top-full left-0 mt-2 w-48 bg-brand-neutral border border-brand-ink py-2 animate-fade-in"
 onMouseLeave={() => setIsActivitiesOpen(false)}
 >
 {link.dropdown.map((subItem) => (
 <Link
 key={subItem.path}
 to={subItem.path}
 onClick={() => setIsActivitiesOpen(false)}
 className="block px-4 py-2 font-sans text-[10px] font-bold tracking-widest text-stone-400 hover:text-brand-ink hover:bg-brand-stone transition-colors uppercase"
 >
 {subItem.label}
 </Link>
 ))}
 </div>
 )}
 </div>
 ) : (
 <Link
 key={link.id}
 to={link.path}
 className={`relative py-1 font-sans text-[11px] font-bold tracking-widest uppercase transition-all duration-200 cursor-pointer ${
 isActive(link.path)
 ?"text-brand-ink border-b border-neutral-900"
 :"text-stone-400 hover:text-neutral-900 hover:opacity-100"
 }`}
 >
 {link.label}
 </Link>
 )
 ))}
 </nav>


  {/* Action button - Admin portal trigger */}
  <div className="hidden items-center gap-6 md:flex">
    <div className="flex items-center gap-4">
      <a
      href="https://www.facebook.com/cugolfclub/"
      target="_blank"
      rel="noopener noreferrer"
      className="text-stone-400 hover:text-brand-ink transition-colors p-1"
      title="Follow us on Facebook"
      >
      <Facebook size={18} />
      </a>
      <a
      href="https://www.instagram.com/cugolfclub/"
      target="_blank"
      rel="noopener noreferrer"
      className="text-stone-400 hover:text-brand-ink transition-colors p-1"
      title="Follow us on Instagram"
      >
      <Instagram size={18} />
      </a>
      <a
      href="https://www.tiktok.com/@cugolfclub"
      target="_blank"
      rel="noopener noreferrer"
      className="text-stone-400 hover:text-brand-ink transition-colors p-1"
      title="Follow us on TikTok"
      >
      <TikTokIcon size={18} />
      </a>
    </div>

    {memberUser && (
      <button
        onClick={onLogout}
        className="font-sans text-[10px] font-black tracking-widest text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors uppercase border border-red-600/30 px-3 py-1 cursor-pointer"
        title="Log out of your session"
      >
        {language === "th" ? "ออกจากระบบ" : "LOGOUT"}
      </button>
    )}

    {/* Desktop Language Switch Toggle */}
    <button
      onClick={() => setLanguage(language === "en" ? "th" : "en")}
      className="transition-all duration-300 hover:opacity-85 hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center bg-transparent outline-none focus:outline-none select-none"
      title={language === "en" ? "Translate to Thai" : "Translate to English"}
    >
      {language === "en" ? <ThaiFlag size={24} /> : <UKFlag size={24} />}
    </button>
  </div>

  <div className="flex items-center gap-4 md:hidden">
    {/* Mobile Language Switch Toggle */}
    <button
      onClick={() => setLanguage(language === "en" ? "th" : "en")}
      className="transition-all duration-300 hover:opacity-85 hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center bg-transparent outline-none focus:outline-none select-none"
      title={language === "en" ? "Translate to Thai" : "Translate to English"}
    >
      {language === "en" ? <ThaiFlag size={20} /> : <UKFlag size={20} />}
    </button>

    {/* Mobile menu panel trigger */}
    <button
    onClick={() => setIsOpen(!isOpen)}
    className="p-1.5 text-neutral-800 cursor-pointer"
    aria-label="Toggle menu"
    >
    {isOpen ? <X size={22} /> : <Menu size={22} />}
    </button>
  </div>
 </div>

 {/* Mobile Menu Panel */}
 {isOpen && (
 <div className="fixed inset-x-0 top-[76px] border-b border-brand-ink bg-brand-neutral/95 backdrop-blur-md px-6 py-8 md:hidden animate-fade-in z-50 overflow-y-auto max-h-[calc(100vh-76px)]">
 <div className="flex flex-col gap-5">
 {navLinks.map((link) => (
 <div key={link.id} className="flex flex-col">
 {link.dropdown ? (
 <>
 <button
 onClick={() => setIsMobileActivitiesOpen(!isMobileActivitiesOpen)}
 className={`flex items-center justify-between text-left font-display text-base font-bold tracking-tight py-1.5 uppercase transition-all ${
 isActive(link.path) ?"text-brand-ink pl-3 border-l-2 border-brand-ink":"text-stone-400"
 }`}
 >
 {link.label}
 <ChevronDown size={18} className={`transition-transform duration-200 ${isMobileActivitiesOpen ?"rotate-180":""}`} />
 </button>
 {isMobileActivitiesOpen && (
 <div className="pl-6 flex flex-col gap-4 mt-4 mb-2 animate-fade-in">
 {link.dropdown.map((subItem) => (
 <Link
 key={subItem.path}
 to={subItem.path}
 onClick={() => {
 setIsOpen(false);
 setIsMobileActivitiesOpen(false);
 }}
 className="text-left font-sans text-xs font-bold tracking-widest text-stone-400 hover:text-brand-ink uppercase"
 >
 {subItem.label}
 </Link>
 ))}
 </div>
 )}
 </>
 ) : (
 <Link
 to={link.path}
 onClick={() => setIsOpen(false)}
 className={`text-left font-display text-base font-bold tracking-tight py-1.5 uppercase transition-all ${
 isActive(link.path) ?"text-brand-ink pl-3 border-l-2 border-brand-ink":"text-stone-400"
 }`}
 >
 {link.label}
 </Link>
 )}
 </div>
 ))}

 <hr className="border-brand-ink"/>

 <div className="flex flex-col gap-3">
 <a
 href="https://www.facebook.com/cugolfclub/"
 target="_blank"
 rel="noopener noreferrer"
 className="flex items-center gap-2.5 font-sans text-[11px] font-bold tracking-widest text-stone-500 uppercase py-2"
 >
 <Facebook size={14} />
 <span>{siteLabels?.navFollowFb || "FOLLOW @CUGOLFCLUB (FB)"}</span>
 </a>

 <a
 href="https://www.instagram.com/cugolfclub/"
 target="_blank"
 rel="noopener noreferrer"
 className="flex items-center gap-2.5 font-sans text-[11px] font-bold tracking-widest text-stone-500 uppercase py-2"
 >
 <Instagram size={14} />
 <span>{siteLabels?.navFollowIg || "FOLLOW @CUGOLFCLUB (IG)"}</span>
 </a>

 <a
 href="https://www.tiktok.com/@cugolfclub"
 target="_blank"
 rel="noopener noreferrer"
 className="flex items-center gap-2.5 font-sans text-[11px] font-bold tracking-widest text-stone-500 uppercase py-2"
 >
 <TikTokIcon size={14} />
 <span>{siteLabels?.navFollowTiktok || "FOLLOW @CUGOLFCLUB (TIKTOK)"}</span>
 </a>

 {memberUser && (
    <button
      onClick={() => {
        setIsOpen(false);
        if (onLogout) onLogout();
      }}
      className="flex items-center gap-2.5 font-sans text-[11px] font-bold tracking-widest text-red-600 uppercase py-2 cursor-pointer border border-red-600/30 px-3 justify-center mt-2"
    >
      <LogOut size={12} />
      <span>{language === "th" ? "ออกจากระบบสมาชิก" : "DISCONNECT SESSION"}</span>
    </button>
  )}
 </div>
 </div>
 </div>
 )}
 </header>
 );
}
