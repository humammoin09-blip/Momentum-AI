"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FocusTimer } from "@/components/dashboard/FocusTimer";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { RecentTasks } from "@/components/dashboard/RecentTasks";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { fadeIn, staggerContainer } from "@/lib/motion";

export function Dashboard() {
  const [focusToken, setFocusToken] = useState(0);
  const weekday = useMemo(
    () => new Date().toLocaleDateString("en-US", { weekday: "long" }),
    [],
  );

  return (
    <DashboardShell onStartFocus={() => setFocusToken((n) => n + 1)}>
      <motion.main
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="relative mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8"
      >
        <motion.div variants={fadeIn} className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-emerald-300/80">
              {weekday} flow
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Stay in the current.
            </h1>
            <p className="mt-2 max-w-xl text-sm text-zinc-400">
              Protect the next 90 minutes. Your streak, timer, and queue are already aligned.
            </p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-right backdrop-blur-md">
            <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">Next peak</p>
            <p className="font-mono text-lg text-emerald-300">17:40 – 18:10</p>
          </div>
        </motion.div>

        <motion.div variants={staggerContainer} className="grid gap-4 md:grid-cols-3">
          <QuickStats />
        </motion.div>

        <motion.div
          variants={staggerContainer}
          className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]"
        >
          <FocusTimer key={focusToken || "idle"} startOnMount={focusToken > 0} />
          <RecentTasks />
        </motion.div>
      </motion.main>
    </DashboardShell>
  );
}
