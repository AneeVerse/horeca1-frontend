import { useSession } from "next-auth/react";
import Cookies from "js-cookie";

// Hook version for components
const useUserSession = () => {
  const { data: session, status } = useSession();
  
  // Try NextAuth session first
  if (session?.user) {
    return { userInfo: session.user, status };
  }
  
  // Fallback to cookie-based auth (for OTP login)
  const userInfoCookie = Cookies.get("userInfo");
  if (userInfoCookie) {
    try {
      const userInfo = JSON.parse(userInfoCookie);
      return { userInfo, status: "authenticated" };
    } catch {
      return { userInfo: null, status: "unauthenticated" };
    }
  }
  
  return { userInfo: null, status };
};

// Simple getter (non-hook, for immediate value)
const getUserSession = () => {
  // Try cookie-based auth first (for OTP login)
  if (typeof window !== "undefined") {
    const userInfoCookie = Cookies.get("userInfo");
    if (userInfoCookie) {
      try {
        return JSON.parse(userInfoCookie);
      } catch {
        return null;
      }
    }
  }
  return null;
};

export { getUserSession, useUserSession };
