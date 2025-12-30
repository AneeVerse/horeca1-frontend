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
import dynamic from "next/dynamic";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";

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
  const pendingAddRef = useRef(null); // Track pending add operation
  const [quantityInputs, setQuantityInputs] = useState({}); // Track input values for each item
  const router = useRouter();
  const pathname = usePathname();

  const { items, addItem, updateItemQuantity, removeItem, inCart } = useCart();
  const { handleIncreaseQuantity } = useAddToCart();
  const { showingTranslateValue } = useUtilsFunction();

  const currency = globalSetting?.default_currency || "₹";

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

  // Handle pending add operations after item removal
  useEffect(() => {
    if (pendingAddRef.current) {
      const { item, quantity } = pendingAddRef.current;
      // Check if the item was actually removed (not in cart)
      const itemStillExists = items.find((cartItem) => cartItem.id === item.id);
      if (!itemStillExists) {
        // Item successfully removed, now add it back
        addItem(item, quantity);
        pendingAddRef.current = null; // Clear the pending operation
      }
    }
  }, [items, addItem]);

  // console.log('attributes in product cart',attributes)

  // Helper function to calculate the appropriate price based on total quantity
  const getPriceForQuantity = (p, totalQuantity) => {
    // Check promo pricing first if promo time (6pm-9am)
    if (isPromoTime && p?.promoPricing) {
      // Check promo bulk pricing tiers (highest quantity tier first)
      if (p.promoPricing?.bulkRate2?.quantity > 0 && totalQuantity >= p.promoPricing.bulkRate2.quantity) {
        return p.promoPricing.bulkRate2.pricePerUnit;
      }
      if (p.promoPricing?.bulkRate1?.quantity > 0 && totalQuantity >= p.promoPricing.bulkRate1.quantity) {
        return p.promoPricing.bulkRate1.pricePerUnit;
      }
      // Promo single unit price
      if (p.promoPricing?.singleUnit > 0) {
        return p.promoPricing.singleUnit;
      }
    }

    // Regular bulk pricing tiers (highest quantity tier first)
    if (p?.bulkPricing?.bulkRate2?.quantity > 0 && totalQuantity >= p.bulkPricing.bulkRate2.quantity) {
      return p.bulkPricing.bulkRate2.pricePerUnit;
    }
    if (p?.bulkPricing?.bulkRate1?.quantity > 0 && totalQuantity >= p.bulkPricing.bulkRate1.quantity) {
      return p.bulkPricing.bulkRate1.pricePerUnit;
    }
    // Default to regular price
    return p.prices?.price || p.prices?.originalPrice;
  };

  const handleAddItem = (p, quantity = 1, isBulkButton = false) => {
    // Check if user is authenticated before adding to cart
    const userInfoCookie = Cookies.get("userInfo");
    if (!userInfoCookie) {
      // Redirect to login page with current page as redirectUrl
      router.push(`/auth/otp-login?redirectUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    if (p.stock < 1) return notifyError("Insufficient stock!");

    if (p?.variants?.length > 0) {
      setModalOpen(!modalOpen);
      return;
    }
    const { slug, variants, categories, description, ...updatedProduct } =
      product;

    // Use base product ID (no suffixes) so same product always uses same ID
    const baseProductId = p._id;

    // Check if this product already exists in cart
    const existingItem = items.find((item) => item.id === baseProductId);

    // Calculate total quantity
    // - If bulk button clicked, ADD to existing (e.g., "Add 12" means add 12 more)
    // - If regular add (quantity = 1), ADD 1 to existing
    // - If new product, use the quantity as is
    let totalQuantity = quantity;
    if (existingItem) {
      if (isBulkButton) {
        // Bulk button: ADD to existing quantity
        totalQuantity = existingItem.quantity + quantity;
      } else {
        // Regular add: ADD 1 to existing quantity
        totalQuantity = existingItem.quantity + quantity;
      }
    }

    // Determine the correct price based on TOTAL quantity (bulk pricing is only for price calculation)
    const calculatedPrice = getPriceForQuantity(p, totalQuantity);

    const newItem = {
      ...updatedProduct,
      title: showingTranslateValue(p?.title),
      id: baseProductId, // Always use base product ID
      variant: p.prices,
      price: calculatedPrice,
      originalPrice: product.prices?.originalPrice,
      // Store bulkPricing and promoPricing data for later price recalculation
      bulkPricing: p.bulkPricing,
      promoPricing: p.promoPricing,
      // Explicitly preserve product details for order details
      sku: product.sku,
      hsn: product.hsn,
      unit: product.unit,
      brand: product.brand,
    };

    if (existingItem) {
      // Product exists - update quantity and recalculate price based on new total
      const newPrice = getPriceForQuantity(p, totalQuantity);

      // Compare prices with a tolerance to handle floating point precision issues
      const priceChanged = Math.abs(existingItem.price - newPrice) > 0.01;

      if (priceChanged) {
        // Price changed - remove and re-add with new price and quantity
        // Store the item to add in a ref, then remove
        // The useEffect will watch for the removal and add it back
        pendingAddRef.current = { item: { ...newItem, price: newPrice }, quantity: totalQuantity };
        removeItem(baseProductId);
      } else {
        // Price unchanged - just update quantity (faster path)
        updateItemQuantity(baseProductId, totalQuantity);
      }
    } else {
      // New product, add with specified quantity and calculated price
      addItem(newItem, totalQuantity);
    }
    // Cart drawer should only open when user clicks cart icon in navbar
  };

  // Handle increment with price recalculation based on new quantity
  const handleIncrementQuantity = (cartItem, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const newQuantity = cartItem.quantity + 1;
    const newPrice = getPriceForQuantity(product, newQuantity);

    // If price changed, need to remove and re-add with new price
    if (cartItem.price !== newPrice) {
      removeItem(cartItem.id);
      const { slug, variants, categories, description, ...updatedProduct } = product;
      const updatedItem = {
        ...updatedProduct,
        title: showingTranslateValue(product?.title),
        id: cartItem.id,
        variant: product.prices,
        price: newPrice,
        originalPrice: product.prices?.originalPrice,
        bulkPricing: product.bulkPricing,
        promoPricing: product.promoPricing,
        sku: product.sku,
        hsn: product.hsn,
        unit: product.unit,
        brand: product.brand,
      };
      addItem(updatedItem, newQuantity);
    } else {
      // Price stays the same, just update quantity
      updateItemQuantity(cartItem.id, newQuantity);
    }
  };

  // Handle decrement with price recalculation based on new quantity
  const handleDecrementQuantity = (cartItem, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (cartItem.quantity <= 1) {
      removeItem(cartItem.id);
      return;
    }

    const newQuantity = cartItem.quantity - 1;
    const newPrice = getPriceForQuantity(product, newQuantity);

    // If price changed, need to remove and re-add with new price
    // Use setTimeout to ensure remove completes before add
    if (cartItem.price !== newPrice) {
      removeItem(cartItem.id);
      const { slug, variants, categories, description, ...updatedProduct } = product;
      const updatedItem = {
        ...updatedProduct,
        title: showingTranslateValue(product?.title),
        id: cartItem.id,
        variant: product.prices,
        price: newPrice,
        originalPrice: product.prices?.originalPrice,
        bulkPricing: product.bulkPricing,
        promoPricing: product.promoPricing,
        sku: product.sku,
        hsn: product.hsn,
        unit: product.unit,
        brand: product.brand,
      };
      requestAnimationFrame(() => {
        addItem(updatedItem, newQuantity);
      });
    } else {
      // Price stays the same, just update quantity
      updateItemQuantity(cartItem.id, newQuantity);
    }
  };

  // Handle direct quantity input change
  const handleQuantityInputChange = (itemId, value) => {
    if (value === '') {
      setQuantityInputs(prev => ({ ...prev, [itemId]: '' }));
      return;
    }
    // Only allow numbers
    if (!/^\d+$/.test(value)) {
      return;
    }
    setQuantityInputs(prev => ({ ...prev, [itemId]: value }));
  };

  // Handle quantity input blur or Enter key
  const handleQuantityInputBlur = (cartItem) => {
    const inputValue = quantityInputs[cartItem.id] || cartItem.quantity.toString();
    const newQuantity = parseInt(inputValue, 10);

    if (isNaN(newQuantity) || newQuantity < 1) {
      // Reset to current quantity if invalid
      setQuantityInputs(prev => ({ ...prev, [cartItem.id]: cartItem.quantity.toString() }));
      return;
    }
    if (newQuantity === cartItem.quantity) {
      // No change, just reset input
      setQuantityInputs(prev => ({ ...prev, [cartItem.id]: cartItem.quantity.toString() }));
      return;
    }

    const newPrice = getPriceForQuantity(product, newQuantity);

    // If price changed, need to remove and re-add with new price
    if (cartItem.price !== newPrice) {
      removeItem(cartItem.id);
      const { slug, variants, categories, description, ...updatedProduct } = product;
      const updatedItem = {
        ...updatedProduct,
        title: showingTranslateValue(product?.title),
        id: cartItem.id,
        variant: product.prices,
        price: newPrice,
        originalPrice: product.prices?.originalPrice,
        bulkPricing: product.bulkPricing,
        promoPricing: product.promoPricing,
        sku: product.sku,
        hsn: product.hsn,
        unit: product.unit,
        brand: product.brand,
      };
      pendingAddRef.current = { item: updatedItem, quantity: newQuantity };
    } else {
      // Price stays the same, just update quantity
      updateItemQuantity(cartItem.id, newQuantity);
    }
    // Clear the input value state - it will be reset from item.quantity
    setQuantityInputs(prev => {
      const newState = { ...prev };
      delete newState[cartItem.id];
      return newState;
    });
  };

  const handleQuantityInputKeyDown = (cartItem, e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleQuantityInputBlur(cartItem);
    }
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

      <div className="group relative flex flex-col overflow-hidden rounded-lg sm:rounded-xl border bg-white border-gray-100 transition-all duration-100 ease-in-out hover:border-primary-500">
        <div className="w-full flex justify-between">
          <Discount product={product} />
        </div>
        <div className="relative w-full h-32 sm:h-40 lg:h-40 xl:h-44">
          <div
            className="relative block w-full h-full overflow-hidden bg-gray-100 cursor-pointer"
            onClick={() => {
              handleModalOpen(!modalOpen, product._id);
              handleLogEvent(
                "product",
                `opened ${showingTranslateValue(product?.title)} product modal via image click`
              );
            }}
          >
            <ImageWithFallback
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              alt="product"
              src={product.image?.[0]}
            />
          </div>
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
              className="relative h-auto inline-flex items-center cursor-pointer justify-center rounded-full transition-colors text-[10px] sm:text-xs py-1 sm:py-2 px-2 sm:px-4 bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-300 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-slate-800 shadow-lg focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-primary-600 dark:focus:ring-offset-0"
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
                      className="flex flex-col w-8 h-16 sm:w-10 sm:h-20 items-center p-0.5 sm:p-1 justify-between bg-[#018549] text-white ring-1 sm:ring-2 ring-white rounded-full shadow-lg"
                    >
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          item?.variants?.length > 0
                            ? handleAddItem(item)
                            : handleIncrementQuantity(item, e);
                        }}
                      >
                        <span className="text-sm sm:text-lg cursor-pointer">
                          <IoAdd />
                        </span>
                      </button>
                      <input
                        type="text"
                        value={quantityInputs[item.id] !== undefined ? quantityInputs[item.id] : item.quantity}
                        onChange={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleQuantityInputChange(item.id, e.target.value);
                        }}
                        onBlur={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleQuantityInputBlur(item);
                        }}
                        onKeyDown={(e) => {
                          e.stopPropagation();
                          handleQuantityInputKeyDown(item, e);
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        className="quantity-input font-semibold text-center bg-transparent border-none outline-none focus:bg-transparent rounded text-white focus:text-white"
                        style={{ color: '#ffffff' }}
                      />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDecrementQuantity(item, e);
                        }}
                      >
                        <span className="text-sm sm:text-lg cursor-pointer">
                          <IoRemove />
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
          <div className="text-xs sm:text-sm font-semibold text-gray-800 line-clamp-2 leading-tight sm:leading-snug mb-0.5">
            {showingTranslateValue(product?.title)}
          </div>

          {/* Unit info */}
          {product?.unit && (
            <span className="text-[10px] sm:text-xs text-gray-400 mb-1 sm:mb-1.5">1 {product.unit}</span>
          )}

          {/* Bulk Pricing Display - Only show when NOT promo time */}
          {!isPromoTime && product?.bulkPricing && (product?.bulkPricing?.bulkRate1?.quantity > 0 || product?.bulkPricing?.bulkRate2?.quantity > 0) && (
            <div className="bg-gray-50 rounded-md p-1.5 sm:p-2.5 mb-1.5 sm:mb-2 space-y-1 sm:space-y-1.5">
              {product?.bulkPricing?.bulkRate1?.quantity > 0 && product?.bulkPricing?.bulkRate1?.pricePerUnit > 0 && (
                <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                  <span className="text-[10px] sm:text-xs text-primary-600 font-medium leading-tight flex-1 min-w-0">
                    <span className="hidden sm:inline">{currency}{product.bulkPricing.bulkRate1.pricePerUnit}/{product.unit || "unit"} for {product.bulkPricing.bulkRate1.quantity}+</span>
                    <span className="sm:hidden">{currency}{product.bulkPricing.bulkRate1.pricePerUnit}/{product.unit || "unit"}</span>
                  </span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Bulk button: ADD the bulk quantity to cart (additive, not replacement)
                      handleAddItem(product, product.bulkPricing.bulkRate1.quantity, true);
                      // Cart drawer should only open when user clicks cart icon in navbar
                    }}
                    className="text-[10px] sm:text-xs font-semibold text-[#018549] hover:text-[#016d3b] transition-colors whitespace-nowrap px-1.5 py-0.5 sm:px-0 sm:py-0"
                  >
                    Add {product.bulkPricing.bulkRate1.quantity}
                  </button>
                </div>
              )}
              {product?.bulkPricing?.bulkRate2?.quantity > 0 && product?.bulkPricing?.bulkRate2?.pricePerUnit > 0 && (
                <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                  <span className="text-[10px] sm:text-xs text-primary-600 font-medium leading-tight flex-1 min-w-0">
                    <span className="hidden sm:inline">{currency}{product.bulkPricing.bulkRate2.pricePerUnit}/{product.unit || "unit"} for {product.bulkPricing.bulkRate2.quantity}+</span>
                    <span className="sm:hidden">{currency}{product.bulkPricing.bulkRate2.pricePerUnit}/{product.unit || "unit"}</span>
                  </span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Bulk button: ADD the bulk quantity to cart (additive, not replacement)
                      handleAddItem(product, product.bulkPricing.bulkRate2.quantity, true);
                    }}
                    className="text-[10px] sm:text-xs font-semibold text-[#018549] hover:text-[#016d3b] transition-colors whitespace-nowrap px-1.5 py-0.5 sm:px-0 sm:py-0"
                  >
                    Add {product.bulkPricing.bulkRate2.quantity}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Promo Bulk Pricing Display (6pm-9am) - Only show during promo time */}
          {isPromoTime && product?.promoPricing && (product?.promoPricing?.bulkRate1?.quantity > 0 || product?.promoPricing?.bulkRate2?.quantity > 0) && (
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-md p-1.5 sm:p-2.5 mb-1.5 sm:mb-2 space-y-1 sm:space-y-1.5 border border-primary-200/50">
              {product?.promoPricing?.bulkRate1?.quantity > 0 && product?.promoPricing?.bulkRate1?.pricePerUnit > 0 && (
                <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                  <span className="text-[10px] sm:text-xs text-primary-700 font-medium leading-tight flex-1 min-w-0">
                    <span className="hidden sm:inline">{currency}{product.promoPricing.bulkRate1.pricePerUnit}/{product.unit || "unit"} for {product.promoPricing.bulkRate1.quantity}+</span>
                    <span className="sm:hidden">{currency}{product.promoPricing.bulkRate1.pricePerUnit}/{product.unit || "unit"}</span>
                  </span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Bulk button: ADD the bulk quantity to cart (additive, not replacement)
                      handleAddItem(product, product.promoPricing.bulkRate1.quantity, true);
                      // Cart drawer should only open when user clicks cart icon in navbar
                    }}
                    className="text-[10px] sm:text-xs font-semibold text-[#018549] hover:text-[#016d3b] transition-colors whitespace-nowrap px-1.5 py-0.5 sm:px-0 sm:py-0"
                  >
                    Add {product.promoPricing.bulkRate1.quantity}
                  </button>
                </div>
              )}
              {product?.promoPricing?.bulkRate2?.quantity > 0 && product?.promoPricing?.bulkRate2?.pricePerUnit > 0 && (
                <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                  <span className="text-[10px] sm:text-xs text-primary-700 font-medium leading-tight flex-1 min-w-0">
                    <span className="hidden sm:inline">{currency}{product.promoPricing.bulkRate2.pricePerUnit}/{product.unit || "unit"} for {product.promoPricing.bulkRate2.quantity}+</span>
                    <span className="sm:hidden">{currency}{product.promoPricing.bulkRate2.pricePerUnit}/{product.unit || "unit"}</span>
                  </span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Bulk button: ADD the bulk quantity to cart (additive, not replacement)
                      handleAddItem(product, product.promoPricing.bulkRate2.quantity, true);
                    }}
                    className="text-[10px] sm:text-xs font-semibold text-[#018549] hover:text-[#016d3b] transition-colors whitespace-nowrap px-1.5 py-0.5 sm:px-0 sm:py-0"
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
                    <span className="text-[9px] sm:text-xs font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-400 px-1 sm:px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">PROMO</span>
                    <span className="text-sm sm:text-base font-bold text-primary-600 truncate">
                      {currency}{product.promoPricing.singleUnit}
                      {product?.unit && <span className="text-[10px] sm:text-xs font-normal text-primary-500">/{product.unit}</span>}
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
                // Regular add button: always adds 1 (promo pricing handled by price calculation)
                handleAddItem(product, 1, false);
              }}
              className="flex items-center gap-0.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md font-semibold text-[10px] sm:text-xs transition-colors border border-transparent bg-[#018549] text-white hover:bg-[#016d3b] flex-shrink-0"
            >
              ADD
              <span className="text-white text-xs sm:text-sm leading-none">+</span>
            </button>
          </div>
        </div>
        {/* product info end */}
      </div>
    </>
  );
};

export default dynamic(() => Promise.resolve(ProductCard), { ssr: false });

