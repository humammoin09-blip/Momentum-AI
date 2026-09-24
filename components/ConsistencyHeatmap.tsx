"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Calendar, Sparkles, TrendingUp, Zap, Info } from "lucide-react";

export function ConsistencyHeatmap() {
  const [activeView, setActiveView] = useState<"weekly" | "matrix">("weekly");
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  const daysData = [
    { day: "Mon", hours: 5.2, tasks: 8, intensity: 3 },
    { day: "Tue", hours: 6.8, tasks: 11, intensity: 4 },
    { day: "Wed", hours: 7.5, tasks: 12, intensity: 4 },
    { day: "Thu", hours: 5.8, tasks: 9, intensity: 3 },
    { day: "Fri", hours: 6.2, tasks: 10, intensity: 4 },
    { day: "Sat", hours: 3.5, tasks: 4, intensity: 2 },
    { day: "Sun", hours: 2.0, tasks: 3, intensity: 1 },
  ];

  // 28-day Heatmap Matrix Data (4 weeks x 7 days)
  const heatmapMatrix = Array.from({ length: 28 }, (_, i) => {
    // Generate realistic activity intensity 0 to 4
    const intensityLevels = [0, 1, 2, 3, 4, 3, 4, 2, 4, 4, 3, 1, 0, 2, 4, 3, 4, 4, 2, 3, 4, 1, 0, 3, 4, 4, 3, 4];
    return {
      dayIndex: i + 1,
      intensity: intensityLevels[i % intensityLevels.length],
      hours: (intensityLevels[i % intensityLevels.length] * 1.8).toFixed(1),
    };
  });

  const getHeatmapColor = (intensity: number) => {
    switch (intensity) {
      case 0:
        return "bg-slate-900 border-white/5";
      case 1:
        return "bg-emerald-950/80 border-emerald-800/40 text-emerald-300";
      case 2:
        return "bg-emerald-800/80 border-emerald-700/50 text-emerald-200";
      case 3:
        return "bg-emerald-600/90 border-emerald-500/60 text-white shadow-[0_0_8px_rgba(16,185,129,0.3)]";
      case 4:
        return "bg-emerald-400 border-emerald-300 text-slate-950 font-bold shadow-[0_0_12px_rgba(52,211,153,0.7)] animate-pulse";
      default:
        return "bg-slate-900";
    }
  };

  const maxHours = 8.0;

  return (
    <div className="glass-card relative p-6 rounded-3xl border border-white/10 shadow-2xl overflow-hidden group">
      {/* Glow highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Weekly Consistency Heatmap
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                94% Score
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Deep focus intensity & habit consistency breakdown
            </p>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/80 border border-white/10">
          <button
            onClick={() => setActiveView("weekly")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeView === "weekly"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Weekly Bar Chart
          </button>
          <button
            onClick={() => setActiveView("matrix")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeView === "matrix"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            28-Day Matrix
          </button>
        </div>
      </div>

      {/* View Content */}
      <div className="py-6">
        {activeView === "weekly" ? (
          <div className="space-y-4">
            {/* Bar Chart Grid */}
            <div className="relative h-44 flex items-end justify-between gap-3 sm:gap-6 px-4 pt-6 pb-2">
              {/* Target Line (6 Hours) */}
              <div className="absolute left-0 right-0 top-12 border-b border-dashed border-emerald-500/30 flex justify-between px-2">
                <span className="text-[10px] font-mono text-emerald-400/80 bg-slate-950/80 px-1 rounded">
                  Target: 6.0h
                </span>
              </div>

              {daysData.map((item) => {
                const heightPercent = (item.hours / maxHours) * 100;
                const isHovered = hoveredDay === item.day;

                return (
                  <div
                    key={item.day}
                    onMouseEnter={() => setHoveredDay(item.day)}
                    onMouseLeave={() => setHoveredDay(null)}
                    className="relative flex-1 flex flex-col items-center h-full justify-end group/bar cursor-pointer"
                  >
                    {/* Hover Tooltip */}
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute -top-12 z-20 px-2.5 py-1 rounded-xl bg-slate-900 border border-white/20 text-[10px] text-white shadow-xl flex flex-col items-center whitespace-nowrap"
                      >
                        <span className="font-bold text-emerald-400">
                          {item.hours} hrs
                        </span>
                        <span className="text-slate-400">
                          {item.tasks} MITs completed
                        </span>
                      </motion.div>
                    )}

                    {/* Animated Bar */}
                    <div className="w-full max-w-[42px] h-full flex items-end">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPercent}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className={`w-full rounded-t-xl transition-all ${
                          item.day === "Thu"
                            ? "bg-gradient-to-t from-emerald-500 to-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.5)] border-t border-emerald-200"
                            : "bg-slate-800 group-hover/bar:bg-emerald-500/50 border-t border-white/10"
                        }`}
                      />
                    </div>

                    <span
                      className={`text-xs font-semibold mt-2 ${
                        item.day === "Thu" ? "text-emerald-400" : "text-slate-400"
                      }`}
                    >
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* 28-Day GitHub-style Matrix */
          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-2 max-w-xl mx-auto">
              {heatmapMatrix.map((cell) => (
                <motion.div
                  key={cell.dayIndex}
                  whileHover={{ scale: 1.15 }}
                  className={`h-9 rounded-lg border flex items-center justify-center text-[10px] font-mono cursor-pointer transition-all ${getHeatmapColor(
                    cell.intensity
                  )}`}
                  title={`Day ${cell.dayIndex}: ${cell.hours} focus hours`}
                >
                  {cell.hours}h
                </motion.div>
              ))}
            </div>

            {/* Matrix Legend */}
            <div className="flex items-center justify-center gap-3 text-[11px] text-slate-400 pt-2">
              <span>Less</span>
              <div className="flex items-center gap-1.5">
                {[0, 1, 2, 3, 4].map((lvl) => (
                  <div
                    key={lvl}
                    className={`w-3.5 h-3.5 rounded border ${getHeatmapColor(
                      lvl
                    )}`}
                  />
                ))}
              </div>
              <span>More (Deep Flow)</span>
            </div>
          </div>
        )}
      </div>

      {/* Insights Banner */}
      <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Weekly Summary:</strong> 37.2 total focus hours logged (<strong>+14% vs last week</strong>). Peak productivity at 10:30 AM.
          </span>
        </div>

        <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" /> Consistency Unlocked
        </span>
      </div>
    </div>
  );
}
