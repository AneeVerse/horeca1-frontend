"use client";

import { useRouter } from "next/navigation";
import { useCart } from "react-use-cart";
import { IoBagCheckOutline, IoClose, IoBagHandle } from "react-icons/io5";
import { useState, useEffect, useMemo } from "react";

//internal import
import CartItem from "@components/cart/CartItem";
import { getUserSession } from "@lib/auth-client";
import { FiShoppingCart } from "react-icons/fi";
import Image from "next/image";

const Cart = ({ setOpen, currency }) => {
  const router = useRouter();
  const { isEmpty, items, cartTotal } = useCart();

  // Use state to reactively track user session
  const [userInfo, setUserInfo] = useState(null);

  // Check user session on mount and periodically to catch login state changes
  useEffect(() => {
    const checkUserSession = () => {
      const session = getUserSession();
      setUserInfo(session);
    };

    // Check immediately
    checkUserSession();

    // Also check periodically to catch login state changes (every 1 second)
    const interval = setInterval(checkUserSession, 1000);

    return () => clearInterval(interval);
  }, []);

  // Calculate pricing breakdown
  const pricingBreakdown = useMemo(() => {
    const deliveryThreshold = 500;
    const standardDeliveryCharge = 30;
    const isFreeDelivery = cartTotal >= deliveryThreshold;
    const actualDeliveryCharge = isFreeDelivery ? 0 : standardDeliveryCharge;

    return {
      deliveryCharge: actualDeliveryCharge,
      standardDeliveryCharge,
      isFreeDelivery,
      deliveryThreshold,
      total: cartTotal + actualDeliveryCharge,
      savings: isFreeDelivery ? standardDeliveryCharge : 0,
    };
  }, [cartTotal]);

  // Calculate total savings (Product discounts + Delivery savings)
  const totalSavings = useMemo(() => {
    const productSavings = items.reduce((acc, item) => {
      const originalPrice = item.originalPrice || item.price;
      const savingsPerUnit = Math.max(0, originalPrice - item.price);
      return acc + savingsPerUnit * item.quantity;
    }, 0);

    return productSavings + (pricingBreakdown.isFreeDelivery ? pricingBreakdown.standardDeliveryCharge : 0);
  }, [items, pricingBreakdown]);

  const handleCheckout = (e) => {
    e.preventDefault();

    if (items?.length <= 0) {
      setOpen(false);
    } else {
      // Re-check user session right before redirect
      const currentUserInfo = getUserSession();

      if (!currentUserInfo) {
        // Redirect to login with redirectUrl parameter to return to checkout after login
        router.push(`/auth/login?redirectUrl=/checkout`, { scroll: true });
        // Don't close cart - let it stay open so user can continue after login
      } else {
        router.push("/checkout");
        setOpen(false);
      }
    }
  };

  return (
    <>
      <div className="flex flex-col h-full justify-between items-middle bg-white rounded w-screen max-w-lg">
        <div className="w-full flex justify-between items-center relative px-5 py-4 border-b bg-indigo-50 border-gray-100">
          <h2 className="font-semibold  text-lg m-0 text-heading flex items-center">
            <FiShoppingCart
              aria-hidden="true"
              className="size-6 shrink-0 me-2"
            />
            Shopping Cart
          </h2>
          <button
            onClick={() => setOpen(false)}
            className="inline-flex text-base items-center cursor-pointer justify-center text-gray-500 p-2 focus:outline-none transition-opacity hover:text-red-400"
          >
            <IoClose />
            <span className="font-sens text-sm text-gray-500 hover:text-red-400 ml-1">
              Close
            </span>
          </button>
        </div>
        <div className="overflow-y-scroll flex-grow scrollbar-hide w-full max-h-full p-4 lg:p-6 pb-0">
          {isEmpty && (
            <div className="flex flex-col h-full justify-center">
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

          {items.map((item, i) => (
            <CartItem key={i + 1} item={item} currency={currency} />
          ))}
        </div>

        {/* Footer with improved pricing */}
        {!isEmpty && (
          <div className="space-y-4">
            {/* Total Savings Box - Inspired by image */}
            <div className="px-5">
              <div className="bg-[#eff6ff] rounded-xl overflow-hidden shadow-sm border border-blue-100 relative">
                {/* Wavy Top Border Effect */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-repeat-x" style={{ backgroundImage: 'radial-gradient(circle at 5px -2px, transparent 6px, #eff6ff 0px)', backgroundSize: '10px 10px' }}></div>

                <div className="p-4 pt-5">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-blue-700 font-bold text-sm">Your total savings</span>
                    <span className="text-blue-700 font-bold text-base">{currency}{totalSavings.toFixed(0)}</span>
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

            <div className="bg-neutral-50 dark:bg-slate-900 p-5 pt-4 pb-20 sm:pb-5 border-t border-gray-100">
              {/* Price Breakdown */}
              <div className="space-y-2 text-sm">
                {/* Subtotal */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Subtotal</span>
                  <span className="text-gray-900 font-semibold">
                    {currency}{cartTotal.toFixed(2)}
                  </span>
                </div>

                {/* Delivery Charge */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Delivery</span>
                  <div className="flex items-center gap-2">
                    {pricingBreakdown.isFreeDelivery ? (
                      <>
                        <span className="text-gray-400 line-through text-xs">
                          {currency}{pricingBreakdown.standardDeliveryCharge}
                        </span>
                        <span className="text-[#018549] font-bold text-sm">
                          FREE
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-900 font-semibold">
                        {currency}{pricingBreakdown.deliveryCharge}
                      </span>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 pt-2 mt-2"></div>

                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-900 font-bold">Total</span>
                  <span className="text-gray-900 font-bold text-lg">
                    {currency}{pricingBreakdown.total.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex mt-4">
                <button
                  onClick={handleCheckout}
                  className="relative h-12 w-full inline-flex items-center justify-center rounded-lg transition-all text-sm sm:text-base font-bold py-2 px-3 bg-[#018549] hover:bg-[#016d3b] text-white shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#018549]"
                >
                  Checkout
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Cart;
