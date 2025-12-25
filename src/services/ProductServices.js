import { baseURL, handleResponse } from "@services/CommonService";

const getShowingStoreProducts = async ({
  category = "",
  title = "",
  slug = "",
}) => {
  try {
    // console.log("slug::", slug);
    const response = await fetch(
      `${baseURL}/products/store?category=${category}&title=${title}&slug=${slug}`,
      {
        // cache: "no-cache",
        next: {
          revalidate: 60,
          tags: ["store_products"],
        },
      }
    );

    const products = await handleResponse(response);

    return {
      error: null,
      reviews: products.reviews,
      products: products.products,
      relatedProducts: products.relatedProducts,
      popularProducts: products.popularProducts,
      discountedProducts: products.discountedProducts,
    };
  } catch (error) {
    return {
      products: [],
      relatedProducts: [],
      popularProducts: [],
      discountedProducts: [],
      error: error.message,
    };
  }
};

export { getShowingStoreProducts };
