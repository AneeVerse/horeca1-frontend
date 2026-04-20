"use client";

import Image from "next/image";
import Link from "next/link";
import { FacebookShareButton, TwitterShareButton } from "react-share";
import { ArrowDown, ArrowUp, ChevronRight, Minus, Plus } from "lucide-react";

//internal import

import Price from "@components/common/Price";
import Stock from "@components/common/Stock";
import Tags from "@components/common/Tags";
import Card from "@components/slug-card/Card";
import useAddToCart from "@hooks/useAddToCart";
import Discount from "@components/common/Discount";
import ProductCard from "@components/product/ProductCard";
import VariantList from "@components/variants/VariantList";
import useUtilsFunction from "@hooks/useUtilsFunction";
import ImageCarousel from "@components/carousel/ImageCarousel";
import { useSetting } from "@context/SettingContext";
import useProductAction from "@hooks/useProductAction";
import Rating from "@components/common/Rating";
import { Button } from "@components/ui/button";
import ProductReviews from "./ProductReviews";
import { FiChevronRight, FiHeadphones, FiMinus, FiPlus } from "react-icons/fi";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { Fragment, useState, useEffect, useContext } from "react";
import { useCart } from "react-use-cart";
import { SidebarContext } from "@context/SidebarContext";
import { notifyError } from "@utils/toast";

