"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  Sparkles,
  Flame,
  Clock,
  CheckCircle2,
  ChevronDown,
  Volume2,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface HeaderProps {
  timerActive: boolean;
  timerTime: string;
  userName?: string;
  userTitle?: string;
  onOpenProfile?: () => void;
  userAvatar?: string;
}

export function Header({
  timerActive,
  timerTime,
  userName = "Alex Vance",
  userTitle = "Flow Master",
  onOpenProfile,
  userAvatar = "🚀",
}: HeaderProps) {
  const [greeting, setGreeting] = useState("Good Afternoon");
  const [currentDateStr, setCurrentDateStr] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      if (hours < 12) setGreeting("Good Morning");
      else if (hours < 18) setGreeting("Good Afternoon");
      else setGreeting("Good Evening");

      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        month: "short",
        day: "numeric",
      };
      setCurrentDateStr(now.toLocaleDateString("en-US", options));
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const notifications = [
    {
      id: 1,
      title: "14-Day Streak Unlocked! 🔥",
      time: "10m ago",
      read: false,
    },
    {
      id: 2,
      title: "Pomodoro Session 2 Completed",
      time: "45m ago",
      read: true,
    },
    {
      id: 3,
      title: "Weekly Consistency Report ready",
      time: "2h ago",
      read: true,
    },
  ];

  // Get user initials for avatar fallback
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-20 w-full px-6 py-4 bg-slate-950/80 backdrop-blur-xl border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
      {/* Left: Greeting Banner & Live Status */}
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
              {greeting}, {userName.split(" ")[0]}
              <span className="inline-block animate-bounce text-amber-400">
                ⚡
              </span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-0.5 flex items-center gap-2">
            <span>{currentDateStr || "Thursday, Sep 24"}</span>
            <span className="w-1 h-1 rounded-full bg-slate-600" />
            <span className="text-emerald-400 font-medium">
              Optimal Focus Window
            </span>
          </p>
        </div>

        {/* Live Focus Status Indicator Pill */}
        <div className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-semibold shadow-[0_0_15px_rgba(16,185,129,0.2)]">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
          </span>
          <span>
            {timerActive
              ? `Deep Focus Active (${timerTime})`
              : "Flow State Ready"}
          </span>
        </div>
      </div>

      {/* Right: Search, Notifications, User Avatar Badge */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Search Bar / Cmd+K trigger */}
        <div className="relative hidden md:flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks, sessions, commands..."
            className="w-64 pl-9 pr-12 py-1.5 text-xs rounded-xl bg-slate-900/60 border border-white/10 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all"
          />
          <kbd className="absolute right-2.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 border border-white/10 rounded">
            ⌘K
          </kbd>
        </div>

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-slate-900/80 border border-white/10 text-slate-300 hover:text-white hover:border-white/20 transition-all"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-white/15 shadow-2xl p-4 z-50 space-y-3"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Notifications
                  </span>
                  <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    3 New
                  </span>
                </div>

                <div className="space-y-2">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="flex items-start gap-2.5 p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-all text-left"
                    >
                      <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mt-0.5">
                        <Zap className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-xs font-semibold text-slate-200">
                          {n.title}
                        </p>
                        <p className="text-[10px] text-slate-400">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile Avatar Badge - Clickable to open ProfileModal */}
        <div 
          onClick={onOpenProfile}
          className="flex items-center gap-2.5 pl-2 border-l border-white/10 cursor-pointer group"
          title="Click to edit profile"
        >
          <div className="relative transition-transform group-hover:scale-105">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-400 via-indigo-500 to-purple-500 p-[1.5px] shadow-[0_0_12px_rgba(16,185,129,0.3)]">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                {userAvatar && (userAvatar.startsWith("data:image/") || userAvatar.startsWith("http")) ? (
                  <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                ) : userAvatar ? (
                  <span className="text-base">{userAvatar}</span>
                ) : (
                  initials
                )}
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-slate-950 border border-white/20 text-[8px] font-bold text-amber-400">
              12
            </span>
          </div>

          <div className="hidden sm:flex flex-col">
            <span className="text-xs font-bold text-slate-100 flex items-center gap-1">
              {userName}
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {userTitle} • 4,820 XP
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}