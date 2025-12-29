"use client";

import { Fragment, useContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Transition,
  Popover,
  PopoverButton,
  PopoverPanel,
} from "@headlessui/react";

//internal import
import Category from "@components/category/Category";
import { SidebarContext } from "@context/SidebarContext";
import useUtilsFunction from "@hooks/useUtilsFunction";
import SelectLanguage from "@components/form/SelectLanguage";
import {
  AlertCircle,
  ChevronDownIcon,
  File,
  FolderLock,
  Gift,
  HelpCircle,
  PhoneIncoming,
  ShoppingBag,
  User,
} from "lucide-react";
import { useSetting } from "@context/SettingContext";

const NavbarPromo = ({ languages, categories, categoryError }) => {
  const { isLoading, setIsLoading } = useContext(SidebarContext);
  const { storeCustomization } = useSetting();
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  // Hide on auth/login pages
  const isAuthPage = pathname?.startsWith("/auth") || pathname?.startsWith("/login");
  // Hide on contact-us page
  const isContactPage = pathname === "/contact-us";
  // Hide on user dashboard pages
  const isUserDashboard = pathname?.startsWith("/user");
  // Hide on search page
  const isSearchPage = pathname?.startsWith("/search");
  // Hide on checkout page
  const isCheckoutPage = pathname === "/checkout";

  const { showingTranslateValue } = useUtilsFunction();
  const navbar = storeCustomization?.navbar;

  // Hide navigation bar on home page, auth pages, contact-us page, user dashboard, search page, or checkout page
  if (isHomePage || isAuthPage || isContactPage || isUserDashboard || isSearchPage || isCheckoutPage) {
    return null;
  }

  return (
    <>
      <div className="hidden lg:block xl:block bg-white border-b">
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-10 h-12 flex justify-between items-center">
          <div className="inline-flex">
            <Popover className="relative">
              <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center md:justify-start md:space-x-10">
                  <Popover as="nav" className="md:flex space-x-10 items-center">
                    {navbar?.categories_menu_status && (
                      <Popover className="relative ">
                        <PopoverButton className="group inline-flex items-center py-2 hover:text-emerald-600 focus:outline-none">
                          <span className=" text-sm font-medium">
                            {showingTranslateValue(navbar?.categories)}
                          </span>

                          <ChevronDownIcon
                            className="ml-1 h-3 w-3 group-hover:text-emerald-600"
                            aria-hidden="true"
                          />
                        </PopoverButton>

                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-200"
                          enterFrom="opacity-0 translate-y-1"
                          enterTo="opacity-100 translate-y-0"
                          leave="transition ease-in duration-150"
                          leaveFrom="opacity-100 translate-y-0"
                          leaveTo="opacity-0 translate-y-1"
                        >
                          <PopoverPanel className="absolute z-10 -ml-1 mt-1 transform w-screen max-w-xs c-h-65vh bg-white">
                            <div className="rounded-md shadow-lg  overflow-y-scroll flex-grow scrollbar-hide w-full h-full">
                              <Category
                                categories={categories}
                                categoryError={categoryError}
                              />
                            </div>
                          </PopoverPanel>
                        </Transition>
                      </Popover>
                    )}

                    {navbar?.about_menu_status && (
                      <Link
                        href="/about-us"
                        onClick={() => setIsLoading(!isLoading)}
                        className=" mx-4 py-2 text-sm font-medium hover:text-emerald-600"
                      >
                        {showingTranslateValue(navbar?.about_us)}
                      </Link>
                    )}

                    {navbar?.contact_menu_status && (
                      <Link
                        onClick={() => setIsLoading(!isLoading)}
                        href="/contact-us"
                        className="mx-4 py-2 text-sm font-medium hover:text-emerald-600"
                      >
                        {showingTranslateValue(navbar?.contact_us)}
                      </Link>
                    )}

                    <Popover className="relative">
                      <PopoverButton className="group inline-flex items-center py-2 text-sm font-medium hover:text-emerald-600 focus:outline-none">
                        <span>{showingTranslateValue(navbar?.pages)}</span>
                        <ChevronDownIcon
                          className="ml-1 h-3 w-3 group-hover:text-emerald-600"
                          aria-hidden="true"
                        />
                      </PopoverButton>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0 translate-y-1"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in duration-150"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-1"
                      >
                        <PopoverPanel className="absolute z-10 -ml-1 mt-1 transform w-screen max-w-xs bg-white">
                          <div className="rounded-lg shadow-lg overflow-y-scroll flex-grow scrollbar-hide w-full h-full">
                            <div className="relative grid gap-2 px-6 py-6">
                              {navbar?.offers_menu_status && (
                                <span className="p-2 items-center rounded-md hover:bg-gray-50 w-full hover:text-emerald-600">
                                  <div className="w-full flex">
                                    <Gift className="my-auto h-5 w-5 text-gray-700" />
                                    <Link
                                      href="/offers"
                                      onClick={() => setIsLoading(!isLoading)}
                                      className="relative inline-flex items-center  ml-2 py-0 rounded text-sm font-medium  hover:text-emerald-600"
                                    >
                                      {showingTranslateValue(navbar?.offers)}
                                    </Link>
                                  </div>
                                </span>
                              )}
                              <span className="p-2 items-center rounded-md hover:bg-gray-50 w-full hover:text-emerald-600">
                                <div className="w-full flex">
                                  <ShoppingBag className="my-auto h-5 w-5 text-gray-700" />
                                  <Link
                                    href="/checkout"
                                    onClick={() => setIsLoading(!isLoading)}
                                    className="relative inline-flex items-center  ml-2 py-0 rounded text-sm font-medium  hover:text-emerald-600"
                                  >
                                    {showingTranslateValue(navbar?.checkout)}
                                  </Link>
                                </div>
                              </span>

                              {navbar?.faq_status && (
                                <span className="p-2  items-center rounded-md hover:bg-gray-50 w-full hover:text-emerald-600">
                                  <div className="w-full flex">
                                    <HelpCircle className="my-auto h-5 w-5 text-gray-700" />
                                    <Link
                                      href="/faq"
                                      onClick={() => setIsLoading(!isLoading)}
                                      className="relative inline-flex items-center  ml-2 py-0 rounded text-sm font-medium  hover:text-emerald-600"
                                    >
                                      {showingTranslateValue(navbar?.faq)}
                                    </Link>
                                  </div>
                                </span>
                              )}

                              {navbar?.about_menu_status && (
                                <span className="p-2   items-center rounded-md hover:bg-gray-50 w-full hover:text-emerald-600">
                                  <div className="w-full flex">
                                    <User className="my-auto h-5 w-5 text-gray-700" />
                                    <Link
                                      href="/about-us"
                                      onClick={() => setIsLoading(!isLoading)}
                                      className="relative inline-flex items-center  ml-2 py-0 rounded text-sm font-medium  hover:text-emerald-600"
                                    >
                                      {showingTranslateValue(navbar?.about_us)}
                                    </Link>
                                  </div>
                                </span>
                              )}

                              {navbar?.contact_menu_status && (
                                <span className="p-2   items-center rounded-md hover:bg-gray-50 w-full hover:text-emerald-600">
                                  <div className="w-full flex">
                                    <PhoneIncoming className="my-auto h-5 w-5 text-gray-700" />
                                    <Link
                                      href="/contact-us"
                                      onClick={() => setIsLoading(!isLoading)}
                                      className="relative inline-flex items-center  ml-2 py-0 rounded text-sm font-medium  hover:text-emerald-600"
                                    >
                                      {showingTranslateValue(
                                        navbar?.contact_us
                                      )}
                                    </Link>
                                  </div>
                                </span>
                              )}

                              {navbar?.privacy_policy_status && (
                                <span className="p-2   items-center rounded-md hover:bg-gray-50 w-full hover:text-emerald-600">
                                  <div className="w-full flex">
                                    <FolderLock className="my-auto h-5 w-5 text-gray-700" />
                                    <Link
                                      href="/privacy-policy"
                                      onClick={() => setIsLoading(!isLoading)}
                                      className="relative inline-flex items-center  ml-2 py-0 rounded text-sm font-medium  hover:text-emerald-600"
                                    >
                                      {showingTranslateValue(
                                        navbar?.privacy_policy
                                      )}
                                    </Link>
                                  </div>
                                </span>
                              )}

                              {navbar?.term_and_condition_status && (
                                <span className="p-2   items-center rounded-md hover:bg-gray-50 w-full hover:text-emerald-600">
                                  <div className="w-full flex">
                                    <File className="my-auto h-5 w-5 text-gray-700" />
                                    <Link
                                      href="/terms-and-conditions"
                                      onClick={() => setIsLoading(!isLoading)}
                                      className="relative inline-flex items-center  ml-2 py-0 rounded text-sm font-medium  hover:text-emerald-600"
                                    >
                                      {showingTranslateValue(
                                        navbar?.term_and_condition
                                      )}
                                    </Link>
                                  </div>
                                </span>
                              )}

                              <span className="p-2 items-center rounded-md hover:bg-gray-50 w-full hover:text-emerald-600">
                                <div className="w-full flex">
                                  <AlertCircle className="my-auto h-5 w-5 text-gray-700" />
                                  <Link
                                    href="/404"
                                    onClick={() => setIsLoading(!isLoading)}
                                    className="relative inline-flex items-center ml-2 py-0 rounded text-sm font-medium  hover:text-emerald-600"
                                  >
                                    404
                                  </Link>
                                </div>
                              </span>
                            </div>
                          </div>
                        </PopoverPanel>
                      </Transition>
                    </Popover>

                    {navbar?.offers_menu_status && (
                      <Link
                        href="/offers"
                        onClick={() => setIsLoading(!isLoading)}
                        className="relative inline-flex items-center  bg-red-100  ml-4 py-0 px-2 rounded text-sm font-medium text-red-500 hover:text-emerald-600"
                      >
                        {showingTranslateValue(navbar?.offers)}
                        <div className="absolute flex w-2 h-2 left-auto -right-1 -top-1">
                          <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </div>
                      </Link>
                    )}
                  </Popover>
                </div>
              </div>
            </Popover>
          </div>
          <div className="flex">
            <SelectLanguage data={languages} />

            {navbar?.privacy_policy_status && (
              <Link
                onClick={() => setIsLoading(!isLoading)}
                href="/privacy-policy"
                className=" mx-4 py-2 text-sm font-medium hover:text-emerald-600"
              >
                {showingTranslateValue(navbar?.privacy_policy)}
              </Link>
            )}
            {navbar?.term_and_condition_status && (
              <Link
                onClick={() => setIsLoading(!isLoading)}
                href="/terms-and-conditions"
                className=" mx-4 py-2 text-sm font-medium hover:text-emerald-600"
              >
                {showingTranslateValue(navbar?.term_and_condition)}
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default NavbarPromo;
