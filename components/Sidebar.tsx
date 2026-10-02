"use client";

import SoundscapePlayer from "./SoundscapePlayer";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Timer,
  CheckSquare,
  BarChart3,
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Zap,
  Flame,
  UserCheck,
} from "lucide-react";

export type NavTab = "dashboard" | "timer" | "tasks" | "analytics";

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  pendingTasksCount: number;
  timerActive: boolean;
  timerTime: string;
  userAvatar?: string;
  userName?: string;
  userTitle?: string;
}

export function Sidebar({
  activeTab,
  setActiveTab,
  pendingTasksCount,
  timerActive,
  timerTime,
  userAvatar = "🚀",
  userName = "Alex Vance",
  userTitle = "Flow Master",
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    {
      id: "dashboard" as NavTab,
      label: "Dashboard",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "timer" as NavTab,
      label: "Focus Timer",
      icon: Timer,
      badge: timerActive ? (
        <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded-full animate-pulse border border-emerald-500/30">
          {timerTime}
        </span>
      ) : null,
    },
    {
      id: "tasks" as NavTab,
      label: "MIT Tasks",
      icon: CheckSquare,
      badge: pendingTasksCount > 0 ? (
        <span className="text-[10px] font-semibold text-indigo-300 bg-indigo-500/20 px-1.5 py-0.5 rounded-full border border-indigo-500/30">
          {pendingTasksCount}
        </span>
      ) : null,
    },
    {
      id: "analytics" as NavTab,
      label: "Analytics",
      icon: BarChart3,
      badge: null,
    },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 256 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative flex flex-col h-screen sticky top-0 z-30 bg-slate-950/80 backdrop-blur-2xl border-r border-white/10 select-none shadow-[4px_0_24px_rgba(0,0,0,0.5)] shrink-0"
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3.5 top-7 z-40 flex items-center justify-center w-7 h-7 rounded-full bg-slate-900 border border-white/15 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/50 shadow-lg hover:shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all"
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* Brand Header */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-white/5 overflow-hidden">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-indigo-600 p-[1px] shadow-[0_0_20px_rgba(16,185,129,0.35)] shrink-0">
          <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
            <Zap className="w-5 h-5 text-emerald-400 fill-emerald-400/20 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          </div>
        </div>

        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col whitespace-nowrap"
            >
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-tight text-lg bg-gradient-to-r from-slate-100 via-white to-slate-300 bg-clip-text text-transparent">
                  FlowState
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
              </div>
              <span className="text-[11px] font-medium text-slate-400 tracking-wider">
                DEEP WORK OS v2.4
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2">
          {!isCollapsed ? (
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
              Navigation
            </span>
          ) : (
            <div className="h-4" />
          )}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex items-center w-full px-3 py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${
                isActive
                  ? "text-white bg-slate-900/90 border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/15 via-indigo-500/10 to-transparent border-l-2 border-emerald-400"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}

              <Icon
                className={`w-5 h-5 shrink-0 transition-all duration-200 z-10 ${
                  isActive
                    ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                    : "text-slate-400 group-hover:text-slate-200 group-hover:scale-110"
                }`}
              />

              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="ml-3 font-medium whitespace-nowrap z-10 flex-1 text-left"
                >
                  {item.label}
                </motion.span>
              )}

              {!isCollapsed && item.badge && (
                <div className="z-10 ml-auto">{item.badge}</div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Soundscape Widget & User Profile Footer */}
      <div className="p-3 border-t border-white/5 space-y-3">
        {/* Soundscape Player Integration */}
        {!isCollapsed && <SoundscapePlayer />}

        {/* User Mini Profile / Status Card */}
        <div className="relative flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-white/10">
          <div className="relative shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-indigo-500 p-[1.5px] shadow-sm overflow-hidden">
              <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center text-xs font-bold text-emerald-400 overflow-hidden">
                {userAvatar && (userAvatar.startsWith("data:image/") || userAvatar.startsWith("http")) ? (
                  <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : userAvatar ? (
                  <span className="text-xs">{userAvatar}</span>
                ) : (
                  "AX"
                )}
              </div>
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950 shadow-[0_0_8px_#10b981]" />
          </div>

          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col text-left overflow-hidden flex-1"
            >
              <span className="text-xs font-semibold text-slate-200 truncate">
                {userName}
              </span>
              <span className="text-[10px] text-emerald-400/90 font-medium flex items-center gap-1 truncate">
                <Sparkles className="w-2.5 h-2.5 shrink-0" /> {userTitle}
              </span>
            </motion.div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}