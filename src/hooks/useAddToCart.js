import { useState } from "react";
import { useCart } from "react-use-cart";
import { useContext } from "react";
import { SidebarContext } from "@context/SidebarContext";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";

import { notifyError, notifySuccess } from "@utils/toast";

const useAddToCart = () => {
  const [item, setItem] = useState(1);
  const { addItem, items, updateItemQuantity, totalItems } = useCart();
  const { setCartDrawerOpen } = useContext(SidebarContext);
  const router = useRouter();
  const pathname = usePathname();
  // console.log('products',products)
  // console.log("items", items);

  const handleAddItem = (product) => {
    // Check if user is authenticated before adding to cart
    const userInfoCookie = Cookies.get("userInfo");
    if (!userInfoCookie) {
      // Redirect to login page with current page as redirectUrl
      router.push(`/auth/otp-login?redirectUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    const result = items.find((i) => i.id === product.id);
    // console.log(
    //   "result in add to",
    //   result,
    //   items,
    //   product.id
    //   // product?.quantity < result?.stock,
    //   // result?.quantity,
    //   // "item",
    //   // item
    // );
    const { variants, categories, description, ...updatedProduct } = product;

    // Explicitly preserve product details (sku, hsn, unit, brand) for order details
    // Also include tax and pricing info for checkout calculations
    const cartItem = {
      ...updatedProduct,
      sku: product.sku,
      hsn: product.hsn,
      unit: product.unit,
      brand: product.brand,
      taxPercent: product.taxPercent || 0,
      taxableRate: product.taxableRate || 0,
      originalPrice: product.prices?.originalPrice || product.originalPrice || product.price,
    };

    if (result !== undefined) {
      if (
        result?.quantity + item <=
        (product?.variants?.length > 0
          ? product?.variant?.quantity
          : product?.stock)
      ) {
        addItem(cartItem, item);
        notifySuccess(`${item} ${product.title} added to cart!`);
        // Cart drawer should only open when user clicks cart icon in navbar
      } else {
        notifyError("Insufficient stock!");
      }
    } else {
      if (
        item <=
        (product?.variants?.length > 0
          ? product?.variant?.quantity
          : product?.stock)
      ) {
        addItem(cartItem, item);
        notifySuccess(`${item} ${product.title} added to cart!`);
        // Cart drawer should only open when user clicks cart icon in navbar
      } else {
        notifyError("Insufficient stock!");
      }
    }
  };

  const handleIncreaseQuantity = (product) => {
    const result = items?.find((p) => p.id === product.id);
    // console.log(
    //   "handleIncreaseQuantity",
    //   product,
    //   result?.quantity + item,
    //   product?.variants?.length > 0
    //     ? product?.variant?.quantity
    //     : product?.stock
    // );
    if (result) {
      if (
        result?.quantity + item <=
        (product?.variants?.length > 0
          ? product?.variant?.quantity
          : product?.stock)
      ) {
        updateItemQuantity(product.id, product.quantity + 1);
      } else {
        notifyError("Insufficient stock!");
      }
    }
  };

  return {
    item,
    setItem,
    totalItems,
    handleAddItem,
    handleIncreaseQuantity,
  };
};

export default useAddToCart;
