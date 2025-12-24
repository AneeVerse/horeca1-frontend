"use client";

import React, { useEffect, useState, useCallback } from "react";
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
import SwitchToggle from "@components/form/SwitchToggle";
import { lookupPincode } from "@utils/pincode";

const CheckoutForm = ({ shippingAddress, hasShippingAddress }) => {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState("");
  
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

  // Handle PIN code lookup with react-hook-form integration
  const handlePincodeChange = useCallback(async (e) => {
    const pincode = e.target.value.replace(/\D/g, "");
    if (pincode.length === 6) {
      setPincodeLoading(true);
      setPincodeError("");
      
      const result = await lookupPincode(pincode);
      
      if (result.success) {
        // Use district as city for better accuracy
        const cityValue = result.district || result.city;
        const stateValue = result.state;
        
        // Update form fields using react-hook-form's setValue
        setValue("city", cityValue, { shouldValidate: true, shouldDirty: true });
        setValue("country", stateValue, { shouldValidate: true, shouldDirty: true });
        
        setPincodeError("");
      } else {
        setPincodeError(result.error || "Invalid PIN code");
      }
      setPincodeLoading(false);
    }
  }, [setValue]);

  if (!mounted) return null; // or a skeleton loader

  return (
    <div className="py-10 lg:py-12 px-0 2xl:max-w-screen-2xl w-full xl:max-w-screen-xl flex flex-col md:flex-row lg:flex-row">
      {/* checkout form */}
      <div className="md:w-full lg:w-3/5 flex h-full flex-col order-2 sm:order-1 lg:order-1">
        <div className="mt-5 md:mt-0 md:col-span-2">
          {/* <Elements stripe={stripePromise}> */}
          <form onSubmit={handleSubmit(submitHandler)}>
            {hasShippingAddress && (
              <div className="flex justify-end my-2">
                <SwitchToggle
                  id="shipping-address"
                  title="Use Default Shipping Address"
                  processOption={useExistingAddress}
                  handleProcess={handleDefaultShippingAddress}
                />
              </div>
            )}
            <div className="form-group">
              <h2 className="font-semibold text-base text-gray-700 pb-3">
                01. Contact Details
              </h2>
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <InputArea
                    register={register}
                    label="First Name"
                    name="firstName"
                    type="text"
                    placeholder="Enter first name"
                  />
                  <Error errorMessage={errors.firstName} />
                </div>

                <div className="col-span-6 sm:col-span-3">
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
              <h2 className="font-semibold text-base text-gray-700 pb-3">
                02. Delivery Address
              </h2>

              <div className="grid grid-cols-6 gap-6 mb-8">
                {/* PIN Code - First for auto-fill */}
                <div className="col-span-6 sm:col-span-2">
                  <Label label="PIN Code" />
                  <div className="relative">
                    <Input
                      {...register("zipCode", { required: "PIN Code is required" })}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="Enter PIN"
                      onChange={handlePincodeChange}
                      className="py-2 px-4"
                    />
                    {pincodeLoading && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <svg className="animate-spin h-4 w-4 text-emerald-500" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {pincodeError && <p className="text-red-500 text-xs mt-1">{pincodeError}</p>}
                  <Error errorMessage={errors.zipCode} />
                </div>

                {/* City - Auto-filled from PIN */}
                <div className="col-span-6 sm:col-span-2">
                  <InputArea
                    register={register}
                    label="City / District"
                    name="city"
                    type="text"
                    placeholder="Auto-filled from PIN"
                  />
                  <Error errorMessage={errors.city} />
                </div>

                {/* State - Auto-filled from PIN */}
                <div className="col-span-6 sm:col-span-2">
                  <InputArea
                    register={register}
                    label="State"
                    name="country"
                    type="text"
                    placeholder="Auto-filled from PIN"
                  />
                  <Error errorMessage={errors.country} />
                </div>

                {/* Full Address */}
                <div className="col-span-6">
                  <InputArea
                    register={register}
                    label="Complete Address"
                    name="address"
                    type="text"
                    placeholder="House/Flat No., Building, Street, Landmark"
                  />
                  <Error errorMessage={errors.address} />
                </div>
              </div>

              {/* Hidden defaults: no delivery selection, always Razorpay */}
              <input type="hidden" value="Standard Delivery" {...register("shippingOption")} />
              <input type="hidden" value="RazorPay" {...register("paymentMethod")} />
            </div>

            <div className="grid grid-cols-6 gap-4 lg:gap-6 mt-10">
              <div className="col-span-6 sm:col-span-3">
                <Button className="w-full h-10 rounded-sm" variant="bulkAction">
                  <Link
                    href="/"
                    rel="preload"
                    className="flex justify-center text-center"
                  >
                    <span className="text-xl mr-2">
                      <IoReturnUpBackOutline />
                    </span>
                    {showingTranslateValue(checkout?.continue_button)}
                  </Link>
                </Button>
              </div>
              <div className="col-span-6 sm:col-span-3">
                <Button
                  type="submit"
                  variant="create"
                  disabled={isEmpty || isCheckoutSubmit}
                  isLoading={isCheckoutSubmit}
                  className="w-full h-10 rounded-sm"
                >
                  {isCheckoutSubmit ? (
                    "Processing"
                  ) : (
                    <span className="flex justify-center text-center">
                      {showingTranslateValue(checkout?.confirm_button)}
                      <span className="text-xl ml-2">
                        {" "}
                        <IoArrowForward />
                      </span>
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </form>
          {/* </Elements> */}
        </div>
      </div>

      {/* cart section */}
      <div className="md:w-full lg:w-2/5 lg:ml-10 xl:ml-14 md:ml-6 flex flex-col h-full md:sticky lg:sticky top-44 md:order-2 lg:order-2">
        <div className="border p-5 lg:px-8 lg:py-8 rounded-lg bg-white order-1 sm:order-2">
          <h2 className="font-semibold  text-lg pb-4">
            {showingTranslateValue(checkout?.order_summary)}
          </h2>

          <div className="overflow-y-scroll flex-grow scrollbar-hide w-full max-h-64 bg-gray-50 block">
            {items.map((item) => (
              <CartItem key={item.id} item={item} currency={currency} />
            ))}

            {isEmpty && (
              <div className="text-center py-10">
                <span className="flex justify-center my-auto text-gray-500 font-semibold text-4xl">
                  <IoBagHandle />
                </span>
                <h2 className="font-medium  text-sm pt-2 text-gray-600">
                  No Item Added Yet!
                </h2>
              </div>
            )}
          </div>

          <div className="flex items-center mt-4 py-4 lg:py-4 text-sm w-full font-semibold text-heading last:border-b-0 last:text-base last:pb-0">
            <form className="w-full">
              {couponInfo.couponCode ? (
                <span className="bg-emerald-50 px-4 py-3 leading-tight w-full rounded-md flex justify-between">
                  {" "}
                  <p className="text-emerald-600">Coupon Applied </p>{" "}
                  <span className="text-red-500 text-right">
                    {couponInfo.couponCode}
                  </span>
                </span>
              ) : (
                <div className="flex flex-row items-start justify-end">
                  <Input
                    ref={couponRef}
                    type="text"
                    placeholder="Coupon Code"
                    className="px-4 py-2 h-10 mr-1 border border-gray-300 rounded-md focus:outline-none"
                    // className="form-input py-2 px-3 md:px-4 w-full appearance-none transition ease-in-out border text-input text-sm rounded-md h-12 duration-200 bg-white border-gray-200 focus:ring-0 focus:outline-none focus:border-emerald-500 placeholder-gray-500 placeholder-opacity-75"
                  />
                  <Button
                    onClick={handleCouponCode}
                    className="h-10 rounded-sm"
                    variant="create"
                    // className="md:text-sm leading-4 inline-flex items-center cursor-pointer transition ease-in-out duration-300 font-semibold text-center justify-center border border-gray-200 rounded-md placeholder-white focus-visible:outline-none focus:outline-none px-5 md:px-6 lg:px-8 py-3 md:py-3.5 lg:py-3 mt-3 sm:mt-0 sm:ml-3 md:mt-0 md:ml-3 lg:mt-0 lg:ml-3 hover:text-white hover:bg-emerald-500 h-12 text-sm lg:text-base w-full sm:w-auto"
                  >
                    {showingTranslateValue(checkout?.apply_button)}
                  </Button>
                </div>
              )}
            </form>
          </div>
          <div className="flex items-center py-2 text-sm w-full font-semibold text-gray-500 last:border-b-0 last:text-base last:pb-0">
            {showingTranslateValue(checkout?.sub_total)}
            <span className="ml-auto flex-shrink-0 text-gray-800 font-bold">
              {currency}
              {cartTotal?.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center py-2 text-sm w-full font-semibold text-gray-500 last:border-b-0 last:text-base last:pb-0">
            {showingTranslateValue(checkout?.shipping_cost)}
            <span className="ml-auto flex-shrink-0 text-gray-800 font-bold">
              {currency}
              {shippingCost?.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center py-2 text-sm w-full font-semibold text-gray-500 last:border-b-0 last:text-base last:pb-0">
            {showingTranslateValue(checkout?.discount)}
            <span className="ml-auto flex-shrink-0 font-bold text-orange-400">
              {currency}
              {discountAmount.toFixed(2)}
            </span>
          </div>
          <div className="border-t mt-4">
            <div className="flex items-center font-bold  justify-between pt-5 text-sm uppercase">
              {showingTranslateValue(checkout?.total_cost)}
              <span className=" font-extrabold text-lg">
                {currency}
                {parseFloat(total).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;
