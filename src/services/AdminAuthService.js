import { baseURL, handleResponse } from "@services/CommonService";

// Decode JWT token without verification (just to read payload)
const decodeToken = (token) => {
  try {
    if (!token || !token.includes('.')) return null;
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("[AdminAuth] Error decoding token:", error);
    return null;
  }
};

// Check if token is expired
export const isTokenExpired = (token) => {
  if (!token) return true;
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  // exp is in seconds, Date.now() is in milliseconds
  const expirationTime = decoded.exp * 1000;
  const isExpired = Date.now() >= expirationTime;
  if (isExpired) {
    console.warn("[AdminAuth] Token expired at:", new Date(expirationTime).toISOString());
  }
  return isExpired;
};

// Get token expiration date
export const getTokenExpiration = (token) => {
  if (!token) return null;
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return null;
  return new Date(decoded.exp * 1000);
};

// Admin login
export const loginAdmin = async (email, password) => {
  try {
    const response = await fetch(`${baseURL}/admin/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await handleResponse(response);

    // Store token in localStorage
    if (typeof window !== "undefined" && data.token) {
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminInfo", JSON.stringify(data));
      console.log("[AdminAuth] Token stored, expires at:", getTokenExpiration(data.token));
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Admin logout
export const logoutAdmin = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
  }
};

// Get admin info from localStorage
export const getAdminInfo = () => {
  if (typeof window !== "undefined") {
    const adminInfo = localStorage.getItem("adminInfo");
    return adminInfo ? JSON.parse(adminInfo) : null;
  }
  return null;
};

// Check if admin is logged in (and token is valid)
export const isAdminAuthenticated = () => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("adminToken");
    if (!token) return false;

    // Check if token is expired
    if (isTokenExpired(token)) {
      console.warn("[AdminAuth] Token is expired, clearing session...");
      // Clear expired token
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminInfo");
      return false;
    }

    return true;
  }
  return false;
};













