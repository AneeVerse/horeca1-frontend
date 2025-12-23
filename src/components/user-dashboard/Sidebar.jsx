"use client";
import Link from "next/link";

//internal import
import {
  ChevronDown,
  ChevronUp,
  File,
  Grid,
  Home,
  List,
  LockOpen,
  Settings,
  Star,
  User,
} from "lucide-react";
import useUtilsFunction from "@hooks/useUtilsFunction";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useSetting } from "@context/SettingContext";

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { storeCustomization } = useSetting();

  // Get userInfo from cookie (primary auth method for OTP login)
  const [userInfo, setUserInfo] = useState(null);
  
  useEffect(() => {
    const userInfoCookie = Cookies.get("userInfo");
    if (userInfoCookie) {
      try {
        const parsed = JSON.parse(userInfoCookie);
        setUserInfo(parsed);
      } catch {
        setUserInfo(null);
      }
    }
  }, []);

  const dashboard = storeCustomization?.dashboard;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { showingTranslateValue } = useUtilsFunction();

  const handleLogOut = () => {
    signOut();
    Cookies.remove("couponInfo");
    Cookies.remove("userInfo");
    router.push("/");
  };

  // Get display name (fallback to phone if no name)
  const displayName = userInfo?.name || (userInfo?.phone ? `+${userInfo.phone.slice(0, 2)} ${userInfo.phone.slice(-10, -5)}****` : "User");
  const displayEmail = userInfo?.email || (userInfo?.phone ? `+${userInfo.phone.slice(0, 2)} ${userInfo.phone.slice(-4)}` : "");

  const userSidebar = [
    {
      title: showingTranslateValue(dashboard?.dashboard_title),
      href: "/user/dashboard",
      icon: Grid,
    },

    {
      title: showingTranslateValue(dashboard?.my_order),
      href: "/user/my-orders",
      icon: List,
    },
    {
      title: "My Review",
      href: "/user/my-reviews",
      icon: Star,
    },
    {
      title: "My Account",
      href: "/user/my-account",
      icon: User,
    },
    // {
    //   title: "Shipping Address",
    //   href: "/user/shipping-address",
    //   icon: Home,
    // },
    {
      title: showingTranslateValue(dashboard?.update_profile),
      href: "/user/update-profile",
      icon: Settings,
    },
    {
      title: showingTranslateValue(dashboard?.change_password),
      href: "/user/change-password",
      icon: File,
    },
  ];

  return (
    <div className="mx-auto max-w-screen-2xl px-3 sm:px-10">
      {/* Mobile Dropdown */}
      <div className="lg:hidden mt-6">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center cursor-pointer justify-between w-full p-3 bg-gray-50 rounded-md transition-all"
        >
          <div className="flex flex-row items-center">
            <div className="relative w-10 h-10">
              <div className="relative rounded-full w-10 h-10 border-2 border-gray-200 flex items-center justify-center bg-gray-100 overflow-hidden">
                {userInfo?.image ? (
                  <Image
                    src={userInfo.image}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full bg-gray-50"
                    alt={userInfo?.name[0]}
                  />
                ) : (
                  <div className="flex items-center text-xl font-semibold justify-center text-emerald-600">
                    {displayName?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}
              </div>
            </div>
            <div className="ml-3">
              <h5 className="text-left text-md font-semibold leading-none text-gray-800 line-h">
                {displayName}
              </h5>
              <p className="text-sm text-gray-500">{displayEmail}</p>
            </div>
          </div>
          {isDropdownOpen ? (
            <ChevronUp className="text-gray-500" />
          ) : (
            <ChevronDown className="text-gray-500" />
          )}
        </button>

        {isDropdownOpen && (
          <div className="mt-1 bg-white rounded-md border border-gray-200">
            {userSidebar?.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="flex items-center px-4 py-3 hover:bg-gray-50 border-b border-gray-100 text-sm font-medium text-gray-600 cursor-pointer"
                onClick={() => setIsDropdownOpen(false)}
              >
                <item.icon className="mr-3 text-gray-500" />
                {item.title}
              </Link>
            ))}
            <button
              onClick={() => {
                handleLogOut();
                setIsDropdownOpen(false);
              }}
              className="flex items-center w-full px-4 py-3 hover:bg-gray-50 text-sm font-medium cursor-pointer text-gray-600"
            >
              <LockOpen className="mr-3 text-gray-500" />
              {showingTranslateValue(storeCustomization?.navbar?.logout)}
            </button>
          </div>
        )}
      </div>

      {/* Desktop Layout */}
      <div className="flex flex-col lg:flex-row w-full">
        {/* Desktop Sidebar - Hidden on mobile */}
        <div className="hidden lg:block flex-shrink-0 w-80 my-10 lg:pr-6">
          <div className="rounded-md sticky top-32">
            {/* Avatar Section */}
            <div className="flex flex-row items-center mb-6">
              <div className="relative w-16 h-16">
                <div className="relative w-16 h-16 rounded-full border-2 border-gray-200 flex items-center justify-center bg-gray-100 overflow-hidden">
                  {userInfo?.image ? (
                    <img
                      src={userInfo.image}
                      width={64}
                      height={64}
                      className="h-16 w-16 rounded-full bg-gray-50"
                      alt={userInfo?.name[0]}
                    />
                  ) : (
                    <div className="flex items-center text-xl font-semibold justify-center text-emerald-600">
                      {displayName?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="ml-3">
                <div>
                  <h5 className="text-lg text-left font-semibold leading-none text-gray-800 line-h">
                    {displayName}
                  </h5>
                  <p className="text-sm text-gray-500">{displayEmail}</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            {userSidebar?.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  href={item.href}
                  key={item.title}
                  className={`inline-flex items-center rounded-md hover:bg-gray-100 py-3 px-4 text-sm font-medium w-full mb-1 transition-colors ${
                    isActive
                      ? "text-emerald-600 bg-emerald-100"
                      : "text-gray-600"
                  }`}
                >
                  <item.icon
                    className={`flex-shrink-0 h-4 w-4 mr-3 ${
                      isActive ? "text-emerald-600" : "text-gray-500"
                    }`}
                    aria-hidden="true"
                  />

                  {item.title}
                </Link>
              );
            })}

            {/* Logout Button */}
            <span className="p-3 flex items-center rounded-md hover:bg-gray-50 w-full">
              <LockOpen className="flex-shrink-0 h-4 w-4 text-gray-500" />
              <button
                onClick={handleLogOut}
                className="inline-flex items-center justify-between ml-2 text-sm font-medium w-full text-left cursor-pointer transition-colors text-gray-600"
              >
                {showingTranslateValue(storeCustomization?.navbar?.logout)}
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
