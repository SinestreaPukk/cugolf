import { ArrowRight, Menu, X, Instagram } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "./Logo";
import { SiteLabels, SiteSettings } from "../types";

const TikTokIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
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
}

export default function Navbar({ currentTab, isAdminLoggedIn, siteLabels, siteSettings }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { id: "home", label: siteLabels?.navHome || "HOME", path: "/", show: true },
    { id: "blog", label: siteLabels?.navBlog || "ACTIVITIES", path: "/activities", show: true },
    { id: "roster", label: siteLabels?.navRoster || "TEAM ROSTER", path: "/roster", show: siteSettings?.showNavbarRoster ?? true },
    { id: "staff", label: siteLabels?.navStaff || "STAFF & BOARD", path: "/staff", show: siteSettings?.showNavbarStaff ?? true },
    { id: "scores", label: siteLabels?.navScores || "SCORES & STATS", path: "/scores", show: siteSettings?.showNavbarScores ?? true },
    { id: "sponsors", label: siteLabels?.navSponsors || "PARTNERS", path: "/sponsors", show: siteSettings?.showNavbarSponsors ?? true },
  ].filter(link => link.show);

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/90 backdrop-blur-md transition-all duration-350">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:py-5">
        {/* Logo / Brand Name in impact editorial typography */}
        <Link
          to="/"
          onClick={() => setIsOpen(false)}
          className="group flex items-center gap-3 text-left cursor-pointer transition-all hover:opacity-90"
        >
          <Logo showText={false} size="md" />
          <div className="flex flex-col">
            <span className="font-display text-2xl md:text-3xl font-extrabold tracking-tight text-neutral-950 leading-none">
              {siteLabels?.navBrandTitle || "cugolfclub."}
            </span>
            <span className="font-mono text-[7.5px] font-bold tracking-wider text-neutral-400 mt-1">
              {siteLabels?.navBrandSubtitle || "[Official] Chulalongkorn University Golf Club"}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.id}
              to={link.path}
              className={`relative py-1 font-sans text-[11px] font-bold tracking-widest uppercase transition-all duration-200 cursor-pointer ${
                isActive(link.path)
                  ? "text-neutral-950 border-b border-neutral-900"
                  : "text-stone-400 hover:text-neutral-900 hover:opacity-100"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>


        {/* Action button - Admin portal trigger */}
        <div className="hidden items-center gap-4 md:flex">
          <a
            href="https://www.instagram.com/cugolfclub/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-400 hover:text-neutral-950 transition-colors p-1"
            title="Follow us on Instagram"
          >
            <Instagram size={18} />
          </a>
          <a
            href="https://www.tiktok.com/@cugolfclub"
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-400 hover:text-neutral-950 transition-colors p-1"
            title="Follow us on TikTok"
          >
            <TikTokIcon size={18} />
          </a>
        </div>

        {/* Mobile menu panel trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 text-neutral-800 md:hidden cursor-pointer"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="fixed inset-x-0 top-[76px] border-b border-stone-200 bg-white/95 backdrop-blur-md px-6 py-8 md:hidden shadow-md animate-fade-in z-50">
          <div className="flex flex-col gap-5">
            {navLinks.map((link) => (
              <Link
                key={link.id}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`text-left font-display text-base font-bold tracking-tight py-1.5 uppercase transition-all ${
                  isActive(link.path) ? "text-neutral-950 pl-3 border-l-2 border-neutral-950" : "text-stone-400"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <hr className="border-stone-150" />

            <div className="flex flex-col gap-3">
              <a
                href="https://www.instagram.com/cugolfclub/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 font-sans text-[11px] font-bold tracking-widest text-stone-500 uppercase py-2"
              >
                <Instagram size={14} />
                <span>FOLLOW @CUGOLFCLUB (IG)</span>
              </a>

              <a
                href="https://www.tiktok.com/@cugolfclub"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 font-sans text-[11px] font-bold tracking-widest text-stone-500 uppercase py-2"
              >
                <TikTokIcon size={14} />
                <span>FOLLOW @CUGOLFCLUB (TIKTOK)</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

