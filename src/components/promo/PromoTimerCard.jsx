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
      <div className="w-full h-full flex">
        <div className="bg-gradient-to-br from-[#025155] via-[#025155] to-[#018549] w-full rounded-2xl shadow-[0_20px_50px_rgba(2,81,85,0.25)] overflow-hidden relative flex flex-col border border-white/10 group transition-all duration-700">
          {/* Professional Color Grading Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/5 rounded-full blur-[100px] -mr-32 -mt-32 group-hover:bg-emerald-400/10 transition-all duration-1000"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/5 rounded-full blur-[100px] -ml-32 -mb-32"></div>

          {/* Elegant Mesh Background Pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "linear-gradient(45deg, #fff 1px, transparent 1px), linear-gradient(-45deg, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }}></div>

          <div className="relative z-10 p-5 lg:p-6 flex flex-col justify-between h-full">
            {/* Title Section - Premium Brand Hierarchy */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-2xl flex-shrink-0 backdrop-blur-2xl shadow-2xl ring-1 ring-white/20 group-hover:ring-emerald-400/40 transition-all duration-500">
                  <Moon className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <h2 className="text-base font-black text-white leading-tight tracking-[0.08em] uppercase drop-shadow-lg">Happy Hour</h2>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                    </span>
                    <span className="text-emerald-300 text-[10px] font-black tracking-widest uppercase">Live Now</span>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 px-4 py-1.5 rounded-xl border border-white/10 backdrop-blur-xl">
                <span className="text-white font-bold text-[11px] tracking-widest">6PM - 9AM</span>
              </div>
            </div>

            {/* Timer Section - High-End "Frosted" Finish */}
            <div className="bg-black/10 backdrop-blur-3xl rounded-2xl p-5 border border-white/5 shadow-2xl relative overflow-hidden group/timer mt-4">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
                <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em] leading-none">ENDS IN</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/5 rounded-xl py-3 px-1 text-center border border-white/10 shadow-lg transition-all group-hover/timer:bg-white/10">
                  <span className="text-3xl font-black text-white block leading-none font-mono tracking-tighter drop-shadow-md">
                    {timeRemaining.hours.toString().padStart(2, "0")}
                  </span>
                  <p className="text-white/30 text-[9px] mt-2 font-black leading-none uppercase tracking-widest">Hours</p>
                </div>
                <div className="bg-white/5 rounded-xl py-3 px-1 text-center border border-white/10 shadow-lg transition-all group-hover/timer:bg-white/10">
                  <span className="text-3xl font-black text-white block leading-none font-mono tracking-tighter drop-shadow-md">
                    {timeRemaining.minutes.toString().padStart(2, "0")}
                  </span>
                  <p className="text-white/30 text-[9px] mt-2 font-black leading-none uppercase tracking-widest">Min</p>
                </div>
                <div className="bg-white/20 rounded-xl py-3 px-1 text-center border border-emerald-400/30 shadow-lg transition-all group-hover/timer:bg-white/30">
                  <span className="text-3xl font-black text-emerald-300 block leading-none font-mono tracking-tighter drop-shadow-[0_0_15px_rgba(110,231,183,0.4)]">
                    {timeRemaining.seconds.toString().padStart(2, "0")}
                  </span>
                  <p className="text-emerald-300/60 text-[9px] mt-2 font-black leading-none uppercase tracking-widest font-bold">Sec</p>
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
    <div className="w-full h-full flex">
      <div className="bg-[#025155] w-full rounded-2xl shadow-xl overflow-hidden relative flex flex-col border border-white/5 group transition-all duration-500">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>

        <div className="relative z-10 p-5 lg:p-6 flex flex-col justify-between h-full">
          {/* Title Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/5 rounded-2xl flex-shrink-0 border border-white/10">
                <Clock className="w-5 h-5 text-white/30" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white/90 leading-tight tracking-[0.05em] uppercase">Happy Hour</h2>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20 animate-pulse"></div>
                  <span className="text-white/40 text-[10px] font-bold tracking-widest uppercase text-center">Starts 6PM</span>
                </div>
              </div>
            </div>
            <div className="bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
              <span className="text-white/30 font-bold text-[10px] tracking-widest uppercase">Upcoming</span>
            </div>
          </div>

          {/* Timer Section */}
          <div className="bg-black/20 rounded-2xl p-5 border border-white/5 relative overflow-hidden mt-4 shadow-inner">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-[1px] w-8 bg-white/5"></div>
              <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em] leading-none">COMING SOON</p>
              <div className="h-[1px] w-8 bg-white/5"></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/5 rounded-xl py-3.5 px-1 text-center border border-white/5 shadow-lg">
                <span className="text-2xl font-black text-white/60 block leading-none font-mono tracking-tighter">
                  {timeRemaining.hours.toString().padStart(2, "0")}
                </span>
                <p className="text-white/20 text-[8px] mt-2 font-bold uppercase tracking-widest text-center">Hours</p>
              </div>
              <div className="bg-white/5 rounded-xl py-3.5 px-1 text-center border border-white/5 shadow-lg">
                <span className="text-2xl font-black text-white/60 block leading-none font-mono tracking-tighter">
                  {timeRemaining.minutes.toString().padStart(2, "0")}
                </span>
                <p className="text-white/20 text-[8px] mt-2 font-bold uppercase tracking-widest text-center">Min</p>
              </div>
              <div className="bg-white/5 rounded-xl py-3.5 px-1 text-center border border-white/10 shadow-lg">
                <span className="text-2xl font-black text-white/20 block leading-none font-mono tracking-tighter">
                  {timeRemaining.seconds.toString().padStart(2, "0")}
                </span>
                <p className="text-white/20 text-[8px] mt-2 font-bold uppercase tracking-widest text-center">Sec</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoTimerCard;

