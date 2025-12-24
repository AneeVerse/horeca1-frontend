"use server";

import { getHeaders } from "@lib/auth-server";
import { baseURL, handleResponse } from "@services/CommonService";
import { revalidatePath, revalidateTag } from "next/cache";

const addOrder = async (orderInfo) => {
  try {
    const response = await fetch(`${baseURL}/order/add`, {
      cache: "no-cache",
      method: "POST",
      headers: await getHeaders(),
      body: JSON.stringify(orderInfo),
    });

    // console.log("res", response);

    const orderResponse = await handleResponse(response);

    // console.log("orderResponse", orderResponse);
    // revalidatePath("/user/my-orders");
    revalidateTag("user-orders");
    revalidateTag("reviewed_products");

    return {
      orderResponse,
    };
  } catch (error) {
    // console.log("error", error);

    return {
      error: error.message,
    };
  }
};
const createPaymentIntent = async (orderInfo) => {
  try {
    const response = await fetch(`${baseURL}/order/create-payment-intent`, {
      cache: "no-cache",
      method: "POST",
      headers: await getHeaders(),
      body: JSON.stringify(orderInfo),
    });

    const stripeInfo = await handleResponse(response);

    return {
      stripeInfo,
    };
  } catch (error) {
    return {
      error: error.message,
    };
  }
};

// Add Razorpay order; expects flat order payload (not nested)
const addRazorpayOrder = async (orderInfo) => {
  try {
    const response = await fetch(`${baseURL}/order/add/razorpay`, {
      cache: "no-cache",
      method: "POST",
      headers: await getHeaders(),
      body: JSON.stringify(orderInfo),
    });

    const order = await handleResponse(response);
    revalidateTag("user-orders");
    revalidateTag("reviewed_products");

    return {
      orderResponse: order,
      error: null,
    };
  } catch (error) {
    return {
      orderResponse: null,
      error: error.message,
    };
  }
};

const createOrderByRazorPay = async ({ amount }) => {
  try {
    const amountNum = Number(amount);
    console.log("[OrderServices] Creating Razorpay order with amount (rupees):", amountNum);
    
    const response = await fetch(`${baseURL}/order/create/razorpay`, {
      cache: "no-cache",
      method: "POST",
      headers: await getHeaders(),
      body: JSON.stringify({ amount: amountNum }),
    });
    
    const order = await handleResponse(response);
    
    console.log("[OrderServices] Razorpay order response received:");
    console.log("[OrderServices] Order ID:", order.id);
    console.log("[OrderServices] Order Amount (paise):", order.amount);
    console.log("[OrderServices] Order Amount (rupees):", order.amount / 100);
    console.log("[OrderServices] Order Currency:", order.currency);
    console.log("[OrderServices] Full order object:", JSON.stringify(order, null, 2));

    // Ensure amount is properly returned (should be in paise from Razorpay)
    if (!order.amount || order.amount < 100) {
      console.error("[OrderServices] ERROR: Invalid amount in Razorpay response:", order.amount);
      throw new Error("Invalid amount received from payment gateway");
    }

    return {
      id: order.id,
      amount: order.amount, // Amount in paise from Razorpay
      currency: order.currency,
    };
  } catch (error) {
    console.error("[OrderServices] ERROR creating Razorpay order:", error.message);
    return {
      error: error.message,
    };
  }
};

const getOrderCustomer = async ({ page = 1, limit = 8 }) => {
  try {
    const response = await fetch(
      `${baseURL}/order?limit=${limit}&page=${page}`,
      {
        // cache: "force-cache",

        next: {
          revalidate: 900,
          tags: ["user-orders"],
        },
        headers: await getHeaders(),
      }
    );

    const orders = await handleResponse(response);
    // console.log("orders::", orders);

    return {
      data: orders,
    };
  } catch (error) {
    // console.log("error", error);
    return {
      error: error.message,
    };
  }
};

const getOrderById = async ({ id }) => {
  try {
    const response = await fetch(`${baseURL}/order/${id}`, {
      cache: "force-cache",
      headers: await getHeaders(),
    });

    const order = await handleResponse(response);
    // console.log("order::", order);

    return {
      data: order,
    };
  } catch (error) {
    // console.log("error", error);
    return {
      error: error.message,
    };
  }
};
//for sending email invoice to customer
const sendEmailInvoiceToCustomer = async (body) => {
  try {
    const response = await fetch(`${baseURL}/order/customer/invoice`, {
      cache: "no-cache",
      method: "POST",
      headers: await getHeaders(),
      body: JSON.stringify(body),
    });

    return await handleResponse(response);
  } catch (error) {
    return {
      error: error.message,
    };
  }
};

export {
  addOrder,
  createPaymentIntent,
  addRazorpayOrder,
  createOrderByRazorPay,
  getOrderCustomer,
  getOrderById,
  sendEmailInvoiceToCustomer,
};
