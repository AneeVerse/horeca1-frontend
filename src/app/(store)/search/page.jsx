//internal import

import SearchScreen from "@components/search/SearchScreen";
import { getShowingAttributes } from "@services/AttributeServices";
import { getShowingCategory } from "@services/CategoryService";
import { getShowingStoreProducts } from "@services/ProductServices";
import { getGlobalSetting } from "@services/SettingServices";
// import Loading from "./loading";

// import { useSearchParams } from "next/navigation";

export async function generateMetadata({ searchParams }) {
  const { _id, query } = await searchParams;

  const { products, error } = await getShowingStoreProducts({
    category: _id ? _id : "",
    title: query ? encodeURIComponent(query) : "",
  });

  const product = products[0];

  return {
    title: `${product?.title?.en || "Search"} | Horeca1`,
    description: product?.description?.en,
    keywords: [product?.tags],
    openGraph: {
      images: [product?.image],
    },
  };
}

const Search = async ({ searchParams }) => {
  //   const searchParams = useSearchParams();

  const { _id, query } = await searchParams;

  const { products, error } = await getShowingStoreProducts({
    category: _id ? _id : "",
    title: query ? encodeURIComponent(query) : "",
  });
  const { attributes } = await getShowingAttributes();
  const { categories } = await getShowingCategory();
  const { globalSetting } = await getGlobalSetting();
  const currency = globalSetting?.default_currency || "$";

  //   console.log("searchParams", searchParams, "query", query, "_id", _id);

  return (
    <>
      <SearchScreen
        products={products}
        attributes={attributes}
        categories={categories}
        currency={currency}
      />
    </>
  );
};

export default Search;
