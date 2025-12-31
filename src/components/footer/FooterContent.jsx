"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const FooterContent = ({ storeCustomizationSetting }) => {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-10">
      {/* Middle Content Section - Hidden on home page */}
      {!isHomePage && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 py-10 lg:py-16">
          {/* Left Side - Big Bold Text */}
          <div className="lg:col-span-5 space-y-3 text-center lg:text-left">
            <h2 className="text-xl md:text-3xl lg:text-[2rem] font-bold text-gray-900 leading-tight">
              Horeca1 - Restaurant Supplies
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              C-003, Sanpada Station Complex,<br />
              Navi Mumbai, Maharashtra 400705
            </p>
            <p className="text-gray-500 text-sm">
              07710920002<br />
              saket@red.org.in
            </p>
          </div>

          {/* Right Side - Link Columns */}
          {/* Mobile: Single column stacked layout | Desktop: 3 columns */}
          <div className="lg:col-span-7">
            {/* Mobile Layout - All links in a centered, wrapped flex container */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 lg:hidden">
              <Link href="/pages/payment-policy" className="text-gray-700 hover:text-primary-600 transition-colors text-sm font-medium">Payment Policy</Link>
              <Link href="/pages/terms-and-conditions" className="text-gray-700 hover:text-primary-600 transition-colors text-sm font-medium">Terms & Conditions</Link>
              <Link href="/pages/privacy-policy" className="text-gray-700 hover:text-primary-600 transition-colors text-sm font-medium">Privacy Policy</Link>
              <Link href="/user/dashboard" className="text-gray-700 hover:text-primary-600 transition-colors text-sm font-medium">My Orders</Link>
              <Link href="/user/dashboard" className="text-gray-700 hover:text-primary-600 transition-colors text-sm font-medium">Customer Support</Link>
              <Link href="/about-us" className="text-gray-700 hover:text-primary-600 transition-colors text-sm font-medium">About Us</Link>
              <Link href="/faq" className="text-gray-700 hover:text-primary-600 transition-colors text-sm font-medium">FAQ</Link>
            </div>

            {/* Desktop Layout - 3 columns grid */}
            <div className="hidden lg:grid grid-cols-3 gap-8">
              {/* Column 1 */}
              <div className="space-y-3">
                <Link href="/pages/payment-policy" className="block text-gray-700 hover:text-primary-600 transition-colors text-sm">Payment Policy</Link>
                <Link href="/pages/terms-and-conditions" className="block text-gray-700 hover:text-primary-600 transition-colors text-sm">Terms & Conditions</Link>
                <Link href="/pages/privacy-policy" className="block text-gray-700 hover:text-primary-600 transition-colors text-sm">Privacy Policy</Link>
              </div>

              {/* Column 2 */}
              <div className="space-y-3">
                <Link href="/user/dashboard" className="block text-gray-700 hover:text-primary-600 transition-colors text-sm">My Orders</Link>
                <Link href="/user/dashboard" className="block text-gray-700 hover:text-primary-600 transition-colors text-sm">Customer Support</Link>
              </div>

              {/* Column 3 */}
              <div className="space-y-3">
                <Link href="/about-us" className="block text-gray-700 hover:text-primary-600 transition-colors text-sm">About Us</Link>
                <Link href="/faq" className="block text-gray-700 hover:text-primary-600 transition-colors text-sm">FAQ</Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Bar - Always visible EXCEPT on home page (moved to green section) */}
      {!isHomePage && (
        <div className={`border-t border-gray-200 py-6 flex flex-col items-center justify-center text-center lg:flex-row lg:justify-between lg:text-left text-xs text-gray-500 space-y-4 lg:space-y-0 lg:gap-4 ${isHomePage ? 'pt-6' : ''}`}>
          <p className="lg:order-1">© {new Date().getFullYear()} Horeca1. All rights reserved.</p>
          <div className="lg:order-2 flex items-center justify-center gap-3 lg:gap-4">
            <Link href="/pages/privacy-policy" className="hover:text-primary-600 transition-colors">Privacy Policy</Link>
            <span className="text-gray-300">|</span>
            <Link href="/pages/terms-and-conditions" className="hover:text-primary-600 transition-colors">Terms of Service</Link>
          </div>
          <p className="lg:order-3 text-gray-400">Designed & Managed by <span className="text-primary-600 font-medium">Aneeverse</span></p>
        </div>
      )}
    </div>
  );
};

export default FooterContent;


