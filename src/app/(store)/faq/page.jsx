import React from "react";
import Image from "next/image";
import { cookies } from "next/headers";

//internal import
import PageHeader from "@components/header/PageHeader";
import FaqContent from "@components/faq/FaqContent";
import { getStoreCustomizationSetting } from "@services/SettingServices";

export const metadata = {
  title: "FAQ | Kachabazar",
  description:
    "Get in touch with us! Find our contact information and fill out our contact form.",
  keywords: ["contact", "email", "phone", "location"],
  // You can also add more advanced metadata here
  openGraph: {
    title: "FAQ | Horeca1",
    description:
      "Get in touch with us! Find our contact information and fill out our contact form.",
    url: "https://kachabazar-store-nine.vercel.app/faq",
    images: [
      {
        url: "https://kachabazar-store-nine.vercel.app/og-image.jpg",
        width: 800,
        height: 600,
        alt: "FAQ Page",
      },
    ],
  },
};

const Faq = async () => {
  const { storeCustomizationSetting, error } =
    await getStoreCustomizationSetting();

  const cookiesStore = await cookies();
  const lang = cookiesStore.get("_lang")?.value;
  const showingTranslateValue = (data) => {
    const updatedData =
      data !== undefined && Object?.keys(data).includes(lang)
        ? data[lang]
        : data?.en;
    return updatedData;
  };

  const faqs = [
    {
      question: showingTranslateValue(storeCustomizationSetting?.faq?.faq_one),
      answer: showingTranslateValue(
        storeCustomizationSetting?.faq?.description_one
      ),
    },
    {
      question: showingTranslateValue(storeCustomizationSetting?.faq?.faq_two),
      answer: showingTranslateValue(
        storeCustomizationSetting?.faq?.description_two
      ),
    },
    {
      question: showingTranslateValue(
        storeCustomizationSetting?.faq?.faq_three
      ),
      answer: showingTranslateValue(
        storeCustomizationSetting?.faq?.description_three
      ),
    },
    {
      question: showingTranslateValue(storeCustomizationSetting?.faq?.faq_four),
      answer: showingTranslateValue(
        storeCustomizationSetting?.faq?.description_four
      ),
    },
    {
      question: showingTranslateValue(storeCustomizationSetting?.faq?.faq_five),
      answer: showingTranslateValue(
        storeCustomizationSetting?.faq?.description_five
      ),
    },
    {
      question: showingTranslateValue(storeCustomizationSetting?.faq?.faq_six),
      answer: showingTranslateValue(
        storeCustomizationSetting?.faq?.description_six
      ),
    },
    {
      question: showingTranslateValue(
        storeCustomizationSetting?.faq?.faq_seven
      ),
      answer: showingTranslateValue(
        storeCustomizationSetting?.faq?.description_seven
      ),
    },
    {
      question: showingTranslateValue(
        storeCustomizationSetting?.faq?.faq_eight
      ),
      answer: showingTranslateValue(
        storeCustomizationSetting?.faq?.description_eight
      ),
    },
  ];

  return (
    <div className="">
      <PageHeader
        headerBg={storeCustomizationSetting?.faq?.header_bg}
        title={storeCustomizationSetting?.faq?.title}
      />

      <div className="bg-white dark:bg-zinc-900">
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-10 py-10 lg:py-12">
          <div className="grid gap-4 lg:mb-8 items-center md:grid-cols-2 xl:grid-cols-2">
            <div className="pr-16">
              <Image
                width={720}
                height={550}
                src={storeCustomizationSetting?.faq?.left_img || "/faq.svg"}
                alt="logo"
              />
            </div>
            <dl className="mt-10 space-y-6 divide-y divide-gray-900/10 divide-gray-300">
              {faqs.map((faq, index) => (
                <FaqContent key={index + 1} faq={faq} />
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Faq;
