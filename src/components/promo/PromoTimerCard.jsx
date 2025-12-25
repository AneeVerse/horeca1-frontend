"use client";

import { useState, useEffect } from "react";
import { Clock, Zap, Moon } from "lucide-react";

const PromoTimerCard = () => {
  const [isPromoTime, setIsPromoTime] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();
      
      // 6pm (18:00) to midnight (23:59) or midnight (00:00) to 9am (08:59)
      const isPromo = hours >= 18 || hours < 9;
      setIsPromoTime(isPromo);

      // Calculate time remaining
      if (isPromo) {
        // Calculate time until promo ends (9am)
        let remainingHours, remainingMinutes, remainingSeconds;
        
        if (hours >= 18) {
          // After 6pm, promo ends at 9am next day
          remainingHours = (24 - hours - 1) + 9;
          remainingMinutes = 59 - minutes;
          remainingSeconds = 60 - seconds;
        } else {
          // Before 9am, promo ends at 9am same day
          remainingHours = 8 - hours;
          remainingMinutes = 59 - minutes;
          remainingSeconds = 60 - seconds;
        }
        
        if (remainingSeconds === 60) {
          remainingSeconds = 0;
          remainingMinutes += 1;
        }
        if (remainingMinutes === 60) {
          remainingMinutes = 0;
          remainingHours += 1;
        }
        
        setTimeRemaining({
          hours: Math.max(0, remainingHours),
          minutes: Math.max(0, remainingMinutes),
          seconds: Math.max(0, remainingSeconds),
        });
      } else {
        // Calculate time until promo starts (6pm)
        const remainingHours = 17 - hours;
        const remainingMinutes = 59 - minutes;
        const remainingSeconds = 60 - seconds;
        
        setTimeRemaining({
          hours: Math.max(0, remainingHours),
          minutes: Math.max(0, remainingMinutes >= 60 ? 0 : remainingMinutes),
          seconds: Math.max(0, remainingSeconds >= 60 ? 0 : remainingSeconds),
        });
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (isPromoTime) {
    // Show Promo Active Card - Clean, well-aligned design
    return (
      <div className="w-full h-full min-h-[300px] lg:min-h-0">
        <div className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 h-full min-h-[300px] lg:min-h-0 rounded-xl shadow-md overflow-hidden relative">
          <div className="relative z-10 p-6 h-full flex flex-col">
            {/* Title Section - Perfectly aligned */}
            <div className="mb-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/20 rounded-lg flex-shrink-0 backdrop-blur-sm mt-0.5">
                  <Moon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-white leading-tight mb-1.5">Happy Hour Discount</h2>
                  <span className="text-white/80 text-sm font-medium">6:00Am to 9:00Pm</span>
                </div>
              </div>
            </div>

            {/* Timer Section - Well-spaced and aligned */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="bg-white/15 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-center gap-1.5 mb-3">
                  <Clock className="w-3.5 h-3.5 text-white" />
                  <p className="text-white/90 text-xs font-medium">Ends in</p>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 bg-white/20 rounded-lg py-3 px-2 text-center border border-white/30">
                    <span className="text-2xl font-bold text-white block leading-none">
                      {timeRemaining.hours.toString().padStart(2, "0")}
                    </span>
                    <p className="text-white/80 text-xs mt-1.5 font-medium">Hours</p>
                  </div>
                  <div className="flex-1 bg-white/20 rounded-lg py-3 px-2 text-center border border-white/30">
                    <span className="text-2xl font-bold text-white block leading-none">
                      {timeRemaining.minutes.toString().padStart(2, "0")}
                    </span>
                    <p className="text-white/80 text-xs mt-1.5 font-medium">Mins</p>
                  </div>
                  <div className="flex-1 bg-white/20 rounded-lg py-3 px-2 text-center border border-white/30">
                    <span className="text-2xl font-bold text-white block leading-none">
                      {timeRemaining.seconds.toString().padStart(2, "0")}
                    </span>
                    <p className="text-white/80 text-xs mt-1.5 font-medium">Secs</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show "Promo Starting Soon" Card - Clean, well-aligned design
  return (
    <div className="w-full h-full min-h-[300px] lg:min-h-0">
      <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 h-full min-h-[300px] lg:min-h-0 rounded-xl shadow-md border border-emerald-200 overflow-hidden relative">
        <div className="relative z-10 p-6 h-full flex flex-col">
          {/* Title Section - Perfectly aligned */}
          <div className="mb-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg flex-shrink-0 mt-0.5">
                <Moon className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-800 leading-tight mb-1.5">Happy Hour Discount</h2>
                <span className="text-gray-600 text-sm font-medium">6:00Am to 9:00Pm</span>
              </div>
            </div>
          </div>

          {/* Timer Section - Well-spaced and aligned */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="bg-white rounded-lg p-4 border border-emerald-100 shadow-sm">
              <div className="flex items-center gap-1.5 mb-3">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <p className="text-gray-600 text-xs font-medium">Starts in</p>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 bg-emerald-500 rounded-lg py-3 px-2 text-center border border-emerald-600 shadow-sm">
                  <span className="text-2xl font-bold text-white block leading-none">
                    {timeRemaining.hours.toString().padStart(2, "0")}
                  </span>
                  <p className="text-white text-xs mt-1.5 font-medium">Hours</p>
                </div>
                <div className="flex-1 bg-emerald-500 rounded-lg py-3 px-2 text-center border border-emerald-600 shadow-sm">
                  <span className="text-2xl font-bold text-white block leading-none">
                    {timeRemaining.minutes.toString().padStart(2, "0")}
                  </span>
                  <p className="text-white text-xs mt-1.5 font-medium">Mins</p>
                </div>
                <div className="flex-1 bg-emerald-500 rounded-lg py-3 px-2 text-center border border-emerald-600 shadow-sm">
                  <span className="text-2xl font-bold text-white block leading-none">
                    {timeRemaining.seconds.toString().padStart(2, "0")}
                  </span>
                  <p className="text-white text-xs mt-1.5 font-medium">Secs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoTimerCard;
