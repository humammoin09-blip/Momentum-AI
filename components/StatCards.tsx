"use client";

import React from "react";
import { Flame, Target, CheckCircle2 } from "lucide-react";

type StatCardsProps = {
  totalFocusHours: number;
  streakDays: number;
  completedTasks: number;
  totalTasks: number;
  dailyGoalHours: number;
  loading?: boolean;
};

export function StatCards({
  totalFocusHours,
  streakDays,
  completedTasks,
  totalTasks,
  dailyGoalHours,
  loading = false,
}: StatCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-3 relative overflow-hidden animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-28 bg-white/10 rounded-lg" />
              <div className="h-4 w-20 bg-white/10 rounded-full" />
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <div className="h-9 w-20 bg-white/15 rounded-xl" />
              <div className="h-4 w-8 bg-white/10 rounded-md" />
            </div>
            <div className="h-3 w-36 bg-white/10 rounded-md mt-2" />
          </div>
        ))}
      </div>
    );
  }

  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* 1. Today's Focus Card */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" /> Today's Focus
          </span>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            Target: {dailyGoalHours}.0 hrs
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white font-mono">
            {totalFocusHours.toFixed(1)}
          </span>
          <span className="text-xs text-slate-400">hrs</span>
        </div>
        <p className="text-[11px] text-slate-400">
          Deep work efficiency: <span className="text-emerald-400 font-semibold">{totalFocusHours > 0 ? "92%" : "Ready"}</span>
        </p>
      </div>

      {/* 2. Active Streak Card */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" /> Active Streak
          </span>
          <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
            {streakDays > 0 ? "Keep Going!" : "Start Streak"}
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white font-mono">
            {streakDays}
          </span>
          <span className="text-xs text-slate-400">Days 🔥</span>
        </div>
        <p className="text-[11px] text-slate-400">
          Unique active focus days logged
        </p>
      </div>

      {/* 3. Task Completion Card */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" /> Task Completion
          </span>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
            {completedTasks}/{totalTasks} Done
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white font-mono">
            {completionPercentage}%
          </span>
          <span className="text-xs text-slate-400">Execution rate</span>
        </div>
        <p className="text-[11px] text-slate-400">
          Real task execution count
        </p>
      </div>
    </div>
  );
}