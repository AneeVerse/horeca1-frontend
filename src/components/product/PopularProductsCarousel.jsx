"use client";

import Link from "next/link";
import React, { useRef } from "react";
import { IoChevronBackOutline, IoChevronForward } from "react-icons/io5";
import { Navigation } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/react";
import ProductCard from "./ProductCard";

const PopularProductsCarousel = ({ products, attributes, currency }) => {
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-1">
            Your Menu Add-ons
          </h2>
          <p className="text-sm text-gray-600">custom food solutions</p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/search"
            className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
          >
            See all
          </Link>
          <div className="flex gap-2">
            <button
              ref={prevRef}
              className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
              aria-label="Previous products"
            >
              <IoChevronBackOutline className="w-5 h-5 text-emerald-600" />
            </button>
            <button
              ref={nextRef}
              className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
              aria-label="Next products"
            >
              <IoChevronForward className="w-5 h-5 text-emerald-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Swiper Carousel */}
      <Swiper
        onInit={(swiper) => {
          swiper.params.navigation.prevEl = prevRef.current;
          swiper.params.navigation.nextEl = nextRef.current;
          swiper.navigation.init();
          swiper.navigation.update();
        }}
        spaceBetween={16}
        navigation={{
          prevEl: prevRef.current,
          nextEl: nextRef.current,
        }}
        allowTouchMove={true}
        loop={false}
        breakpoints={{
          375: {
            width: 375,
            slidesPerView: 2,
          },
          640: {
            width: 640,
            slidesPerView: 2,
          },
          768: {
            width: 768,
            slidesPerView: 3,
          },
          1024: {
            width: 1024,
            slidesPerView: 4,
          },
          1280: {
            width: 1280,
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
    </div>
  );
};

export default PopularProductsCarousel;

