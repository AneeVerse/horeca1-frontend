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

const PopularProductsCarousel = ({ products, attributes, currency }) => {
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
    <div className="w-full">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Image
            src="/product-header.png"
            alt="Product header"
            width={56}
            height={56}
            className="w-14 h-14 lg:w-12 lg:h-12 object-contain flex-shrink-0"
          />
          <div>
            <h2 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-1">
              Your Menu Add-ons
            </h2>
            <p className="text-sm text-gray-600">custom food solutions</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/search"
            className="text-primary-500 hover:text-primary-600 font-medium text-sm"
            scroll={true}
            onClick={() => window.scrollTo(0, 0)}
          >
            See all
          </Link>
        </div>
      </div>

      {/* Swiper Carousel with Navigation Buttons */}
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
          className="popular-products-carousel"
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
    </div>
  );
};

export default PopularProductsCarousel;
