"use client";

import dynamic from "next/dynamic";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "react-use-cart";
import { FiHome, FiUser, FiShoppingCart, FiAlignLeft } from "react-icons/fi";
import Cookies from "js-cookie";

//internal imports
import PagesDrawer from "@components/drawer/PagesDrawer";
import CartDrawer from "@components/drawer/CartDrawer";
import { SidebarContext } from "@context/SidebarContext";

const MobileFooter = ({ globalSetting, categories, categoryError }) => {
  const [openPageDrawer, setOpenPageDrawer] = useState(false);
  const { cartDrawerOpen, setCartDrawerOpen } = React.useContext(SidebarContext);
  const { totalItems } = useCart();
  
  // Get userInfo from cookie (supports OTP users who may not have email/name)
  const [userInfo, setUserInfo] = useState(null);
  
  useEffect(() => {
    const userInfoCookie = Cookies.get("userInfo");
    if (userInfoCookie) {
      try {
        setUserInfo(JSON.parse(userInfoCookie));
      } catch {
        setUserInfo(null);
      }
    }
  }, []);

  // Check if user is logged in
  const isLoggedIn = !!(userInfo?.email || userInfo?.phone || userInfo?.token);

  const currency = globalSetting?.default_currency || "$";

  return (
    <>
      <CartDrawer
        currency={currency}
        open={cartDrawerOpen}
        setOpen={setCartDrawerOpen}
      />

      <div className="flex flex-col h-full justify-between align-middle bg-white rounded cursor-pointer overflow-y-scroll flex-grow scrollbar-hide w-full">
        <PagesDrawer
          open={openPageDrawer}
          setOpen={setOpenPageDrawer}
          categories={categories}
          categoryError={categoryError}
        />
      </div>
      <footer className="sm:hidden fixed z-30 bottom-0 bg-emerald-500 flex items-center justify-between w-full h-16 px-3 sm:px-10">
        <button
          aria-label="Bar"
          onClick={() => setOpenPageDrawer(true)}
          className="flex items-center justify-center flex-shrink-0 h-auto relative focus:outline-none"
        >
          <span className="text-xl text-white">
            <FiAlignLeft className="w-6 h-6 drop-shadow-xl" />
          </span>
        </button>
        <Link
          href="/"
          className="text-xl text-white"
          rel="noreferrer"
          aria-label="Home"
        >
          <FiHome className="w-6 h-6 drop-shadow-xl" />
        </Link>

        <button
          onClick={() => setCartDrawerOpen(!cartDrawerOpen)}
          className="h-9 w-9 relative whitespace-nowrap inline-flex items-center justify-center text-white text-lg"
        >
          <span className="absolute z-10 top-0 right-0 inline-flex items-center justify-center p-1 h-5 w-5 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 bg-red-500 rounded-full">
            {totalItems}
          </span>
          <FiShoppingCart className="w-6 h-6 drop-shadow-xl" />
        </button>

        <button
          aria-label="User"
          type="button"
          className="text-xl text-white indicator justify-center"
        >
          {isLoggedIn ? (
            userInfo?.image ? (
              <Link href="/user/dashboard" aria-label="user" className="relative top-1 w-6 h-6">
                <Image
                  width={29}
                  height={29}
                  src={userInfo.image}
                  alt="user"
                  className="rounded-full"
                />
              </Link>
            ) : (
              <Link
                aria-label="User"
                href="/user/dashboard"
                className="leading-none font-bold block h-7 w-7 rounded-full bg-white text-emerald-600 flex items-center justify-center"
              >
                {userInfo?.name?.[0] || userInfo?.phone?.slice(-2) || "U"}
              </Link>
            )
          ) : (
            <Link aria-label="user" href="/auth/otp-login">
              <FiUser className="w-6 h-6 drop-shadow-xl" />
            </Link>
          )}
        </button>
      </footer>
    </>
  );
};

export default dynamic(() => Promise.resolve(MobileFooter), { ssr: false });
