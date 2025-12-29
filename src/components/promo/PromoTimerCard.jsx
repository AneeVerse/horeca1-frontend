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
      <div className="w-full h-auto lg:h-[180px] flex">
        <div className="bg-gradient-to-br from-primary-600 via-primary-500 to-primary-400 w-full rounded-xl shadow-md overflow-hidden relative flex flex-col">
          <div className="relative z-10 p-4 lg:p-5 flex flex-col gap-3">
            {/* Title Section - Perfectly aligned */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg flex-shrink-0 backdrop-blur-sm shadow-sm ring-1 ring-white/10">
                <Moon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm border-none font-bold text-white leading-tight mb-0.5">Happy Hour</h2>
                <span className="text-white/90 text-xs font-medium leading-none block">6:00 PM - 9:00 AM</span>
              </div>
            </div>

            {/* Timer Section - Well-spaced and aligned */}
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 border border-white/20 shadow-sm w-full">
              <div className="flex items-center gap-1.5 mb-2">
                <Clock className="w-3.5 h-3.5 text-white/90 flex-shrink-0" />
                <p className="text-white/90 text-[10px] font-bold uppercase tracking-wider leading-none">ENDS IN</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white/20 rounded-lg py-1.5 px-1 text-center border border-white/30 backdrop-blur-sm">
                  <span className="text-lg font-bold text-white block leading-none font-mono tracking-tight">
                    {timeRemaining.hours.toString().padStart(2, "0")}
                  </span>
                  <p className="text-white/80 text-[10px] mt-1 font-bold leading-none uppercase tracking-wide">HRS</p>
                </div>
                <div className="bg-white/20 rounded-lg py-1.5 px-1 text-center border border-white/30 backdrop-blur-sm">
                  <span className="text-lg font-bold text-white block leading-none font-mono tracking-tight">
                    {timeRemaining.minutes.toString().padStart(2, "0")}
                  </span>
                  <p className="text-white/80 text-[10px] mt-1 font-bold leading-none uppercase tracking-wide">MIN</p>
                </div>
                <div className="bg-white/20 rounded-lg py-1.5 px-1 text-center border border-white/30 backdrop-blur-sm">
                  <span className="text-lg font-bold text-white block leading-none font-mono tracking-tight">
                    {timeRemaining.seconds.toString().padStart(2, "0")}
                  </span>
                  <p className="text-white/80 text-[10px] mt-1 font-bold leading-none uppercase tracking-wide">SEC</p>
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
    <div className="w-full h-auto lg:h-[180px] flex">
      <div className="bg-gradient-to-br from-white via-primary-50 to-primary-100 w-full rounded-xl shadow-md border border-primary-100 overflow-hidden relative flex flex-col">
        <div className="relative z-10 p-4 lg:p-5 flex flex-col gap-3">
          {/* Title Section - Perfectly aligned */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg flex-shrink-0 shadow-sm ring-1 ring-primary-200">
              <Moon className="w-4 h-4 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm border-none font-bold text-gray-800 leading-tight mb-0.5">Happy Hour</h2>
              <span className="text-gray-600 text-xs font-medium leading-none block">6:00 PM - 9:00 AM</span>
            </div>
          </div>

          {/* Timer Section - Well-spaced and aligned */}
          <div className="bg-white rounded-xl p-3 border border-primary-100 shadow-sm w-full">
            <div className="flex items-center gap-1.5 mb-2">
              <Clock className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider leading-none">STARTS IN</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-primary-600 rounded-lg py-1.5 px-1 text-center border border-primary-700 shadow-sm">
                <span className="text-lg font-bold text-white block leading-none font-mono tracking-tight">
                  {timeRemaining.hours.toString().padStart(2, "0")}
                </span>
                <p className="text-primary-100 text-[10px] mt-1 font-bold leading-none uppercase tracking-wide">HRS</p>
              </div>
              <div className="bg-primary-600 rounded-lg py-1.5 px-1 text-center border border-primary-700 shadow-sm">
                <span className="text-lg font-bold text-white block leading-none font-mono tracking-tight">
                  {timeRemaining.minutes.toString().padStart(2, "0")}
                </span>
                <p className="text-primary-100 text-[10px] mt-1 font-bold leading-none uppercase tracking-wide">MIN</p>
              </div>
              <div className="bg-primary-600 rounded-lg py-1.5 px-1 text-center border border-primary-700 shadow-sm">
                <span className="text-lg font-bold text-white block leading-none font-mono tracking-tight">
                  {timeRemaining.seconds.toString().padStart(2, "0")}
                </span>
                <p className="text-primary-100 text-[10px] mt-1 font-bold leading-none uppercase tracking-wide">SEC</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoTimerCard;
