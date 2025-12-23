import Image from "next/image";

//internal import
import CMSkeletonTwo from "@components/preloader/CMSkeleton";
import { getShowingCategory } from "@services/CategoryService";
import CategoryNavigateButton from "@components/category/CategoryNavigateButton";

const FeatureCategory = async () => {
  const { categories, error } = await getShowingCategory();

  return (
    <>
      {error ? (
        <CMSkeletonTwo count={10} height={20} error={error} loading={false} />
      ) : (
        <ul className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10 gap-2 md:gap-3 lg:gap-4">
          {(categories[0]?.children || []).map((category, i) => (
            <li className="group" key={i + 1}>
              <div className="flex flex-col items-center w-full cursor-pointer transition duration-200 ease-linear group-hover:-translate-y-1">
                {/* Image Section - Rounded light bg like Blinkit */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden mb-2 group-hover:shadow-md transition-shadow">
                  {category.icon ? (
                    <Image
                      src={category.icon}
                      alt={category.name || "category"}
                      width={100}
                      height={100}
                      className="object-contain p-1"
                    />
                  ) : (
                    <Image
                      src="https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png"
                      alt="category"
                      width={80}
                      height={80}
                      className="object-contain p-1"
                    />
                  )}
                </div>
                {/* Text Below - No box, just text */}
                <CategoryNavigateButton
                  className="flex flex-col items-center text-center w-full"
                  showChildren={false}
                  textOnly={true}
                  category={{
                    ...category,
                    name: category.name,
                    description: category.description,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default FeatureCategory;
