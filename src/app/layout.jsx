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
};

export default async function RootLayout({ children }) {
  // Fetch settings with error handling - use defaults if API fails
  const globalResult = await getGlobalSetting();
  const storeResult = await getStoreSetting();
  const customizationResult = await getStoreCustomizationSetting();

  const globalSetting = globalResult.globalSetting || {};
  const storeSetting = storeResult.storeSetting || {};
  // Merge API response with frontend defaults, ensuring continue_button uses correct value
  const apiCustomization = customizationResult.storeCustomizationSetting || {};
  const storeCustomizationSetting = {
    ...defaultStoreCustomization,
    ...apiCustomization,
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
