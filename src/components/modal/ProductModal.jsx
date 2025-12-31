import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  Minus,
  Plus,
  ShoppingCart,
  X,
} from "lucide-react";

//internal import
import Price from "@components/common/Price";
import Tags from "@components/common/Tags";
import useAddToCart from "@hooks/useAddToCart";
import Discount from "@components/common/Discount";
import VariantList from "@components/variants/VariantList";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Label } from "@components/ui/label";
import Stock from "@components/common/Stock";
import useProductAction from "@hooks/useProductAction";
import ImageWithFallback from "@components/common/ImageWithFallBack";
import {
  FiEye,
  FiMinus,
  FiPlus,
  FiShoppingBag,
} from "react-icons/fi";
import { FaStar } from "react-icons/fa6";
import MainModal from "./MainModal";
import Image from "next/image";
import { notifyError } from "@utils/toast";

const ProductModal = ({
  product,
  modalOpen,
  attributes,
  setModalOpen,
  globalSetting,
}) => {
  const { getNumberTwo, showingTranslateValue } = useUtilsFunction();
  const currency = globalSetting?.default_currency || "₹";
  const { item, setItem, totalItems, handleAddItem, handleIncreaseQuantity } =
    useAddToCart();

  // Check if current time is between 6pm (18:00) and 9am (09:00)
  const [isPromoTime, setIsPromoTime] = useState(false);

  useEffect(() => {
    const checkPromoTime = () => {
      const now = new Date();
      const hours = now.getHours();
      // 6pm (18:00) to midnight (23:59) or midnight (00:00) to 9am (08:59)
      setIsPromoTime(hours >= 18 || hours < 9);
    };
    checkPromoTime();
    const interval = setInterval(checkPromoTime, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const {
    // state
    value,
    setValue,
    price,
    stock,
    discount,
    isReadMore,
    setIsReadMore,
    selectedImage,
    originalPrice,
    setSelectedImage,
    selectVariant,
    setSelectVariant,
    selectVa,
    setSelectVa,
    variantTitle,
    variants,
    category_name,

    // actions
    handleAddToCart,
    handleMoreInfo,
  } = useProductAction({
    product,
    attributes,
    globalSetting,
    onCloseModal: () => setModalOpen(false),
    withRouter: true,
  });

  return (
    <>
      <MainModal
        modalOpen={modalOpen}
        bottomCloseBtn={false}
        handleCloseModal={() => setModalOpen(false)}
      >
        <div className="inline-block overflow-y-auto h-full align-middle transition-all transform">
          <div className="lg:flex flex-col lg:flex-row md:flex-row w-full max-w-4xl overflow-hidden">
            <div className="w-full lg:w-[40%]">
              <div className="flex-shrink-0 flex items-center justify-center h-auto">
                {product.image[0] ? (
                  <Image
                    src={selectedImage || product.image[0]}
                    width={420}
                    height={420}
                    alt="product"
                  />
                ) : (
                  <Image
                    src="https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png"
                    width={420}
                    height={420}
                    alt="product Image"
                  />
                )}
              </div>
            </div>

            <div className="w-full lg:w-[60%] pt-6 lg:pt-0 lg:pl-7 xl:pl-10">
              <div className="mb-2 md:mb-2.5 block -mt-1.5">
                <div
                  className={`${stock <= 0 ? "relative py-1 mb-2" : "relative"
                    }`}
                >
                  <Stock In stock={stock} />
                </div>
                <h2 className="text-heading text-lg md:text-xl lg:text-xl font-medium">
                  {showingTranslateValue(product?.title)}
                </h2>
              </div>
              <p className="text-sm leading-6 text-gray-500 md:leading-6">
                {showingTranslateValue(product?.description)}
              </p>
              <div className="flex items-center my-4">
                <Price
                  price={price}
                  product={product}
                  currency={currency}
                  originalPrice={originalPrice}
                />
                <span className="ml-2">
                  <Discount slug product={product} discount={discount} />
                </span>
              </div>

              {/* Bulk Pricing Display - Always show regular bulk pricing */}
              {product?.bulkPricing && (product?.bulkPricing?.bulkRate1?.quantity > 0 || product?.bulkPricing?.bulkRate2?.quantity > 0) && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4 space-y-2">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Bulk Pricing</h4>
                  {product?.bulkPricing?.bulkRate1?.quantity > 0 && product?.bulkPricing?.bulkRate1?.pricePerUnit > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-primary-600 font-medium">
                        Buy {product.bulkPricing.bulkRate1.quantity}+ {product.unit || "units"}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-primary-700">
                          {currency}{product.bulkPricing.bulkRate1.pricePerUnit}/{product.unit || "unit"}
                        </span>
                        <button
                          onClick={() => {
                            setItem(product.bulkPricing.bulkRate1.quantity);
                          }}
                          className="text-xs font-semibold text-white bg-[#018549] hover:bg-[#016d3b] px-3 py-1 rounded transition-colors"
                        >
                          Add {product.bulkPricing.bulkRate1.quantity}
                        </button>
                      </div>
                    </div>
                  )}
                  {product?.bulkPricing?.bulkRate2?.quantity > 0 && product?.bulkPricing?.bulkRate2?.pricePerUnit > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-primary-600 font-medium">
                        Buy {product.bulkPricing.bulkRate2.quantity}+ {product.unit || "units"}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-primary-700">
                          {currency}{product.bulkPricing.bulkRate2.pricePerUnit}/{product.unit || "unit"}
                        </span>
                        <button
                          onClick={() => {
                            setItem(product.bulkPricing.bulkRate2.quantity);
                          }}
                          className="text-xs font-semibold text-white bg-[#018549] hover:bg-[#016d3b] px-3 py-1 rounded transition-colors"
                        >
                          Add {product.bulkPricing.bulkRate2.quantity}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Promo Bulk Pricing Display (6pm-9am) - Always show Happy Hour teaser */}
              {product?.promoPricing && (product?.promoPricing?.singleUnit > 0 || product?.promoPricing?.bulkRate1?.quantity > 0 || product?.promoPricing?.bulkRate2?.quantity > 0) && (
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-3 mb-4 space-y-2 border border-primary-200/50">
                  <h4 className="text-sm font-semibold text-primary-700 mb-2 flex items-center gap-2">
                    <span className="text-xs font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-400 px-2 py-0.5 rounded">PROMO</span>
                    Happy Hour Pricing (6pm - 9am)
                  </h4>
                  {product?.promoPricing?.singleUnit > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-primary-600 font-medium">
                        Single Unit Price
                      </span>
                      <span className="text-sm font-bold text-primary-700">
                        {currency}{product.promoPricing.singleUnit}/{product.unit || "unit"}
                      </span>
                    </div>
                  )}
                  {product?.promoPricing?.bulkRate1?.quantity > 0 && product?.promoPricing?.bulkRate1?.pricePerUnit > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-primary-600 font-medium">
                        Buy {product.promoPricing.bulkRate1.quantity}+ {product.unit || "units"}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-primary-700">
                          {currency}{product.promoPricing.bulkRate1.pricePerUnit}/{product.unit || "unit"}
                        </span>
                        <button
                          onClick={() => {
                            if (!isPromoTime) {
                              return notifyError("Come at 6pm to get this offer!");
                            }
                            setItem(product.promoPricing.bulkRate1.quantity);
                          }}
                          className="text-xs font-semibold text-white bg-[#018549] hover:bg-[#016d3b] px-3 py-1 rounded transition-colors"
                        >
                          Add {product.promoPricing.bulkRate1.quantity}
                        </button>
                      </div>
                    </div>
                  )}
                  {product?.promoPricing?.bulkRate2?.quantity > 0 && product?.promoPricing?.bulkRate2?.pricePerUnit > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-primary-600 font-medium">
                        Buy {product.promoPricing.bulkRate2.quantity}+ {product.unit || "units"}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-primary-700">
                          {currency}{product.promoPricing.bulkRate2.pricePerUnit}/{product.unit || "unit"}
                        </span>
                        <button
                          onClick={() => {
                            if (!isPromoTime) {
                              return notifyError("Come at 6pm to get this offer!");
                            }
                            setItem(product.promoPricing.bulkRate2.quantity);
                          }}
                          className="text-xs font-semibold text-white bg-[#018549] hover:bg-[#016d3b] px-3 py-1 rounded transition-colors"
                        >
                          Add {product.promoPricing.bulkRate2.quantity}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mb-6">
                {variantTitle?.map((a, i) => (
                  <span key={a._id} className="mb-2 block">
                    <h4 className="text-sm py-1 text-gray-800 font-medium">
                      {showingTranslateValue(a?.name)}:
                    </h4>
                    <VariantList
                      att={a._id}
                      option={a.option}
                      setValue={setValue}
                      varTitle={variantTitle}
                      variants={product?.variants}
                      setSelectVa={setSelectVa}
                      selectVariant={selectVariant}
                      setSelectVariant={setSelectVariant}
                    />
                  </span>
                ))}
              </div>

              <div className="flex items-center mt-4">
                <div className="w-full grid lg:grid-cols-3 sm:grid-cols-3 gap-3">
                  <div className="group flex items-center justify-between rounded-md overflow-hidden flex-shrink-0 border border-gray-300">
                    <button
                      onClick={() => setItem(item - 1)}
                      disabled={item === 1}
                      className="flex items-center cursor-pointer justify-center py-2 px-4 h-full flex-shrink-0 transition ease-in-out duration-300 focus:outline-none w-8 md:w-12 text-heading border-e border-gray-300 hover:text-gray-500"
                    >
                      <span className="text-dark text-xl">
                        <FiMinus />
                      </span>
                    </button>
                    <p className="font-semibold text-sm">{item}</p>
                    <button
                      onClick={() => setItem(item + 1)}
                      disabled={
                        product.quantity < item || product.quantity === item
                      }
                      className="flex items-center cursor-pointer justify-center py-2 px-4 h-full flex-shrink-0 transition ease-in-out duration-300 focus:outline-none w-8 md:w-12 text-heading border-s border-gray-300 hover:text-gray-500"
                    >
                      <span className="text-dark text-xl">
                        <FiPlus />
                      </span>
                    </button>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.quantity < 1}
                    className="w-full text-sm flex items-center cursor-pointer transition ease-in-out duration-300 font-semibold text-center justify-center border-0 border-transparent rounded-md focus-visible:outline-none focus:outline-none text-white py-2 px-4 hover:text-white bg-[#018549] hover:bg-[#016d3b]"
                  >
                    <FiShoppingBag className="mr-2" />
                    Add to cart
                  </button>
                </div>
              </div>
              <div className="flex items-center mt-4">
                <div className="flex items-center justify-between space-s-3 sm:space-s-4 w-full">
                  <div>
                    <span className=" font-semibold py-1 text-sm d-block">
                      <span className="text-gray-700">Category</span>{" "}
                      <Link
                        href={`/search?category=${category_name}&_id=${product?.category?._id}`}
                        className="cursor-pointer"
                      >
                        <button
                          type="button"
                          className="text-gray-600 font-medium ml-2 hover:text-teal-600"
                          onClick={() => setIsLoading(!isLoading)}
                        >
                          {category_name}
                        </button>
                      </Link>
                    </span>

                    <Tags product={product} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainModal>
    </>
  );
};

export default ProductModal;

