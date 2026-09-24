"use client";

import React from "react";
import { motion } from "framer-motion";
import { Clock, Flame, CheckCircle2, TrendingUp, Sparkles, Award } from "lucide-react";

interface StatCardsProps {
  totalFocusHours: number;
  streakDays: number;
  completedTasks: number;
  totalTasks: number;
}

export function StatCards({
  totalFocusHours,
  streakDays,
  completedTasks,
  totalTasks,
}: StatCardsProps) {
  const completionPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // SVG Progress Ring Specs
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (completionPercentage / 100) * circumference;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* CARD 1: Total Focus Hours Today */}
      <motion.div
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        className="glass-card glass-card-hover relative p-5 rounded-2xl overflow-hidden group border border-white/10 shadow-lg"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Today's Focus
              </span>
              <p className="text-[11px] text-slate-500">Target: 6.0 hrs</p>
            </div>
          </div>

          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
            <TrendingUp className="w-3 h-3" />
            +18%
          </span>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-mono">
                {totalFocusHours.toFixed(1)}
              </span>
              <span className="text-sm font-semibold text-slate-400">hrs</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Deep work efficiency:{" "}
              <strong className="text-emerald-400">92%</strong>
            </p>
          </div>

          {/* Mini Sparkline SVG */}
          <div className="w-24 h-10 shrink-0">
            <svg className="w-full h-full" viewBox="0 0 100 40">
              <defs>
                <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 35 Q 20 20, 40 25 T 70 10 T 100 5 L 100 40 L 0 40 Z"
                fill="url(#emeraldGrad)"
              />
              <path
                d="M 0 35 Q 20 20, 40 25 T 70 10 T 100 5"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </motion.div>

      {/* CARD 2: Active Streak Count */}
      <motion.div
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        className="glass-card glass-card-hover relative p-5 rounded-2xl overflow-hidden group border border-white/10 shadow-lg"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.35)] animate-pulse">
              <Flame className="w-5 h-5 fill-amber-400/30" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Active Streak
              </span>
              <p className="text-[11px] text-amber-400/90 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Personal Best!
              </p>
            </div>
          </div>

          <span className="flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
            <Award className="w-3 h-3 text-amber-400" /> Level 14
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-mono">
              {streakDays}
            </span>
            <span className="text-sm font-semibold text-slate-400">Days 🔥</span>
          </div>

          {/* Progress bar to next milestone (21 Days) */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-medium text-slate-400">
              <span>Next Milestone: 21 Days</span>
              <span className="text-amber-400 font-mono">7 days left</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden border border-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(streakDays / 21) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* CARD 3: Task Completion Rate */}
      <motion.div
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        className="glass-card glass-card-hover relative p-5 rounded-2xl overflow-hidden group border border-white/10 shadow-lg"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.25)]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Task Completion
              </span>
              <p className="text-[11px] text-slate-500">Daily MITs Goal</p>
            </div>
          </div>

          <span className="text-[11px] font-medium text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 rounded-full">
            {completedTasks}/{totalTasks} Done
          </span>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-mono">
                {completionPercentage}%
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {completionPercentage >= 80 ? (
                <span className="text-emerald-400 font-medium">
                  ⚡ Outstanding velocity!
                </span>
              ) : (
                <span>Keep pushing deep work!</span>
              )}
            </p>
          </div>

          {/* Progress Ring SVG */}
          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r={radius}
                className="stroke-slate-800"
                strokeWidth="5"
                fill="transparent"
              />
              <motion.circle
                cx="32"
                cy="32"
                r={radius}
                className="stroke-emerald-400"
                strokeWidth="5"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1, ease: "easeOut" }}
                strokeLinecap="round"
                fill="transparent"
                style={{
                  filter: "drop-shadow(0px 0px 6px rgba(16, 185, 129, 0.6))",
                }}
              />
            </svg>
            <span className="absolute text-[11px] font-bold font-mono text-emerald-400">
              {completionPercentage}%
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
