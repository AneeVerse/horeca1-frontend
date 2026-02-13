//internal imports
import React from "react";
import "@styles/custom.css";
import Providers from "./provider";
import {
  getStoreSetting,
  getGlobalSetting,
  getStoreCustomizationSetting,
} from "@services/SettingServices";

import { SettingProvider } from "@context/SettingContext";
import { storeCustomization as defaultStoreCustomization } from "@utils/storeCustomizationSetting";

// Force dynamic rendering to avoid long static generation during builds
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "horeca1 - Grocery & Food Store",
  description: "horeca1 passwordless grocery store",
  icons: {
    icon: "/logo/favicon.webp",
    shortcut: "/logo/favicon.webp",
    apple: "/logo/favicon.webp",
  },
  verification: {
    google: "tWfkp4bYQ-gZK6R1jQiFC31kWXzJyOK_MvkrhF_J_iI",
  },
};

export default async function RootLayout({ children }) {
  // Fetch settings in parallel with error handling - use defaults if API fails
  const [globalResult, storeResult, customizationResult] = await Promise.allSettled([
    getGlobalSetting(),
    getStoreSetting(),
    getStoreCustomizationSetting(),
  ]);

  // Extract results with fallbacks
  const globalSetting = globalResult.status === 'fulfilled' && globalResult.value?.globalSetting ? globalResult.value.globalSetting : {};
  const storeSetting = storeResult.status === 'fulfilled' && storeResult.value?.storeSetting ? storeResult.value.storeSetting : {};
  const apiCustomization = customizationResult.status === 'fulfilled' && customizationResult.value?.storeCustomizationSetting ? customizationResult.value.storeCustomizationSetting : {};

  // Deep merge to ensure API values override defaults, especially for nested objects like home
  const storeCustomizationSetting = {
    ...defaultStoreCustomization,
    ...apiCustomization,
    // Deep merge for home to ensure API values take precedence
    home: {
      ...defaultStoreCustomization.home,
      ...apiCustomization.home,
      // Ensure API values override defaults for these specific fields - check if API has the nested .en property
      quick_delivery_subtitle: (apiCustomization.home?.quick_delivery_subtitle?.en || apiCustomization.home?.quick_delivery_subtitle)
        ? apiCustomization.home.quick_delivery_subtitle
        : defaultStoreCustomization.home.quick_delivery_subtitle,
      quick_delivery_description: (apiCustomization.home?.quick_delivery_description?.en || apiCustomization.home?.quick_delivery_description)
        ? apiCustomization.home.quick_delivery_description
        : defaultStoreCustomization.home.quick_delivery_description,
    },
    // Ensure checkout.continue_button always uses the correct value
    checkout: {
      ...defaultStoreCustomization.checkout,
      ...apiCustomization.checkout,
      continue_button: {
        en: "Continue Shopping",
        de: apiCustomization.checkout?.continue_button?.de || defaultStoreCustomization.checkout.continue_button.de,
      },
    },
  };

  return (
    <html lang="en" className="" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="bg-white antialiased dark:bg-zinc-900"
      >
        <div>
          <SettingProvider
            initialGlobalSetting={globalSetting}
            initialStoreSetting={storeSetting}
            initialCustomizationSetting={storeCustomizationSetting}
          >
            <Providers storeSetting={storeSetting}>
              {children}
            </Providers>
          </SettingProvider>
        </div>
      </body>
    </html>
  );
}

