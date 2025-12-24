/**
 * Indian PIN Code Lookup Utility
 * Fetches city and state from PIN code using India Post API
 */

/**
 * Lookup city and state from Indian PIN code
 * @param {string} pincode - 6-digit Indian PIN code
 * @returns {Promise<{success: boolean, city?: string, state?: string, district?: string, error?: string}>}
 */
export const lookupPincode = async (pincode) => {
  try {
    // Validate PIN code format (6 digits)
    const cleanPincode = pincode.replace(/\D/g, "");
    
    if (cleanPincode.length !== 6) {
      return {
        success: false,
        error: "PIN code must be 6 digits",
      };
    }

    // India Post API for PIN code lookup
    const response = await fetch(
      `https://api.postalpincode.in/pincode/${cleanPincode}`
    );

    const data = await response.json();

    if (data && data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
      const postOffice = data[0].PostOffice[0];
      return {
        success: true,
        city: postOffice.Block || postOffice.Name || postOffice.District,
        district: postOffice.District,
        state: postOffice.State,
        country: "India",
      };
    } else {
      return {
        success: false,
        error: "Invalid PIN code or not found",
      };
    }
  } catch (error) {
    console.error("PIN code lookup error:", error);
    return {
      success: false,
      error: "Failed to lookup PIN code",
    };
  }
};

export default lookupPincode;


