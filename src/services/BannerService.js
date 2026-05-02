import { baseURL } from "./CommonService";

// Get all active banners for homepage
export const getBanners = async () => {
  try {
    const response = await fetch(`${baseURL}/banners/`, {
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch banners");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching banners:", error);
    return [];
  }
};

// Get all banners for admin (including inactive)
export const getAllBannersAdmin = async () => {
try {
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      throw new Error("Admin authentication required. Please login.");
    }
    
    const apiUrl = `${baseURL}/banners/admin`;
const response = await fetch(apiUrl, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      cache: "no-store",
    });
if (!response.ok) {
      // Read response body only once
      const contentType = response.headers.get("content-type");
      let errorMessage = "Failed to fetch banners";
      
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } else {
        // If response is HTML (like 404 page), consume it and provide helpful message
        await response.text(); // Consume the response to avoid stream error
        if (response.status === 404) {
          errorMessage = "Banner API endpoint not found. Please check backend server.";
        } else if (response.status === 401) {
          errorMessage = "Authentication failed. Please login again.";
        } else {
          errorMessage = `Server error (${response.status}). Please check backend server.`;
        }
      }
      throw new Error(errorMessage);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching banners:", error);
    throw error;
  }
};

// Add a new banner
export const addBanner = async (bannerData) => {
try {
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      throw new Error("Admin authentication required");
    }
    
    const apiUrl = `${baseURL}/banners/admin`;
const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(bannerData),
    });
if (!response.ok) {
      // Read response body only once
      const contentType = response.headers.get("content-type");
      let errorMessage = "Failed to add banner";
      let errorBody = null;
      
      if (contentType && contentType.includes("application/json")) {
        errorBody = await response.json();
        errorMessage = errorBody.message || errorMessage;
} else {
        const errorText = await response.text();
if (response.status === 404) {
          errorMessage = "Banner API endpoint not found. Please check backend server.";
        } else if (response.status === 401) {
          errorMessage = "Authentication failed. Please login again.";
        } else {
          errorMessage = `Server error (${response.status}): ${errorText.substring(0, 100)}`;
        }
      }
      throw new Error(errorMessage);
    }
    const result = await response.json();
return result;
  } catch (error) {
console.error("Error adding banner:", error);
    throw error;
  }
};

// Update a banner
export const updateBanner = async (id, bannerData) => {
  try {
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      throw new Error("Admin authentication required");
    }
    
    const response = await fetch(`${baseURL}/banners/admin/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(bannerData),
    });
    
    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      let errorMessage = "Failed to update banner";
      
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } else {
        await response.text(); // Consume the response
        if (response.status === 401) {
          errorMessage = "Authentication failed. Please login again.";
        } else {
          errorMessage = `Server error (${response.status})`;
        }
      }
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (error) {
    console.error("Error updating banner:", error);
    throw error;
  }
};

// Delete a banner
export const deleteBanner = async (id) => {
  try {
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      throw new Error("Admin authentication required");
    }
    
    const response = await fetch(`${baseURL}/banners/admin/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
    });
    
    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      let errorMessage = "Failed to delete banner";
      
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } else {
        await response.text(); // Consume the response
        if (response.status === 401) {
          errorMessage = "Authentication failed. Please login again.";
        } else {
          errorMessage = `Server error (${response.status})`;
        }
      }
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (error) {
    console.error("Error deleting banner:", error);
    throw error;
  }
};

// Reorder banners
export const reorderBanners = async (banners) => {
  try {
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      throw new Error("Admin authentication required");
    }
    
    const response = await fetch(`${baseURL}/banners/admin/reorder`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ banners }),
    });
    
    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      let errorMessage = "Failed to reorder banners";
      
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } else {
        await response.text(); // Consume the response
        if (response.status === 401) {
          errorMessage = "Authentication failed. Please login again.";
        } else {
          errorMessage = `Server error (${response.status})`;
        }
      }
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (error) {
    console.error("Error reordering banners:", error);
    throw error;
  }
};

