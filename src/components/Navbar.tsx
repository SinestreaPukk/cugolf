import { ArrowRight, Menu, X, Instagram } from "lucide-react";
import { useState } from "react";
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
  setCurrentTab: (tab: string) => void;
  isAdminLoggedIn: boolean;
  siteLabels?: SiteLabels;
  siteSettings?: SiteSettings;
}

export default function Navbar({ currentTab, setCurrentTab, isAdminLoggedIn, siteLabels, siteSettings }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { id: "home", label: siteLabels?.navHome || "HOME", show: true },
    { id: "roster", label: siteLabels?.navRoster || "TEAM ROSTER", show: siteSettings?.showNavbarRoster ?? true },
    { id: "staff", label: siteLabels?.navStaff || "STAFF & BOARD", show: siteSettings?.showNavbarStaff ?? true },
    { id: "scores", label: siteLabels?.navScores || "SCORES & STATS", show: siteSettings?.showNavbarScores ?? true },
    { id: "sponsors", label: siteLabels?.navSponsors || "PARTNERS", show: siteSettings?.showNavbarSponsors ?? true },
  ].filter(link => link.show);

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-950 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:py-8">
        {/* Logo / Brand Name in impact editorial typography */}
        <button
          onClick={() => {
            setCurrentTab("home");
            setIsOpen(false);
          }}
          className="group flex items-center gap-4 text-left cursor-pointer transition-all"
        >
          <Logo showText={false} size="md" />
          <div className="flex flex-col">
            <span className="font-thai text-3xl md:text-4xl font-bold tracking-tight text-neutral-950 leading-none">
              {siteLabels?.navBrandTitle || "cugolfclub."}
            </span>
            <span className="font-mono text-[8px] font-black tracking-[0.3em] text-neutral-400 mt-1 uppercase">
              {siteLabels?.navBrandSubtitle || "[Official] Chulalongkorn University Golf Club"}
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-10 lg:flex">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => setCurrentTab(link.id)}
              className={`relative py-1 font-mono text-[10px] font-black tracking-[0.3em] uppercase transition-all duration-300 cursor-pointer ${
                currentTab === link.id
                  ? "text-[#da5f8e] border-b-2 border-[#da5f8e]"
                  : "text-neutral-400 hover:text-neutral-950"
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Action icons */}
        <div className="hidden items-center gap-6 lg:flex">
          <a
            href="https://www.instagram.com/cugolfclub/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-400 hover:text-[#da5f8e] transition-colors"
            title="Follow us on Instagram"
          >
            <Instagram size={20} />
          </a>
          <a
            href="https://www.tiktok.com/@cugolfclub"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-400 hover:text-[#da5f8e] transition-colors"
            title="Follow us on TikTok"
          >
            <TikTokIcon size={20} />
          </a>
        </div>

        {/* Mobile menu panel trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-neutral-950 lg:hidden cursor-pointer"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="fixed inset-x-0 top-[90px] h-screen bg-white border-t border-neutral-950 px-8 py-12 lg:hidden z-50 animate-fade-in">
          <div className="flex flex-col gap-8">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  setCurrentTab(link.id);
                  setIsOpen(false);
                }}
                className={`text-left font-thai text-4xl font-bold tracking-tight py-2 uppercase transition-all ${
                  currentTab === link.id ? "text-[#da5f8e] border-l-4 border-[#da5f8e] pl-6" : "text-neutral-950"
                }`}
              >
                {link.label}
              </button>
            ))}

            <div className="mt-12 pt-12 border-t border-neutral-950/5 flex flex-col gap-6">
              <a
                href="https://www.instagram.com/cugolfclub/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 font-mono text-xs font-black tracking-[0.3em] text-neutral-400 uppercase"
              >
                <Instagram size={20} />
                <span>FOLLOW @CUGOLFCLUB</span>
              </a>

              <a
                href="https://www.tiktok.com/@cugolfclub"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 font-mono text-xs font-black tracking-[0.3em] text-neutral-400 uppercase"
              >
                <TikTokIcon size={20} />
                <span>FOLLOW @CUGOLFCLUB</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
