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
        <div className="overflow-y-scroll flex-grow scrollbar-hide w-full max-h-full p-4 lg:p-6">
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
        <div className="bg-neutral-50 dark:bg-slate-900 p-5 pb-20 sm:pb-5 border-t border-gray-100">
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
                    <span className="text-emerald-600 font-bold text-sm">
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

            {/* Free delivery hint */}
            {!pricingBreakdown.isFreeDelivery && !isEmpty && (
              <div className="bg-blue-50 rounded-lg px-3 py-2">
                <p className="text-xs text-blue-700 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Add {currency}{(pricingBreakdown.deliveryThreshold - cartTotal).toFixed(0)} more for FREE delivery!
                </p>
              </div>
            )}

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
              className="relative h-12 w-full inline-flex items-center justify-center rounded-lg transition-all text-sm sm:text-base font-bold py-2 px-3 bg-emerald-500 hover:bg-emerald-600 text-white shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              Checkout
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;

