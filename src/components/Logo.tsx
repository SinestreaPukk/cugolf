import React from "react";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

export default function Logo({ className = "", showText = true, size = "md" }: LogoProps) {
  // Dimensions based on size preset
  const sizeClasses = {
    sm: { svg: "h-8 w-8", text: "text-[9px] mt-1" },
    md: { svg: "h-11 w-11", text: "text-[11px] mt-1.5" },
    lg: { svg: "h-16 w-16", text: "text-[14px] mt-2" },
    xl: { svg: "h-32 w-32", text: "text-[24px] mt-4" },
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`inline-flex flex-col items-center justify-center ${className}`} id="cu-golf-logo">
      {/* Pristine high-fidelity SVG reproduction of the GOLF CU logo */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${currentSize.svg} drop-shadow-xs`}
        id="cu-golf-logo-svg"
      >
        {/* GREEN 'C' RECTANGLE: outer border, gap on right */}
        {/* Outer Rect is [28,15] to [63,60], strokeWidth: 7 */}
        <path
          d="M 63 15 L 28 15 L 28 60 L 63 60 L 63 47 M 63 36 L 63 15"
          stroke="#3cb882"
          strokeWidth="7"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />

        {/* PINK 'U' SHAPE: Left leg starts inside under black circle, loops down, goes base right, goes right leg up */}
        {/* Left leg center: x=45.5, runs from y=38 to y=76. Bottom horizontal: x=45.5 to x=73.5 at y=76. Right leg: x=73.5, runs from y=76 up to y=31 */}
        <path
          d="M 45.5 38 L 45.5 76 L 73.5 76 L 73.5 31"
          stroke="#ec4899"
          strokeWidth="7.5"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />

        {/* BLACK RING: Centered inside top-half of Green box */}
        {/* Center: cx=45.5, cy=30, outer radius about 9.5 */}
        <circle cx="45.5" cy="30" r="8" stroke="#333333" strokeWidth="4.5" />

        {/* OVERLAP TRANSPARENCY SEGMENT: green and pink overlap at the bottom of the green rect */}
        {/* Green bottom horizontal runs from x=38.5 to x=52.5 at y=56.5 to y=63.5 */}
        {/* We place a blended overlay accent to simulate the beautiful overlay effect */}
        <rect x="41.5" y="56.5" width="8" height="7" fill="#2d4037" opacity="0.9" />
      </svg>
      {showText && (
        <span
          className={`font-sans font-extrabold tracking-wider text-[#333333] uppercase leading-none ${currentSize.text}`}
          id="cu-golf-logo-text"
        >
          GOLF CU
        </span>
      )}
    </div>
  );
}
