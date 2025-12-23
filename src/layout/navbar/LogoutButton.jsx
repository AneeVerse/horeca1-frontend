"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { FiUnlock, FiUser } from "react-icons/fi";
import dynamic from "next/dynamic";
import Cookies from "js-cookie";

//internal imports
import useUtilsFunction from "@hooks/useUtilsFunction";

const LogoutButton = ({ storeCustomization }) => {
  const { showingTranslateValue } = useUtilsFunction();
  
  // Get userInfo from cookie (supports OTP users who don't have email)
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

  // Check if user is logged in (has email OR phone OR token)
  const isLoggedIn = !!(userInfo?.email || userInfo?.phone || userInfo?.token);

  // Handle logout - clear cookie and signOut
  const handleLogout = () => {
    Cookies.remove("userInfo");
    signOut({ callbackUrl: "/" });
  };

  return (
    <>
      <Link
        href={isLoggedIn ? "/user/my-account" : "/auth/otp-login?redirectUrl=/user/my-account"}
        className="font-medium hover:text-emerald-600"
      >
        {showingTranslateValue(storeCustomization?.navbar?.my_account)}
      </Link>
      <span className="mx-2">|</span>
      {isLoggedIn ? (
        <button
          onClick={handleLogout}
          type="submit"
          className="flex items-center font-medium hover:text-emerald-600"
        >
          <span className="mr-1">
            <FiUnlock />
          </span>
          {showingTranslateValue(storeCustomization?.navbar?.logout)}
        </button>
      ) : (
        <Link
          href="/auth/otp-login"
          className="flex items-center font-medium hover:text-emerald-600"
        >
          <span className="mr-1">
            <FiUser />
          </span>

          {showingTranslateValue(storeCustomization?.navbar?.login)}
        </Link>
      )}
    </>
  );
};

export default dynamic(() => Promise.resolve(LogoutButton), { ssr: false });
