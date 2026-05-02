import CheckoutCartScreen from "@components/checkout/CheckoutCartScreen";
import React from "react";

// Allow up to 5 min for payment Server Actions (Vercel Pro max)
export const maxDuration = 300;

export const metadata = {
  title: "Checkout Cart | Horeca1",
  description:
    "Get in touch with us! Find our contact information and fill out our contact form.",
  keywords: ["contact", "email", "phone", "location"],
  // You can also add more advanced metadata here
  openGraph: {
    title: "Checkout Cart | Horeca1",
    description:
      "Get in touch with us! Find our contact information and fill out our contact form.",
    url: "https://Horeca1-store-nine.vercel.app/faq",
    images: [
      {
        url: "https://Horeca1-store-nine.vercel.app/og-image.jpg",
        width: 800,
        height: 600,
        alt: "Checkout Cart Page",
      },
    ],
  },
};

const CheckoutCart = async () => {
  return (
    <div className="">
      <CheckoutCartScreen />
    </div>
  );
};

export default CheckoutCart;

