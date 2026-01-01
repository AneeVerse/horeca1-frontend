"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  IoReturnUpBackOutline,
  IoArrowForward,
  IoBagHandle,
} from "react-icons/io5";
import useTranslation from "next-translate/useTranslation";

//internal import
import Label from "@components/form/Label";
import Error from "@components/form/Error";
import CartItem from "@components/cart/CartItem";
import InputArea from "@components/form/InputArea";
import useCheckoutSubmit from "@hooks/useCheckoutSubmit";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import AddressManager from "@components/checkout/AddressManager";

const CheckoutForm = ({ shippingAddress, hasShippingAddress }) => {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const {
    error,
    stripe,
    couponInfo,
    couponRef,
    total,
    isEmpty,
    items,
    cartTotal,
    currency,
    register,
    errors,
    showCard,
    setShowCard,
    handleSubmit,
    submitHandler,
    handleShippingCost,
    handleCouponCode,
    discountAmount,
    shippingCost,
    isCheckoutSubmit,
    useExistingAddress,
    isCouponAvailable,
    globalSetting,
    storeSetting,
    storeCustomization,
    showingTranslateValue,
    handleDefaultShippingAddress,
    setValue,
  } = useCheckoutSubmit({ shippingAddress });
  const checkout = storeCustomization?.checkout;

  // Calculate pricing breakdown
  const pricingBreakdown = useMemo(() => {
    // Calculate original total (if items had originalPrice) and tax
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

    // Shipping settings - free if over a threshold (₹500)
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
      calculatedTotal: cartTotal - discountAmount + actualDeliveryCharge,
      savings: totalDiscount + (isFreeDelivery ? standardDeliveryCharge : 0),
    };
  }, [items, cartTotal, discountAmount]);

  if (!mounted) return null; // or a skeleton loader

  return (
    <div className="py-10 lg:py-12 px-0 2xl:max-w-screen-2xl w-full xl:max-w-screen-xl flex flex-col md:flex-row lg:flex-row">
      {/* checkout form */}
      <div className="md:w-full lg:w-3/5 flex h-full flex-col order-2 sm:order-1 lg:order-1">
        <div className="mt-5 md:mt-0 md:col-span-2">
          {/* <Elements stripe={stripePromise}> */}
          <form onSubmit={handleSubmit(submitHandler)}>
            <div className="form-group">
              <h2 className="font-semibold text-base text-gray-700 pb-3">
                01. Contact Details
              </h2>
              <div className="grid grid-cols-6 gap-4 sm:gap-6">
                <div className="col-span-3">
                  <InputArea
                    register={register}
                    label="First Name"
                    name="firstName"
                    type="text"
                    placeholder="Enter first name"
                  />
                  <Error errorMessage={errors.firstName} />
                </div>

                <div className="col-span-3">
                  <InputArea
                    register={register}
                    label="Last Name"
                    name="lastName"
                    type="text"
                    placeholder="Enter last name"
                  />
                  <Error errorMessage={errors.lastName} />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <Label label="Mobile Number" />
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="text-gray-500 text-sm">+91</span>
                    </div>
                    <Input
                      {...register("contact", { required: "Mobile number is required" })}
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="10-digit mobile"
                      className="py-2 pl-12 pr-4"
                      readOnly
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Verified via OTP</p>
                  <Error errorMessage={errors.contact} />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <InputArea
                    register={register}
                    label="Email (Optional)"
                    name="email"
                    type="email"
                    placeholder="For order updates"
                  />
                  <Error errorMessage={errors.email} />
                </div>
              </div>
            </div>

            <div className="form-group mt-12">
              {/* Address Manager Component */}
              <AddressManager
                shippingAddress={shippingAddress}
                onAddressSelect={(address) => {
                  // Optionally handle address selection
                  console.log("Selected address:", address);
                }}
                register={register}
                setValue={setValue}
                errors={errors}
              />

              {/* Hidden defaults: no delivery selection, always Razorpay */}
              <input type="hidden" value="Standard Delivery" {...register("shippingOption")} />
              <input type="hidden" value="RazorPay" {...register("paymentMethod")} />
            </div>

            <div className="mt-10">
              <Button
                type="submit"
                disabled={isEmpty || isCheckoutSubmit}
                isLoading={isCheckoutSubmit}
                className="w-full h-12 rounded-lg bg-[#018549] hover:bg-[#016d3b] text-white font-bold shadow-md hover:shadow-lg"
              >
                {isCheckoutSubmit ? (
                  "Processing..."
                ) : (
                  <span className="flex items-center justify-center">
                    Checkout
                    <IoArrowForward className="ml-2 text-lg" />
                  </span>
                )}
              </Button>
            </div>
          </form>
          {/* </Elements> */}
        </div>
      </div>

      {/* cart section - Redesigned Order Summary */}
      <div className="md:w-full lg:w-2/5 lg:ml-10 xl:ml-14 md:ml-6 flex flex-col h-full md:sticky lg:sticky top-28 md:order-2 lg:order-2">
        <div className="border rounded-xl bg-white shadow-sm overflow-hidden order-1 sm:order-2">
          <div className="p-5 lg:px-6 lg:py-6">
            <h2 className="font-bold text-lg text-gray-900 pb-4">
              {showingTranslateValue(checkout?.order_summary) || "Order Summary"}
            </h2>

            {/* Cart Items */}
            <div className="overflow-y-auto flex-grow scrollbar-hide w-full max-h-48 bg-gray-50 rounded-lg block mb-4">
              {items.map((item) => (
                <CartItem key={item.id} item={item} currency={currency} />
              ))}

              {isEmpty && (
                <div className="text-center py-8">
                  <span className="flex justify-center my-auto text-gray-400 text-4xl">
                    <IoBagHandle />
                  </span>
                  <h2 className="font-medium text-sm pt-2 text-gray-500">
                    No Item Added Yet!
                  </h2>
                </div>
              )}
            </div>

            {/* Coupon Section */}
            <div className="py-3 border-t border-gray-100">
              <form className="w-full">
                {couponInfo.couponCode ? (
                  <div className="bg-[#e6f5ef] px-4 py-3 rounded-lg flex justify-between items-center border border-[#018549]/30">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-[#018549]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-[#016d3b] font-medium text-sm">Coupon Applied</span>
                    </div>
                    <span className="text-[#025155] font-bold text-sm">
                      {couponInfo.couponCode}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-row items-center gap-2">
                    <Input
                      ref={couponRef}
                      type="text"
                      placeholder="Coupon Code"
                      className="px-4 py-2 h-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#018549] focus:border-[#018549] flex-1"
                    />
                    <Button
                      onClick={handleCouponCode}
                      className="h-10 rounded-lg px-5"
                      variant="create"
                    >
                      {showingTranslateValue(checkout?.apply_button) || "Apply"}
                    </Button>
                  </div>
                )}
              </form>
            </div>

            {/* Total Savings Box - Inspired by image */}
            <div className="py-3 border-t border-gray-100">
              <div className="bg-[#eff6ff] rounded-xl overflow-hidden shadow-sm border border-blue-100 relative">
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
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3 pt-3 border-t border-gray-100">
              {/* Item Total */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 font-medium">Item total</span>
                <span className="text-gray-900 font-semibold">
                  {currency}{pricingBreakdown.itemTotal.toFixed(2)}
                </span>
              </div>

              {/* Product Discount */}
              {pricingBreakdown.productDiscount > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 font-medium">Product discount</span>
                  <span className="text-teal-600 font-semibold">
                    - {currency}{pricingBreakdown.productDiscount.toFixed(2)}
                  </span>
                </div>
              )}

              {/* GST + Cess */}
              {pricingBreakdown.gstCess > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-600 font-medium">GST + Cess</span>
                    <button className="text-gray-400 hover:text-gray-600" title="Tax calculated based on product tax rates">
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
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 font-medium">Delivery charge</span>
                <div className="flex items-center gap-2">
                  {pricingBreakdown.isFreeDelivery ? (
                    <>
                      <span className="text-gray-400 line-through text-xs">
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
            </div>
          </div>

          {/* Total Section */}
          <div className="bg-gray-50 px-5 py-4 lg:px-6 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-gray-900 font-bold text-base uppercase">
                {showingTranslateValue(checkout?.total_cost) || "TOTAL COST"}
              </span>
              <span className="text-gray-900 font-extrabold text-xl">
                {currency}{parseFloat(total).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;


