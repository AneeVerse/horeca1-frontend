"use server";

import { baseURL, handleResponse } from "@services/CommonService";

/**
 * Send OTP to phone number
 * @param {string} phone - Phone number with country code (e.g., "919876543210")
 * @returns {Promise<{success: boolean, message: string, phone?: string}>}
 */
export const sendOTP = async (phone) => {
  try {
    const response = await fetch(`${baseURL}/customer/otp/send`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone }),
    });

    const data = await handleResponse(response);
    return {
      success: true,
      message: data.message || "OTP sent successfully",
      phone: data.phone,
      otp: data.otp, // For dev mode
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to send OTP",
    };
  }
};

/**
 * Verify OTP and login/signup
 * @param {string} phone - Phone number with country code
 * @param {string} otp - 6-digit OTP
 * @returns {Promise<{success: boolean, userInfo?: object, message?: string, error?: string}>}
 */
export const verifyOTP = async (phone, otp) => {
  try {
    const response = await fetch(`${baseURL}/customer/otp/verify`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone, otp }),
    });

    const userInfo = await handleResponse(response);
    return {
      success: true,
      userInfo,
      message: userInfo.message || "Login successful",
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Failed to verify OTP",
    };
  }
};

/**
 * Resend OTP
 * @param {string} phone - Phone number with country code
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const resendOTP = async (phone) => {
  try {
    const response = await fetch(`${baseURL}/customer/otp/resend`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone }),
    });

    const data = await handleResponse(response);
    return {
      success: true,
      message: data.message || "OTP resent successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to resend OTP",
    };
  }
};

