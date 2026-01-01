"use client";

import React, { useMemo } from "react";
import { IoAlertCircleOutline, IoReturnUpBackOutline } from "react-icons/io5";
import Link from "next/link";
import dynamic from "next/dynamic";
import Image from "next/image";
import { getUserSession } from "@lib/auth-client";

//internal import

import CartItem from "@components/cart/CartItem";
import useCheckoutSubmit from "@hooks/useCheckoutSubmit";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { useSetting } from "@context/SettingContext";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";

const CheckoutCartScreen = () => {
  const userInfo = getUserSession();
  const { storeCustomization } = useSetting();
  const { showingTranslateValue } = useUtilsFunction();

  const {
    total,
    isEmpty,
    items,
    cartTotal,
    couponInfo,
    couponRef,
    handleCouponCode,
    discountAmount,
    isCouponAvailable,
    shippingCost,
  } = useCheckoutSubmit({});
  const { currency } = useUtilsFunction();

  const checkout = storeCustomization?.checkout;

  // Calculate pricing breakdown
  const pricingBreakdown = useMemo(() => {
    // Calculate original total (if items had originalPrice)
    let originalTotal = 0;
    let currentTotal = 0;
    let totalTax = 0;

    items.forEach(item => {
      const itemOriginalPrice = item.originalPrice || item.prices?.originalPrice || item.price;
      const itemCurrentPrice = item.price;
      const quantity = item.quantity || 1;
      const taxPercent = item.taxPercent || 0;

      originalTotal += itemOriginalPrice * quantity;
      currentTotal += itemCurrentPrice * quantity;

      // Calculate tax for this item (taxPercent is the GST percentage)
      if (taxPercent > 0) {
        const taxableAmount = item.taxableRate || itemCurrentPrice;
        const itemTax = (taxableAmount * quantity * taxPercent) / 100;
        totalTax += itemTax;
      }
    });

    // Product discount is the difference between original and current prices
    const productDiscount = originalTotal > currentTotal ? originalTotal - currentTotal : 0;

    // Add coupon discount
    const totalDiscount = productDiscount + discountAmount;

    // Shipping settings - free if over a threshold (let's say ₹500)
    const deliveryThreshold = 500;
    const standardDeliveryCharge = 30;
    const isFreeDelivery = cartTotal >= deliveryThreshold;
    const actualDeliveryCharge = isFreeDelivery ? 0 : standardDeliveryCharge;

    return {
      itemTotal: originalTotal > 0 ? originalTotal : cartTotal,
      productDiscount: totalDiscount,
      gstCess: totalTax,
      deliveryCharge: actualDeliveryCharge,
      standardDeliveryCharge,
      isFreeDelivery,
      deliveryThreshold,
      total: cartTotal - discountAmount + actualDeliveryCharge,
      savings: totalDiscount + (isFreeDelivery ? standardDeliveryCharge : 0),
    };
  }, [items, cartTotal, discountAmount]);

  const handleCheckout = () => {
    if (items?.length <= 0) {
      closeCartDrawer();
    } else {
      if (!userInfo) {
        // Redirect to login page with returnUrl query parameter
        router.push(`/auth/login?redirectUrl=checkout`);
        closeCartDrawer();
      } else {
        router.push("/checkout");
        closeCartDrawer();
      }
    }
  };

  return (
    <div className="mx-auto max-w-screen-2xl px-3 sm:px-10 pt-16 pb-16">
      <div className="flex flex-col lg:flex-row">
        <div className="w-full lg:w-[60%] xl:w-[55%] divide-y divide-slate-200 dark:divide-slate-700 ">
          <h2 className="font-bold text-xl pb-3">Shopping Cart</h2>
          <div className="w-full block mt-3">
            {items.map((item) => (
              <CartItem key={item.id} item={item} currency={currency} />
            ))}

            {isEmpty && (
              <div className="mt-10 flex flex-col h-full justify-center">
                <div className="flex flex-col items-center">
                  <Image
                    className="size-40 flex-none rounded-md object-cover"
                    src="/no-result.svg"
                    alt="no-result"
                    width={400}
                    height={380}
                  />
                  <h3 className=" font-semibold text-gray-700 text-lg pt-5">
                    Your cart is empty
                  </h3>
                  <p className="px-12 text-center text-sm text-gray-500 pt-2">
                    No items added in your cart. Please add product to your cart
                    list.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-700 my-10 lg:my-0 lg:mx-10 xl:mx-16 2xl:mx-20 flex-shrink-0"></div>
        <div className="flex-1">
          <div className="sticky top-44 border bg-white rounded-lg border-gray-100 overflow-hidden shadow-sm">
            <div className="p-6">
              {/* Coupon Section */}
              <form className="w-full mb-6">
                {couponInfo.couponCode ? (
                  <span className="bg-[#e6f5ef] px-4 py-3 leading-tight w-full rounded-lg flex justify-between items-center border border-[#018549]/30">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-[#018549]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-[#016d3b] font-medium">Coupon Applied</p>
                    </div>
                    <span className="text-[#025155] font-bold">
                      {couponInfo.couponCode}
                    </span>
                  </span>
                ) : (
                  <div className="flex flex-row items-start justify-end w-full gap-2">
                    <Input
                      ref={couponRef}
                      type="text"
                      placeholder="Coupon Code"
                      className="px-4 py-2 h-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#018549] focus:border-[#018549]"
                    />
                    <Button
                      onClick={handleCouponCode}
                      className="h-10 rounded-lg px-6"
                      variant="create"
                    >
                      {showingTranslateValue(checkout?.apply_button) || "Apply"}
                    </Button>
                  </div>
                )}
              </form>

              {/* Total Savings Box - Inspired by image */}
              <div className="mb-6 bg-[#eff6ff] rounded-xl overflow-hidden shadow-sm border border-blue-100 relative">
                {/* Wavy Top Border Effect */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-repeat-x" style={{ backgroundImage: 'radial-gradient(circle at 5px -2px, transparent 6px, #eff6ff 0px)', backgroundSize: '10px 10px' }}></div>

                <div className="p-4 pt-5">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-blue-700 font-bold text-sm">Your total savings</span>
                    <span className="text-blue-700 font-bold text-base">{currency}{pricingBreakdown.savings.toFixed(0)}</span>
                  </div>

                  {!pricingBreakdown.isFreeDelivery && (
                    <p className="text-[11px] text-blue-500 font-medium leading-normal">
                      Shop for {currency}{(pricingBreakdown.deliveryThreshold - cartTotal).toFixed(0)} more to <span className="text-blue-700 font-bold italic underline decoration-blue-300">save {currency}{pricingBreakdown.standardDeliveryCharge}</span> on delivery charge
                    </p>
                  )}

                  {pricingBreakdown.isFreeDelivery && (
                    <p className="text-[11px] text-[#018549] font-bold flex items-center gap-1 mt-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Free delivery applied!
                    </p>
                  )}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3">
                {/* Item Total */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Item total</span>
                  <span className="text-gray-900 font-semibold">
                    {currency}{pricingBreakdown.itemTotal.toFixed(2)}
                  </span>
                </div>

                {/* Product Discount */}
                {pricingBreakdown.productDiscount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Product discount</span>
                    <span className="text-[#018549] font-semibold">
                      - {currency}{pricingBreakdown.productDiscount.toFixed(2)}
                    </span>
                  </div>
                )}

                {/* GST + Cess */}
                {pricingBreakdown.gstCess > 0 && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-700 font-medium">GST + Cess</span>
                      <button className="text-gray-400 hover:text-gray-600" title="Tax included in product price">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    </div>
                    <span className="text-gray-900 font-semibold">
                      {currency}{pricingBreakdown.gstCess.toFixed(2)}
                    </span>
                  </div>
                )}

                {/* Delivery Charge */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Delivery charge</span>
                  <div className="flex items-center gap-2">
                    {pricingBreakdown.isFreeDelivery ? (
                      <>
                        <span className="text-gray-400 line-through text-sm">
                          {currency}{pricingBreakdown.standardDeliveryCharge}
                        </span>
                        <span className="text-[#018549] font-bold flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                          </svg>
                          FREE
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-900 font-semibold">
                        {currency}{pricingBreakdown.deliveryCharge.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {/* End Price Breakdown */}
              </div>
            </div>

            {/* Total Section */}
            <div className="bg-gray-50 p-6 border-t border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-900 font-bold text-lg">Total</span>
                <span className="text-gray-900 font-bold text-xl">
                  {currency}{parseFloat(total).toFixed(2)}
                </span>
              </div>

              <div className="flex gap-3">
                <Link
                  href="/search"
                  className="flex-1 h-12 inline-flex items-center justify-center rounded-lg transition-colors text-sm font-medium bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                >
                  <IoReturnUpBackOutline className="mr-2 text-lg" />
                  Continue
                </Link>
                <Link
                  href="/checkout"
                  onClick={handleCheckout}
                  className="flex-1 h-12 inline-flex items-center justify-center rounded-lg transition-colors text-sm font-bold bg-[#018549] hover:bg-[#016d3b] text-white shadow-md hover:shadow-lg"
                >
                  Checkout
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(CheckoutCartScreen), {
  ssr: false,
});