const ProductScreen = ({ product, reviews, attributes, relatedProducts }) => {
  const { globalSetting, storeCustomization } = useSetting();
  const { showingTranslateValue } = useUtilsFunction();
  const currency = globalSetting?.default_currency || "₹";
  const { item, setItem } = useAddToCart();
  const { addItem, items: cartItems } = useCart();

  // Returns how many of a given cart-id the user already has in their cart.
  // Bulk buttons create separate cart lines (e.g. id-bulk1, id-bulk2, id-promo)
  // so we look up the exact line, not the base product.
  const getExistingCartQty = (cartId) => {
    const existing = cartItems?.find((i) => i.id === cartId);
    return existing?.quantity || 0;
  };

  // Common stock guard for every "Add X" button. Returns true if the add is
  // allowed, and shows an error toast + returns false otherwise.
  const canAddBulk = (requestedQty, cartId) => {
    const availableStock = Number(product?.stock) || 0;
    const alreadyInCart = getExistingCartQty(cartId);
    // Also account for the base-product line (single add) consuming stock.
    const baseLineQty = getExistingCartQty(`${product._id}`);
    const totalRequested = alreadyInCart + baseLineQty + requestedQty;

    if (availableStock <= 0) {
      notifyError("This product is currently out of stock.");
      return false;
    }
    if (totalRequested > availableStock) {
      notifyError(
        `Only ${availableStock} in stock. You already have ${alreadyInCart + baseLineQty} in cart.`
      );
      return false;
    }
    return true;
  };
  const { setCartDrawerOpen } = useContext(SidebarContext);
  const [isPromoTime, setIsPromoTime] = useState(false);

  const { checkIsPromoTime } = require("@utils/date");

  // Check if current time is promo time (6pm-9am IST)
  useEffect(() => {
    const updatePromoTime = () => {
      setIsPromoTime(checkIsPromoTime());
    };
    updatePromoTime();
    const interval = setInterval(updatePromoTime, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);
  const {
    value,
    setValue,
    price,
    stock,
    discount,
    isReadMore,
    setIsReadMore,
    selectedImage,
    originalPrice,
    setSelectedImage,
    selectVariant,
    setSelectVariant,
    setSelectVa,
    variantTitle,
    category_name,
    // actions
    handleAddToCart,
  } = useProductAction({
    product,
    attributes,
    globalSetting,
  });

  // console.log("discount", discount);

  return (
    <>
      <div className="bg-white px-0">
        <div className="container mx-auto px-3 sm:px-10 max-w-screen-2xl">
          <div className="flex items-center py-6 lg:py-8">
            <ol className="flex items-center w-full overflow-hidden ">
              <li className="text-sm pr-1 transition duration-200 ease-in cursor-pointer hover:text-[#018549] font-semibold">
                <Link href="/">Home</Link>
              </li>
              <li className="text-sm mt-[1px]">
                {" "}
                <FiChevronRight />{" "}
              </li>
              <li className="text-sm pl-1 transition duration-200 ease-in cursor-pointer hover:text-[#018549] font-semibold ">
                <Link
                  href={`/search?category=${category_name}&_id=${product?.category?._id}`}
                >
                  <button
                    type="button"
                    onClick={() => setIsLoading(!isLoading)}
                  >
                    {category_name}
                  </button>
                </Link>
              </li>
              <li className="text-sm mt-[1px]">
                {" "}
                <FiChevronRight />{" "}
              </li>
              <li className="text-sm px-1 transition duration-200 ease-in ">
                {showingTranslateValue(product?.title)}
              </li>
            </ol>
          </div>
          {/* Product */}
          <div className="relative lg:grid lg:grid-cols-7 lg:grid-rows-1 lg:gap-x-4 lg:gap-y-8">
            {/* Product image */}
            <div className="lg:col-span-3 lg:row-end-1">
              {/* Image gallery */}
              <div className="overflow-hidden w-full mx-auto">
                {product?.image?.[0] ? (
                  <Image
                    src={selectedImage || product.image[0]}
                    alt="product"
                    width={500}
                    height={500}
                    priority
                    className="aspect-square w-full rounded-lg bg-gray-100 object-cover"
                  />
                ) : (
                  <Image
                    src="https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png"
                    width={500}
                    height={500}
                    alt="product Image"
                    className="aspect-square w-full rounded-lg bg-gray-100 object-cover"
                  />
                )}
              </div>

              {product?.image?.length > 1 && (
                <div className="flex flex-row flex-wrap mt-4">
                  <ImageCarousel
                    images={product.image}
                    handleChangeImage={setSelectedImage}
                  />
                </div>
              )}
            </div>

            {/* Product details */}
            <div className="lg:sticky top-44 mt-6 lg:mt-0 self-start z-10 mx-auto lg:col-span-4 lg:row-span-2 lg:row-end-2 lg:max-w-none">
              <div className="mb-2 md:mb-2.5 block -mt-1.5">
                <div className="relative">
                  <Stock stock={stock} />
                </div>
                <h1 className="leading-7 text-lg md:text-xl lg:text-2xl mb-1 font-semibold  text-gray-800">
                  {showingTranslateValue(product?.title)}
                </h1>
                <div className="flex gap-0.5 items-center mt-1">
                  <Rating
                    size="md"
                    showReviews={true}
                    rating={product?.average_rating}
                    totalReviews={product?.total_reviews}
                  />
                </div>
              </div>
              <div className="flex items-center mb-4">
                <div className="flex flex-col">
                  {isPromoTime && product?.promoPricing?.singleUnit > 0 ? (
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 px-2.5 py-1 rounded-full shadow-sm">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                        PROMO ACTIVE
                      </span>
                      <span className="text-2xl lg:text-3xl font-bold text-[#018549]">
                        {currency}{product.promoPricing.singleUnit}
                        {product?.unit && <span className="text-sm font-normal text-[#018549]">/{product.unit}</span>}
                      </span>
                    </div>
                  ) : (
                    <Price
                      price={price}
                      product={product}
                      currency={currency}
                      originalPrice={originalPrice}
                      showUnit={true}
                    />
                  )}
                </div>
                {!isPromoTime && (
                  <span className="ml-2 block">
                    <Discount slug product={product} discount={discount} />
                  </span>
                )}
              </div>

              {/* Bulk Pricing Display - Only show when NOT promo time */}
              {!isPromoTime && product?.bulkPricing && (product?.bulkPricing?.bulkRate1?.quantity > 0 || product?.bulkPricing?.bulkRate2?.quantity > 0) && (
                <div className="mb-6 bg-gray-50 rounded-xl p-4 space-y-3">
                  {product?.bulkPricing?.bulkRate1?.quantity > 0 && product?.bulkPricing?.bulkRate1?.pricePerUnit > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-base text-[#018549] font-medium">
                        {currency}{product.bulkPricing.bulkRate1.pricePerUnit}/{product.unit || "unit"} for {product.bulkPricing.bulkRate1.quantity} {product.unit ? `${product.unit}s` : "units"}+
                      </span>
                      <button
                        onClick={() => {
                          const bulkQuantity = product.bulkPricing.bulkRate1.quantity;
                          const bulkId = `${product._id}-bulk1`;
                          if (!canAddBulk(bulkQuantity, bulkId)) return;
                          const bulkItem = {
                            ...product,
                            title: showingTranslateValue(product?.title),
                            id: bulkId,
                            variant: product.prices,
                            price: product.bulkPricing.bulkRate1.pricePerUnit,
                            originalPrice: product.prices?.originalPrice,
                            // Explicitly preserve product details for order details
                            sku: product.sku,
                            hsn: product.hsn,
                            unit: product.unit,
                            brand: product.brand,
                          };
                          addItem(bulkItem, bulkQuantity);
                        }}
                        className="text-base font-semibold text-[#018549] hover:text-[#016d3b] transition-colors"
                      >
                        Add {product.bulkPricing.bulkRate1.quantity}
                      </button>
                    </div>
                  )}
                  {product?.bulkPricing?.bulkRate2?.quantity > 0 && product?.bulkPricing?.bulkRate2?.pricePerUnit > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-base text-[#018549] font-medium">
                        {currency}{product.bulkPricing.bulkRate2.pricePerUnit}/{product.unit || "unit"} for {product.bulkPricing.bulkRate2.quantity} {product.unit ? `${product.unit}s` : "units"}+
                      </span>
                      <button
                        onClick={() => {
                          const bulkQuantity = product.bulkPricing.bulkRate2.quantity;
                          const bulkId = `${product._id}-bulk2`;
                          if (!canAddBulk(bulkQuantity, bulkId)) return;
                          const bulkItem = {
                            ...product,
                            title: showingTranslateValue(product?.title),
                            id: bulkId,
                            variant: product.prices,
                            price: product.bulkPricing.bulkRate2.pricePerUnit,
                            originalPrice: product.prices?.originalPrice,
                            // Explicitly preserve product details for order details
                            sku: product.sku,
                            hsn: product.hsn,
                            unit: product.unit,
                            brand: product.brand,
                          };
                          addItem(bulkItem, bulkQuantity);
                          // Cart drawer should only open when user clicks cart icon in navbar
                        }}
                        className="text-base font-semibold text-[#018549] hover:text-[#016d3b] transition-colors"
                      >
                        Add {product.bulkPricing.bulkRate2.quantity}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Promo Bulk Pricing Display (6pm-9am) - Clean Modern Style */}
              {isPromoTime && product?.promoPricing && (product?.promoPricing?.bulkRate1?.quantity > 0 || product?.promoPricing?.bulkRate2?.quantity > 0) && (
                <div className="mb-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200/50 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-[#018549] rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-[#025155]">Night Special Bulk Rates</span>
                  </div>
                  <div className="space-y-2">
                    {product?.promoPricing?.bulkRate1?.quantity > 0 && product?.promoPricing?.bulkRate1?.pricePerUnit > 0 && (
                      <div className="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2">
                        <span className="text-sm text-[#016d3b] font-medium">
                          {currency}{product.promoPricing.bulkRate1.pricePerUnit}/{product.unit || "unit"} for {product.promoPricing.bulkRate1.quantity}+
                        </span>
                        <button
                          onClick={() => {
                            const promoQuantity = product.promoPricing.bulkRate1.quantity;
                            const promoId = `${product._id}-promo-bulk1`;
                            if (!canAddBulk(promoQuantity, promoId)) return;
                            const promoItem = {
                              ...product,
                              title: showingTranslateValue(product?.title),
                              id: promoId,
                              variant: product.prices,
                              price: product.promoPricing.bulkRate1.pricePerUnit,
                              originalPrice: product.prices?.originalPrice,
                              isPromo: true,
                              // Explicitly preserve product details for order details
                              sku: product.sku,
                              hsn: product.hsn,
                              unit: product.unit,
                              brand: product.brand,
                            };
                            addItem(promoItem, promoQuantity);
                            // Cart drawer should only open when user clicks cart icon in navbar
                          }}
                          className="text-sm font-semibold text-[#018549] hover:text-[#016d3b] px-3 py-1 bg-emerald-100 hover:bg-emerald-200 rounded-full transition-colors"
                        >
                          Add {product.promoPricing.bulkRate1.quantity}
                        </button>
                      </div>
                    )}
                    {product?.promoPricing?.bulkRate2?.quantity > 0 && product?.promoPricing?.bulkRate2?.pricePerUnit > 0 && (
                      <div className="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2">
                        <span className="text-sm text-[#016d3b] font-medium">
                          {currency}{product.promoPricing.bulkRate2.pricePerUnit}/{product.unit || "unit"} for {product.promoPricing.bulkRate2.quantity}+
                        </span>
                        <button
                          onClick={() => {
                            const promoQuantity = product.promoPricing.bulkRate2.quantity;
                            const promoId = `${product._id}-promo-bulk2`;
                            if (!canAddBulk(promoQuantity, promoId)) return;
                            const promoItem = {
                              ...product,
                              title: showingTranslateValue(product?.title),
                              id: promoId,
                              variant: product.prices,
                              price: product.promoPricing.bulkRate2.pricePerUnit,
                              originalPrice: product.prices?.originalPrice,
                              isPromo: true,
                              // Explicitly preserve product details for order details
                              sku: product.sku,
                              hsn: product.hsn,
                              unit: product.unit,
                              brand: product.brand,
                            };
                            addItem(promoItem, promoQuantity);
                            // Cart drawer should only open when user clicks cart icon in navbar
                          }}
                          className="text-sm font-semibold text-[#018549] hover:text-[#016d3b] px-3 py-1 bg-emerald-100 hover:bg-emerald-200 rounded-full transition-colors"
                        >
                          Add {product.promoPricing.bulkRate2.quantity}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="mb-6">
                {variantTitle?.map((a, i) => (
                  <span key={a._id} className="mb-2 block">
                    <h4 className="text-sm py-1 text-gray-800 font-medium">
                      {showingTranslateValue(a?.name)}:
                    </h4>

                    <VariantList
                      att={a._id}
                      option={a.option}
                      setValue={setValue}
                      varTitle={variantTitle}
                      setSelectVa={setSelectVa}
                      variants={product.variants}
                      selectVariant={selectVariant}
                      setSelectVariant={setSelectVariant}
                    />
                  </span>
                ))}
              </div>

              <div>
                <div className="flex items-center mt-4">
                  <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 w-full">
                    {/* Quantity Selector */}
                    <div className="group flex items-center justify-between rounded-md overflow-hidden flex-shrink-0 border h-11 border-gray-300">
                      <Button
                        variant="outline"
                        onClick={() => setItem(item - 1)}
                        disabled={item === 1}
                        className="border-0 border-e-1 border-gray-300 rounded-none flex items-center justify-center h-full flex-shrink-0 transition ease-in-out duration-300 focus:outline-none w-10 md:w-12 text-heading hover:text-gray-500"
                      >
                        <span className="text-dark sm:text-2xl">
                          <Minus />
                        </span>
                      </Button>

                      <p className="font-semibold flex items-center justify-center transition-colors duration-250 ease-in-out cursor-default flex-shrink-0 text-base text-heading w-10 md:w-20 xl:w-22">
                        {item}
                      </p>

                      <Button
                        variant="outline"
                        onClick={() => setItem(item + 1)}
                        disabled={selectVariant?.quantity <= item}
                        className="border-0 border-s-1 border-gray-300 rounded-none flex items-center justify-center h-full flex-shrink-0 transition ease-in-out duration-300 focus:outline-none w-10 md:w-12 text-heading hover:text-gray-500"
                      >
                        <span className="text-dark sm:text-2xl">
                          <Plus />
                        </span>
                      </Button>
                    </div>

                    {/* Add to Cart Button */}
                    <Button
                      onClick={() => {
                        // Use promo pricing if promo time and promo pricing exists
                        if (isPromoTime && product?.promoPricing?.singleUnit > 0 && product?.variants?.length === 0) {
                          const promoId = `${product._id}-promo`;
                          if (!canAddBulk(item, promoId)) return;
                          const promoItem = {
                            ...product,
                            title: showingTranslateValue(product?.title),
                            id: promoId,
                            variant: product.prices,
                            price: product.promoPricing.singleUnit,
                            originalPrice: product.prices?.originalPrice,
                            isPromo: true,
                            // Explicitly preserve product details for order details
                            sku: product.sku,
                            hsn: product.hsn,
                            unit: product.unit,
                            brand: product.brand,
                          };
                          addItem(promoItem, item);
                          // Cart drawer should only open when user clicks cart icon in navbar
                        } else {
                          handleAddToCart(product);
                        }
                      }}
                      className="text-sm leading-4 inline-flex items-center cursor-pointer transition ease-in-out duration-300 font-semibold  text-center justify-center border-0 border-transparent rounded-md focus-visible:outline-none focus:outline-none px-4 md:px-6 lg:px-8 py-4 md:py-3.5 lg:py-4 w-full h-11"
                      variant="create"
                    >
                      {isPromoTime && product?.promoPricing?.singleUnit > 0 ? "Add Promo Price to Cart" : "Add to Cart"}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center mt-4">
                  <div className="flex items-center justify-between space-s-3 sm:space-s-4 w-full">
                    <div>
                      <span className=" font-semibold py-1 text-sm d-block">
                        <span className="text-gray-700">Category:</span>{" "}
                        <Link
                          href={`/search?category=${category_name}&_id=${product?.category?._id}`}
                          className="cursor-pointer"
                        >
                          <button
                            type="button"
                            className="text-gray-600 font-medium ml-2 hover:text-teal-600"
                            onClick={() => setIsLoading(!isLoading)}
                          >
                            {category_name}
                          </button>
                        </Link>
                      </span>

                      <Tags product={product} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-500 mt-3">
                  <FiHeadphones className="mr-1 text-md" />
                  Call Us for Order
                  <a
                    href={`tel:${globalSetting?.phone || "+099949343"}`}
                    className="font-bold text-[#018549] ml-1"
                  >
                    {globalSetting?.phone || "+099949343"}
                  </a>
                </div>

                <div className="mt-6 border-t border-gray-200 pt-6">
                  <h3 className="text-sm font-medium text-gray-900">
                    Highlights
                  </h3>
                  <div className="mt-4">
                    {/* shipping description card */}
                    <Card storeCustomization={storeCustomization} />
                  </div>
                </div>

                <div className="mt-6 border-t border-gray-200 pt-6">
                  <h3 className="text-sm font-medium text-gray-900">
                    Share your social network
                  </h3>
                  <p className="text-sm text-gray-500">
                    For get lots of traffic from social network share this
                    product
                  </p>
                  <ul role="list" className="mt-4 flex items-center space-x-6">
                    <li>
                      <FacebookShareButton
                        url={`https://Horeca1-store-nine.vercel.app/product/${product?.slug}`}
                      >
                        <a
                          href="#"
                          className="flex size-6 items-center justify-center text-gray-400 hover:text-gray-500"
                        >
                          <span className="sr-only">Share on Facebook</span>
                          <svg
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                            className="size-5"
                          >
                            <path
                              d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z"
                              clipRule="evenodd"
                              fillRule="evenodd"
                            />
                          </svg>
                        </a>
                      </FacebookShareButton>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="flex size-6 items-center justify-center text-gray-400 hover:text-gray-500"
                      >
                        <span className="sr-only">Share on Instagram</span>
                        <svg
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                          className="size-6"
                        >
                          <path
                            d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                            clipRule="evenodd"
                            fillRule="evenodd"
                          />
                        </svg>
                      </a>
                    </li>
                    <li>
                      <TwitterShareButton
                        url={`https://Horeca1-store-nine.vercel.app/product/${product?.slug}`}
                      >
                        <a
                          href="#"
                          className="flex size-6 items-center justify-center text-gray-400 hover:text-gray-500"
                        >
                          <span className="sr-only">Share on X</span>
                          <svg
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                            className="size-5"
                          >
                            <path d="M11.4678 8.77491L17.2961 2H15.915L10.8543 7.88256L6.81232 2H2.15039L8.26263 10.8955L2.15039 18H3.53159L8.87581 11.7878L13.1444 18H17.8063L11.4675 8.77491H11.4678ZM9.57608 10.9738L8.95678 10.0881L4.02925 3.03974H6.15068L10.1273 8.72795L10.7466 9.61374L15.9156 17.0075H13.7942L9.57608 10.9742V10.9738Z" />
                          </svg>
                        </a>
                      </TwitterShareButton>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="mx-auto w-full lg:col-span-3 lg:my-0 my-8 lg:max-w-none">
              <TabGroup>
                <div className="border-b border-gray-200">
                  <TabList className="-mb-px flex space-x-8">
                    <Tab className="cursor-pointer border-b-2 border-transparent pb-3 text-sm font-medium whitespace-nowrap text-gray-700 hover:border-gray-300 focus:outline-0 hover:text-gray-800 data-selected:border-emerald-600 data-selected:text-[#018549]">
                      Customer Reviews
                    </Tab>

                    <Tab className="cursor-pointer border-b-2 border-transparent pb-3 text-sm font-medium whitespace-nowrap text-gray-700 hover:border-gray-300 focus:outline-0 hover:text-gray-800 data-selected:border-emerald-600 data-selected:text-[#018549]">
                      Description
                    </Tab>
                  </TabList>
                </div>
                <TabPanels as={Fragment}>
                  <TabPanel className="-mb-10">
                    <h3 className="sr-only">Customer Reviews</h3>
                    <ProductReviews reviews={reviews} />
                  </TabPanel>
                  <TabPanel className="pt-8">
                    <h3 className="sr-only">Product Description</h3>
                    <p className="text-sm leading-6 text-gray-500 md:leading-6 mb-3">
                      {isReadMore
                        ? showingTranslateValue(product?.description)?.slice(
                          0,
                          150
                        )
                        : showingTranslateValue(product?.description)}
                    </p>
                    <div className="text-sm text-gray-500 [&_h4]:mt-5 [&_h4]:font-medium [&_h4]:text-gray-900 [&_li]:pl-2 [&_li::marker]:text-gray-300 [&_p]:my-2 [&_p]:text-sm/6 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_ul]:text-sm/6 [&>:first-child]:mt-0" />
                  </TabPanel>
                </TabPanels>
              </TabGroup>
            </div>
          </div>
          {/* related products */}
          {relatedProducts?.length >= 2 && (
            <div className="pt-10 lg:pt-20 lg:pb-10">
              <h3 className="text-xl font-semibold tracking-tight text-pretty sm:text-3xl mb-6">
                Related Products
              </h3>
              <div className="flex">
                <div className="w-full">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-6 gap-1.5 min-[300px]:gap-2 md:gap-3 lg:gap-3">
                    {relatedProducts?.slice(1, 13).map((product, i) => (
                      <ProductCard
                        key={product._id}
                        product={product}
                        attributes={attributes}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductScreen;

