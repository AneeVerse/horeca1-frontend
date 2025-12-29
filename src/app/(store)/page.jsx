import { Suspense } from "react";

//internal import
import OfferCard from "@components/offer/OfferCard";
import MainCarousel from "@components/carousel/MainCarousel";
import CMSkeletonTwo from "@components/preloader/CMSkeleton";
import FeatureCategory from "@components/category/FeatureCategory";
import { getShowingStoreProducts } from "@services/ProductServices";
import { getShowingAttributes } from "@services/AttributeServices";
import {
  getGlobalSetting,
  getStoreCustomizationSetting,
} from "@services/SettingServices";
import DiscountedCard from "@components/product/DiscountedCard";
import PopularProductsCarousel from "@components/product/PopularProductsCarousel";
import CategoryProductsSection from "@components/product/CategoryProductsSection";
import { getShowingCategory } from "@services/CategoryService";
import { showingTranslateValue } from "@lib/translate";

const Home = async () => {
  // Fetch all data in parallel with error handling
  const [attributesResult, customizationResult, productsResult, globalResult, categoriesResult] = await Promise.allSettled([
    getShowingAttributes(),
    getStoreCustomizationSetting(),
    getShowingStoreProducts({ category: "", title: "" }),
    getGlobalSetting(),
    getShowingCategory(),
  ]);

  // Extract results with fallbacks
  const { attributes } = attributesResult.status === 'fulfilled' ? attributesResult.value : { attributes: [] };
  const { storeCustomizationSetting, error: storeCustomizationError } = customizationResult.status === 'fulfilled' ? customizationResult.value : { storeCustomizationSetting: null, error: null };
  const { popularProducts = [], discountedProducts = [], error } = productsResult.status === 'fulfilled' ? productsResult.value : { popularProducts: [], discountedProducts: [], error: null };
  const { globalSetting } = globalResult.status === 'fulfilled' ? globalResult.value : { globalSetting: null };
  const { categories: allCategories } = categoriesResult.status === 'fulfilled' ? categoriesResult.value : { categories: [] };
  
  const currency = globalSetting?.default_currency || "₹";

  // Get top 3 categories in order (already sorted by order field from backend)
  const topCategories = (allCategories[0]?.children || []).filter(cat => cat && cat._id).slice(0, 3);
  
  // Fetch products for top 3 categories (in order, show even if no products)
  const productsByCategory = {};
  
  for (const category of topCategories) {
    try {
      const categoryProducts = await getShowingStoreProducts({ 
        category: category._id, 
        title: "" 
      });
      productsByCategory[category._id] = categoryProducts.products?.slice(0, 20) || [];
    } catch (err) {
      productsByCategory[category._id] = [];
    }
  }

  // console.log("storeCustomizationSetting", storeCustomizationSetting);

  return (
    <div className="min-h-screen dark:bg-zinc-900">
      <div className="bg-white dark:bg-zinc-900">
        <div className="mx-auto py-5 max-w-screen-2xl px-3 sm:px-10">
          <div className="flex flex-col lg:flex-row w-full gap-4 lg:gap-6">
            {/* Home page main carousel */}
            <div className="flex-shrink-0 xl:pr-6 lg:block w-full lg:w-3/5">
              <Suspense fallback={<p>Loading carousel...</p>}>
                <MainCarousel />
              </Suspense>
            </div>
            {/* Coupon Offer Card */}
            <div className="w-full lg:w-2/5 flex">
              <Suspense fallback={<p>Loading coupons...</p>}>
                <OfferCard />
              </Suspense>
            </div>
          </div>

          {/* Banner - Hidden per user request */}
        </div>
      </div>

      {/* feature category's */}
      {storeCustomizationSetting?.home?.featured_status && (
        <div className="bg-white dark:bg-zinc-900 lg:pt-4 lg:pb-4 pt-2 pb-3">
          <div className="mx-auto max-w-screen-2xl px-3 sm:px-10">
            <Suspense fallback={<p>Loading feature category...</p>}>
              <FeatureCategory />
            </Suspense>
          </div>
        </div>
      )}

      {/* Category-based products sections */}
      {storeCustomizationSetting?.home?.popular_products_status && topCategories.length > 0 && (
        <div className="bg-gray-50 dark:bg-zinc-900 lg:pt-4 lg:pb-16 pt-3 pb-10 mx-auto max-w-screen-2xl px-3 sm:px-10">
          {error ? (
            <CMSkeletonTwo
              count={20}
              height={20}
              error={error}
              loading={false}
            />
          ) : (
            <CategoryProductsSection
              categories={topCategories}
              productsByCategory={productsByCategory}
              attributes={attributes}
              currency={currency}
            />
          )}
        </div>
      )}

      {/* discounted products */}
      {storeCustomizationSetting?.home?.discount_product_status &&
        discountedProducts?.length > 0 && (
          <div
            id="discount"
            className="bg-gray-50 dark:bg-zinc-800 lg:py-16 py-10 mx-auto max-w-screen-2xl px-3 sm:px-10"
          >
            <div className="mb-10 flex justify-center">
              <div className="text-center w-full lg:w-2/5">
                <h2 className="text-xl lg:text-2xl mb-2  font-semibold">
                  <CMSkeletonTwo
                    count={1}
                    height={30}
                    loading={false}
                    error={storeCustomizationError}
                    data={
                      storeCustomizationSetting?.home?.latest_discount_title
                    }
                  />
                </h2>
                <p className="text-base font-sans text-gray-600 leading-6">
                  <CMSkeletonTwo
                    count={5}
                    height={20}
                    loading={false}
                    error={storeCustomizationError}
                    data={
                      storeCustomizationSetting?.home
                        ?.latest_discount_description
                    }
                  />
                </p>
              </div>
            </div>
            <div className="flex">
              <div className="w-full">
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-3 md:gap-4 lg:gap-4">
                  {discountedProducts
                    ?.slice(
                      0,
                      storeCustomizationSetting?.home?.popular_product_limit
                    )
                    .map((product) => (
                      <DiscountedCard
                        key={product._id}
                        product={product}
                        currency={currency}
                        attributes={attributes}
                      />
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default Home;
