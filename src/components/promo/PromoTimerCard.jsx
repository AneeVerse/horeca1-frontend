"use client";

import { useState, useEffect } from "react";
import { Clock, Zap, Moon, Sun } from "lucide-react";

const PromoTimerCard = () => {
  const [isPromoTime, setIsPromoTime] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();
      
      // 6pm (18:00) to midnight (23:59) or midnight (00:00) to 9am (08:59)
      const isPromo = hours >= 18 || hours < 9;
      setIsPromoTime(isPromo);
      
      // Format current time
      setCurrentTime(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );

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
    // Show Promo Active Card - Using emerald theme to match website
    return (
      <div className="w-full h-full min-h-[300px] lg:min-h-0">
        <div className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 h-full min-h-[300px] lg:min-h-0 rounded-xl shadow-lg overflow-hidden relative">
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, white 2%, transparent 2%), radial-gradient(circle at 75% 75%, white 2%, transparent 2%)`,
              backgroundSize: '30px 30px'
            }}></div>
          </div>
          
          <div className="relative z-10 p-5 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Moon className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/90 font-medium text-sm">Night Special</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/20 rounded-full backdrop-blur-sm">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                <span className="text-white text-xs font-bold tracking-wider">LIVE</span>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-yellow-300" />
                <h2 className="text-xl font-bold text-white">PROMO ACTIVE</h2>
              </div>
              <p className="text-white/80 text-sm mb-4 leading-relaxed">
                Special bulk pricing now! Get discounted rates on bulk orders.
              </p>

              {/* Timer */}
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3">
                <p className="text-white/70 text-xs mb-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Ends in
                </p>
                <div className="flex gap-2">
                  <div className="flex-1 bg-white/20 rounded-lg py-2 px-1 text-center">
                    <span className="text-2xl font-bold text-white">
                      {timeRemaining.hours.toString().padStart(2, "0")}
                    </span>
                    <p className="text-white/60 text-xs mt-0.5">Hours</p>
                  </div>
                  <div className="flex-1 bg-white/20 rounded-lg py-2 px-1 text-center">
                    <span className="text-2xl font-bold text-white">
                      {timeRemaining.minutes.toString().padStart(2, "0")}
                    </span>
                    <p className="text-white/60 text-xs mt-0.5">Mins</p>
                  </div>
                  <div className="flex-1 bg-white/20 rounded-lg py-2 px-1 text-center">
                    <span className="text-2xl font-bold text-white">
                      {timeRemaining.seconds.toString().padStart(2, "0")}
                    </span>
                    <p className="text-white/60 text-xs mt-0.5">Secs</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-3 pt-3 border-t border-white/20">
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-xs">6:00 PM - 9:00 AM</span>
                <span className="text-yellow-300 font-semibold text-sm flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Extra Savings!
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show "Promo Starting Soon" Card - Subtle gray theme
  return (
    <div className="w-full h-full min-h-[300px] lg:min-h-0">
      <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-slate-900 h-full min-h-[300px] lg:min-h-0 rounded-xl shadow-lg overflow-hidden relative">
        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, white 1%, transparent 1%)`,
            backgroundSize: '20px 20px'
          }}></div>
        </div>
        
        <div className="relative z-10 p-5 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-500/20 rounded-lg">
                <Sun className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-gray-400 font-medium text-sm">Day Time</span>
            </div>
            <div className="px-2.5 py-1 bg-gray-700/50 rounded-full">
              <span className="text-gray-400 text-xs font-medium">Upcoming</span>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2">
              <Moon className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">Night Promo</h2>
            </div>
            <p className="text-gray-400 text-sm mb-4 leading-relaxed">
              Special bulk pricing starts at 6:00 PM. Save more on bulk orders!
            </p>

            {/* Timer */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3">
              <p className="text-gray-500 text-xs mb-2 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Starts in
              </p>
              <div className="flex gap-2">
                <div className="flex-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg py-2 px-1 text-center">
                  <span className="text-2xl font-bold text-emerald-400">
                    {timeRemaining.hours.toString().padStart(2, "0")}
                  </span>
                  <p className="text-gray-500 text-xs mt-0.5">Hours</p>
                </div>
                <div className="flex-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg py-2 px-1 text-center">
                  <span className="text-2xl font-bold text-emerald-400">
                    {timeRemaining.minutes.toString().padStart(2, "0")}
                  </span>
                  <p className="text-gray-500 text-xs mt-0.5">Mins</p>
                </div>
                <div className="flex-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg py-2 px-1 text-center">
                  <span className="text-2xl font-bold text-emerald-400">
                    {timeRemaining.seconds.toString().padStart(2, "0")}
                  </span>
                  <p className="text-gray-500 text-xs mt-0.5">Secs</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-3 pt-3 border-t border-gray-700/50">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-xs">6:00 PM - 9:00 AM</span>
              <span className="text-emerald-400 font-semibold text-sm">Coming Soon</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoTimerCard;
