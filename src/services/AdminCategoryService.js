import { baseURL, handleResponse } from "@services/CommonService";
import requests, { setToken } from "@services/httpServices";

// Set token from localStorage if available
if (typeof window !== "undefined") {
  const token = localStorage.getItem("adminToken");
  if (token) {
    setToken(token);
  }
}

// Get all categories
export const getAllCategories = async () => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
    const response = await fetch(`${baseURL}/category/all`, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      cache: "no-store",
    });

    const data = await handleResponse(response);
    return { categories: data, error: null };
  } catch (error) {
    return { categories: [], error: error.message };
  }
};

// Get single category by ID
export const getCategoryById = async (id) => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
    const response = await fetch(`${baseURL}/category/${id}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    const data = await handleResponse(response);
    return { category: data, error: null };
  } catch (error) {
    return { category: null, error: error.message };
  }
};

// Add category
export const addCategory = async (categoryData) => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
    const response = await fetch(`${baseURL}/category/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(categoryData),
    });

    const data = await handleResponse(response);
    return { category: data, error: null };
  } catch (error) {
    return { category: null, error: error.message };
  }
};

// Update category
export const updateCategory = async (id, categoryData) => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
    const response = await fetch(`${baseURL}/category/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(categoryData),
    });

    const data = await handleResponse(response);
    return { category: data, error: null };
  } catch (error) {
    return { category: null, error: error.message };
  }
};

// Delete category
export const deleteCategory = async (id) => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
    const response = await fetch(`${baseURL}/category/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    const data = await handleResponse(response);
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Update category status
export const updateCategoryStatus = async (id, status) => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
    const response = await fetch(`${baseURL}/category/status/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ status }),
    });

    const data = await handleResponse(response);
    return { category: data, error: null };
  } catch (error) {
    return { category: null, error: error.message };
  }
};





