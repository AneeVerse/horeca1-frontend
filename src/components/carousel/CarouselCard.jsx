"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, Navigation } from "swiper";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const CarouselCard = ({ storeCustomizationSetting, sliderData }) => {
  return (
    <Swiper
      spaceBetween={30}
      centeredSlides={true}
      autoplay={{
        delay: 2000,
        disableOnInteraction: false,
      }}
      loop={true}
      pagination={
        (storeCustomizationSetting?.slider?.bottom_dots ||
          storeCustomizationSetting?.slider?.both_slider) && {
          clickable: true,
        }
      }
      navigation={
        (storeCustomizationSetting?.slider?.left_right_arrow ||
          storeCustomizationSetting?.slider?.both_slider) && {
          clickable: true,
        }
      }
      modules={[Autoplay, Pagination, Navigation]}
      className="mySwiper"
    >
      {sliderData?.map((item, i) => (
        <SwiperSlide
          className="h-[150px] lg:h-[280px] relative rounded-lg overflow-hidden dark:bg-zinc-900"
          key={i + 1}
        >
          <div className="text-sm text-gray-600 hover:text-primary-600 dark:bg-zinc-900 relative w-full h-[150px] lg:h-[280px]">
            {item.mobileImage ? (
              <>
                <Image
                  width={950}
                  height={280}
                  src={item.mobileImage}
                  alt={item.title || "Banner"}
                  className="object-cover w-full h-[150px] lg:hidden"
                  priority
                />
                <Image
                  width={950}
                  height={280}
                  src={item.image}
                  alt={item.title || "Banner"}
                  className="object-cover w-full h-[280px] hidden lg:block"
                  priority
                />
              </>
            ) : (
              <Image
                width={950}
                height={280}
                src={item.image}
                alt={item.title || "Banner"}
                className="object-cover w-full h-[150px] lg:h-[280px]"
                priority
              />
            )}
          </div>
          {(item.title || item.info) && (
            <div className="absolute top-0 left-0 z-10 p-r-16 flex-col flex w-full h-full place-items-start justify-center">
              <div className="pl-2 pr-8 sm:pl-6 sm:pr-10 lg:pl-10 lg:pr-16 w-10/12 lg:w-8/12 xl:w-7/12">
                {item.title && (
                  <h1 className="mb-0.5 lg:mb-2 text-xs sm:text-sm md:text-base line-clamp-1 md:line-clamp-none lg:line-clamp-none lg:text-xl xl:text-2xl font-bold text-gray-800">
                    {item.title}
                  </h1>
                )}
                {item.info && (
                  <p className="text-[10px] sm:text-xs leading-4 lg:leading-6 text-gray-600 font-sans line-clamp-1 md:line-clamp-none lg:line-clamp-none">
                    {item.info}
                  </p>
                )}
                {item.buttonName && (
                  <Link
                    href={item.url}
                    className="hidden sm:inline-block lg:inline-block text-[10px] lg:text-sm leading-4 lg:leading-6 font-medium mt-2 lg:mt-6 px-3 lg:px-6 py-1 lg:py-2 bg-[#018549] text-center rounded-md text-white hover:bg-[#016d3b]"
                  >
                    {item.buttonName}
                  </Link>
                )}
              </div>
            </div>
          )}
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default CarouselCard;

