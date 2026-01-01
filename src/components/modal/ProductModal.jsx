"use client";

import { useEffect, useRef, useState, useContext } from "react";
import {
    IoAdd,
    IoRemove,
    IoExpand,
    IoBagAdd,
} from "react-icons/fi";
import { useCart } from "react-use-cart";
import dynamic from "next/dynamic";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";

//internal import
import Price from "@components/common/Price";
import Tags from "@components/common/Tags";
import useAddToCart from "@hooks/useAddToCart";
import Discount from "@components/common/Discount";
import VariantList from "@components/variants/VariantList";
import useUtilsFunction from "@hooks/useUtilsFunction";
import Stock from "@components/common/Stock";
import useProductAction from "@hooks/useProductAction";
import MainModal from "./MainModal";
import Image from "next/image";
import Link from "next/link";
import { notifyError, notifySuccess } from "@utils/toast";
import { FiMinus, FiPlus } from "react-icons/fi";

const ProductModal = ({
    product,
    modalOpen,
    attributes,
    setModalOpen,
    globalSetting,
}) => {
    const { showingTranslateValue, getNumber, getNumberTwo } = useUtilsFunction();
    const currency = globalSetting?.default_currency || "₹";
    const { item, setItem, handleAddToCart } = useAddToCart();
    const { items, updateItemQuantity, addItem, removeItem } = useCart();
    const router = useRouter();
    const pathname = usePathname();
    const [isPromoTime, setIsPromoTime] = useState(false);
    const [quantityInput, setQuantityInput] = useState(item.toString());

    // Sync quantityInput with item when item changes externally (e.g., from buttons)
    useEffect(() => {
        setQuantityInput(item.toString());
    }, [item]);

    useEffect(() => {
        const checkPromoTime = () => {
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const isPromo = hours >= 18 || hours < 9;
            setIsPromoTime(isPromo);
        };
        checkPromoTime();
        const interval = setInterval(checkPromoTime, 60000);
        return () => clearInterval(interval);
    }, []);

    const {
        price,
        stock,
        discount,
        selectedImage,
        originalPrice,
        variantTitle,
        category_name,
        setValue,
        setSelectVa,
        selectVariant,
        setSelectVariant,
    } = useProductAction({
        product,
        attributes,
        globalSetting,
        onCloseModal: () => setModalOpen(false),
        withRouter: true,
    });

    // Calculate savings for a specific bulk pricing tier based on current quantity
    const calculateSavingsForTier = (tierQuantity, bulkPricePerUnit, currentQuantity) => {
        if (!product || tierQuantity < 1 || !bulkPricePerUnit || currentQuantity < tierQuantity) {
            return null;
        }
        
        // Get single unit base price (use current displayed price for comparison, not originalPrice)
        const singleUnitPrice = price || product?.prices?.price || originalPrice || product?.prices?.originalPrice || 0;
        
        // Calculate savings: (single price - bulk price) × current quantity
        if (bulkPricePerUnit < singleUnitPrice) {
            const savingsPerUnit = singleUnitPrice - bulkPricePerUnit;
            const totalSavings = savingsPerUnit * currentQuantity;
            
            if (totalSavings > 0) {
                return {
                    amount: getNumberTwo(totalSavings),
                    quantity: currentQuantity,
                    unit: product?.unit || "pcs"
                };
            }
        }
        
        return null;
    };

    // Determine the highest active bulk pricing tier based on current quantity
    const determineActiveBulkTier = (bulkPricing, currentQuantity) => {
        if (!bulkPricing || !currentQuantity) return null;
        
        // Check tier 2 first (highest tier)
        if (bulkPricing.bulkRate2?.quantity > 0 && bulkPricing.bulkRate2?.pricePerUnit > 0 && currentQuantity >= bulkPricing.bulkRate2.quantity) {
            return {
                tier: 'bulkRate2',
                quantity: bulkPricing.bulkRate2.quantity,
                pricePerUnit: bulkPricing.bulkRate2.pricePerUnit
            };
        }
        
        // Check tier 1
        if (bulkPricing.bulkRate1?.quantity > 0 && bulkPricing.bulkRate1?.pricePerUnit > 0 && currentQuantity >= bulkPricing.bulkRate1.quantity) {
            return {
                tier: 'bulkRate1',
                quantity: bulkPricing.bulkRate1.quantity,
                pricePerUnit: bulkPricing.bulkRate1.pricePerUnit
            };
        }
        
        return null;
    };

    // Helper function to calculate price based on quantity and bulk/promo pricing
    const getPriceForQuantity = (productData, totalQuantity) => {
        // Check promo pricing first if promo time
        if (isPromoTime && productData?.promoPricing) {
            if (productData.promoPricing?.bulkRate2?.quantity > 0 && totalQuantity >= productData.promoPricing.bulkRate2.quantity) {
                return productData.promoPricing.bulkRate2.pricePerUnit;
            }
            if (productData.promoPricing?.bulkRate1?.quantity > 0 && totalQuantity >= productData.promoPricing.bulkRate1.quantity) {
                return productData.promoPricing.bulkRate1.pricePerUnit;
            }
            if (productData.promoPricing?.singleUnit > 0) {
                return productData.promoPricing.singleUnit;
            }
        }
        
        // Use bulkPricing
        if (productData?.bulkPricing?.bulkRate2?.quantity > 0 && totalQuantity >= productData.bulkPricing.bulkRate2.quantity) {
            return productData.bulkPricing.bulkRate2.pricePerUnit;
        }
        if (productData?.bulkPricing?.bulkRate1?.quantity > 0 && totalQuantity >= productData.bulkPricing.bulkRate1.quantity) {
            return productData.bulkPricing.bulkRate1.pricePerUnit;
        }
        // Default to current price
        return price || productData?.prices?.price || 0;
    };

    // Helper function to prepare cart item
    const prepareCartItem = (productData, quantity, calculatedPrice) => {
        const { variants, categories, description, ...updatedProduct } = productData;
        const baseProductId = productData.id || productData._id;
        
        // Handle variants - check if product has variants and if all are selected
        const hasVariants = productData?.variants?.length > 0;
        const selectedVariantName = variantTitle
            ?.map((att) =>
                att?.variants?.find((v) => v._id === selectVariant[att._id])
            )
            .map((el) => showingTranslateValue(el?.name));
        
        // Determine product ID - with variant suffix if variants exist
        let productId;
        let productTitle;
        
        if (hasVariants) {
            // Check if all variants are selected
            const allVariantsSelected = variantTitle?.length > 0 && 
                variantTitle.every((att) => selectVariant[att._id]);
            
            if (!allVariantsSelected) {
                // Variants not fully selected - return null to prevent adding
                return null;
            }
            
            // Build variant ID suffix
            const variantSuffix = variantTitle?.map((att) => selectVariant[att._id]).join("-");
            productId = baseProductId + "-" + variantSuffix;
            productTitle = showingTranslateValue(productData?.title) + "-" + selectedVariantName?.join("-");
        } else {
            productId = baseProductId;
            productTitle = showingTranslateValue(productData?.title);
        }
        
        return {
            ...updatedProduct,
            id: productId,
            title: productTitle,
            price: calculatedPrice,
            originalPrice: originalPrice || productData?.prices?.originalPrice || productData?.prices?.price,
            bulkPricing: productData.bulkPricing,
            promoPricing: productData.promoPricing,
            sku: productData.sku,
            hsn: productData.hsn,
            unit: productData.unit,
            brand: productData.brand,
            taxPercent: productData.taxPercent || 0,
            taxableRate: productData.taxableRate || 0,
            image: selectedImage || productData.image?.[0],
            variant: hasVariants ? selectVariant : {},
        };
    };

    // Add or update cart when quantity changes
    useEffect(() => {
        if (!modalOpen || (!product?._id && !product?.id) || item < 1) return;
        
        // Check authentication before adding/updating cart
        const userInfoCookie = Cookies.get("userInfo");
        if (!userInfoCookie) {
            // Redirect to login page with current page as redirectUrl
            router.push(`/auth/otp-login?redirectUrl=${encodeURIComponent(pathname)}`);
            return;
        }
        
        // Check if product has variants and if all are selected
        const hasVariants = product?.variants?.length > 0;
        if (hasVariants) {
            const allVariantsSelected = variantTitle?.length > 0 && 
                variantTitle.every((att) => selectVariant[att._id]);
            if (!allVariantsSelected) {
                // Don't add to cart if variants not fully selected
                return;
            }
        }
        
        // Prepare cart item to get the correct product ID (with variant suffix if applicable)
        const calculatedPrice = getPriceForQuantity(product, item);
        const preparedItem = prepareCartItem(product, item, calculatedPrice);
        
        if (!preparedItem) {
            // Variants not selected or other issue
            return;
        }
        
        const productId = preparedItem.id;
        const cartItem = items.find((cartItem) => cartItem.id === productId);
        
        // Validate stock
        const availableStock = product?.variants?.length > 0 
            ? (selectVariant?.quantity || product?.variant?.quantity || product?.stock || 0)
            : (stock || product?.stock || product?.quantity || 0);
        
        if (item > availableStock) {
            notifyError("Insufficient stock!");
            setItem(Math.max(1, availableStock));
            return;
        }
        
        if (cartItem) {
            // Product is in cart - update quantity/price
            if (item === cartItem.quantity) return; // No change needed
            
            const newPrice = getPriceForQuantity(product, item);
            const priceChanged = Math.abs(cartItem.price - newPrice) > 0.01;
            
            if (priceChanged) {
                // Price changed - remove and re-add with new price and quantity
                removeItem(cartItem.id);
                requestAnimationFrame(() => {
                    const newCartItem = prepareCartItem(product, item, newPrice);
                    if (newCartItem) {
                        addItem(newCartItem, item);
                    }
                });
            } else {
                // Price stays the same, just update quantity
                updateItemQuantity(cartItem.id, item);
            }
        } else {
            // Product is NOT in cart - add to cart (only show notification on initial add)
            if (preparedItem) {
                addItem(preparedItem, item);
                // Only show success notification when adding for the first time, not on updates
            }
        }
    }, [item, modalOpen, product, items, isPromoTime, price, originalPrice, showingTranslateValue, removeItem, addItem, updateItemQuantity, stock, selectVariant, selectedImage, router, pathname, variantTitle]);

    return (
        <MainModal
            modalOpen={modalOpen}
            bottomCloseBtn={false}
            handleCloseModal={() => setModalOpen(false)}
        >
            <div className="inline-block overflow-y-auto h-full align-middle transition-all transform">
                <div data-modal-content className="lg:flex flex-col lg:flex-row md:flex-row w-full max-w-4xl overflow-hidden mx-auto">
                    {/* Left Side: Product Image */}
                    <div className="w-full lg:w-[40%] flex-shrink-0">
                        <div data-product-image-container className="flex-shrink-0 flex items-center justify-center h-36 sm:h-56 md:h-64 lg:h-[400px] bg-gray-50">
                            {product.image?.[0] ? (
                                <Image
                                    src={selectedImage || product.image[0]}
                                    width={420}
                                    height={420}
                                    alt="product"
                                    className="object-contain w-full h-full"
                                />
                            ) : (
                                <Image
                                    src="https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png"
                                    width={420}
                                    height={420}
                                    alt="product Image"
                                    className="object-contain w-full h-full"
                                />
                            )}
                        </div>
                    </div>

                    {/* Right Side: Product Details */}
                    <div className="w-full lg:w-[60%] pt-6 lg:pt-0 lg:pl-7 xl:pl-10">
                        {/* Header Content: Category, Stock, Title */}
                        <div className="flex flex-col gap-1 mb-1.5">
                            <div className="flex items-baseline gap-2 flex-wrap">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Category:</span>
                                <Link
                                    href={`/search?category=${category_name}&_id=${product?.category?._id}`}
                                    className="text-[10px] font-bold uppercase tracking-wider text-primary-600 hover:text-primary-700"
                                >
                                    {category_name}
                                </Link>
                                <Stock In stock={stock} />
                            </div>
                        </div>

                        <h2 className="text-heading text-lg md:text-xl lg:text-xl font-medium mb-2">
                            {showingTranslateValue(product?.title)}
                        </h2>

                        {/* Price and Discount */}
                        <div className="flex items-center justify-between my-4">
                            <div className="flex items-center">
                                <Price
                                    price={price}
                                    product={product}
                                    currency={currency}
                                    originalPrice={originalPrice}
                                />
                                <span className="ml-2">
                                    <Discount slug product={product} discount={discount} />
                                </span>
                            </div>
                            {/* Quantity Selector */}
                            <div className="group flex items-center rounded-md overflow-hidden flex-shrink-0 border border-gray-300">
                                <button
                                    onClick={() => setItem(item - 1)}
                                    disabled={item === 1}
                                    className="flex items-center cursor-pointer justify-center py-2 px-3 h-full flex-shrink-0 transition ease-in-out duration-300 focus:outline-none w-8 md:w-10 text-heading border-e border-gray-300 hover:text-gray-500"
                                >
                                    <FiMinus className="text-dark text-lg" />
                                </button>
                                <input
                                    type="number"
                                    min="1"
                                    max={product.quantity || 9999}
                                    value={quantityInput}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setQuantityInput(value); // Update local state immediately for responsive typing
                                        
                                        const numValue = parseInt(value, 10);
                                        if (value === '' || isNaN(numValue)) {
                                            // Allow empty or invalid input while typing
                                            return;
                                        }
                                        if (numValue >= 1) {
                                            const maxQuantity = product.quantity || 9999;
                                            setItem(Math.min(numValue, maxQuantity));
                                        } else if (numValue < 1) {
                                            setItem(1);
                                        }
                                    }}
                                    onBlur={(e) => {
                                        const value = e.target.value;
                                        const numValue = parseInt(value, 10);
                                        if (value === '' || isNaN(numValue) || numValue < 1) {
                                            setItem(1);
                                            setQuantityInput('1');
                                        } else {
                                            const maxQuantity = product.quantity || 9999;
                                            const finalValue = Math.min(numValue, maxQuantity);
                                            setItem(finalValue);
                                            setQuantityInput(finalValue.toString());
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        // Allow backspace, delete, arrow keys, etc.
                                        if (e.key === 'Enter') {
                                            e.target.blur();
                                        }
                                    }}
                                    className="font-semibold text-sm px-3 min-w-[2.5rem] text-center border-0 outline-none focus:outline-none focus:ring-0 bg-transparent [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                />
                                <button
                                    onClick={() => setItem(item + 1)}
                                    disabled={product.quantity <= item}
                                    className="flex items-center cursor-pointer justify-center py-2 px-3 h-full flex-shrink-0 transition ease-in-out duration-300 focus:outline-none w-8 md:w-10 text-heading border-s border-gray-300 hover:text-gray-500"
                                >
                                    <FiPlus className="text-dark text-lg" />
                                </button>
                            </div>
                        </div>

                        {/* Bulk Pricing Display - Hide during promo time */}
                        {(() => {
                            const shouldShowBulk = !isPromoTime && product?.bulkPricing && (product?.bulkPricing?.bulkRate1?.quantity > 0 || product?.bulkPricing?.bulkRate2?.quantity > 0);
                            if (!shouldShowBulk) return null;
                            
                            // Check tier activation status
                            const isTier1Active = product?.bulkPricing?.bulkRate1?.quantity > 0 && 
                                item >= product.bulkPricing.bulkRate1.quantity && 
                                (!product.bulkPricing.bulkRate2?.quantity || item < product.bulkPricing.bulkRate2.quantity);
                            const isTier2Active = product?.bulkPricing?.bulkRate2?.quantity > 0 && 
                                item >= product.bulkPricing.bulkRate2.quantity;
                            
                            const tier1Savings = isTier1Active ? calculateSavingsForTier(product.bulkPricing.bulkRate1.quantity, product.bulkPricing.bulkRate1.pricePerUnit, item) : null;
                            const tier2Savings = isTier2Active ? calculateSavingsForTier(product.bulkPricing.bulkRate2.quantity, product.bulkPricing.bulkRate2.pricePerUnit, item) : null;
                            
                            // Scenario 2: Tier 2 active - hide entire section, show only tier 2 savings banner
                            if (isTier2Active && tier2Savings) {
                                return (
                                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                                        <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex items-center gap-2">
                                            <span className="text-sm font-semibold text-green-700">
                                                {currency}{tier2Savings.amount} saved on {tier2Savings.quantity} {tier2Savings.unit}
                                            </span>
                                            <div className="flex items-center justify-center w-5 h-5 bg-green-500 rounded-full flex-shrink-0">
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                            
                            // Scenario 1: Tier 1 active - hide tier 1 row, show tier 1 savings banner, show tier 2 with Add button
                            if (isTier1Active && tier1Savings) {
                                return (
                                    <div className="bg-gray-50 rounded-lg p-3 mb-4 space-y-2">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Bulk Pricing</h4>
                                        {/* Tier 1 Savings Banner */}
                                        <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex items-center gap-2">
                                            <span className="text-sm font-semibold text-green-700">
                                                {currency}{tier1Savings.amount} saved on {tier1Savings.quantity} {tier1Savings.unit}
                                            </span>
                                            <div className="flex items-center justify-center w-5 h-5 bg-green-500 rounded-full flex-shrink-0">
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        </div>
                                        {/* Tier 2 - Show with Add button */}
                                        {product?.bulkPricing?.bulkRate2?.quantity > 0 && product?.bulkPricing?.bulkRate2?.pricePerUnit > 0 && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-primary-600 font-medium">
                                                    Buy {product.bulkPricing.bulkRate2.quantity}+ {product.unit || "units"}
                                                </span>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-bold text-primary-700">
                                                        {currency}{product.bulkPricing.bulkRate2.pricePerUnit}/{product.unit || "unit"}
                                                    </span>
                                                    <button
                                                        onClick={() => setItem(product.bulkPricing.bulkRate2.quantity)}
                                                        className="text-xs font-semibold text-white bg-[#018549] hover:bg-[#016d3b] px-3 py-1 rounded transition-colors"
                                                    >
                                                        Add {product.bulkPricing.bulkRate2.quantity}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            }
                            
                            // Scenario 3: No tier active - show all tiers with Add buttons
                            return (
                                <div className="bg-gray-50 rounded-lg p-3 mb-4 space-y-2">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Bulk Pricing</h4>
                                    {product?.bulkPricing?.bulkRate1?.quantity > 0 && product?.bulkPricing?.bulkRate1?.pricePerUnit > 0 && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-primary-600 font-medium">
                                                Buy {product.bulkPricing.bulkRate1.quantity}+ {product.unit || "units"}
                                            </span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-bold text-primary-700">
                                                    {currency}{product.bulkPricing.bulkRate1.pricePerUnit}/{product.unit || "unit"}
                                                </span>
                                                <button
                                                    onClick={() => setItem(product.bulkPricing.bulkRate1.quantity)}
                                                    className="text-xs font-semibold text-white bg-[#018549] hover:bg-[#016d3b] px-3 py-1 rounded transition-colors"
                                                >
                                                    Add {product.bulkPricing.bulkRate1.quantity}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {product?.bulkPricing?.bulkRate2?.quantity > 0 && product?.bulkPricing?.bulkRate2?.pricePerUnit > 0 && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-primary-600 font-medium">
                                                Buy {product.bulkPricing.bulkRate2.quantity}+ {product.unit || "units"}
                                            </span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-bold text-primary-700">
                                                    {currency}{product.bulkPricing.bulkRate2.pricePerUnit}/{product.unit || "unit"}
                                                </span>
                                                <button
                                                    onClick={() => setItem(product.bulkPricing.bulkRate2.quantity)}
                                                    className="text-xs font-semibold text-white bg-[#018549] hover:bg-[#016d3b] px-3 py-1 rounded transition-colors"
                                                >
                                                    Add {product.bulkPricing.bulkRate2.quantity}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}

                        {/* Savings Banner - Show directly below bulk pricing */}

                        {/* Promo Bulk Pricing Display - Premium Unified Happy Hour Design */}
                        {product?.promoPricing && (product?.promoPricing?.singleUnit > 0 || product?.promoPricing?.bulkRate1?.quantity > 0 || product?.promoPricing?.bulkRate2?.quantity > 0) && (
                            <div className="bg-gradient-to-br from-[#025155] via-[#025155] to-[#018549] rounded-lg p-3 mb-4 space-y-2 border border-white/10 shadow-lg relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-400/10 rounded-full blur-2xl -mr-12 -mt-12"></div>

                                <h4 className="relative z-10 text-sm font-semibold text-white mb-2 flex items-center gap-2">
                                    <span className="text-[10px] font-black text-[#018549] bg-emerald-300 px-2 py-0.5 rounded shadow-[0_0_10px_rgba(110,231,183,0.3)]">PROMO</span>
                                    <span className="tracking-wide text-xs font-black">DAILY DISCOUNTS 6 Pm - 9 Am</span>
                                </h4>
                                {product?.promoPricing?.singleUnit > 0 && (
                                    <div className="relative z-10 flex items-center justify-between border-b border-white/5 pb-2">
                                        <span className="text-xs text-emerald-100 font-medium">Single Unit Price</span>
                                        <span className="text-sm font-black text-emerald-300">
                                            {currency}{product.promoPricing.singleUnit}/{product.unit || "unit"}
                                        </span>
                                    </div>
                                )}
                                {(() => {
                                    // Only check for active tier during promo time
                                    if (!isPromoTime) {
                                        // Show all promo bulk pricing tiers with Add buttons (but they'll show error on click)
                                        return (
                                            <>
                                                {product?.promoPricing?.bulkRate1?.quantity > 0 && product?.promoPricing?.bulkRate1?.pricePerUnit > 0 && (
                                                    <div className="relative z-10 flex items-center justify-between py-1 border-b border-white/5">
                                                        <span className="text-xs text-emerald-100 font-medium">Buy {product.promoPricing.bulkRate1.quantity}+ {product.unit || "units"}</span>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-sm font-black text-emerald-300">
                                                                {currency}{product.promoPricing.bulkRate1.pricePerUnit}/{product.unit || "unit"}
                                                            </span>
                                                            <button
                                                                onClick={() => {
                                                                    notifyError("Come at 6pm to get this offer!");
                                                                }}
                                                                className="text-[10px] font-black text-white bg-white/10 hover:bg-white/20 px-3 py-1 rounded transition-colors border border-white/10"
                                                            >
                                                                Add {product.promoPricing.bulkRate1.quantity}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                                {product?.promoPricing?.bulkRate2?.quantity > 0 && product?.promoPricing?.bulkRate2?.pricePerUnit > 0 && (
                                                    <div className="relative z-10 flex items-center justify-between pt-1">
                                                        <span className="text-xs text-emerald-100 font-medium">Buy {product.promoPricing.bulkRate2.quantity}+ {product.unit || "units"}</span>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-sm font-black text-emerald-300">
                                                                {currency}{product.promoPricing.bulkRate2.pricePerUnit}/{product.unit || "unit"}
                                                            </span>
                                                            <button
                                                                onClick={() => {
                                                                    notifyError("Come at 6pm to get this offer!");
                                                                }}
                                                                className="text-[10px] font-black text-white bg-white/10 hover:bg-white/20 px-3 py-1 rounded transition-colors border border-white/10"
                                                            >
                                                                Add {product.promoPricing.bulkRate2.quantity}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        );
                                    }
                                    
                                    // During promo time, check tier activation status
                                    const isPromoTier1Active = product?.promoPricing?.bulkRate1?.quantity > 0 && 
                                        item >= product.promoPricing.bulkRate1.quantity && 
                                        (!product.promoPricing.bulkRate2?.quantity || item < product.promoPricing.bulkRate2.quantity);
                                    const isPromoTier2Active = product?.promoPricing?.bulkRate2?.quantity > 0 && 
                                        item >= product.promoPricing.bulkRate2.quantity;
                                    
                                    const promoTier1Savings = isPromoTier1Active ? calculateSavingsForTier(product.promoPricing.bulkRate1.quantity, product.promoPricing.bulkRate1.pricePerUnit, item) : null;
                                    const promoTier2Savings = isPromoTier2Active ? calculateSavingsForTier(product.promoPricing.bulkRate2.quantity, product.promoPricing.bulkRate2.pricePerUnit, item) : null;
                                    
                                    // Scenario 2: Tier 2 active - hide entire section, show only tier 2 savings banner
                                    if (isPromoTier2Active && promoTier2Savings) {
                                        return (
                                            <div className="relative z-10 bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex items-center gap-2">
                                                <span className="text-sm font-semibold text-green-700">
                                                    {currency}{promoTier2Savings.amount} saved on {promoTier2Savings.quantity} {promoTier2Savings.unit}
                                                </span>
                                                <div className="flex items-center justify-center w-5 h-5 bg-green-500 rounded-full flex-shrink-0">
                                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        );
                                    }
                                    
                                    // Scenario 1: Tier 1 active - hide tier 1 row, show tier 1 savings banner, show tier 2 with Add button
                                    if (isPromoTier1Active && promoTier1Savings) {
                                        return (
                                            <>
                                                {/* Tier 1 Savings Banner */}
                                                <div className="relative z-10 bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex items-center gap-2">
                                                    <span className="text-sm font-semibold text-green-700">
                                                        {currency}{promoTier1Savings.amount} saved on {promoTier1Savings.quantity} {promoTier1Savings.unit}
                                                    </span>
                                                    <div className="flex items-center justify-center w-5 h-5 bg-green-500 rounded-full flex-shrink-0">
                                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                {/* Tier 2 - Show with Add button */}
                                                {product?.promoPricing?.bulkRate2?.quantity > 0 && product?.promoPricing?.bulkRate2?.pricePerUnit > 0 && (
                                                    <div className="relative z-10 flex items-center justify-between pt-1">
                                                        <span className="text-xs text-emerald-100 font-medium">Buy {product.promoPricing.bulkRate2.quantity}+ {product.unit || "units"}</span>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-sm font-black text-emerald-300">
                                                                {currency}{product.promoPricing.bulkRate2.pricePerUnit}/{product.unit || "unit"}
                                                            </span>
                                                            <button
                                                                onClick={() => {
                                                                    setItem(product.promoPricing.bulkRate2.quantity);
                                                                }}
                                                                className="text-[10px] font-black text-white bg-white/10 hover:bg-white/20 px-3 py-1 rounded transition-colors border border-white/10"
                                                            >
                                                                Add {product.promoPricing.bulkRate2.quantity}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        );
                                    }
                                    
                                    // Scenario 3: No tier active - show all promo bulk pricing tiers with Add buttons
                                    return (
                                        <>
                                            {product?.promoPricing?.bulkRate1?.quantity > 0 && product?.promoPricing?.bulkRate1?.pricePerUnit > 0 && (
                                                <div className="relative z-10 flex items-center justify-between py-1 border-b border-white/5">
                                                    <span className="text-xs text-emerald-100 font-medium">Buy {product.promoPricing.bulkRate1.quantity}+ {product.unit || "units"}</span>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm font-black text-emerald-300">
                                                            {currency}{product.promoPricing.bulkRate1.pricePerUnit}/{product.unit || "unit"}
                                                        </span>
                                                        <button
                                                            onClick={() => {
                                                                setItem(product.promoPricing.bulkRate1.quantity);
                                                            }}
                                                            className="text-[10px] font-black text-white bg-white/10 hover:bg-white/20 px-3 py-1 rounded transition-colors border border-white/10"
                                                        >
                                                            Add {product.promoPricing.bulkRate1.quantity}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            {product?.promoPricing?.bulkRate2?.quantity > 0 && product?.promoPricing?.bulkRate2?.pricePerUnit > 0 && (
                                                <div className="relative z-10 flex items-center justify-between pt-1">
                                                    <span className="text-xs text-emerald-100 font-medium">Buy {product.promoPricing.bulkRate2.quantity}+ {product.unit || "units"}</span>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm font-black text-emerald-300">
                                                            {currency}{product.promoPricing.bulkRate2.pricePerUnit}/{product.unit || "unit"}
                                                        </span>
                                                        <button
                                                            onClick={() => {
                                                                setItem(product.promoPricing.bulkRate2.quantity);
                                                            }}
                                                            className="text-[10px] font-black text-white bg-white/10 hover:bg-white/20 px-3 py-1 rounded transition-colors border border-white/10"
                                                        >
                                                            Add {product.promoPricing.bulkRate2.quantity}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        )}

                        {/* Variants */}
                        <div className="mb-6">
                            {variantTitle?.map((a) => (
                                <span key={a._id} className="mb-2 block">
                                    <h4 className="text-sm py-1 text-gray-800 font-medium">
                                        {showingTranslateValue(a?.name)}:
                                    </h4>
                                    <VariantList
                                        att={a._id}
                                        option={a.option}
                                        setValue={setValue}
                                        varTitle={variantTitle}
                                        variants={product?.variants}
                                        setSelectVa={setSelectVa}
                                        selectVariant={selectVariant}
                                        setSelectVariant={setSelectVariant}
                                    />
                                </span>
                            ))}
                        </div>

                        {/* Tags */}
                        <div className="flex items-center mt-6">
                            <Tags product={product} />
                        </div>
                    </div>
                </div>
            </div>
        </MainModal>
    );
};

export default dynamic(() => Promise.resolve(ProductModal), { ssr: false });
