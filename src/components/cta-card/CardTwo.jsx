import React from "react";
import Image from "next/image";
import Link from "next/link";

//internal import
import CMSkeletonTwo from "@components/preloader/CMSkeleton";
import { getStoreCustomizationSetting } from "@services/SettingServices";
import { showingTranslateValue } from "@lib/translate";

const CardTwo = async ({}) => {
  const { storeCustomizationSetting, error } =
    await getStoreCustomizationSetting();
  const home = storeCustomizationSetting?.home;
return (
    <div className="w-full bg-white shadow-sm lg:px-10 lg:py-5 p-6 rounded-lg">
      <div className="flex justify-between items-center">
        <div className="lg:w-3/5">
          <span className="text-base lg:text-lg">
            <CMSkeletonTwo
              count={1}
              height={20}
              error={error}
              loading={false}
              data={home?.quick_delivery_subtitle}
            />
          </span>
          <h2 className=" text-lg lg:text-2xl font-bold mb-1">
            <CMSkeletonTwo
              count={1}
              height={30}
              error={error}
              loading={false}
              data={home?.quick_delivery_title}
            />
          </h2>
          <p className="text-sm font-sans leading-6">
            <CMSkeletonTwo
              count={4}
              height={20}
              error={error}
              loading={false}
              data={home?.quick_delivery_description}
            />
          </p>
          <Link
            href={`${home?.quick_delivery_link}`}
            className="lg:w-1/3  text-xs  font-medium inline-block mt-5 px-8 py-3 bg-[#018549] text-center text-white rounded-full hover:text-white contact-btn"
            target="_blank"
          >
            {showingTranslateValue(home?.quick_delivery_button)}
          </Link>
        </div>
        <div className="w-1/5 flex-grow hidden lg:flex md:flex md:justify-items-center lg:justify-end">
          <Image
            width={373}
            height={250}
            alt="Quick Delivery to Your Home"
            className="block w-auto object-contain"
            src={home?.quick_delivery_img || "/cta/delivery-boy.png"}
          />
        </div>
      </div>
    </div>
  );
};

export default CardTwo;

