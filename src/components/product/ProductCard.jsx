"use client";

import { useEffect, useRef, useState, useContext } from "react";
import {
  IoAdd,
  IoRemove,
  IoExpand,
  IoBagAdd,
} from "react-icons/io5";
import { useCart } from "react-use-cart";
import { Expand } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

//internal import
import Price from "@components/common/Price";
import Stock from "@components/common/Stock";
import { notifyError } from "@utils/toast";
import Rating from "@components/common/Rating";
import useAddToCart from "@hooks/useAddToCart";
import { useSetting } from "@context/SettingContext";
import Discount from "@components/common/Discount";
import { handleLogEvent } from "src/lib/analytics";
import useUtilsFunction from "@hooks/useUtilsFunction";
import ProductModal from "@components/modal/ProductModal";
import ImageWithFallback from "@components/common/ImageWithFallBack";
import { SidebarContext } from "@context/SidebarContext";

const ProductCard = ({ product, attributes }) => {
  const modalRef = useRef(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { globalSetting } = useSetting();
  const { setCartDrawerOpen } = useContext(SidebarContext);
  const [isPromoTime, setIsPromoTime] = useState(false);

  const { items, addItem, updateItemQuantity, inCart } = useCart();
  const { handleIncreaseQuantity } = useAddToCart();
  const { showingTranslateValue } = useUtilsFunction();

  const currency = globalSetting?.default_currency || "$";

  // Check if current time is between 6pm (18:00) and 9am (09:00)
  useEffect(() => {
    const checkPromoTime = () => {
      const now = new Date();
      const hours = now.getHours();
      // 6pm (18:00) to midnight (23:59) or midnight (00:00) to 9am (08:59)
      setIsPromoTime(hours >= 18 || hours < 9);
    };
    checkPromoTime();
    const interval = setInterval(checkPromoTime, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  // console.log('attributes in product cart',attributes)

  const handleAddItem = (p) => {
    if (p.stock < 1) return notifyError("Insufficient stock!");

    if (p?.variants?.length > 0) {
      setModalOpen(!modalOpen);
      return;
    }
    const { slug, variants, categories, description, ...updatedProduct } =
      product;
    const newItem = {
      ...updatedProduct,
      title: showingTranslateValue(p?.title),
      id: p._id,
      variant: p.prices,
      price: p.prices.price,
      originalPrice: product.prices?.originalPrice,
    };
    addItem(newItem);
    setCartDrawerOpen(true); // Auto-open cart drawer
  };

  const handleModalOpen = (event, id) => {
    setModalOpen(event);
  };

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setModalOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setModalOpen]);

  // console.log("product", product);

  return (
    <>
      {modalOpen && (
        <ProductModal
          product={product}
          modalOpen={modalOpen}
          attributes={attributes}
          globalSetting={globalSetting}
          setModalOpen={setModalOpen}
        />
      )}

      <div className="group relative flex flex-col overflow-hidden rounded-lg sm:rounded-xl border bg-white border-gray-100 transition-all duration-100 ease-in-out hover:border-emerald-500">
        <div className="w-full flex justify-between">
          <Discount product={product} />
        </div>
        <div className="relative w-full min-h-32 sm:min-h-40 lg:h-40 xl:h-44">
          <Link
            href={`/product/${product?.slug}`}
            className="relative block w-full h-full overflow-hidden bg-gray-100"
          >
            <ImageWithFallback
              fill
              sizes="100%"
              alt="product"
              src={product.image?.[0]}
            />
          </Link>
          <div className="absolute lg:bottom-0 bottom-2 sm:bottom-4 lg:group-hover:bottom-4 inset-x-1 opacity-100 flex justify-center lg:opacity-0 lg:invisible group-hover:opacity-100 group-hover:visible transition-all">
            <button
              aria-label="quick view"
              onClick={() => {
                handleModalOpen(!modalOpen, product._id);
                handleLogEvent(
                  "product",
                  `opened ${showingTranslateValue(
                    product?.title
                  )} product modal`
                );
              }}
              className="relative h-auto inline-flex items-center cursor-pointer justify-center rounded-full transition-colors text-[10px] sm:text-xs py-1 sm:py-2 px-2 sm:px-4 bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-300 hover:text-emerald-500 hover:bg-gray-100 dark:hover:bg-slate-800 shadow-lg focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-emerald-600 dark:focus:ring-offset-0"
            >
              <IoExpand className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="ms-1 hidden xl:block lg:block">Quick View</span>
            </button>
          </div>

          {/* Cart quantity indicator on image */}
          {inCart(product._id) && (
            <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 z-10">
              {items.map(
                (item) =>
                  item.id === product._id && (
                    <div
                      key={item.id}
                      className="flex flex-col w-8 h-16 sm:w-10 sm:h-20 items-center p-0.5 sm:p-1 justify-between bg-emerald-500 text-white ring-1 sm:ring-2 ring-white rounded-full shadow-lg"
                    >
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          updateItemQuantity(item.id, item.quantity - 1);
                        }}
                      >
                        <span className="text-sm sm:text-lg cursor-pointer">
                          <IoRemove />
                        </span>
                      </button>
                      <p className="text-xs sm:text-sm font-semibold">
                        {item.quantity}
                      </p>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          item?.variants?.length > 0
                            ? handleAddItem(item)
                            : handleIncreaseQuantity(item);
                        }}
                      >
                        <span className="text-sm sm:text-lg cursor-pointer">
                          <IoAdd />
                        </span>
                      </button>
                    </div>
                  )
              )}
            </div>
          )}
        </div>

        {/* product info start */}
        <div className="flex flex-1 flex-col px-2 sm:px-3 pt-1.5 sm:pt-2 pb-2 sm:pb-3">
          {/* Product Title */}
          <Link
            href={`/product/${product?.slug}`}
            className="text-xs sm:text-sm font-semibold text-gray-800 line-clamp-2 hover:text-emerald-600 leading-tight sm:leading-snug mb-0.5"
          >
            {showingTranslateValue(product?.title)}
          </Link>
          
          {/* Unit info */}
          {product?.unit && (
            <span className="text-[10px] sm:text-xs text-gray-400 mb-1 sm:mb-1.5">1 {product.unit}</span>
          )}
          
          {/* Bulk Pricing Display - Only show when NOT promo time */}
          {!isPromoTime && product?.bulkPricing && (product?.bulkPricing?.bulkRate1?.quantity > 0 || product?.bulkPricing?.bulkRate2?.quantity > 0) && (
            <div className="bg-gray-50 rounded-md p-1.5 sm:p-2.5 mb-1.5 sm:mb-2 space-y-1 sm:space-y-1.5">
              {product?.bulkPricing?.bulkRate1?.quantity > 0 && product?.bulkPricing?.bulkRate1?.pricePerUnit > 0 && (
                <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                  <span className="text-[10px] sm:text-xs text-emerald-600 font-medium leading-tight flex-1 min-w-0">
                    <span className="hidden sm:inline">{currency}{product.bulkPricing.bulkRate1.pricePerUnit}/{product.unit || "unit"} for {product.bulkPricing.bulkRate1.quantity}+</span>
                    <span className="sm:hidden">{currency}{product.bulkPricing.bulkRate1.pricePerUnit}/{product.unit || "unit"}</span>
                  </span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const bulkQuantity = product.bulkPricing.bulkRate1.quantity;
                      const bulkItem = {
                        ...product,
                        title: showingTranslateValue(product?.title),
                        id: `${product._id}-bulk1`,
                        variant: product.prices,
                        price: product.bulkPricing.bulkRate1.pricePerUnit,
                        originalPrice: product.prices?.originalPrice,
                      };
                      addItem(bulkItem, bulkQuantity);
                      setCartDrawerOpen(true); // Auto-open cart drawer
                    }}
                    className="text-[10px] sm:text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors whitespace-nowrap px-1.5 py-0.5 sm:px-0 sm:py-0"
                  >
                    Add {product.bulkPricing.bulkRate1.quantity}
                  </button>
                </div>
              )}
              {product?.bulkPricing?.bulkRate2?.quantity > 0 && product?.bulkPricing?.bulkRate2?.pricePerUnit > 0 && (
                <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                  <span className="text-[10px] sm:text-xs text-emerald-600 font-medium leading-tight flex-1 min-w-0">
                    <span className="hidden sm:inline">{currency}{product.bulkPricing.bulkRate2.pricePerUnit}/{product.unit || "unit"} for {product.bulkPricing.bulkRate2.quantity}+</span>
                    <span className="sm:hidden">{currency}{product.bulkPricing.bulkRate2.pricePerUnit}/{product.unit || "unit"}</span>
                  </span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const bulkQuantity = product.bulkPricing.bulkRate2.quantity;
                      const bulkItem = {
                        ...product,
                        title: showingTranslateValue(product?.title),
                        id: `${product._id}-bulk2`,
                        variant: product.prices,
                        price: product.bulkPricing.bulkRate2.pricePerUnit,
                        originalPrice: product.prices?.originalPrice,
                      };
                      addItem(bulkItem, bulkQuantity);
                      setCartDrawerOpen(true); // Auto-open cart drawer
                    }}
                    className="text-[10px] sm:text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors whitespace-nowrap px-1.5 py-0.5 sm:px-0 sm:py-0"
                  >
                    Add {product.bulkPricing.bulkRate2.quantity}
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* Promo Bulk Pricing Display (6pm-9am) - Only show during promo time */}
          {isPromoTime && product?.promoPricing && (product?.promoPricing?.bulkRate1?.quantity > 0 || product?.promoPricing?.bulkRate2?.quantity > 0) && (
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-md p-1.5 sm:p-2.5 mb-1.5 sm:mb-2 space-y-1 sm:space-y-1.5 border border-emerald-200/50">
              {product?.promoPricing?.bulkRate1?.quantity > 0 && product?.promoPricing?.bulkRate1?.pricePerUnit > 0 && (
                <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                  <span className="text-[10px] sm:text-xs text-emerald-700 font-medium leading-tight flex-1 min-w-0">
                    <span className="hidden sm:inline">{currency}{product.promoPricing.bulkRate1.pricePerUnit}/{product.unit || "unit"} for {product.promoPricing.bulkRate1.quantity}+</span>
                    <span className="sm:hidden">{currency}{product.promoPricing.bulkRate1.pricePerUnit}/{product.unit || "unit"}</span>
                  </span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const promoQuantity = product.promoPricing.bulkRate1.quantity;
                      const promoItem = {
                        ...product,
                        title: showingTranslateValue(product?.title),
                        id: `${product._id}-promo-bulk1`,
                        variant: product.prices,
                        price: product.promoPricing.bulkRate1.pricePerUnit,
                        originalPrice: product.prices?.originalPrice,
                        isPromo: true,
                      };
                      addItem(promoItem, promoQuantity);
                      setCartDrawerOpen(true);
                    }}
                    className="text-[10px] sm:text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors whitespace-nowrap px-1.5 py-0.5 sm:px-0 sm:py-0"
                  >
                    Add {product.promoPricing.bulkRate1.quantity}
                  </button>
                </div>
              )}
              {product?.promoPricing?.bulkRate2?.quantity > 0 && product?.promoPricing?.bulkRate2?.pricePerUnit > 0 && (
                <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                  <span className="text-[10px] sm:text-xs text-emerald-700 font-medium leading-tight flex-1 min-w-0">
                    <span className="hidden sm:inline">{currency}{product.promoPricing.bulkRate2.pricePerUnit}/{product.unit || "unit"} for {product.promoPricing.bulkRate2.quantity}+</span>
                    <span className="sm:hidden">{currency}{product.promoPricing.bulkRate2.pricePerUnit}/{product.unit || "unit"}</span>
                  </span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const promoQuantity = product.promoPricing.bulkRate2.quantity;
                      const promoItem = {
                        ...product,
                        title: showingTranslateValue(product?.title),
                        id: `${product._id}-promo-bulk2`,
                        variant: product.prices,
                        price: product.promoPricing.bulkRate2.pricePerUnit,
                        originalPrice: product.prices?.originalPrice,
                        isPromo: true,
                      };
                      addItem(promoItem, promoQuantity);
                      setCartDrawerOpen(true);
                    }}
                    className="text-[10px] sm:text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors whitespace-nowrap px-1.5 py-0.5 sm:px-0 sm:py-0"
                  >
                    Add {product.promoPricing.bulkRate2.quantity}
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* Price and Add Button Row */}
          <div className="flex items-center justify-between mt-auto pt-1 sm:pt-1.5 gap-2">
            <div className="flex flex-col min-w-0 flex-1">
              {isPromoTime && product?.promoPricing?.singleUnit > 0 ? (
                <>
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <span className="text-[9px] sm:text-xs font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 px-1 sm:px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">PROMO</span>
                    <span className="text-sm sm:text-base font-bold text-emerald-600 truncate">
                      {currency}{product.promoPricing.singleUnit}
                      {product?.unit && <span className="text-[10px] sm:text-xs font-normal text-emerald-500">/{product.unit}</span>}
                    </span>
                  </div>
                </>
              ) : (
                <span className="text-sm sm:text-base font-bold text-gray-900 truncate">
                  {currency}{product?.isCombination ? product?.variants[0]?.price : product?.prices?.price}
                  {product?.unit && <span className="text-[10px] sm:text-xs font-normal text-gray-400">/{product.unit}</span>}
                </span>
              )}
            </div>
            
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Use promo price if promo time and promo pricing exists
                if (isPromoTime && product?.promoPricing?.singleUnit > 0) {
                  const promoItem = {
                    ...product,
                    title: showingTranslateValue(product?.title),
                    id: `${product._id}-promo`,
                    variant: product.prices,
                    price: product.promoPricing.singleUnit,
                    originalPrice: product.prices?.originalPrice,
                    isPromo: true,
                  };
                  addItem(promoItem, 1);
                  setCartDrawerOpen(true);
                } else {
                  handleAddItem(product);
                }
              }}
              className="flex items-center gap-0.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full font-semibold text-[10px] sm:text-xs transition-colors border border-emerald-500 text-emerald-600 hover:bg-emerald-50 flex-shrink-0"
            >
              ADD
              <span className="text-emerald-500 text-xs sm:text-sm leading-none">+</span>
            </button>
          </div>
        </div>
        {/* product info end */}
      </div>
    </>
  );
};

export default dynamic(() => Promise.resolve(ProductCard), { ssr: false });
