"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { IoChevronBackOutline, IoChevronForward } from "react-icons/io5";
import { Navigation } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/react";
import ProductCard from "./ProductCard";
import useUtilsFunction from "@hooks/useUtilsFunction";

const CategoryProductsSection = ({ categories, productsByCategory, attributes, currency }) => {
  const { showingTranslateValue } = useUtilsFunction();

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <>
      {categories.map((category, categoryIndex) => {
        const categoryProducts = productsByCategory[category._id] || [];

        const CategoryCarousel = ({ categoryId, products }) => {
          const [swiperInstance, setSwiperInstance] = useState(null);
          const [prevEl, setPrevEl] = useState(null);
          const [nextEl, setNextEl] = useState(null);

          useEffect(() => {
            if (swiperInstance && prevEl && nextEl) {
              swiperInstance.params.navigation.prevEl = prevEl;
              swiperInstance.params.navigation.nextEl = nextEl;
              swiperInstance.navigation.destroy();
              swiperInstance.navigation.init();
              swiperInstance.navigation.update();
            }
          }, [swiperInstance, prevEl, nextEl]);

          return (
            <div className="relative">
              <Swiper
                onSwiper={setSwiperInstance}
                spaceBetween={16}
                navigation={{
                  prevEl: prevEl,
                  nextEl: nextEl,
                }}
                allowTouchMove={true}
                loop={false}
                slidesPerView={2}
                breakpoints={{
                  640: {
                    slidesPerView: 2,
                  },
                  768: {
                    slidesPerView: 3,
                  },
                  1024: {
                    slidesPerView: 4,
                  },
                  1280: {
                    slidesPerView: 5,
                  },
                }}
                modules={[Navigation]}
                className="category-products-carousel"
              >
                {products?.map((product) => (
                  <SwiperSlide key={product._id}>
                    <ProductCard
                      product={product}
                      attributes={attributes}
                      currency={currency}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Navigation Buttons - Positioned on Left and Right */}
              <button
                ref={(node) => setPrevEl(node)}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors -translate-x-2 lg:-translate-x-4"
                aria-label="Previous products"
              >
                <IoChevronBackOutline className="w-5 h-5 text-primary-500" />
              </button>
              <button
                ref={(node) => setNextEl(node)}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors translate-x-2 lg:translate-x-4"
                aria-label="Next products"
              >
                <IoChevronForward className="w-5 h-5 text-primary-500" />
              </button>
            </div>
          );
        };

        return (
          <div key={category._id} className="mb-8 lg:mb-12">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {category.icon ? (
                  <Image
                    src={category.icon}
                    alt={showingTranslateValue(category?.name)}
                    width={56}
                    height={56}
                    className="w-14 h-14 lg:w-12 lg:h-12 object-contain flex-shrink-0"
                  />
                ) : (
                  <Image
                    src="/product-header.png"
                    alt="Category"
                    width={56}
                    height={56}
                    className="w-14 h-14 lg:w-12 lg:h-12 object-contain flex-shrink-0"
                  />
                )}
                <div>
                  <h2 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-1">
                    {showingTranslateValue(category?.name)}
                  </h2>
                  {category.description && (
                    <p className="text-sm text-gray-600">
                      {showingTranslateValue(category?.description)}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href={`/search?category=${category.slug || category._id}&_id=${category._id}`}
                  className="text-primary-500 hover:text-primary-600 font-medium text-sm"
                >
                  See all
                </Link>
              </div>
            </div>

            {/* Products Carousel - Only show if products exist */}
            {categoryProducts.length > 0 ? (
              <CategoryCarousel categoryId={category._id} products={categoryProducts} />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No products available in this category</p>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};

export default CategoryProductsSection;


