"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Check,
  Trash2,
} from "lucide-react";

export interface NotificationItem {
  id: string | number;
  title: string;
  time: string;
  timestamp?: number;
  read: boolean;
  type?: "pomodoro" | "task" | "system";
}

export const STORAGE_KEY_NOTIFICATIONS = "flowstate_notifications";
export const NOTIFICATION_EVENT = "flowstate_new_notification";

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "14-Day Streak Unlocked! 🔥",
    time: "10m ago",
    timestamp: Date.now() - 10 * 60 * 1000,
    read: false,
    type: "system",
  },
  {
    id: "notif-2",
    title: "Pomodoro Session 2 Completed",
    time: "45m ago",
    timestamp: Date.now() - 45 * 60 * 1000,
    read: true,
    type: "pomodoro",
  },
  {
    id: "notif-3",
    title: "Weekly Consistency Report ready",
    time: "2h ago",
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
    read: true,
    type: "system",
  },
];

function formatTimeAgo(timestamp?: number, fallback = "Just now"): string {
  if (!timestamp) return fallback;
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}d ago`;
}

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
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Ref tracking notified events to prevent duplicate notifications during countdown intervals
  const notifiedEventsRef = useRef<Set<string>>(new Set());

  // Initialize notifications from localStorage with fallback to DEFAULT_NOTIFICATIONS
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
      if (saved) {
        const parsed: NotificationItem[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const updated = parsed.map((n) => ({
            ...n,
            time: formatTimeAgo(n.timestamp, n.time),
          }));
          setNotifications(updated);
          return;
        }
      }
    } catch {
      // Fallback on json parse errors
    }
    setNotifications(DEFAULT_NOTIFICATIONS);
    try {
      localStorage.setItem(
        STORAGE_KEY_NOTIFICATIONS,
        JSON.stringify(DEFAULT_NOTIFICATIONS)
      );
    } catch {
      // Ignore localStorage write error
    }
  }, []);

  // Save helper function
  const saveNotifications = (items: NotificationItem[]) => {
    setNotifications(items);
    try {
      localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(items));
    } catch {
      // Ignore
    }
  };

  const addNotification = (item: {
    title: string;
    type?: "pomodoro" | "task" | "system";
  }) => {
    const newItem: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: item.title,
      time: "Just now",
      timestamp: Date.now(),
      read: false,
      type: item.type || "system",
    };

    setNotifications((prev) => {
      const updated = [newItem, ...prev.slice(0, 29)];
      try {
        localStorage.setItem(
          STORAGE_KEY_NOTIFICATIONS,
          JSON.stringify(updated)
        );
      } catch {
        // Ignore
      }
      return updated;
    });
  };

  // Real-time notification event listener & cross-tab storage sync
  useEffect(() => {
    // 1. Custom event listener for explicitly dispatched notification events
    const handleCustomNotification = (e: Event) => {
      const customEvent = e as CustomEvent<{
        title: string;
        type?: "pomodoro" | "task" | "system";
      }>;
      if (customEvent.detail && customEvent.detail.title) {
        addNotification({
          title: customEvent.detail.title,
          type: customEvent.detail.type,
        });
      }
    };

    // 2. Storage event listener for updates from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_NOTIFICATIONS && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setNotifications(
              parsed.map((n: NotificationItem) => ({
                ...n,
                time: formatTimeAgo(n.timestamp, n.time),
              }))
            );
          }
        } catch {
          // Ignore
        }
      }
    };

    // 3. Listener / Poller for Pomodoro and Task timer transitions to zero or alerts
    const checkTimerEvents = () => {
      // Check Pomodoro Target End Time
      const pomodoroTargetEnd = localStorage.getItem("flowstate_pomodoro_target_end_time");
      const pomodoroRunning = localStorage.getItem("flowstate_pomodoro_running") === "true";
      const pomodoroMode = localStorage.getItem("flowstate_pomodoro_mode") || "focus";

      if (pomodoroTargetEnd && pomodoroRunning) {
        const endTimeNum = Number(pomodoroTargetEnd);
        const remaining = Math.ceil((endTimeNum - Date.now()) / 1000);

        if (remaining <= 0) {
          const eventKey = `pomodoro_zero_${endTimeNum}`;
          if (!notifiedEventsRef.current.has(eventKey)) {
            notifiedEventsRef.current.add(eventKey);
            const modeName = pomodoroMode.charAt(0).toUpperCase() + pomodoroMode.slice(1);
            addNotification({
              title: `Pomodoro ${modeName} Session Complete! 🎯`,
              type: "pomodoro",
            });
          }
        }
      }

      // Check MIT task timers in localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("task_timer_end_")) {
          const taskId = key.replace("task_timer_end_", "");
          const endVal = localStorage.getItem(key);
          if (endVal) {
            const endNum = Number(endVal);
            const taskRemaining = Math.ceil((endNum - Date.now()) / 1000);
            if (taskRemaining <= 0) {
              const eventKey = `task_zero_${taskId}_${endNum}`;
              if (!notifiedEventsRef.current.has(eventKey)) {
                notifiedEventsRef.current.add(eventKey);
                addNotification({
                  title: `MIT Task Timer Hit 0:00! ⚡`,
                  type: "task",
                });
              }
            }
          }
        }
      }
    };

    window.addEventListener(NOTIFICATION_EVENT, handleCustomNotification);
    window.addEventListener("storage", handleStorageChange);

    const timerCheckInterval = setInterval(checkTimerEvents, 1000);

    return () => {
      window.removeEventListener(NOTIFICATION_EVENT, handleCustomNotification);
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(timerCheckInterval);
    };
  }, []);

  // Update timestamps and header greeting
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

      // Refresh relative timestamps (e.g. "Just now" -> "1m ago")
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          time: formatTimeAgo(n.timestamp, n.time),
        }))
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    saveNotifications(updated);
  };

  const clearAllNotifications = () => {
    saveNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

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
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
            )}
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
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        {unreadCount} New
                      </span>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={markAllAsRead}
                        className="text-[10px] text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-0.5"
                        title="Mark all as read"
                      >
                        <Check className="w-3 h-3" />
                        <span>Read</span>
                      </button>
                      <span className="text-slate-600">•</span>
                      <button
                        onClick={clearAllNotifications}
                        className="text-[10px] text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-0.5"
                        title="Clear all"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Clear</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          if (!n.read) {
                            const updated = notifications.map((item) =>
                              item.id === n.id ? { ...item, read: true } : item
                            );
                            saveNotifications(updated);
                          }
                        }}
                        className={`flex items-start gap-2.5 p-2 rounded-xl transition-all text-left cursor-pointer ${
                          n.read
                            ? "bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 opacity-75"
                            : "bg-emerald-500/[0.06] hover:bg-emerald-500/[0.1] border border-emerald-500/20"
                        }`}
                      >
                        <div
                          className={`p-1.5 rounded-lg border mt-0.5 ${
                            n.type === "pomodoro"
                              ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                              : n.type === "task"
                              ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          }`}
                        >
                          {n.type === "pomodoro" ? (
                            <Clock className="w-3.5 h-3.5" />
                          ) : n.type === "task" ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <Zap className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p
                            className={`text-xs ${
                              n.read
                                ? "font-normal text-slate-300"
                                : "font-semibold text-white"
                            }`}
                          >
                            {n.title}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {n.time}
                          </p>
                        </div>
                        {!n.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                        )}
                      </div>
                    ))
                  )}
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
                {userAvatar &&
                (userAvatar.startsWith("data:image/") ||
                  userAvatar.startsWith("http")) ? (
                  <img
                    src={userAvatar}
                    alt={userName}
                    className="w-full h-full object-cover"
                  />
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