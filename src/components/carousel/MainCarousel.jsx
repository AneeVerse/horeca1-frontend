//internal import

import useUtilsFunction from "@hooks/useUtilsFunction";
import CarouselCard from "@components/carousel/CarouselCard";
import { getStoreCustomizationSetting } from "@services/SettingServices";
import { showingTranslateValue } from "@lib/translate";

const MainCarousel = async () => {
  const { showingUrl, showingImage } = useUtilsFunction();

  const { storeCustomizationSetting } = await getStoreCustomizationSetting();
  const slider = storeCustomizationSetting?.slider;

  const sliderData = [
    {
      id: 1,

      title: showingTranslateValue(slider?.first_title),
      info: showingTranslateValue(slider?.first_description),
      buttonName: showingTranslateValue(slider?.first_button),
      url: showingUrl(slider?.first_link),
      image: showingImage(slider?.first_img) || "/slider/slider-1.jpg",
    },
    {
      id: 2,
      title: showingTranslateValue(slider?.second_title),
      info: showingTranslateValue(slider?.second_description),
      buttonName: showingTranslateValue(slider?.second_button),
      url: showingUrl(slider?.second_link),
      image: showingImage(slider?.second_img) || "/slider/slider-2.jpg",
    },
    {
      id: 3,
      title: showingTranslateValue(slider?.third_title),
      info: showingTranslateValue(slider?.third_description),
      buttonName: showingTranslateValue(slider?.third_button),
      url: showingUrl(slider?.third_link),
      image: showingImage(slider?.third_img) || "/slider/slider-3.jpg",
    },
    // New Banner 1
    {
      id: 4,
      title: "",
      info: "",
      buttonName: "Shop Now",
      url: "/",
      image: "/banner1.png",
    },
    // New Banner 2
    {
      id: 5,
      title: "",
      info: "",
      buttonName: "Shop Now",
      url: "/",
      image: "/banner2.png",
    },
    // Old Banner 4 - Commented out per user request
    // {
    //   id: 4,
    //   title: showingTranslateValue(slider?.four_title),
    //   info: showingTranslateValue(slider?.four_description),
    //   buttonName: showingTranslateValue(slider?.four_button),
    //   url: showingUrl(slider?.four_link),
    //   image: showingImage(slider?.four_img) || "/slider/slider-1.jpg",
    // },
    // Old Banner 5 - Commented out per user request
    // {
    //   id: 5,
    //   title: showingTranslateValue(slider?.five_title),
    //   info: showingTranslateValue(slider?.five_description),
    //   buttonName: showingTranslateValue(slider?.five_button),
    //   url: showingUrl(slider?.five_link),
    //   image: showingImage(slider?.five_img) || "/slider/slider-2.jpg",
    // },
  ];

  return (
    <>
      <CarouselCard
        sliderData={sliderData}
        storeCustomizationSetting={storeCustomizationSetting}
      />
    </>
  );
};

export default MainCarousel;

