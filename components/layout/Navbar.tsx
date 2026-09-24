"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  IconBell,
  IconBolt,
  IconMenu,
  IconPlus,
  IconSearch,
  IconTimer,
} from "@/components/icons";

type NavbarProps = {
  onMenuClick: () => void;
  onStartFocus: () => void;
};

function formatClock(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function Navbar({ onMenuClick, onStartFocus }: NavbarProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-white/5 bg-zinc-950/70 px-4 backdrop-blur-xl sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="grid h-10 w-10 place-items-center rounded-xl border border-white/8 text-zinc-300 transition hover:border-emerald-400/30 hover:text-emerald-200 lg:hidden"
          aria-label="Open navigation"
        >
          <IconMenu className="h-5 w-5" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
            </span>
            <p className="text-sm font-medium text-zinc-100">Live · In Flow</p>
            <span className="hidden font-mono text-xs text-zinc-500 sm:inline">
              {formatClock(now)}
            </span>
          </div>
          <p className="truncate text-xs text-zinc-500">Session synced · 3 teammates online</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <label className="relative hidden md:block">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="search"
            placeholder="Jump to a task…"
            className="h-10 w-56 rounded-xl border border-white/8 bg-white/[0.04] pl-9 pr-3 text-sm text-zinc-200 outline-none placeholder:text-zinc-500 focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/15"
          />
        </label>

        <motion.button
          type="button"
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.97 }}
          className="hidden h-10 items-center gap-2 rounded-xl border border-white/8 bg-white/[0.04] px-3 text-sm text-zinc-200 transition hover:border-emerald-400/30 hover:text-white sm:inline-flex"
        >
          <IconPlus className="h-4 w-4 text-emerald-300" />
          New task
        </motion.button>

        <motion.button
          type="button"
          onClick={onStartFocus}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-500/90 px-3 text-sm font-medium text-zinc-950 shadow-[0_0_24px_rgba(16,185,129,0.35)] transition hover:bg-emerald-400"
        >
          <IconTimer className="h-4 w-4" />
          <span className="hidden sm:inline">Start focus</span>
        </motion.button>

        <button
          type="button"
          className="relative grid h-10 w-10 place-items-center rounded-xl border border-white/8 text-zinc-300 transition hover:border-emerald-400/30 hover:text-emerald-200"
          aria-label="Notifications"
        >
          <IconBell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </button>

        <div className="flex items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.04] py-1 pl-1 pr-3">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-xs font-semibold text-zinc-950">
            AK
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-zinc-100">Ava Kane</p>
            <p className="flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] text-emerald-300/80">
              <IconBolt className="h-3 w-3" />
              Pro
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
