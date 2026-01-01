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
    // Show Promo Active Card - Master Designer Brand Teal Design
    return (
      <div className="w-full h-[140px] lg:h-[280px] flex">
        <div className="bg-gradient-to-br from-[#025155] via-[#025155] to-[#018549] w-full rounded-2xl shadow-[0_20px_50px_rgba(2,81,85,0.25)] overflow-hidden relative flex flex-col border border-white/10 group transition-all duration-700">
          {/* Professional Color Grading Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/5 rounded-full blur-[100px] -mr-32 -mt-32 group-hover:bg-emerald-400/10 transition-all duration-1000"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/5 rounded-full blur-[100px] -ml-32 -mb-32"></div>

          {/* Elegant Mesh Background Pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "linear-gradient(45deg, #fff 1px, transparent 1px), linear-gradient(-45deg, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }}></div>

          <div className="relative z-10 px-4 py-3 lg:px-6 lg:py-6 flex flex-col h-full">
            {/* Title Section - Premium Brand Hierarchy */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 lg:p-3 bg-white/10 rounded-xl flex-shrink-0 backdrop-blur-2xl shadow-2xl ring-1 ring-white/20 group-hover:ring-emerald-400/40 transition-all duration-500">
                  <Moon className="w-3.5 h-3.5 lg:w-5 lg:h-5 text-emerald-300" />
                </div>
                <div>
                  <h2 className="text-[15px] lg:text-[24px] font-black text-white leading-tight tracking-[0.08em] drop-shadow-lg lg:max-w-none">DAILY DISCOUNTS 6 Pm - 9 Am</h2>
                </div>
              </div>
            </div>

            {/* Timer Section - Minimalist View */}
            <div className="relative group/timer mt-3 lg:mt-8">
              <div className="flex items-center justify-center gap-1.5 mb-3 lg:mb-4 px-2">
                <div className="h-[1px] w-6 bg-white/10"></div>
                <Zap className="w-3 h-3 text-emerald-300 animate-pulse" />
                <p className="text-white/40 text-[8px] lg:text-[10px] font-black tracking-[0.3em] leading-none">END IN</p>
                <div className="h-[1px] w-6 bg-white/10"></div>
              </div>
              <div className="grid grid-cols-3 gap-2 lg:gap-4">
                <div className="bg-white/5 rounded-lg py-2.5 lg:py-6 px-2 lg:px-3 text-center border border-white/10 shadow-lg transition-all group-hover/timer:bg-white/10">
                  <span className="text-xl lg:text-4xl font-black text-white block leading-none font-mono tracking-tighter drop-shadow-md">
                    {timeRemaining.hours.toString().padStart(2, "0")}
                  </span>
                  <p className="text-white/30 text-[8px] lg:text-[10px] mt-1 lg:mt-2 font-black leading-none uppercase tracking-widest text-center">Hours</p>
                </div>
                <div className="bg-white/5 rounded-lg py-2.5 lg:py-6 px-2 lg:px-3 text-center border border-white/10 shadow-lg transition-all group-hover/timer:bg-white/10">
                  <span className="text-xl lg:text-4xl font-black text-white block leading-none font-mono tracking-tighter drop-shadow-md">
                    {timeRemaining.minutes.toString().padStart(2, "0")}
                  </span>
                  <p className="text-white/30 text-[8px] lg:text-[10px] mt-1 lg:mt-2 font-black leading-none uppercase tracking-widest text-center">Min</p>
                </div>
                <div className="bg-white/20 rounded-lg py-1.5 lg:py-5 px-2 lg:px-3 text-center border border-emerald-400/30 shadow-lg transition-all group-hover/timer:bg-white/30">
                  <span className="text-xl lg:text-3xl font-black text-emerald-300 block leading-none font-mono tracking-tighter drop-shadow-[0_0_15px_rgba(110,231,183,0.4)]">
                    {timeRemaining.seconds.toString().padStart(2, "0")}
                  </span>
                  <p className="text-emerald-300/60 text-[8px] lg:text-[10px] mt-1 lg:mt-2 font-black leading-none uppercase tracking-widest font-bold text-center">Sec</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show "Promo Starting Soon" Card - Brand Teal Design
  return (
    <div className="w-full h-[140px] lg:h-[280px] flex">
      <div className="bg-gradient-to-br from-[#025155] via-[#025155] to-[#018549] w-full rounded-2xl shadow-[0_20px_50px_rgba(2,81,85,0.25)] overflow-hidden relative flex flex-col border border-white/10 group transition-all duration-700">
        {/* Professional Color Grading Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/5 rounded-full blur-[100px] -mr-32 -mt-32 group-hover:bg-emerald-400/10 transition-all duration-1000"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/5 rounded-full blur-[100px] -ml-32 -mb-32"></div>

        {/* Elegant Mesh Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "linear-gradient(45deg, #fff 1px, transparent 1px), linear-gradient(-45deg, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }}></div>

        <div className="relative z-10 px-4 py-3 lg:px-6 lg:py-6 flex flex-col h-full">
          {/* Title Section - Premium Brand Hierarchy */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 lg:p-3 bg-white/10 rounded-xl flex-shrink-0 backdrop-blur-2xl shadow-2xl ring-1 ring-white/20 group-hover:ring-emerald-400/40 transition-all duration-500">
                <Clock className="w-3.5 h-3.5 lg:w-5 lg:h-5 text-emerald-300" />
              </div>
              <div>
                <h2 className="text-[16px] lg:text-[24px] font-black text-white leading-tight tracking-[0.08em] drop-shadow-lg text-center sm:text-left lg:max-w-none">DAILY DISCOUNTS 6 Pm - 9 Am</h2>
              </div>
            </div>
          </div>

          {/* Timer Section - Minimalist View */}
          <div className="relative group/timer mt-3 lg:mt-8">
            <div className="flex items-center justify-center gap-1.5 mb-3 lg:mb-4 px-2">
              <div className="h-[1px] w-6 bg-white/10"></div>
              <p className="text-[#5be3b1] text-[8px] lg:text-[10px] font-black tracking-[0.3em] leading-none">START IN</p>
              <div className="h-[1px] w-6 bg-white/10"></div>
            </div>
            <div className="grid grid-cols-3 gap-2 lg:gap-4">
              <div className="bg-white/5 rounded-lg py-2 lg:py-5 px-2 lg:px-3 text-center border border-white/10 shadow-lg transition-all group-hover/timer:bg-white/10">
                <span className="text-xl lg:text-3xl font-black text-white/60 block leading-none font-mono tracking-tighter drop-shadow-md">
                  {timeRemaining.hours.toString().padStart(2, "0")}
                </span>
                <p className="text-white/30 text-[8px] lg:text-[10px] mt-1 lg:mt-2 font-black leading-none uppercase tracking-widest text-center">Hours</p>
              </div>
              <div className="bg-white/5 rounded-lg py-2 lg:py-5 px-2 lg:px-3 text-center border border-white/10 shadow-lg transition-all group-hover/timer:bg-white/10">
                <span className="text-xl lg:text-3xl font-black text-white/60 block leading-none font-mono tracking-tighter drop-shadow-md">
                  {timeRemaining.minutes.toString().padStart(2, "0")}
                </span>
                <p className="text-white/30 text-[8px] lg:text-[10px] mt-1 lg:mt-2 font-black leading-none uppercase tracking-widest text-center">Min</p>
              </div>
              <div className="bg-white/5 rounded-lg py-2 lg:py-5 px-2 lg:px-3 text-center border border-white/10 shadow-lg transition-all group-hover/timer:bg-white/10">
                <span className="text-xl lg:text-3xl font-black text-white/40 block leading-none font-mono tracking-tighter drop-shadow-md">
                  {timeRemaining.seconds.toString().padStart(2, "0")}
                </span>
                <p className="text-white/30 text-[8px] lg:text-[10px] mt-1 lg:mt-2 font-black leading-none uppercase tracking-widest text-center">Sec</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoTimerCard;
