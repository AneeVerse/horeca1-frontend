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

  // #region agent log
  useEffect(() => {
    if (isHomePage && footerRef.current) {
      const computedStyle = window.getComputedStyle(footerRef.current);
      fetch('http://127.0.0.1:7243/ingest/7c8b8306-06cf-4e61-b56f-4a46c890ce31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Footer.jsx:useEffect',message:'Footer container styles',data:{display:computedStyle.display,flexDirection:computedStyle.flexDirection,width:computedStyle.width,children:footerRef.current.children.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    }
  }, [isHomePage]);
  // #endregion

  return (
    <div className={`${isHomePage ? 'bg-primary-500' : 'bg-gradient-to-b from-primary-50 to-white pb-20 lg:pb-8'}`}>
      {/* Hero Logo Section */}
      <div className="bg-primary-500 py-12 lg:py-20">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-10 flex flex-col items-center justify-center text-center">
          <div className="relative w-48 md:w-64 lg:w-full lg:max-w-md">
            <img
              src="https://res.cloudinary.com/dezs8ma9n/image/upload/v1766484997/horecaLogo_hirtnv.png"
              alt="Horeca1 Large"
              className="w-full h-auto object-contain brightness-0 invert opacity-90"
            />
          </div>
          <p className="text-white/80 text-xs md:text-sm tracking-[0.15em] md:tracking-[0.25em] uppercase mt-3 lg:mt-4 font-medium mb-8">Hospitality Supplies Made Easy</p>

          {/* New Integrated Links - Side by Side layout for Home Page */}
          {isHomePage && (
            <div ref={footerRef} className="flex flex-row items-center justify-center gap-2 sm:gap-3 md:gap-4 text-white/70 border-t border-white/10 pt-8 mt-4" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap' }}>
              <span className="text-[9px] sm:text-[10px] md:text-xs font-light whitespace-nowrap inline-block">© {new Date().getFullYear()} Horeca1. All rights reserved.</span>
              <span className="text-white/30">|</span>
              <span className="text-[9px] sm:text-[10px] md:text-xs text-white/50 whitespace-nowrap inline-block">
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
