import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  IoChevronDownOutline,
  IoChevronForwardOutline,
  IoRemoveSharp,
} from "react-icons/io5";

import useUtilsFunction from "@hooks/useUtilsFunction";

const CategoryCard = ({ title, icon, nested, id, onClose }) => {
  const router = useRouter();
  const { showingTranslateValue } = useUtilsFunction();

  const [show, setShow] = useState(false);
  const [showSubCategory, setShowSubCategory] = useState({
    id: "",
    show: false,
  });

  // ✅ Search only when clicking on the category name
  const handleSearch = (id, categoryName) => {
    if (!id || id === "all") {
      router.push("/search");
    } else {
      const name = categoryName.toLowerCase().replace(/[^A-Z0-9]+/gi, "-");
      router.push(`/search?category=${name}&_id=${id}`);
    }
    if (onClose) {
      onClose();
    }
  };

  // ✅ Toggle expand only when clicking the arrow/icon
  const toggleExpand = () => {
    setShow(!show);
  };

  const handleSubNestedToggle = (id) => {
    setShowSubCategory({
      id: id,
      show: showSubCategory.id === id ? !showSubCategory.show : true,
    });
  };

  return (
    <>
      <div
        onClick={() => handleSearch(id, title)}
        className="flex flex-col items-center justify-start p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group w-full"
      >
        <div className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-full mb-2 group-hover:bg-white group-hover:shadow-sm transition-all overflow-hidden border border-gray-100">
          {icon ? (
            <Image
              src={icon}
              width={40}
              height={40}
              alt={title}
              className="object-contain p-1"
            />
          ) : (
            <Image
              src="https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png"
              width={40}
              height={40}
              alt="category"
              className="object-contain p-1 opacity-50"
            />
          )}
        </div>

        <div className="text-[10px] sm:text-xs font-semibold text-gray-700 text-center leading-tight line-clamp-2 max-w-full group-hover:text-primary-600 transition-colors">
          {title}
        </div>
      </div>

      {/* Nested categories */}
      {show && nested.length > 0 && (
        <ul className="pl-6 pb-3 pt-1 -mt-1">
          {nested.map((children) => (
            <li key={children._id}>
              {children.children.length > 0 ? (
                <div className="flex items-center py-1">
                  <span className="text-xs text-gray-500 pr-2">
                    <IoRemoveSharp />
                  </span>
                  <div
                    onClick={() =>
                      handleSearch(
                        children._id,
                        showingTranslateValue(children.name)
                      )
                    }
                    className="flex-1 text-sm text-gray-600 hover:text-primary-600 cursor-pointer"
                  >
                    {showingTranslateValue(children.name)}
                  </div>
                  <span
                    onClick={() => handleSubNestedToggle(children._id)}
                    className="cursor-pointer text-gray-400 hover:text-primary-600"
                  >
                    {showSubCategory.id === children._id &&
                      showSubCategory.show ? (
                      <IoChevronDownOutline />
                    ) : (
                      <IoChevronForwardOutline />
                    )}
                  </span>
                </div>
              ) : (
                <div
                  onClick={() =>
                    handleSearch(
                      children._id,
                      showingTranslateValue(children.name)
                    )
                  }
                  className="flex items-center py-1 text-sm text-gray-600 hover:text-primary-600 cursor-pointer"
                >
                  <span className="text-xs text-gray-500 pr-2">
                    <IoRemoveSharp />
                  </span>
                  {showingTranslateValue(children.name)}
                </div>
              )}

              {/* Sub children */}
              {showSubCategory.id === children._id && showSubCategory.show && (
                <ul className="pl-6 pb-3">
                  {children.children.map((subChildren) => (
                    <li
                      key={subChildren._id}
                      onClick={() =>
                        handleSearch(
                          subChildren._id,
                          showingTranslateValue(subChildren.name)
                        )
                      }
                      className="flex items-center py-1 text-sm text-gray-600 hover:text-primary-600 cursor-pointer"
                    >
                      <span className="text-xs text-gray-500 pr-2">
                        <IoRemoveSharp />
                      </span>
                      {showingTranslateValue(subChildren.name)}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default CategoryCard;

