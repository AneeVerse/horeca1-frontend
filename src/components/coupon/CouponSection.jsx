"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import dayjs from "dayjs";
import { Tag, Clock, Gift } from "lucide-react";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { baseURL } from "@services/CommonService";

const CouponSection = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState("₹");
  const { showingTranslateValue } = useUtilsFunction();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch coupons
        const couponRes = await fetch(`${baseURL}/coupon/show`);
        const couponData = await couponRes.json();
        setCoupons(couponData || []);

        // Fetch settings
        const settingRes = await fetch(`${baseURL}/setting/global/all`);
        const settingData = await settingRes.json();
        setCurrency(settingData?.default_currency || "₹");
      } catch (error) {
        console.error("Error fetching coupons:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-full">
        <div className="bg-gray-50 h-full border-2 border-orange-500 rounded-lg shadow animate-pulse">
          <div className="bg-orange-100 px-6 py-3 rounded-t border-b">
            <div className="h-5 bg-orange-200 rounded w-3/4 mx-auto"></div>
          </div>
          <div className="p-4 space-y-4">
            <div className="bg-white rounded-md p-4 h-24"></div>
            <div className="bg-white rounded-md p-4 h-24"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div className="bg-gray-50 h-full border-2 border-orange-500 transition duration-150 ease-linear hover:border-emerald-500 rounded-xl shadow overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-100 to-amber-100 px-4 py-3 border-b border-orange-200">
          <div className="flex items-center justify-center gap-2">
            <Gift className="w-5 h-5 text-orange-600" />
            <h3 className="text-base font-semibold text-gray-800">
              Active Discount Coupons
            </h3>
          </div>
        </div>

        {/* Coupons List */}
        <div className="p-3 space-y-3 overflow-y-auto max-h-[320px]">
          {coupons?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Tag className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p>No active coupons available</p>
            </div>
          ) : (
            coupons?.slice(0, 2).map((coupon) => {
              const isExpired = dayjs().isAfter(dayjs(coupon.endTime));
              
              return (
                <div
                  key={coupon._id}
                  className={`bg-white rounded-lg shadow-sm border ${
                    isExpired ? "border-gray-200 opacity-60" : "border-emerald-100"
                  } overflow-hidden`}
                >
                  <div className="flex items-start gap-3 p-3">
                    {/* Coupon Logo */}
                    {coupon.logo && (
                      <div className="flex-shrink-0">
                        <Image
                          src={coupon.logo}
                          width={60}
                          height={60}
                          className="rounded-lg object-cover"
                          alt={showingTranslateValue(coupon.title) || "Coupon"}
                        />
                      </div>
                    )}

                    {/* Coupon Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-lg font-bold ${isExpired ? "text-gray-400" : "text-emerald-600"}`}>
                          {coupon?.discountType?.type === "fixed"
                            ? `${currency}${coupon?.discountType?.value}`
                            : `${coupon?.discountType?.value}%`}
                        </span>
                        <span className="text-sm text-gray-600">Off</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            isExpired
                              ? "bg-red-100 text-red-600"
                              : "bg-emerald-100 text-emerald-600"
                          }`}
                        >
                          {isExpired ? "Expired" : "Active"}
                        </span>
                      </div>

                      <h4 className="text-sm font-medium text-gray-800 truncate mb-1">
                        {showingTranslateValue(coupon?.title)}
                      </h4>

                      {/* Timer */}
                      {!isExpired && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                          <Clock className="w-3 h-3" />
                          <span>
                            Expires: {dayjs(coupon.endTime).format("MMM DD, YYYY")}
                          </span>
                        </div>
                      )}

                      {/* Coupon Code */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-emerald-50 border border-dashed border-emerald-300 rounded px-2 py-1">
                          <code className="text-sm font-semibold text-emerald-700">
                            {coupon.couponCode}
                          </code>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(coupon.couponCode);
                          }}
                          className="text-xs px-2 py-1 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors"
                        >
                          Copy
                        </button>
                      </div>

                      <p className="text-xs text-gray-400 mt-1">
                        Min. order: {currency}{coupon.minimumAmount}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default CouponSection;





