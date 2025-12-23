// dynamicSettings.js

import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Facebook from "next-auth/providers/facebook";
import Credentials from "next-auth/providers/credentials";
import {
  loginCustomer,
  signUpWithOauthProvider,
} from "@services/CustomerServices";
import { getStoreSecretKeys } from "@services/SettingServices";

// OTP Login - verify via backend token
const verifyOTPToken = async (credentials) => {
  // For OTP login, the token is already verified by backend
  // We just need to return the user info
  if (credentials.loginType === "otp" && credentials.token) {
    return {
      _id: credentials._id,
      name: credentials.name || null,
      email: credentials.email || null,
      phone: credentials.phone,
      address: credentials.address || null,
      image: credentials.image || null,
      token: credentials.token,
      refreshToken: credentials.refreshToken,
      expiresIn: 900, // 15 minutes (will be refreshed)
    };
  }
  return null;
};

async function refreshAccessToken(token) {
  // console.log("token", token);

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/customer/refresh`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: token.refreshToken }),
      }
    );

    const refreshedTokens = await response.json();
    // console.log("refreshTokens", refreshedTokens);

    if (!response.ok) throw refreshedTokens;

    return {
      ...token,
      token: refreshedTokens.accessToken,
      accessTokenExpires: Date.now() + refreshedTokens.expiresIn * 1000,
      refreshToken: refreshedTokens.refreshToken ?? token.refreshToken, // reuse old if not rotated
    };
  } catch (error) {
    // console.error("Error refreshing access token", error);
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export const getDynamicAuthOptions = async () => {
  const { storeSetting } = await getStoreSecretKeys();

  // console.log("storeSetting::::", storeSetting);

  const providers = [
    Google({
      clientId: storeSetting?.google_id || "",
      clientSecret: storeSetting?.google_secret || "",
    }),
    GitHub({
      clientId: storeSetting?.github_id || "",
      clientSecret: storeSetting?.github_secret || "",
    }),
    Facebook({
      clientId: storeSetting?.facebook_id || "",
      clientSecret: storeSetting?.facebook_secret || "",
    }),
    // OTP Login Provider (Phone-based)
    Credentials({
      id: "otp-login",
      name: "OTP Login",
      credentials: {
        loginType: { label: "Login Type", type: "text" },
        phone: { label: "Phone", type: "text" },
        token: { label: "Token", type: "text" },
        refreshToken: { label: "Refresh Token", type: "text" },
        _id: { label: "User ID", type: "text" },
        name: { label: "Name", type: "text" },
        email: { label: "Email", type: "text" },
        address: { label: "Address", type: "text" },
        image: { label: "Image", type: "text" },
      },
      authorize: async (credentials) => {
        // Verify OTP token from backend
        const user = await verifyOTPToken(credentials);
        if (user) {
          return user;
        }
        throw new Error("Invalid OTP credentials");
      },
    }),
    // Email/Password Login Provider
    Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const { userInfo, error } = await loginCustomer(credentials);
        if (error) {
          throw new Error(error);
        }
        return userInfo;
      },
    }),
  ];

  const authOptions = {
    providers,
    callbacks: {
      async signIn({ user, account }) {
        // Allow OTP login (already verified)
        if (account.provider === "otp-login" || account.provider === "credentials") {
          return true;
        }
        
        // OAuth providers (Google, GitHub, Facebook)
        if (account.provider !== "credentials" && account.provider !== "otp-login") {
          try {
            const { res, error } = await signUpWithOauthProvider(user);

            if (error) {
              console.error("OAuth sign-in error:", error);
              return false;
            }

            if (res.token) {
              user.token = res.token;
              user.refreshToken = res.refreshToken;
              user.expiresIn = res.expiresIn;
              user._id = res._id;
              user.address = res.address;
              user.phone = res.phone;
              user.image = res.image;
            } else {
              console.error("OAuth sign-in: No token received");
              return false;
            }
          } catch (error) {
            console.error("OAuth sign-in exception:", error);
            return false;
          }
        }
        return true;
      },
      async jwt({ token, user, trigger, session }) {
        if (user) {
          token.id = user._id;
          token.name = user.name;
          token.email = user.email;
          token.address = user.address;
          token.phone = user.phone;
          token.image = user.image;
          token.token = user.token;
          token.refreshToken = user.refreshToken;
          token.accessTokenExpires = Date.now() + user.expiresIn * 1000;
        }

        if (trigger === "update" && session) {
          return {
            ...token,
            ...session.user,
          };
        }

        // return token;
        // If token still valid, just return it
        if (Date.now() < token.accessTokenExpires) {
          return token;
        }

        // Otherwise refresh it
        return await refreshAccessToken(token);
      },
      async session({ session, token }) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.address = token.address;
        session.user.phone = token.phone;
        session.user.image = token.image;
        session.user.token = token.token;
        session.user.refreshToken = token.refreshToken;
        session.error = token.error;

        return session;
      },
      async redirect({ url, baseUrl }) {
        // If the URL starts with baseUrl, use it; otherwise go to home
        if (url.startsWith(baseUrl)) {
          return url;
        }
        // If url is a relative path, prepend baseUrl
        if (url.startsWith("/")) {
          return `${baseUrl}${url}`;
        }
        return baseUrl;
      },
    },
    secret: process.env.NEXTAUTH_SECRET,
    session: { strategy: "jwt" },
  };

  return authOptions;
};
