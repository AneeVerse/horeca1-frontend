import { baseURL, handleResponse } from "@services/CommonService";
import requests, { setToken } from "@services/httpServices";

// Set token from localStorage if available
if (typeof window !== "undefined") {
  const token = localStorage.getItem("adminToken");
  if (token) {
    setToken(token);
  }
}

// Get all products
export const getAllProducts = async (page = 1, limit = 1000) => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
    const response = await fetch(`${baseURL}/products/?page=${page}&limit=${limit}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      cache: "no-store",
    });

    const data = await handleResponse(response);
    return { products: data, error: null };
  } catch (error) {
    return { products: [], error: error.message };
  }
};

// Get single product by ID
export const getProductById = async (id) => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
    const response = await fetch(`${baseURL}/products/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    const data = await handleResponse(response);
    return { product: data, error: null };
  } catch (error) {
    return { product: null, error: error.message };
  }
};

// Add product
export const addProduct = async (productData) => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
    const response = await fetch(`${baseURL}/products/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(productData),
    });

    const data = await handleResponse(response);
    return { product: data, error: null };
  } catch (error) {
    return { product: null, error: error.message };
  }
};

// Update product
export const updateProduct = async (id, productData) => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
    const response = await fetch(`${baseURL}/products/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(productData),
    });

    const data = await handleResponse(response);
    return { product: data, error: null };
  } catch (error) {
    return { product: null, error: error.message };
  }
};

// Delete product
export const deleteProduct = async (id) => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
    const response = await fetch(`${baseURL}/products/${id}`, {
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

// Update product status
export const updateProductStatus = async (id, status) => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
    const response = await fetch(`${baseURL}/products/status/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ status }),
    });

    const data = await handleResponse(response);
    return { product: data, error: null };
  } catch (error) {
    return { product: null, error: error.message };
  }
};

// Update product order (for drag and drop)
export const updateProductOrder = async (products) => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
    const response = await fetch(`${baseURL}/products/order/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ products }),
    });

    const data = await handleResponse(response);
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Get products grouped by category
export const getProductsByCategory = async () => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
    const response = await fetch(`${baseURL}/products/by-category`, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      cache: "no-store",
    });

    const data = await handleResponse(response);
    return { data, error: null };
  } catch (error) {
    return { data: [], error: error.message };
  }
};

// Get product count by category (for delete confirmation)
export const getProductCountByCategory = async (categoryId) => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
    const response = await fetch(`${baseURL}/products/count/${categoryId}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    const data = await handleResponse(response);
    return { count: data.count, error: null };
  } catch (error) {
    return { count: 0, error: error.message };
  }
};

// Delete all products in a category
export const deleteProductsByCategory = async (categoryId) => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
    const response = await fetch(`${baseURL}/products/by-category/${categoryId}`, {
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
