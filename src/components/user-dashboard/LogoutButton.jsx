"use client";
import React from "react";

import { FiUnlock } from "react-icons/fi";
import { handleLogout } from "@utils/logout";

//internal imports
import useUtilsFunction from "@hooks/useUtilsFunction";

const LogoutButton = ({ storeCustomizationSetting }) => {
  const { showingTranslateValue } = useUtilsFunction();
  return (
    <span className="p-2 flex items-center rounded-md hover:bg-gray-50 w-full hover:text-emerald-600">
      <span className="mr-2">
        <FiUnlock />
      </span>{" "}
      <button
        onClick={() => handleLogout({ redirectUrl: "/" })}
        type="submit"
        className="inline-flex items-center justify-between text-sm font-medium w-full hover:text-emerald-600"
      >
        {showingTranslateValue(storeCustomizationSetting?.navbar?.logout)}
      </button>
    </span>
  );
};

export default LogoutButton;
