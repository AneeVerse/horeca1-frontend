import React from "react";
import Link from "next/link";
import Image from "next/image";

//internal imports

import useUtilsFunction from "@hooks/useUtilsFunction";
import CMSkeletonTwo from "@components/preloader/CMSkeleton";
import { getUserServerSession } from "@lib/auth-server";

const Footer = async ({ error, storeCustomizationSetting }) => {
  const footer = storeCustomizationSetting?.footer;

  return (
    <div className="bg-gradient-to-b from-primary-50 to-white pb-20 lg:pb-8">
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
          <p className="text-white/80 text-xs md:text-sm tracking-[0.15em] md:tracking-[0.25em] uppercase mt-3 lg:mt-4 font-medium">Hospitality Supplies Made Easy</p>
        </div>
      </div>

      {/* Footer Content */}
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-10">
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

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 py-6 flex flex-col items-center text-center lg:flex-row lg:justify-between lg:text-left text-xs text-gray-500 gap-3 lg:gap-4">
          <p className="order-2 lg:order-1">© {new Date().getFullYear()} Horeca1. All rights reserved.</p>
          <div className="order-1 lg:order-2 flex items-center gap-3 lg:gap-4">
            <Link href="/pages/privacy-policy" className="hover:text-primary-600 transition-colors">Privacy Policy</Link>
            <span className="text-gray-300">|</span>
            <Link href="/pages/terms-and-conditions" className="hover:text-primary-600 transition-colors">Terms of Service</Link>
          </div>
          <p className="order-3 text-gray-400">Designed & Managed by <span className="text-primary-600 font-medium">Aneeverse</span></p>
        </div>
      </div>
    </div>
  );
};

export default Footer;
