"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

//internal import
import useFilter from "@hooks/useFilter";
import ProductCard from "@components/product/ProductCard";
import { Button } from "@components/ui/button";
import useUtilsFunction from "@hooks/useUtilsFunction";

const SearchScreen = ({ products, attributes, categories, currency }) => {
  const [visibleProduct, setVisibleProduct] = useState(18);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { showingTranslateValue } = useUtilsFunction();
  useEffect(() => setMounted(true), []);

  const { setSortedField, productData } = useFilter(products);
  if (!mounted) return null; // or a skeleton loader

  const categoryList = categories?.[0]?.children || [];

  const handleCategoryClick = (categoryId, categoryName) => {
    if (categoryId === null || categoryId === "all") {
      // Clear category filter - show all products
      router.push(`/search`);
    } else {
      const category_name = categoryName.toLowerCase().replace(/[^A-Z0-9]+/gi, "-");
      router.push(`/search?category=${category_name}&_id=${categoryId}`);
    }
  };

  return (
    <div className="mx-auto max-w-screen-2xl px-3 sm:px-6 lg:px-10">
      <div className="flex py-6 sm:py-10 lg:py-12">
        <div className="flex w-full gap-3 sm:gap-4">
          {/* Categories sidebar on left - mobile and desktop */}
          <div className="w-20 sm:w-32 lg:w-40 flex-shrink-0 border-r border-gray-200">
            <div className="sticky top-20 h-[calc(100vh-6rem)] overflow-y-auto py-2 sm:py-4">
              <ul className="flex flex-col gap-2">
                {/* All tab with product-header image */}
                <li className="w-full">
                  <div
                    onClick={() => handleCategoryClick(null, "All")}
                    className="flex flex-col items-center p-2 sm:p-3 cursor-pointer hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <Image
                      src="/product-header.png"
                      alt="All Products"
                      width={32}
                      height={32}
                      className="sm:w-10 sm:h-10 lg:w-12 lg:h-12 object-contain mb-1 sm:mb-2"
                    />
                    <span className="text-[10px] sm:text-xs lg:text-sm text-gray-700 font-medium leading-tight line-clamp-2 text-center hover:text-primary-600">
                      All
                    </span>
                  </div>
                </li>
                {categoryList.map((category, i) => (
                  <li key={i + 1} className="w-full">
                    <div
                      onClick={() => handleCategoryClick(category._id, showingTranslateValue(category?.name))}
                      className="flex flex-col items-center p-2 sm:p-3 cursor-pointer hover:bg-gray-50 rounded-md transition-colors"
                    >
                      {category.icon ? (
                        <Image
                          src={category.icon}
                          alt={category.name || "category"}
                          width={32}
                          height={32}
                          className="sm:w-10 sm:h-10 lg:w-12 lg:h-12 object-contain mb-1 sm:mb-2"
                        />
                      ) : (
                        <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gray-100 rounded-full mb-1 sm:mb-2" />
                      )}
                      <span className="text-[10px] sm:text-xs lg:text-sm text-gray-700 font-medium leading-tight line-clamp-2 text-center hover:text-primary-600">
                        {showingTranslateValue(category?.name)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            {productData?.length === 0 ? (
              <div className="mx-auto p-5 my-5">
                <Image
                  className="my-4 mx-auto"
                  src="/no-result.svg"
                  alt="no-result"
                  width={400}
                  height={380}
                />
                <h2 className="text-lg md:text-xl lg:text-2xl xl:text-2xl text-center mt-2 font-medium text-gray-600">
                  Sorry, we can not find this product 😞
                </h2>
              </div>
            ) : (
              <div className="flex justify-between my-3 bg-orange-100 border border-gray-100 rounded p-3">
                <h6 className="text-sm">
                  Total <span className="font-bold">{productData?.length}</span>{" "}
                  Items Found
                </h6>
                <span className="text-sm">
                  <select
                    onChange={(e) => setSortedField(e.target.value)}
                    className="py-0 text-sm font-medium block w-full rounded border-0 bg-white pr-10 cursor-pointer focus:ring-0"
                  >
                    <option className="px-3" value="All" defaultValue hidden>
                      Sort By Price
                    </option>
                    <option className="px-3" value="Low">
                      Low to High
                    </option>
                    <option className="px-3" value="High">
                      High to Low
                    </option>
                  </select>
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-3 md:gap-4 lg:gap-4">
              {productData?.slice(0, visibleProduct).map((product, i) => (
                <ProductCard
                  key={i + 1}
                  product={product}
                  attributes={attributes}
                  currency={currency}
                />
              ))}
            </div>

            {productData?.length > visibleProduct && (
              <Button
                onClick={() => setVisibleProduct((pre) => pre + 10)}
                variant="create"
                className="w-auto mx-auto md:text-sm leading-5 flex items-center transition ease-in-out duration-300 font-medium text-center justify-center px-5 md:px-6 lg:px-8 py-2 md:py-3 lg:py-3 mt-6"
              >
                Load More
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(SearchScreen), { ssr: false });
