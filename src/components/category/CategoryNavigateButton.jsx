"use client";

import { useRouter } from "next/navigation";
import { IoChevronForwardSharp } from "react-icons/io5";

//internal import

import useUtilsFunction from "@hooks/useUtilsFunction";

const CategoryNavigateButton = ({ category, className = "", showChildren = true, textOnly = false }) => {
  const router = useRouter();
  const { showingTranslateValue } = useUtilsFunction();

  const handleCategoryClick = (id, categoryName) => {
    const category_name = categoryName
      .toLowerCase()
      .replace(/[^A-Z0-9]+/gi, "-");
    const url = `/search?category=${category_name}&_id=${id}`;
    router.push(url);
  };

  // Get text style based on mode
  const getTextStyle = () => {
    if (textOnly) {
      // Blinkit style - plain text below image, no box
      return "text-xs sm:text-sm text-gray-800 font-medium leading-tight line-clamp-2 cursor-pointer hover:text-emerald-600";
    }
    if (showChildren) {
      return "text-sm text-gray-700 dark:text-gray-200 hover:text-emerald-600 font-semibold leading-tight line-clamp-1 cursor-pointer";
    }
    return "text-xs text-gray-800 font-medium leading-tight line-clamp-2 cursor-pointer bg-white rounded-md px-2 py-1.5 w-full shadow-sm border border-gray-100";
  };

  return (
    <>
      <div className={className || "pl-4"}>
        <h3
          onClick={() =>
            handleCategoryClick(
              category._id,
              showingTranslateValue(category?.name)
            )
          }
          className={getTextStyle()}
        >
          {showingTranslateValue(category?.name)}
        </h3>
        {showChildren && !textOnly && (
          <ul className="pt-1 mt-1">
            {category?.children?.slice(0, 3).map((child) => (
              <li key={child._id} className="pt-1">
                <a
                  onClick={() =>
                    handleCategoryClick(
                      child._id,
                      showingTranslateValue(child?.name)
                    )
                  }
                  className="flex hover:translate-x-2 transition-transform duration-300 items-center text-xs text-gray-500 cursor-pointer"
                >
                  <span className="text-xs text-gray-400 ">
                    <IoChevronForwardSharp />
                  </span>
                  {showingTranslateValue(child?.name)}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default CategoryNavigateButton;
