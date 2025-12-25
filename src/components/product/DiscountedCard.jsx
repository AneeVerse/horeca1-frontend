"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { IoAdd, IoExpand, IoBagAdd, IoRemove } from "react-icons/io5";
import { useCart } from "react-use-cart";

//internal import

import { notifyError } from "@utils/toast";
import useAddToCart from "@hooks/useAddToCart";
import { handleLogEvent } from "src/lib/analytics";
import Discount from "@components/common/Discount";
import PriceTwo from "@components/common/PriceTwo";
import Rating from "@components/common/Rating";
import useUtilsFunction from "@hooks/useUtilsFunction";
import ProductModal from "@components/modal/ProductModal";
import ImageWithFallback from "@components/common/ImageWithFallBack";

const DiscountedCard = ({ product, attributes, currency }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const { items, addItem, updateItemQuantity, inCart } = useCart();
  const { handleIncreaseQuantity } = useAddToCart();
  const { showingTranslateValue } = useUtilsFunction();

  // console.log('attributes in product cart',attributes)

  const handleAddItem = (p) => {
    if (p.stock < 1) return notifyError("Insufficient stock!");

    if (p?.variants?.length > 0) {
      setModalOpen(!modalOpen);
      return;
    }
    const { slug, variants, categories, description, ...updatedProduct } =
      product;
    const newItem = {
      ...updatedProduct,
      title: showingTranslateValue(p?.title),
      id: p._id,
      variant: p.prices,
      price: p.prices.price,
      originalPrice: product.prices?.originalPrice,
    };
    addItem(newItem);
  };

  const handleModalOpen = (event, id) => {
    setModalOpen(event);
  };

  return (
    <>
      {modalOpen && (
        <ProductModal
          modalOpen={modalOpen}
          setModalOpen={setModalOpen}
          product={product}
          currency={currency}
          attributes={attributes}
        />
      )}

      <div className="group relative flex flex-col overflow-hidden rounded-xl border bg-white border-gray-100 transition-all duration-100 ease-in-out hover:border-emerald-500 ">
        <div className="w-full flex justify-between">
          <Discount product={product} />
        </div>
        <div className="relative w-full h-48 lg:h-48 xl:h-52">
          <div className="relative block w-full h-full overflow-hidden bg-gray-100">
            <ImageWithFallback
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              alt="product"
              src={product.image?.[0]}
            />
          </div>
          <div className="absolute lg:bottom-0 bottom-4 lg:group-hover:bottom-4 inset-x-1 opacity-100 flex justify-center lg:opacity-0 lg:invisible group-hover:opacity-100 group-hover:visible transition-all">
            <button
              aria-label="quick view"
              onClick={() => {
                handleModalOpen(!modalOpen, product._id);
                handleLogEvent(
                  "product",
                  `opened ${showingTranslateValue(
                    product?.title
                  )} product modal`
                );
              }}
              className="relative h-auto inline-flex items-center cursor-pointer justify-center rounded-full transition-colors text-xs py-2 px-4 bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-300 hover:text-emerald-500 hover:bg-gray-100 dark:hover:bg-slate-800 shadow-lg focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-emerald-600 dark:focus:ring-offset-0"
            >
              <IoExpand />
              <span className="ms-1 hidden xl:block lg:block">Quick View</span>
            </button>
          </div>
          <div className="absolute bottom-3 right-3 z-10 flex items-center justify-center rounded-full bg-white text-gray-700 shadow-lg transition-all duration-300 ease-in-out hover:bg-gray-100 hover:text-emerald-500">
            {inCart(product._id) ? (
              <div>
                {items.map(
                  (item) =>
                    item.id === product._id && (
                      <div
                        key={item.id}
                        className="flex flex-col w-11 h-22 items-center p-1 justify-between bg-emerald-500 text-white ring-2 ring-white rounded-full"
                      >
                        <button
                          onClick={() =>
                            updateItemQuantity(item.id, item.quantity - 1)
                          }
                        >
                          <span className="text-xl cursor-pointer">
                            <IoRemove />
                          </span>
                        </button>
                        <p className="text-sm px-1 font-medium">
                          {item.quantity}
                        </p>
                        <button
                          onClick={() =>
                            item?.variants?.length > 0
                              ? handleAddItem(item)
                              : handleIncreaseQuantity(item)
                          }
                        >
                          <span className="text-lg cursor-pointer">
                            <IoAdd />
                          </span>
                        </button>
                      </div>
                    )
                )}{" "}
              </div>
            ) : (
              <button
                onClick={() => handleAddItem(product)}
                aria-label="cart"
                className="w-11 h-11 flex items-center justify-center rounded-full cursor-pointer border-2 bg-emerald-500 text-white border-gray-10 font-medium transition-colors duration-300 hover:border-accent hover:bg-emerald-600 hover:border-emerald-600 hover:text-gray-50 focus:border-emerald-500 focus:bg-emerald-500 focus:text-gray-50"
              >
                {" "}
                <IoBagAdd className="text-xl" />
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-1 flex-col space-y-2 px-4 pt-2 pb-8">
          <div className="relative mb-1">
            <div className="text-sm font-medium text-gray-800 line-clamp-1">
              {showingTranslateValue(product?.title)}
            </div>
          </div>
          <div className="flex gap-0.5 items-center">
            <Rating
              size="md"
              showReviews={true}
              rating={product?.average_rating}
              totalReviews={product?.total_reviews}
            />
          </div>

          <PriceTwo
            card
            product={product}
            currency={currency}
            price={
              product?.isCombination
                ? product?.variants[0]?.price
                : product?.prices?.price
            }
            originalPrice={
              product?.isCombination
                ? product?.variants[0]?.originalPrice
                : product?.prices?.originalPrice
            }
          />
        </div>
      </div>
    </>
  );
};

export default dynamic(() => Promise.resolve(DiscountedCard), {
  ssr: false,
});
