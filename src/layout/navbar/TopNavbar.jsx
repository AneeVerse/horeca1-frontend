"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiPhoneCall } from "react-icons/fi";

//internal imports
import LogoutButton from "./LogoutButton";
import { showingTranslateValue } from "@lib/translate";

const TopNavbar = ({ storeCustomization }) => {
  const navbar = storeCustomization?.navbar;
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  // Hide top navbar on home page
  if (isHomePage) {
    return null;
  }

  return (
    <div className="hidden lg:block bg-gray-100">
      <div className="max-w-screen-2xl mx-auto px-3 sm:px-10">
        <div className="text-gray-700 py-2 font-sans text-xs font-medium flex justify-between items-center">
          <span className="flex items-center">
            <FiPhoneCall className="mr-2" />
            {showingTranslateValue(navbar?.help_text)}
            <a
              href={`tel:${navbar?.phone_number || "+099949343"}`}
              className="font-bold text-emerald-500 ml-1"
            >
              {navbar?.phone_number || "+099949343"}
            </a>
          </span>

          <div className="lg:text-right flex items-center navBar">
            {navbar?.about_menu_status && (
              <div>
                <Link
                  href="/about-us"
                  className="font-medium hover:text-emerald-600"
                >
                  {showingTranslateValue(navbar?.about_us)}
                </Link>
                <span className="mx-2">|</span>
              </div>
            )}
            {navbar?.contact_menu_status && (
              <div>
                <Link
                  href="/contact-us"
                  className="font-medium hover:text-emerald-600"
                >
                  {showingTranslateValue(navbar?.contact_us)}
                </Link>
                <span className="mx-2">|</span>
              </div>
            )}

            <LogoutButton storeCustomization={storeCustomization} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNavbar;
