"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import Cookies from "js-cookie";

const Login = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirectUrl");

  useEffect(() => {
    // Check if already logged in
    const userInfoCookie = Cookies.get("userInfo");
    if (userInfoCookie) {
      try {
        const userInfo = JSON.parse(userInfoCookie);
        if (userInfo?.token) {
          // Already logged in, redirect to account or specified URL
          router.replace(redirectUrl || "/user/dashboard");
          return;
        }
      } catch {
        // Invalid cookie, continue to OTP login
      }
    }
    
    // Redirect to OTP login (passwordless authentication)
    const url = redirectUrl 
      ? `/auth/otp-login?redirectUrl=${encodeURIComponent(redirectUrl)}`
      : "/auth/otp-login";
    router.replace(url);
  }, [router, redirectUrl]);

  return null;
};

export default Login;
