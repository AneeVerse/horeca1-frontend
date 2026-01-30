import dayjs from "dayjs";
import React from "react";
import Link from "next/link";

//internal import
import useUtilsFunction from "@hooks/useUtilsFunction";
import ImageWithFallback from "@components/common/ImageWithFallBack";

const Invoice = ({ data, printRef, globalSetting }) => {
  const currency = globalSetting?.default_currency || "₹";
  const { getNumberTwo } = useUtilsFunction();

  // Calculate GST breakdown (same logic as checkout pricingBreakdown)
  const pricingBreakdown = React.useMemo(() => {
    let totalGst = 0;
    let taxableSubtotal = 0;

    (data?.cart || []).forEach(item => {
      const quantity = item.quantity || 1;
      const taxPercent = parseFloat(item.taxPercent) || 0;
      const itemCurrentPriceGross = parseFloat(item.price) || 0;
      const itemGrossTotal = itemCurrentPriceGross * quantity;

      let itemTaxableAmount, itemGstAmount;
      if (item.taxableRate && item.taxableRate > 0) {
        itemTaxableAmount = item.taxableRate * quantity;
        itemGstAmount = itemGrossTotal - itemTaxableAmount;
      } else {
        itemTaxableAmount = itemGrossTotal / (1 + taxPercent / 100);
        itemGstAmount = itemGrossTotal - itemTaxableAmount;
      }
      taxableSubtotal += itemTaxableAmount;
      totalGst += itemGstAmount;
    });

    return {
      taxableSubtotal: data?.taxableSubtotal !== undefined ? data.taxableSubtotal : taxableSubtotal,
      totalGst: data?.totalGst !== undefined ? data.totalGst : totalGst,
    };
  }, [data]);

  // Status badge helper
  const getStatusBadge = (status) => {
    const statusStyles = {
      "Delivered": "text-green-600",
      "POS-Completed": "text-green-600",
      "Pending": "text-orange-500",
      "Cancel": "text-red-500",
      "Processing": "text-indigo-500",
      "Deleted": "text-red-700",
    };
    return statusStyles[status] || "text-gray-600";
  };

  return (
    <div ref={printRef} className="bg-white max-w-4xl mx-auto print:max-w-none print:mx-0">
      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:break-inside-avoid { break-inside: avoid; }
          .print\\:text-xs { font-size: 10px !important; }
        }
      `}</style>

      {/* Header Section */}
      <div className="bg-indigo-50 p-6 print:p-4">
        <div className="flex justify-between items-start border-b border-gray-200 pb-4">
          <div>
            <h1 className="font-bold text-2xl uppercase print:text-xl">Invoice</h1>
            <p className="text-gray-700 mt-1">
              Status: <span className={getStatusBadge(data?.status)}>{data?.status}</span>
            </p>
          </div>
          <div className="text-right">
            <img
              className="h-10 w-auto ml-auto print:h-8"
              src="https://res.cloudinary.com/dezs8ma9n/image/upload/v1766484997/horecaLogo_hirtnv.png"
              alt="horeca1"
            />
            <p className="text-sm text-gray-700 font-semibold mt-2">
              {globalSetting?.company_name || "HCX Global Pvt. Ltd."}
            </p>
            <p className="text-xs text-gray-500 max-w-[200px] print:max-w-[150px]">
              {globalSetting?.address || "C-003, Station Complex, Sanpada, Navi Mumbai - 400705"}
            </p>
            <p className="text-xs text-gray-500">
              GST: {globalSetting?.vat_number || "27AAJCH7899F1ZC"}
            </p>
          </div>
        </div>

        {/* Invoice Details Row */}
        <div className="grid grid-cols-3 gap-4 pt-4 text-sm print:text-xs">
          <div>
            <p className="text-gray-500 font-medium">DATE</p>
            <p className="text-gray-800">{dayjs(data?.createdAt).format("MMMM D, YYYY")}</p>
          </div>
          <div>
            <p className="text-gray-500 font-medium">INVOICE NO.</p>
            <p className="text-gray-800">#{data?.invoice}</p>
          </div>
          <div>
            <p className="text-gray-500 font-medium">INVOICE TO</p>
            <p className="text-gray-800 font-medium">{data?.user_info?.name}</p>
            <p className="text-gray-600 text-xs">{data?.user_info?.contact}</p>
            <p className="text-gray-600 text-xs">{data?.user_info?.address}</p>
            <p className="text-gray-600 text-xs">
              {data?.user_info?.city}, {data?.user_info?.zipCode}
            </p>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="px-6 py-4 print:px-4 print:py-2">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-xs uppercase text-gray-600">
              <th className="py-2 px-2 text-left w-10 print:w-8">Sr.</th>
              <th className="py-2 px-2 text-left">Product Name</th>
              <th className="py-2 px-2 text-center w-20 print:w-16">Qty</th>
              <th className="py-2 px-2 text-center w-24 print:w-20">Price</th>
              <th className="py-2 px-2 text-right w-24 print:w-20">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data?.cart?.map((item, i) => (
              <tr key={i} className="print:break-inside-avoid">
                <td className="py-2 px-2 text-sm text-gray-600 print:text-xs">{i + 1}</td>
                <td className="py-2 px-2">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 shrink-0 rounded border border-gray-200 overflow-hidden print:w-8 print:h-8">
                      <ImageWithFallback
                        img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-sm text-gray-700 print:text-xs">{item.title}</span>
                  </div>
                </td>
                <td className="py-2 px-2 text-sm text-center text-gray-600 print:text-xs">{item.quantity}</td>
                <td className="py-2 px-2 text-sm text-center text-gray-600 print:text-xs">
                  {currency}{getNumberTwo(item.price)}
                </td>
                <td className="py-2 px-2 text-sm text-right font-medium text-gray-700 print:text-xs">
                  {currency}{getNumberTwo(item.itemTotal || item.price * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Section */}
      <div className="bg-emerald-50 p-6 print:p-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 print:gap-2">
          {/* Left - Payment Info */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm print:text-xs">
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-medium text-gray-800">{data?.paymentMethod || "RazorPay"}</span>
            </div>
            <div className="flex justify-between text-sm print:text-xs">
              <span className="text-gray-600">Shipping:</span>
              <span className="font-medium text-green-600">FREE</span>
            </div>
            {data?.discount > 0 && (
              <div className="flex justify-between text-sm print:text-xs">
                <span className="text-gray-600">Discount:</span>
                <span className="font-medium text-red-500">-{currency}{getNumberTwo(data?.discount)}</span>
              </div>
            )}
          </div>

          {/* Right - Totals */}
          <div className="space-y-2 text-right">
            <div className="flex justify-between text-sm print:text-xs">
              <span className="text-gray-600">Item Total:</span>
              <span className="font-medium text-gray-800">{currency}{getNumberTwo(pricingBreakdown.taxableSubtotal)}</span>
            </div>
            <div className="flex justify-between text-sm print:text-xs">
              <span className="text-gray-600">+ GST:</span>
              <span className="font-medium text-gray-800">{currency}{getNumberTwo(pricingBreakdown.totalGst)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2 print:text-base">
              <span className="text-gray-700">Total:</span>
              <span className="text-red-500">{currency}{getNumberTwo(data?.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
