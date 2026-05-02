"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import Link from "next/link";

//internal imports

// Dynamically import FooterContent (client component)
const FooterContent = dynamic(() => import("@components/footer/FooterContent"));

const Footer = ({ error, storeCustomizationSetting }) => {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const footer = storeCustomizationSetting?.footer;
  const footerRef = useRef(null);
return (
    <div className={`${isHomePage ? 'bg-primary-500 pb-[68px] sm:pb-8' : 'bg-gradient-to-b from-primary-50 to-white pb-20 lg:pb-8'}`}>
      {/* Hero Logo Section */}
      <div className="bg-primary-500 py-4 md:py-5 lg:py-6">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-10">
          {/* Top Section - Logo and Tagline (Centered for both mobile and desktop) */}
          <div className="flex flex-col items-center justify-center text-center">
            <div className="relative w-48 md:w-64 lg:w-full lg:max-w-[320px]">
              <img
                src="https://res.cloudinary.com/dezs8ma9n/image/upload/v1766484997/horecaLogo_hirtnv.png"
                alt="Horeca1 Large"
                className="w-full h-auto object-contain brightness-0 invert opacity-90"
              />
            </div>
            {/* Mobile: Tagline centered */}
            <p className="text-white/80 text-[10px] md:text-sm tracking-[0.15em] md:tracking-[0.25em] uppercase mt-1 lg:mt-2 font-medium italic text-center lg:hidden">Hospitality Supplies Made Easy</p>

            {/* Desktop: Tagline with left and right text on same row */}
            {isHomePage && (
              <div className="hidden lg:grid lg:grid-cols-3 lg:items-center lg:w-full lg:mt-3">
                {/* Left Column - Copyright */}
                <div className="text-left flex items-center justify-start">
                  <span className="text-white/70 text-xs font-light">© {new Date().getFullYear()} Horeca1. All rights reserved.</span>
                </div>

                {/* Center Column - Tagline */}
                <div className="text-center flex items-center justify-center">
                  <p className="text-white/80 text-sm tracking-[0.25em] uppercase font-medium italic">Hospitality Supplies Made Easy</p>
                </div>

                {/* Right Column - Design Credit */}
                <div className="text-right flex items-center justify-end">
                  <span className="text-white/70 text-xs text-white/50">
                    Designed & Managed by <span className="text-white/90 font-semibold italic">Aneeverse</span>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Section - Mobile only */}
          {isHomePage && (
            <div ref={footerRef} className="flex flex-row items-center justify-center gap-2 text-white/70 text-[9px] sm:text-[10px] md:text-xs mt-2 lg:hidden">
              <span className="font-light whitespace-nowrap">© {new Date().getFullYear()} Horeca1. All rights reserved.</span>
              <span className="text-white/30">|</span>
              <span className="text-white/50 whitespace-nowrap">
                Designed & Managed by <span className="text-white/90 font-semibold italic">Aneeverse</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Content - conditionally hidden on home page */}
      <FooterContent storeCustomizationSetting={storeCustomizationSetting} />
    </div>
  );
};

export default Footer;
