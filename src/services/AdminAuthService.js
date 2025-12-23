import { baseURL, handleResponse } from "@services/CommonService";

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

// Check if admin is logged in
export const isAdminAuthenticated = () => {
  if (typeof window !== "undefined") {
    return !!localStorage.getItem("adminToken");
  }
  return false;
};




