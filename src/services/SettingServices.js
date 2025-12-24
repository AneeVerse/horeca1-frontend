import { baseURL, handleResponse } from "@services/CommonService";

const getStoreCustomizationSetting = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    const response = await fetch(`${baseURL}/setting/store/customization`, {
      signal: controller.signal,
      cache: "no-store", // Force fresh data - no caching
    });
    
    clearTimeout(timeoutId);
    const storeCustomizationSetting = await handleResponse(response);
    return { storeCustomizationSetting };
  } catch (error) {
    return { error: error.message, storeCustomizationSetting: null };
  }
};

const getGlobalSetting = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    const response = await fetch(`${baseURL}/setting/global`, {
      signal: controller.signal,
      cache: "no-store", // Force fresh data - no caching
    });
    
    clearTimeout(timeoutId);
    const globalSetting = await handleResponse(response);
    return { globalSetting };
  } catch (error) {
    return { error: error.message, globalSetting: null };
  }
};

const getShowingLanguage = async () => {
  try {
    const response = await fetch(`${baseURL}/language/show`, {
      // cache: "force-cache", //if you want to no cache then comment this line, this setup will only re-call the api on hard reload after first call
      next: { revalidate: 120 }, // revalidate every 2 minutes
    });
    const languages = await handleResponse(response);
    // console.log("res", response.headers);
    return { languages };
  } catch (error) {
    return { error: error.message };
  }
};

const getStoreSetting = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    const response = await fetch(`${baseURL}/setting/store-setting`, {
      signal: controller.signal,
      next: { revalidate: 300 }, // revalidate every 5 minutes
    });
    
    clearTimeout(timeoutId);
    const storeSetting = await handleResponse(response);
    return { storeSetting };
  } catch (error) {
    return { error: error.message, storeSetting: null };
  }
};

const getStoreSecretKeys = async () => {
  try {
    const response = await fetch(`${baseURL}/setting/store-setting/keys`, {
      // cache: "force-cache", //if you want to no cache then comment this line, this setup will only re-call the api on hard reload after first call
      next: { revalidate: 120 }, // revalidate every 2 minutes
    });

    const storeSetting = await handleResponse(response);
    // console.log("storeSetting:::>>>", storeSetting);

    return { storeSetting };
  } catch (error) {
    return { error: error.message };
  }
};

const getStoreSeoSetting = async () => {
  try {
    const response = await fetch(`${baseURL}/setting/store-setting/seo`, {
      // cache: "force-cache", //if you want to no cache then comment this line, this setup will only re-call the api on hard reload after first call
      next: { revalidate: 300 }, // revalidate every 5 minutes
    });

    const seoSetting = await handleResponse(response);

    return { seoSetting };
  } catch (error) {
    return { error: error.message };
  }
};

export {
  getGlobalSetting,
  getShowingLanguage,
  getStoreSetting,
  getStoreSeoSetting,
  getStoreSecretKeys,
  getStoreCustomizationSetting,
};
