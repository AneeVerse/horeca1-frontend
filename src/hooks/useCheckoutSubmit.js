import Cookies from "js-cookie";
import { getCookieOptions } from "@utils/cookieConfig";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useCart } from "react-use-cart";
import { useRazorpay, RazorpayOrderOptions } from "react-razorpay";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";

//internal import

import { UserContext } from "@context/UserContext";
import { getAllCoupons } from "@services/CouponServices";
import { notifyError, notifySuccess } from "@utils/toast";
import { addNotification } from "@services/NotificationServices";
import {
  addOrder,
  addRazorpayOrder,
  savePendingPayment,
  createOrderByRazorPay,
  createPaymentIntent,
  sendEmailInvoiceToCustomer,
} from "@services/OrderServices";
import { getUserSession } from "@lib/auth-client";
import { useSetting } from "@context/SettingContext";
import useUtilsFunction from "./useUtilsFunction";
import { baseURL } from "@services/CommonService";

const useCheckoutSubmit = ({ shippingAddress }) => {
  const { state, dispatch } = useContext(UserContext);
  const { userInfo } = state;

  const [error, setError] = useState("");
  const [total, setTotal] = useState("");
  const [couponInfo, setCouponInfo] = useState({});
  const [minimumAmount, setMinimumAmount] = useState(0);
  const [showCard, setShowCard] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [isCheckoutSubmit, setIsCheckoutSubmit] = useState(false);
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [useExistingAddress, setUseExistingAddress] = useState(false);
  const [isCouponAvailable, setIsCouponAvailable] = useState(false);

  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const couponRef = useRef("");
  const { error: razorPayError, isLoading, Razorpay } = useRazorpay();
  const { isEmpty, emptyCart, items, cartTotal } = useCart();

  const { globalSetting, storeSetting, storeCustomization } = useSetting();
  const { showDateFormat, showingTranslateValue } = useUtilsFunction();

  const currency = globalSetting?.default_currency || "₹";

  // console.log("storeSetting", storeSetting);

  // console.log("res", data);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm();

  // Orphan detection: if the user returns to checkout and localStorage has a
  // pending_razorpay_order older than 2 minutes, the previous checkout crashed
  // mid-payment. Show a warning. The webhook + PendingPayment safety net will
  // recover the order automatically, but the user should know their money is safe.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("pending_razorpay_order");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const ageMinutes = (Date.now() - (parsed.savedAt || 0)) / 60000;
      if (ageMinutes > 2) {
        notifyError(
          "A previous payment may not have completed. If money was deducted, your order will be recovered automatically — check 'My Orders' in a few minutes or contact support."
        );
        localStorage.removeItem("pending_razorpay_order");
      }
    } catch (e) {
      // Corrupted backup — just clear it
      try { localStorage.removeItem("pending_razorpay_order"); } catch {}
    }
  }, []);

  useEffect(() => {
    if (Cookies.get("couponInfo")) {
      const coupon = JSON.parse(Cookies.get("couponInfo"));
      // console.log('coupon information',coupon)
      setCouponInfo(coupon);
      setDiscountPercentage(coupon.discountType);
      setMinimumAmount(coupon.minimumAmount);
    }
    // Auto-fill user data from session
    if (userInfo?.email) {
      setValue("email", userInfo.email);
    }
    // Auto-fill phone from session (OTP login)
    if (userInfo?.phone) {
      // Format phone for display (remove country code for Indian numbers)
      const phone = userInfo.phone.startsWith("91") && userInfo.phone.length > 10
        ? userInfo.phone.slice(2)
        : userInfo.phone;
      setValue("contact", phone);
    }
    // Auto-fill name if available
    if (userInfo?.name) {
      setValue("firstName", userInfo.name);
    }
  }, [isCouponApplied, userInfo]);

  //remove coupon if total value less then minimum amount of coupon
  useEffect(() => {
    if (minimumAmount - discountAmount > total || isEmpty) {
      setDiscountPercentage(0);
      Cookies.remove("couponInfo");
    }
  }, [minimumAmount, total]);

  //calculate total and discount value
  //calculate total and discount value
  useEffect(() => {
    const discountProductTotal = items?.reduce(
      (preValue, currentValue) => preValue + currentValue.itemTotal,
      0
    );

    let totalValue = 0;
    const subTotal = parseFloat(cartTotal + Number(shippingCost)).toFixed(2);
    const discountAmount =
      discountPercentage?.type === "fixed"
        ? discountPercentage?.value
        : discountProductTotal * (discountPercentage?.value / 100);

    const discountAmountTotal = discountAmount ? discountAmount : 0;

    totalValue = Number(subTotal) - discountAmountTotal;

    setDiscountAmount(discountAmountTotal);

    // console.log("total", totalValue);

    setTotal(totalValue);
  }, [cartTotal, shippingCost, discountPercentage]);

  const submitHandler = async (data) => {
    // console.log("data", data);
    // return;
    try {
      // dispatch({ type: "SAVE_SHIPPING_ADDRESS", payload: data });
      // Cookies.set("shippingAddress", JSON.stringify(data));
      setIsCheckoutSubmit(true);
      setError("");

      const userDetails = {
        name: data.lastName ? `${data.firstName} ${data.lastName}`.trim() : (data.firstName || "").trim(),
        contact: data.contact,
        email: data.email,
        address: data.address,
        country: data.country,
        city: data.city,
        area: data.city, // Populate area with city as seen in other address forms
        zipCode: data.zipCode,
      };

      // Hard guard: refuse submit if any delivery field is missing. The hidden
      // address inputs are now required via react-hook-form, but a user can
      // still reach this point if state gets out of sync (e.g. added an address
      // that never became the selected one).
      const cleanZip = (data.zipCode || "").toString().trim();
      if (
        !userDetails.name ||
        !(data.address || "").trim() ||
        !(data.city || "").trim() ||
        !/^\d{6}$/.test(cleanZip)
      ) {
        const msg = "Please add a complete delivery address (name, address, city, 6-digit PIN) before checkout.";
        setError(msg);
        notifyError(msg);
        setIsCheckoutSubmit(false);
        return;
      }

      // Pincode serviceability check (BEST-EFFORT, original behaviour).
      // Only validates against an allowlist IF that allowlist is present in
      // localStorage. If it's missing or malformed, we silently skip — never
      // block an order on the absence of the allowlist itself.
      const pincode = cleanZip;
      const storedPincodes = typeof window !== 'undefined' ? localStorage.getItem("deliveryPincodes") : null;
      if (storedPincodes) {
        try {
          const allowedPincodes = JSON.parse(storedPincodes);
          if (Array.isArray(allowedPincodes) && allowedPincodes.length > 0) {
            const isServiceable = allowedPincodes.some(p => p.pincode === pincode);
            if (!isServiceable) {
              const msg = "Sorry currently we do not have service in your pincode. Hope to serve you soon";
              setError(msg);
              notifyError(msg);
              setIsCheckoutSubmit(false);
              return;
            }
          }
        } catch (e) {
          // Corrupt allowlist — log and proceed rather than block the order.
          console.warn("[Checkout] deliveryPincodes is malformed, skipping serviceability check:", e?.message);
        }
      }

      // Calculate final total at submit time to ensure accuracy
      const cartTotalNum = parseFloat(cartTotal) || 0;
      const shippingNum = parseFloat(shippingCost) || 0;
      const discountNum = parseFloat(discountAmount) || 0;
      const finalTotal = cartTotalNum + shippingNum - discountNum;

      // Calculate GST breakdown (same logic as CheckoutForm pricingBreakdown)
      let totalTaxAmount = 0;
      let totalTaxableAmount = 0;
      items.forEach(item => {
        const quantity = item.quantity || 1;
        const taxPercent = parseFloat(item.taxPercent) || 0;
        const itemCurrentPriceGross = parseFloat(item.price) || 0;
        const itemGrossTotal = itemCurrentPriceGross * quantity;

        let itemTaxableAmount, itemGstAmount;
        if (item.taxableRate && item.taxableRate > 0) {
          // Use stored taxableRate
          itemTaxableAmount = item.taxableRate * quantity;
          itemGstAmount = itemGrossTotal - itemTaxableAmount;
        } else {
          // Fallback: Taxable = Gross / (1 + Tax/100)
          itemTaxableAmount = itemGrossTotal / (1 + taxPercent / 100);
          itemGstAmount = itemGrossTotal - itemTaxableAmount;
        }
        totalTaxableAmount += itemTaxableAmount;
        totalTaxAmount += itemGstAmount;
      });

      console.log("Submit Handler - Total calculation:", {
        cartTotal, cartTotalNum,
        shippingCost, shippingNum,
        discountAmount, discountNum,
        totalState: total,
        calculatedTotal: finalTotal,
        totalGst: totalTaxAmount,
        taxableSubtotal: totalTaxableAmount
      });

      // Log cart items structure to verify product details are included
      const cartItemsDebug = items.map(item => ({
        id: item.id,
        title: item.title,
        sku: item.sku,
        hsn: item.hsn,
        unit: item.unit,
        brand: item.brand,
        price: item.price,
        quantity: item.quantity,
      }));
      console.log("[Checkout] Cart items structure:", cartItemsDebug);

      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/7c8b8306-06cf-4e61-b56f-4a46c890ce31', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'useCheckoutSubmit.js:163', message: 'Cart items before order creation', data: { cartItems: cartItemsDebug, itemsCount: items.length }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'C' }) }).catch(() => { });
      // #endregion

      let orderInfo = {
        user_info: userDetails,
        shippingOption: data.shippingOption,
        paymentMethod: data.paymentMethod,
        status: "pending",
        cart: items,
        subTotal: cartTotal,
        shippingCost: shippingCost,
        discount: discountAmount,
        total: finalTotal > 0 ? finalTotal : cartTotal, // Use calculated total or fallback to cartTotal
        totalGst: totalTaxAmount, // Pass the calculated GST to the order
        taxableSubtotal: totalTaxableAmount, // Pass the taxable amount
      };

      // Get customer ID - check both id and _id
      const customerId = userInfo?.id || userInfo?._id;

      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/7c8b8306-06cf-4e61-b56f-4a46c890ce31', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'useCheckoutSubmit.js:186', message: 'Profile update attempt', data: { customerId, userInfo: userInfo ? { id: userInfo.id, _id: userInfo._id, phone: userInfo.phone } : null, userDetails }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { });
      // #endregion

      if (customerId) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/7c8b8306-06cf-4e61-b56f-4a46c890ce31', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'useCheckoutSubmit.js:190', message: 'Calling addShippingAddress API', data: { customerId, userDetails }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
        // #endregion

        try {
          // Call backend API directly to update shipping address and profile
          const session = await getUserSession();
          const token = userInfo?.token || session?.user?.token;

          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/7c8b8306-06cf-4e61-b56f-4a46c890ce31', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'useCheckoutSubmit.js:203', message: 'Making API call to update profile', data: { customerId, userDetails, hasToken: !!token }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
          // #endregion

          // Construct strictly validated address data for the API (excluding email to match schema)
          const addressData = {
            name: data.lastName ? `${data.firstName} ${data.lastName}`.trim() : (data.firstName || "").trim(),
            contact: data.contact.replace(/\D/g, ""), // formatted phone - strictly numeric
            address: data.address,
            country: data.country,
            city: data.city,
            area: data.city,
            zipCode: data.zipCode.replace(/\D/g, ""), // Ensure clean numeric zip
            isDefault: data.isDefault || false,
          };

          // Determine if we are using an existing address or a new one
          // Local IDs start with 'addr' in AddressManager
          const addressId = data.addressId && !data.addressId.toString().startsWith('addr') ? data.addressId : "";

          const response = await fetch(
            `${baseURL}/customer/shipping/address/${customerId}?id=${addressId}`, // Pass ID to prevent duplicates
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(token && { Authorization: `Bearer ${token}` }),
              },
              body: JSON.stringify(addressData),
            }
          );

          const result = await response.json();

          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/7c8b8306-06cf-4e61-b56f-4a46c890ce31', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'useCheckoutSubmit.js:218', message: 'addShippingAddress API result', data: { result, status: response.status, ok: response.ok }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
          // #endregion

          if (!response.ok) {
            console.error("[Checkout] Failed to update shipping address:", result);
          } else {
            console.log("[Checkout] Profile updated successfully:", result);

            // Update userInfo cookie with fresh data from backend response
            // Backend returns: { message, profileUpdated, customer: { name, email, phone } }
            if (result.customer || result.profileUpdated) {
              const updatedUserInfo = {
                ...userInfo,
                name: result.customer?.name || userDetails.name || userInfo?.name,
                email: result.customer?.email || userDetails.email || userInfo?.email,
                phone: result.customer?.phone || userInfo?.phone,
              };
              Cookies.set("userInfo", JSON.stringify(updatedUserInfo), getCookieOptions(30));

              // #region agent log
              fetch('http://127.0.0.1:7243/ingest/7c8b8306-06cf-4e61-b56f-4a46c890ce31', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'useCheckoutSubmit.js:236', message: 'Updated userInfo cookie', data: { updatedUserInfo, result }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
              // #endregion

              // Dispatch update to UserContext to refresh UI
              dispatch({ type: "USER_LOGIN", payload: updatedUserInfo });

              // Dispatch custom event to notify Sidebar and other components
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('profileUpdated'));
              }
            }
          }
        } catch (err) {
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/7c8b8306-06cf-4e61-b56f-4a46c890ce31', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'useCheckoutSubmit.js:228', message: 'addShippingAddress API error', data: { error: err.message, stack: err.stack }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
          // #endregion
          console.error("[Checkout] Error updating shipping address:", err);
        }
      } else {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/7c8b8306-06cf-4e61-b56f-4a46c890ce31', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'useCheckoutSubmit.js:223', message: 'No customer ID found', data: { userInfo }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { });
        // #endregion
        console.warn("[Checkout] No customer ID found in userInfo:", userInfo);
      }

      // Handle payment based on method
      switch (data.paymentMethod) {
        case "Card":
          await handlePaymentWithStripe(orderInfo);
          break;
        case "RazorPay":
          await handlePaymentWithRazorpay(orderInfo);
          break;
        case "Cash":
          await handleCashPayment(orderInfo);
          break;
        default:
          throw new Error("Invalid payment method selected");
      }
    } catch (error) {
      notifyError(error?.response?.data?.message || error?.message);
      setIsCheckoutSubmit(false);
    }
  };

  // console.log("globalSetting", globalSetting?.email_to_customer);

  const handleOrderSuccess = async (orderResponse, orderInfo) => {
    // console.log("Order successful:", orderResponse, orderInfo);

    try {
      if (!orderResponse) {
        throw new Error("Order response is empty");
      }

      const createdAtValue =
        orderResponse?.createdAt || orderResponse?.updatedAt || new Date().toISOString();

      const notificationInfo = {
        orderId: orderResponse?._id,
        message: `${orderResponse?.user_info?.name
          } placed an order of ${parseFloat(orderResponse?.total || 0).toFixed(2)}!`,
        image:
          userInfo?.image ||
          "https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png",
      };

      const updatedData = {
        ...orderResponse,
        date: showDateFormat(createdAtValue),
        company_info: {
          currency: currency,
          vat_number: globalSetting?.vat_number,
          company: globalSetting?.company_name,
          address: globalSetting?.address,
          phone: globalSetting?.contact,
          email: globalSetting?.email,
          website: globalSetting?.website,
          from_email: globalSetting?.from_email,
        },
      };

      // console.log("notificaiton", notification);
      // if (error) {
      //   console.error("Failed to add notification:", error);
      //   return setIsCheckoutSubmit(false);
      // }
      // return setIsCheckoutSubmit(false);

      // Always send emails to owner and customer when order is created
      sendEmailInvoiceToCustomer(updatedData).catch((emailErr) => {
        console.error("Failed to send email invoice:", emailErr.message);
      });
      // notification api call
      const { notification, error } = await addNotification(notificationInfo);

      // Proceed with order success
      console.log("[Checkout] Order processed successfully, redirecting...");

      if (!orderResponse?._id) {
        throw new Error("Order ID missing in response");
      }

      // Clear data before redirect
      emptyCart();

      // Manual fallback to ensure react-use-cart is cleared from localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("react-use-cart");
        // Clear the razorpay orphan backup — order is now safely in DB
        localStorage.removeItem("pending_razorpay_order");
      }

      Cookies.remove("couponInfo");

      notifySuccess(
        "Your Order Confirmed! The invoice will be emailed to you shortly."
      );

      // Give a tiny bit of time for state/storage to sync before hard redirect
      setTimeout(() => {
        window.location.replace(`/order/${orderResponse?._id}`);
      }, 500);

      setIsCheckoutSubmit(false);
    } catch (err) {
      console.error("Order success handling error:", err.message);
      throw new Error(err.message);
    }
  };

  //handle cash payment
  // const handleCashPayment = async (orderInfo) => {
  //   try {
  //     const { orderResponse, error } = await addOrder(orderInfo);
  //     console.log("orderResponse", orderResponse, "error", error);
  //     if (error) {
  //       setIsCheckoutSubmit(false);
  //       return notifyError(error);
  //     }

  //     await handleOrderSuccess(orderResponse, orderInfo);
  //   } catch (err) {
  //     console.error("Cash payment error:", err.message);
  //     throw new Error(err.message);
  //   }
  // };
  const handleCashPayment = async (orderInfo) => {
    try {
      // console.log("Cash payment orderInfo:", orderInfo);
      const { orderResponse, error } = await addOrder(orderInfo);
      // console.log("orderResponse:", orderResponse, "error:", error);

      if (error) {
        setIsCheckoutSubmit(false);
        return notifyError(error);
      }

      if (!orderResponse) {
        setIsCheckoutSubmit(false);
        return notifyError("Order response is empty!");
      }

      await handleOrderSuccess(orderResponse, orderInfo);
    } catch (err) {
      // console.error("Cash payment error:", err.message);
      setIsCheckoutSubmit(false);
      notifyError(err.message);
    }
  };

  //handle stripe payment
  const handlePaymentWithStripe = async (orderInfo) => {
    try {
      if (!stripe || !elements) {
        throw new Error("Stripe is not initialized");
      }

      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: elements.getElement(CardElement),
      });

      if (error || !paymentMethod) {
        throw new Error(error?.message || "Stripe payment failed");
      }

      const order = {
        ...orderInfo,
        cardInfo: paymentMethod,
      };

      const { stripeInfo } = await createPaymentIntent(order);
      // console.log("res", stripeInfo, "order", order);
      stripe.confirmCardPayment(stripeInfo?.client_secret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      // console.log("stripeInfo", stripeInfo);

      const orderData = { ...orderInfo, cardInfo: stripeInfo };
      const { orderResponse, error: orderError } = await addOrder(orderData);
      if (orderError) {
        setIsCheckoutSubmit(false);
        return notifyError(orderError);
      }
      await handleOrderSuccess(orderResponse, orderInfo);
    } catch (err) {
      // Instead of just throwing the error, rethrow it so that it can be caught by the main submit handler
      throw new Error(err.message); // Ensure the error is propagated properly
    }
  };

  //handle razorpay payment
  const handlePaymentWithRazorpay = async (orderInfo) => {
    try {
      // Calculate amount directly from orderInfo to ensure correct value
      // orderInfo.total is the final calculated total passed from submitHandler
      const orderTotal = parseFloat(orderInfo.total);
      const fallbackTotal = parseFloat(cartTotal) + parseFloat(shippingCost) - parseFloat(discountAmount);
      const amountInRupees = orderTotal > 0 ? orderTotal : fallbackTotal;

      console.log("[Frontend Razorpay] ========== Payment Start ==========");
      console.log("[Frontend Razorpay] Final Amount (rupees):", amountInRupees);

      if (amountInRupees < 1) {
        throw new Error("Invalid order amount. Please try again.");
      }

      // LAYER 1 SAFETY NET: save complete orderInfo to localStorage BEFORE we
      // even talk to Razorpay. If the user's browser dies, power fails, or
      // anything else kills the tab during UPI approval, the next page load
      // can detect this and ask the user to recover. See recoverOrphanedRazorpayOrder.
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(
            "pending_razorpay_order",
            JSON.stringify({
              orderInfo,
              amountInRupees,
              userId: userInfo?.id || userInfo?._id,
              userToken: userInfo?.token,
              savedAt: Date.now(),
            })
          );
        } catch (e) {
          console.warn("[Frontend Razorpay] localStorage backup failed:", e.message);
        }
      }

      console.log("[Frontend Razorpay] Calling createOrderByRazorPay with amount:", amountInRupees.toString());
      // Pass orderInfo so the backend saves LAYER 2 safety net (PendingPayment
      // record with status=created) BEFORE the modal opens.
      const razorpayOrderResponse = await createOrderByRazorPay({
        amount: amountInRupees.toString(),
        orderInfo,
      });

      if (razorpayOrderResponse.error) {
        throw new Error(razorpayOrderResponse.error);
      }

      const { amount: orderAmount, id, currency: orderCurrency } = razorpayOrderResponse;

      console.log("[Frontend Razorpay] Razorpay Order Response:");
      console.log("[Frontend Razorpay] Order ID:", id);
      console.log("[Frontend Razorpay] Order Amount (from response):", orderAmount);
      console.log("[Frontend Razorpay] Order Amount (rupees):", orderAmount / 100);
      console.log("[Frontend Razorpay] Order Currency:", orderCurrency);

      // Ensure amount is a number (Razorpay returns amount in paise)
      const amountInPaise = Number(orderAmount);

      if (!amountInPaise || amountInPaise < 100) {
        console.error("[Frontend Razorpay] ERROR: Invalid amount received from Razorpay:", amountInPaise);
        throw new Error("Invalid amount received from payment gateway");
      }

      const options = {
        key: storeSetting?.razorpay_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amountInPaise, // Amount in paise (e.g., 7800 for ₹78)
        currency: orderCurrency || "INR",
        name: "horeca1",
        description: `Order total: ₹${amountInPaise / 100}`,
        order_id: id,
        handler: async (response) => {
          try {
            console.log("[Frontend Razorpay] Payment successful, creating order...");
            console.log("[Frontend Razorpay] Payment ID:", response.razorpay_payment_id);
            console.log("[Frontend Razorpay] Order ID:", response.razorpay_order_id);

            const razorpayDetails = {
              amount: orderInfo.total,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            };

            // Save pending payment as safety net BEFORE creating order
            // This ensures we can recover if order creation fails
            console.log("[Frontend Razorpay] Saving pending payment as safety net...");
            await savePendingPayment({
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
              amount: orderInfo.total,
              orderInfo: orderInfo,
            });

            const orderData = { ...orderInfo, razorpay: razorpayDetails, cart: items };
            console.log("[Frontend Razorpay] Calling addRazorpayOrder with data:", {
              user_info: orderData.user_info,
              total: orderData.total,
              paymentMethod: orderData.paymentMethod,
              cartItemsCount: orderData.cart?.length,
              razorpayPaymentId: razorpayDetails.razorpayPaymentId,
            });

            const { orderResponse, error } = await addRazorpayOrder(orderData);

            console.log("[Frontend Razorpay] addRazorpayOrder result:", {
              success: !!orderResponse,
              error: error,
              orderId: orderResponse?._id,
              invoice: orderResponse?.invoice,
            });

            if (error || !orderResponse) {
              console.error("[Frontend Razorpay] CRITICAL: Payment captured but order creation failed!");
              console.error("[Frontend Razorpay] Error:", error);
              console.error("[Frontend Razorpay] Payment ID:", response.razorpay_payment_id);
              console.error("[Frontend Razorpay] Please create order manually for this payment.");
              setIsCheckoutSubmit(false);
              return notifyError(error || "Order creation failed. Please contact support with Payment ID: " + response.razorpay_payment_id);
            }

            console.log("[Frontend Razorpay] Order created successfully, invoice:", orderResponse.invoice);
            await handleOrderSuccess(orderResponse, orderInfo);
          } catch (handlerError) {
            console.error("[Frontend Razorpay] CRITICAL: Handler error after payment captured!");
            console.error("[Frontend Razorpay] Error:", handlerError.message);
            console.error("[Frontend Razorpay] Payment ID:", response.razorpay_payment_id);
            setIsCheckoutSubmit(false);
            notifyError("Order processing failed. Please contact support with Payment ID: " + response.razorpay_payment_id);
          }
        },
        prefill: {
          name: orderInfo?.user_info?.name || "Customer",
          email: orderInfo?.user_info?.email || "customer@example.com",
          contact: orderInfo?.user_info?.contact || "0000000000",
        },
        theme: { color: "#018549" },
        // Customize payment options: UPI first, other methods collapsed
        config: {
          display: {
            blocks: {
              // UPI block - shown first and expanded by default
              upi: {
                name: "Pay using UPI",
                instruments: [
                  { method: "upi" }
                ]
              },
              // Other payment methods - collapsed by default
              other: {
                name: "Other Payment Options",
                instruments: [
                  { method: "card" },
                  { method: "netbanking" },
                  { method: "wallet" },
                  { method: "emi" },
                  { method: "paylater" }
                ]
              }
            },
            // Order of blocks
            sequence: ["block.upi", "block.other"],
            // Preferences
            preferences: {
              show_default_blocks: false // Hide default arrangement, use our custom blocks
            }
          }
        },
        modal: {
          ondismiss: function () {
            console.log("[Frontend Razorpay] Payment modal closed/cancelled");
            setIsCheckoutSubmit(false);
          },
        },
      };

      console.log("[Frontend Razorpay] Razorpay Options:");
      console.log("[Frontend Razorpay] Key:", options.key ? "Present" : "Missing");
      console.log("[Frontend Razorpay] Amount (paise):", options.amount);
      console.log("[Frontend Razorpay] Amount (rupees):", options.amount / 100);
      console.log("[Frontend Razorpay] Currency:", options.currency);
      console.log("[Frontend Razorpay] Order ID:", options.order_id);
      console.log("[Frontend Razorpay] ========== Opening Razorpay Checkout ==========");

      const rzpay = new Razorpay(options);
      rzpay.on("payment.failed", function (response) {
        console.error("[Frontend Razorpay] Payment failed:", response.error);
        setIsCheckoutSubmit(false);
        notifyError(response.error.description || "Payment failed");
      });
      rzpay.open();
    } catch (err) {
      console.error("[Frontend Razorpay] ERROR:", err.message);
      console.error("[Frontend Razorpay] Error stack:", err.stack);
      throw new Error(err.message);
    }
  };

  const handleShippingCost = (value) => {
    // console.log("handleShippingCost", value);
    setShippingCost(Number(value));
  };

  //handle default shipping address
  const handleDefaultShippingAddress = (value) => {
    // console.log("handle default shipping", value);
    setUseExistingAddress(value);
    if (value) {
      const address = shippingAddress;

      setValue("firstName", address?.name);

      setValue("address", address.address);
      setValue("contact", address.contact);
      setValue("email", address.email);
      setValue("city", address.city);
      setValue("country", address.country);
      setValue("zipCode", address.zipCode);
    } else {
      setValue("firstName");
      setValue("address");
      setValue("contact");
      // setValue("email");
      setValue("city");
      setValue("country");
      setValue("zipCode");
    }
  };
  const handleCouponCode = async (e) => {
    e.preventDefault();

    if (!couponRef.current.value) {
      notifyError("Please Input a Coupon Code!");
      return;
    }
    setIsCouponAvailable(true);

    try {
      const { coupons, error } = await getAllCoupons();
      const result = coupons.filter(
        (coupon) => coupon.couponCode === couponRef.current.value
      );
      setIsCouponAvailable(false);

      if (result.length < 1) {
        notifyError("Please Input a Valid Coupon!");
        return;
      }

      if (dayjs().isAfter(dayjs(result[0]?.endTime))) {
        notifyError("This coupon is not valid!");
        return;
      }

      if (total < result[0]?.minimumAmount) {
        notifyError(
          `Minimum ${result[0].minimumAmount} USD required for Apply this coupon!`
        );
        return;
      } else {
        notifySuccess(`Your Coupon ${result[0].couponCode} is Applied!`);
        setIsCouponApplied(true);
        setMinimumAmount(result[0]?.minimumAmount);
        setDiscountPercentage(result[0].discountType);
        dispatch({ type: "SAVE_COUPON", payload: result[0] });
        Cookies.set("couponInfo", JSON.stringify(result[0]), getCookieOptions(7));
      }
    } catch (error) {
      return notifyError(error.message);
    }
  };

  return {
    register,
    errors,
    showCard,
    setShowCard,
    error,
    stripe,
    couponInfo,
    couponRef,
    total,
    isEmpty,
    items,
    cartTotal,
    currency,
    handleSubmit,
    submitHandler,
    handleShippingCost,
    handleCouponCode,
    discountPercentage,
    discountAmount,
    shippingCost,
    isCheckoutSubmit,
    isCouponApplied,
    useExistingAddress,
    isCouponAvailable,
    globalSetting,
    storeSetting,
    storeCustomization,
    showingTranslateValue,
    handleDefaultShippingAddress,
    setValue,
    getValues,
    watch,
  };
};

export default useCheckoutSubmit;

