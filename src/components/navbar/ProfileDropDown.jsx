"use client";

import { Fragment, useState, useEffect } from "react";
import Link from "next/link";
import { Transition, Menu, MenuButton } from "@headlessui/react";
import { FiUser } from "react-icons/fi";
import Image from "next/image";
import Cookies from "js-cookie";

//internal imports
import { userNavigation } from "@utils/data";

const ProfileDropDown = () => {
  // Check userInfo from cookie (for OTP login users who may not have email)
  const [userInfo, setUserInfo] = useState(null);
  
  useEffect(() => {
    const loadUserInfo = async () => {
      const userInfoCookie = Cookies.get("userInfo");
      if (userInfoCookie) {
        try {
          const parsed = JSON.parse(userInfoCookie);
          setUserInfo(parsed);
          
          // Fetch fresh customer data from database to get latest image
          const customerId = parsed.id || parsed._id;
          if (customerId) {
            try {
              const { baseURL } = await import("@services/CommonService");
              const token = parsed.token;
              
              const response = await fetch(`${baseURL}/customer/${customerId}`, {
                cache: "no-store",
                headers: {
                  "Content-Type": "application/json",
                  ...(token && { Authorization: `Bearer ${token}` }),
                },
              });
              
              if (response.ok) {
                const customer = await response.json();
                
                // Update userInfo with fresh data (prioritize image from database)
                const freshUserInfo = {
                  ...parsed,
                  image: customer.image || parsed.image, // Use image from DB if available
                  name: customer.name || parsed.name,
                  email: customer.email || parsed.email,
                  phone: customer.phone || parsed.phone,
                };
                
                setUserInfo(freshUserInfo);
                
                // Update cookie with fresh data
                Cookies.set("userInfo", JSON.stringify(freshUserInfo), { expires: 30 });
              }
            } catch (err) {
              console.error("[ProfileDropDown] Failed to fetch customer data:", err);
            }
          }
        } catch {
          setUserInfo(null);
        }
      }
    };
    
    // Load initially
    loadUserInfo();
    
    // Listen for custom event when profile is updated
    const handleProfileUpdate = () => {
      loadUserInfo();
    };
    
    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    // Also poll every 5 seconds to refresh data
    const interval = setInterval(loadUserInfo, 5000);
    
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
      clearInterval(interval);
    };
  }, []);

  // Check if user is logged in (has email OR phone OR token)
  const isLoggedIn = !!(userInfo?.email || userInfo?.phone || userInfo?.token);

  return (
    <>
      <Menu as="div" className="relative">
        {isLoggedIn ? (
          <Link href="/user/dashboard" className="-m-1.5 flex items-center p-1.5">
            <span className="sr-only">Go to dashboard</span>

            {userInfo?.image ? (
              <Image
                src={userInfo.image}
                width={32}
                height={32}
                className="h-8 w-8 rounded-full bg-gray-50"
                alt={userInfo?.name?.[0] || "U"}
              />
            ) : (
              <div className="flex items-center justify-center h-8 w-8 rounded-full dark:bg-zinc-700 bg-emerald-500 text-xl font-bold text-center text-white">
                {userInfo?.name?.charAt(0) || userInfo?.phone?.slice(-2) || "U"}
              </div>
            )}
          </Link>
        ) : (
          <Link
            href="/auth/otp-login"
            className="-m-1.5 flex items-center p-1.5"
          >
            <span className="sr-only">Login</span>

            <FiUser className="h-6 w-6 text-white" aria-hidden="true" />
          </Link>
        )}

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 z-10 mt-2.5 w-60 origin-top-right rounded-md dark:bg-zinc-900 dark:text-white bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
            {userNavigation.map((item) => (
              <Menu.Item
                key={item.name}
                className="px-6 py-1 dark:hover:bg-zinc-800 hover:bg-gray-50 hover:text-teal-600"
              >
                <div className="w-full flex">
                  <item.icon className="my-auto" />
                  <Link
                    href={item.href}
                    className="block px-3 py-1 text-sm leading-6 dark:text-white text-gray-900 hover:text-teal-600"
                  >
                    {item.name}
                  </Link>
                </div>
              </Menu.Item>
            ))}

            {/* <Menu.Item className="px-6 py-1 hover:bg-gray-50 hover:text-teal-600">
              <div className="w-full flex">
                <IoLockOpenOutline className="my-auto" />
                <form action="">
                  <button
                    onClick={handleLogOut}
                    // href={item.href}
                    className="block px-3 py-1 text-sm leading-6 text-gray-900 hover:text-teal-600"
                  >
                    Logout
                  </button>
                </form>
              </div>
            </Menu.Item> */}
          </Menu.Items>
        </Transition>
      </Menu>
    </>
  );
};

export default ProfileDropDown;
