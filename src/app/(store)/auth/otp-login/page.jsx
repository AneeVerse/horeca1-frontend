"use client";

import { useState, useEffect, useRef, useContext } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiSmartphone, FiArrowLeft, FiShield } from "react-icons/fi";
import { signIn } from "next-auth/react";
import { sendOTP, verifyOTP, resendOTP } from "@services/OTPServices";
import { notifyError, notifySuccess } from "@utils/toast";
import { UserContext } from "@context/UserContext";
import { SidebarContext } from "@context/SidebarContext";
import Cookies from "js-cookie";

const OTPLogin = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirectUrl") || "/user/dashboard";
  const { dispatch } = useContext(UserContext);
  const { setCartDrawerOpen } = useContext(SidebarContext);
  
  const [step, setStep] = useState("phone"); // "phone" or "otp"
  const [phone, setPhone] = useState("");
  const [displayPhone, setDisplayPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [devOtp, setDevOtp] = useState(null); // For development mode
  const otpInputRefs = useRef([]);
  const phoneInputRef = useRef(null);
  const hasCheckedAuth = useRef(false); // Guard to prevent repeated auth checks

  // Check if already logged in, redirect to dashboard - only once
  useEffect(() => {
    if (hasCheckedAuth.current) return; // Prevent multiple checks
    hasCheckedAuth.current = true;

    const userInfoCookie = Cookies.get("userInfo");
    if (userInfoCookie) {
      try {
        const userInfo = JSON.parse(userInfoCookie);
        // If user has token (logged in), redirect
        if (userInfo?.token) {
          router.replace(redirectUrl);
          return; // Exit early if redirecting
        }
      } catch {
        // Invalid cookie, continue with login
      }
    }

    // Close cart drawer if it was open when redirected to login
    setCartDrawerOpen?.(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount to prevent loops

  // Focus phone input on mount
  useEffect(() => {
    if (step === "phone" && phoneInputRef.current) {
      phoneInputRef.current.focus();
    }
  }, [step]);

  // Auto-read OTP from SMS (for mobile browsers)
  useEffect(() => {
    if (step === "otp" && typeof window !== "undefined") {
      // For WebOTP API (Chrome/Edge on Android)
      if ("OTPCredential" in window) {
        const ac = new AbortController();
        navigator.credentials
          .get({
            otp: { transport: ["sms"] },
            signal: ac.signal,
          })
          .then((otp) => {
            if (otp?.code) {
              const otpArray = otp.code.split("");
              setOtpValues(otpArray);
              otpArray.forEach((digit, index) => {
                if (otpInputRefs.current[index]) {
                  otpInputRefs.current[index].value = digit;
                }
              });
              setTimeout(() => {
                handleOTPSubmit(otp.code);
              }, 500);
            }
          })
          .catch(() => {
            // User cancelled or not supported
          });

        return () => ac.abort();
      }
    }
  }, [step]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Format phone number (add country code if missing)
  const formatPhoneNumber = (phoneNumber) => {
    const cleaned = phoneNumber.replace(/\D/g, "");
    // If starts with 0, remove it
    if (cleaned.startsWith("0")) {
      return cleaned.substring(1);
    }
    // If doesn't start with country code, assume India (+91)
    if (cleaned.length === 10) {
      return `91${cleaned}`;
    }
    return cleaned;
  };

  // Format display phone (add +91)
  const formatDisplayPhone = (phoneNumber) => {
    const cleaned = phoneNumber.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }
    if (cleaned.length > 10) {
      const countryCode = cleaned.slice(0, cleaned.length - 10);
      const number = cleaned.slice(-10);
      return `+${countryCode} ${number.slice(0, 5)} ${number.slice(5)}`;
    }
    return phoneNumber;
  };

  // Handle phone input change
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setDisplayPhone(value);
  };

  // Handle phone submission
  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent multiple submissions
    if (loading) {
      return;
    }
    
    if (!displayPhone || displayPhone.length < 10) {
      notifyError("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    
    const formattedPhone = formatPhoneNumber(displayPhone);
    setPhone(formattedPhone);

    try {
      const result = await sendOTP(formattedPhone);
      
      if (result.success) {
        notifySuccess("OTP sent to your mobile");
        setStep("otp");
        setResendTimer(30); // 30 seconds cooldown
        
        // For development mode - if OTP is returned, show it
        if (result.otp) {
          setDevOtp(result.otp);
        }
        
        // Focus first OTP input
        setTimeout(() => {
          if (otpInputRefs.current[0]) {
            otpInputRefs.current[0].focus();
          }
        }, 100);
      } else {
        notifyError(result.message || "Failed to send OTP");
      }
    } catch (error) {
      notifyError(error.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP input change
  const handleOTPChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are entered
    if (newOtpValues.every((val) => val !== "") && newOtpValues.length === 6) {
      const otp = newOtpValues.join("");
      handleOTPSubmit(otp);
    }
  };

  // Handle backspace
  const handleOTPKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handleOTPPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");
    if (pastedData.length === 6) {
      const otpArray = pastedData.split("");
      setOtpValues(otpArray);
      otpArray.forEach((digit, index) => {
        if (otpInputRefs.current[index]) {
          otpInputRefs.current[index].value = digit;
        }
      });
      // Auto-submit
      setTimeout(() => {
        handleOTPSubmit(pastedData);
      }, 100);
    }
  };

  // Handle OTP submission
  const handleOTPSubmit = async (otp) => {
    if (!otp || otp.length !== 6) {
      notifyError("Please enter a valid 6-digit OTP");
      return;
    }

    // Prevent multiple submissions
    if (loading) {
      return;
    }

    setLoading(true);
    
    try {
      // Verify OTP with backend
      const result = await verifyOTP(phone, otp);

      if (result.success && result.userInfo) {
        // Skip NextAuth signIn to avoid POST request loops
        // We use cookie-based auth as primary method (no NextAuth needed)
        
        // Use cookie-based auth as primary
        // Store in userInfo cookie for middleware auth check
        const userInfoForCookie = {
          ...result.userInfo,
          id: result.userInfo._id, // Ensure id is set for auth checks
        };
        
        // Set the cookie with proper options
        Cookies.set("userInfo", JSON.stringify(userInfoForCookie), { 
          expires: 7,
          path: "/",
          sameSite: "lax"
        });
        console.log("[OTP Login] userInfo cookie set:", userInfoForCookie);
        
        // Update context
        dispatch({ type: "USER_LOGIN", payload: userInfoForCookie });
        
        notifySuccess("Login successful!");
        
        // Redirect immediately - use window.location for full reload
        const targetUrl = redirectUrl || "/user/dashboard";
        console.log("[OTP Login] Redirecting to:", targetUrl);
        
        // Immediate redirect to prevent any loops
        window.location.href = targetUrl;
      } else {
        notifyError(result.error || "Invalid OTP. Please try again.");
        // Clear OTP inputs on error
        setOtpValues(["", "", "", "", "", ""]);
        otpInputRefs.current[0]?.focus();
      }
    } catch (error) {
      notifyError(error.message || "Failed to verify OTP");
      setOtpValues(["", "", "", "", "", ""]);
      otpInputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    if (resendTimer > 0) {
      return;
    }

    setLoading(true);
    try {
      const result = await resendOTP(phone);
      if (result.success) {
        notifySuccess("OTP sent again");
        setResendTimer(30);
        setOtpValues(["", "", "", "", "", ""]);
        otpInputRefs.current[0]?.focus();
      } else {
        notifyError(result.message || "Failed to resend OTP");
      }
    } catch (error) {
      notifyError(error.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-start justify-center px-4 pt-8 pb-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg mb-3">
            <FiShield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">horeca1</h1>
          <p className="text-gray-500 text-sm mt-1">Fresh groceries delivered</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
          {step === "phone" ? (
            <>
              {/* Phone Step */}
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Login or Sign up
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Enter your mobile number to continue
                </p>
              </div>

              <form onSubmit={handlePhoneSubmit} action="#" method="get">
                {/* Phone Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                      <span className="text-gray-500 font-medium">+91</span>
                    </div>
                    <input
                      ref={phoneInputRef}
                      type="tel"
                      inputMode="numeric"
                      value={displayPhone}
                      onChange={handlePhoneChange}
                      placeholder="Enter 10 digit number"
                      className="w-full pl-14 pr-4 py-4 text-lg font-medium border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all placeholder:text-gray-300"
                      maxLength={10}
                      autoComplete="tel"
                    />
                  </div>
                </div>

                {/* Continue Button */}
                <button
                  type="submit"
                  disabled={loading || displayPhone.length < 10}
                  className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-700 focus:ring-4 focus:ring-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              {/* Terms */}
              <p className="text-xs text-gray-400 text-center mt-6">
                By continuing, you agree to our{" "}
                <a href="/terms-and-conditions" className="text-emerald-600 hover:underline">Terms of Service</a>
                {" "}and{" "}
                <a href="/privacy-policy" className="text-emerald-600 hover:underline">Privacy Policy</a>
              </p>
            </>
          ) : (
            <>
              {/* OTP Step */}
              <button
                onClick={() => {
                  setStep("phone");
                  setOtpValues(["", "", "", "", "", ""]);
                }}
                className="flex items-center text-gray-500 hover:text-gray-700 transition-colors mb-6"
              >
                <FiArrowLeft className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">Change number</span>
              </button>

              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-4">
                  <FiSmartphone className="w-6 h-6 text-emerald-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Verify OTP
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Enter the 6-digit code sent to
                </p>
                <p className="text-emerald-600 font-semibold mt-1">
                  {formatDisplayPhone(displayPhone)}
                </p>
                
                {/* Dev mode OTP display */}
                {devOtp && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-700 font-medium">Dev Mode OTP:</p>
                    <p className="text-lg font-bold text-yellow-800 tracking-widest">{devOtp}</p>
                  </div>
                )}
              </div>

              {/* OTP Input Fields */}
              <div className="flex justify-center gap-2 sm:gap-3 mb-6">
                {otpValues.map((value, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpInputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={value}
                    onChange={(e) => handleOTPChange(index, e.target.value)}
                    onKeyDown={(e) => handleOTPKeyDown(index, e)}
                    onPaste={index === 0 ? handleOTPPaste : undefined}
                    className="w-11 h-14 sm:w-12 sm:h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
                    autoComplete="one-time-code"
                  />
                ))}
              </div>

              {/* Verify Button */}
              <button
                onClick={() => handleOTPSubmit(otpValues.join(""))}
                disabled={loading || otpValues.some((val) => !val)}
                className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-700 focus:ring-4 focus:ring-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mb-4"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Verify & Login</span>
                )}
              </button>

              {/* Resend OTP */}
              <div className="text-center">
                {resendTimer > 0 ? (
                  <p className="text-sm text-gray-500">
                    Resend OTP in <span className="font-semibold text-emerald-600">{resendTimer}s</span>
                  </p>
                ) : (
                  <button
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 disabled:opacity-50 transition-colors"
                  >
                    Didn't receive? Resend OTP
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Help */}
        <p className="text-center text-gray-400 text-xs mt-6">
          Having trouble?{" "}
          <a href="/contact" className="text-emerald-600 hover:underline">Contact Support</a>
        </p>
      </div>
    </div>
  );
};

export default OTPLogin;
