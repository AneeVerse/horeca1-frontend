import React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

//internal imports

import { getUserServerSession } from "@lib/auth-server";
import { getShippingAddress, getCustomerById } from "@services/CustomerServices";

const MyAccount = async () => {
  const sessionUser = await getUserServerSession();
  
  // Get customer ID - check both id and _id (session might use either)
  const customerId = sessionUser?.id || sessionUser?._id || sessionUser?.user?._id || sessionUser?.user?.id;
  
  // Fetch fresh customer data from database instead of relying on session
  const { customer, error: customerError } = customerId 
    ? await getCustomerById(customerId)
    : { customer: null, error: null };
  
  // #region agent log
  const fs = require('fs');
  const logPath = 'c:\\Users\\Roger\\Desktop\\horeca1\\kachabazar\\.cursor\\debug.log';
  try {
    fs.appendFileSync(logPath, JSON.stringify({location:'my-account/page.jsx:17',message:'Fetched customer data',data:{customerId,customerName:customer?.name,customerEmail:customer?.email,customerPhone:customer?.phone,hasCustomer:!!customer},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})+'\n');
  } catch(e) {}
  // #endregion
  
  // Use customer data from database if available, otherwise fall back to session
  const userInfo = customer || sessionUser;
  
  const { shippingAddress, error } = await getShippingAddress({
    id: customerId || userInfo?.id || userInfo?._id,
  });
  // console.log("shippingAddress", shippingAddress);

  const hasShippingAddress =
    shippingAddress && Object.keys(shippingAddress).length > 0;

  // console.log("error", error);

  // const defaultAddress = error ? [] : shippingAddress[0];

  return (
    <div className="overflow-hidden">
      <div className="grid gap-4 mb-8 sm:grid-cols-2 grid-cols-1">
        {/* User Info Card */}
        <div className="flex h-full relative">
          <div className="flex items-center border border-gray-200 w-full rounded-lg p-4 relative">
            <Link
              href="/user/update-profile"
              className="absolute top-2 right-2 bg-cyan-600 text-white px-3 py-1 rounded hover:bg-cyan-700"
            >
              Edit
            </Link>
            <div className="flex items-center justify-center rounded-full text-xl text-center mr-4 bg-gray-200">
              {userInfo?.image ? (
                <img
                  src={userInfo.image}
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-full bg-gray-50"
                  alt={userInfo?.name[0]}
                />
              ) : (
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gray-200 text-xl font-bold text-center mr-4">
                  {userInfo?.name?.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h5 className="leading-none mb-2 text-base font-medium text-gray-700">
                {userInfo?.name || (userInfo?.phone ? `+91 ${userInfo.phone.slice(-4).padStart(userInfo.phone.length - 4, 'X')}` : "User")}
              </h5>
              <p className="text-sm text-gray-500">{userInfo?.email || "N/A"}</p>
              <p className="text-sm text-gray-500">{userInfo?.phone ? `+91 ${userInfo.phone}` : "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Shipping Address Card */}
        {hasShippingAddress ? (
          <div className="flex h-full relative">
            <div className="flex items-center border border-gray-200 w-full rounded-lg p-4 relative">
              <Link
                href={`/user/shipping-address?id=${userInfo?.id}`}
                className="absolute top-2 right-2 bg-cyan-600 text-white px-3 py-1 rounded hover:bg-cyan-700"
              >
                Edit
              </Link>
              <div className="flex-grow">
                {error ? (
                  <h2 className="text-xl text-center my-10 mx-auto w-11/12 text-red-400">
                    {error}
                  </h2>
                ) : (
                  <>
                    <h5 className="leading-none mb-2 text-base font-medium text-gray-700">
                      {shippingAddress?.name}{" "}
                      <span className="text-xs text-gray-500">
                        (Default Shipping Address)
                      </span>
                    </h5>
                    <p className="text-sm text-gray-500">
                      {shippingAddress?.contact}{" "}
                    </p>
                    <p className="text-sm text-gray-500">
                      {shippingAddress?.address}{" "}
                    </p>
                    <p className="text-sm text-gray-500">
                      {shippingAddress?.country}, {shippingAddress?.city},{" "}
                      {shippingAddress?.area} -{shippingAddress?.zipCode}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full relative">
            <Link
              href="/user/add-shipping-address"
              className="flex items-center bg-cyan-600 text-white hover:bg-cyan-700 w-full rounded-lg py-3 px-4 text-center relative"
            >
              <Plus className="text-xl font-bold text-center mr-4" /> Add
              Default Shipping Address
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAccount;
