import { getOrderById } from "@services/OrderServices";
import DownloadPrintButton from "@components/invoice/DownloadPrintButton";
import { getStoreCustomizationSetting } from "@services/SettingServices";

// Allow up to 5 min for Server Actions (Vercel Pro max)
export const maxDuration = 300;

const Order = async ({ params }) => {
  const { id } = await params;
  const { data, error } = await getOrderById({ id });
  const { storeCustomizationSetting } = await getStoreCustomizationSetting();
  // console.log("params", params);

  return (
    <>
      <div className="max-w-screen-2xl mx-auto py-10 px-3 sm:px-6">
        <DownloadPrintButton
          data={data}
          storeCustomizationSetting={storeCustomizationSetting}
        />
      </div>
    </>
  );
};

export default Order;
