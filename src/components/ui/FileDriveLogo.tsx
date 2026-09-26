import React from "react";
import { cn } from "@/lib/utils";

interface FileDriveLogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

/**
 * Classy Folder Logo with Download for FileDrive
 * Features a modern, multi-layered folder with a crisp download arrow,
 * subtle gradient depth, and sleek SaaS typography.
 */
export function FileDriveLogo({
  className,
  iconOnly = false,
  size = "md",
}: FileDriveLogoProps) {
  const sizeMap = {
    sm: { icon: "w-5 h-5", text: "text-sm", gap: "gap-1.5" },
    md: { icon: "w-7 h-7", text: "text-base", gap: "gap-2.5" },
    lg: { icon: "w-9 h-9", text: "text-xl", gap: "gap-3" },
    xl: { icon: "w-12 h-12", text: "text-2xl", gap: "gap-3.5" },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={cn("inline-flex items-center select-none shrink-0", currentSize.gap, className)}>
      {/* Classy Folder with Download SVG */}
      <div className={cn("relative shrink-0 flex items-center justify-center", currentSize.icon)}>
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md"
        >
          <defs>
            {/* Folder Backplate Gradient */}
            <linearGradient id="fd-back-grad" x1="4" y1="5" x2="32" y2="31" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>

            {/* Folder Front Flap Gradient - Richer vibrant sky to electric blue */}
            <linearGradient id="fd-front-grad" x1="3" y1="13" x2="33" y2="33" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="60%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>

            {/* Glossy Top Edge Highlight */}
            <linearGradient id="fd-gloss" x1="3" y1="13" x2="33" y2="15" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.1" />
            </linearGradient>

            {/* Arrow Glow */}
            <filter id="fd-arrow-shadow" x="8" y="10" width="20" height="20" filterUnits="userSpaceOnUse">
              <feDropShadow dx="0" dy="1" stdDeviation="0.8" floodColor="#082f49" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* 1. Back Folder & Tab */}
          <path
            d="M5 8C5 6.34315 6.34315 5 8 5H14.2C15.26 5 16.27 5.42 17.02 6.17L18.83 7.98C19.2 8.36 19.71 8.57 20.24 8.57H28C29.6569 8.57 31 9.91315 31 11.57V26C31 27.6569 29.6569 29 28 29H8C6.34315 29 5 27.6569 5 26V8Z"
            fill="url(#fd-back-grad)"
          />

          {/* 2. Folder Interior Dark Pocket Accent */}
          <path
            d="M6 12H30V26C30 27.1 29.1 28 28 28H8C6.9 28 6 27.1 6 26V12Z"
            fill="#082f49"
            opacity="0.4"
          />

          {/* 3. Front Flap with Rounded Isometric/Sleek Angle */}
          <path
            d="M4 14C4 12.3431 5.34315 11 7 11H29C30.6569 11 32 12.3431 32 14V26C32 27.6569 30.6569 29 29 29H7C5.34315 29 4 27.6569 4 26V14Z"
            fill="url(#fd-front-grad)"
          />

          {/* 4. Glossy Highlight Line along top rim of front flap */}
          <path
            d="M5 13C5 12.4477 5.44772 12 6 12H30C30.5523 12 31 12.4477 31 13V14H5V13Z"
            fill="url(#fd-gloss)"
          />

          {/* 5. Classy Download Arrow (Integrated in Center) */}
          <g filter="url(#fd-arrow-shadow)">
            {/* Arrow Stem & Head */}
            <path
              d="M18 14V22.5M18 22.5L14.5 19M18 22.5L21.5 19"
              stroke="#FFFFFF"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Arrow Base / Download Tray */}
            <path
              d="M13.5 25H22.5"
              stroke="#FFFFFF"
              strokeWidth="2.1"
              strokeLinecap="round"
            />
          </g>
        </svg>
      </div>

      {/* Brand Text Typography */}
      {!iconOnly && (
        <span className={cn("font-bold tracking-tight text-white flex items-center", currentSize.text)}>
          File<span className="text-[#38bdf8]">Drive</span>
        </span>
      )}
    </div>
  );
}

export default FileDriveLogo;
