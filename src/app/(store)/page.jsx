import { Suspense } from "react";

//internal import
import OfferCard from "@components/offer/OfferCard";
import StickyCart from "@components/cart/StickyCart";
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

const Home = async () => {
  const { attributes } = await getShowingAttributes();
  const { storeCustomizationSetting, error: storeCustomizationError } =
    await getStoreCustomizationSetting();
  const { popularProducts, discountedProducts, error } =
    await getShowingStoreProducts({
      category: "",
      title: "",
    });

  const { globalSetting } = await getGlobalSetting();
  const currency = globalSetting?.default_currency || "$";

  // console.log("storeCustomizationSetting", storeCustomizationSetting);

  return (
    <div className="min-h-screen dark:bg-zinc-900">
      {/* sticky cart section */}
      <StickyCart currency={currency} />

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
        <div className="bg-white dark:bg-zinc-900 lg:py-10 py-6">
          <div className="mx-auto max-w-screen-2xl px-3 sm:px-10">
            <Suspense fallback={<p>Loading feature category...</p>}>
              <FeatureCategory />
            </Suspense>
          </div>
        </div>
      )}

      {/* popular products - with header and carousel */}
      {storeCustomizationSetting?.home?.popular_products_status && (
        <div className="bg-gray-50 dark:bg-zinc-900 lg:py-16 py-10 mx-auto max-w-screen-2xl px-3 sm:px-10">
          {error ? (
            <CMSkeletonTwo
              count={20}
              height={20}
              error={error}
              loading={false}
            />
          ) : (
            <PopularProductsCarousel
              products={popularProducts?.slice(
                0,
                storeCustomizationSetting?.home?.latest_discount_product_limit
              )}
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
