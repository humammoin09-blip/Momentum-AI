"use client";

import { motion } from "framer-motion";
import { IconTrendUp } from "@/components/icons";
import { stats } from "@/lib/dashboard-data";
import { fadeIn } from "@/lib/motion";

export function QuickStats() {
  return (
    <>
      {stats.map((stat) => (
        <motion.article
          key={stat.id}
          variants={fadeIn}
          className="group relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.035] p-5 backdrop-blur-xl"
        >
          <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-emerald-400/10 blur-2xl transition group-hover:bg-emerald-400/20" />
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{stat.label}</p>
          <div className="mt-3 flex items-end justify-between gap-3">
            <p className="font-mono text-3xl font-semibold tracking-tight text-zinc-50">{stat.value}</p>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[11px] text-emerald-300">
              <IconTrendUp className="h-3 w-3" />
              {stat.hint}
            </span>
          </div>
          <p className="mt-3 text-sm text-zinc-400">{stat.delta}</p>
        </motion.article>
      ))}
    </>
  );
}
