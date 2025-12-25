import Link from "next/link";
import { useCart } from "react-use-cart";
import { FiPlus, FiMinus, FiTrash2 } from "react-icons/fi";

//internal import
import useAddToCart from "@hooks/useAddToCart";
import ImageWithFallback from "@components/common/ImageWithFallBack";

const CartItem = ({ item, currency }) => {
  const { updateItemQuantity, removeItem } = useCart();
  const { handleIncreaseQuantity } = useAddToCart();

  // console.log("item>>", item);

  return (
    <div className="group w-full h-auto flex justify-start items-center py-4 transition-all relative border-b border-gray-200 last:border-b-0">
      <div className="relative flex overflow-hidden flex-shrink-0 cursor-pointer mr-4 w-20 h-20">
        <ImageWithFallback
          img
          width={80}
          height={80}
          src={item.image}
          alt={item.title}
          className="w-full h-full flex-none rounded-md bg-gray-100 object-contain"
        />
      </div>
      <div className="flex flex-col w-full overflow-hidden">
        <div className="flex">
          <div className="min-w-0 flex-1">
            <Link
              href={`/product/${item.slug}`}
              // onClick={closeCartDrawer}
              className="truncate text-sm font-medium text-gray-700 text-heading line-clamp-1"
            >
              {item.title}
            </Link>
            <span className="text-xs text-gray-400 mb-1">
              Item Price {currency}{item.price}
            </span>
          </div>
          <div className="ml-4 flow-root shrink-0">
            <button
              onClick={() => removeItem(item.id)}
              className="hover:text-red-600 text-red-400 text-lg cursor-pointer"
            >
              <FiTrash2 />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="font-bold text-teal-600 hover:text-teal-700 text-sm md:text-base text-heading leading-5">
            <span>
              {currency}
              {(item.price * item.quantity).toFixed(2)}
            </span>
          </div>

          <div className="h-8 w-22 md:w-24 lg:w-24 flex flex-wrap items-center justify-evenly p-1 border border-gray-100 bg-white text-gray-600 rounded-full">
            <button
              onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
            >
              <span className="text-dark text-base cursor-pointer hover:bg-gray-100">
                <FiMinus />
              </span>
            </button>
            <p className="text-sm font-semibold text-dark px-1">
              {item.quantity}
            </p>
            <button onClick={() => handleIncreaseQuantity(item)}>
              <span className="text-dark text-base cursor-pointer hover:bg-gray-100">
                <FiPlus />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
