"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { IconPause, IconPlay, IconReset } from "@/components/icons";
import { fadeIn } from "@/lib/motion";

const FOCUS_SECONDS = 25 * 60;
const STORAGE_KEY_END_TIME = "flowstate_timer_end_time";
const STORAGE_KEY_RUNNING = "flowstate_timer_running";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

type FocusTimerProps = {
  startOnMount?: boolean;
};

const STORAGE_KEY_REMAINING = "flowstate_timer_remaining";

export function FocusTimer({ startOnMount = false }: FocusTimerProps) {
  const [remaining, setRemaining] = useState<number>(FOCUS_SECONDS);
  const [running, setRunning] = useState<boolean>(startOnMount);

  // Initialize state from localStorage on mount & handle tick
  useEffect(() => {
    const syncState = () => {
      const savedRunning = localStorage.getItem(STORAGE_KEY_RUNNING) === "true";
      const savedEndTime = localStorage.getItem(STORAGE_KEY_END_TIME);
      const savedRemaining = localStorage.getItem(STORAGE_KEY_REMAINING);

      if (savedRunning && savedEndTime) {
        const now = Date.now();
        const left = Math.max(0, Math.ceil((Number(savedEndTime) - now) / 1000));
        if (left > 0) {
          setRemaining(left);
          setRunning(true);
        } else {
          setRemaining(0);
          setRunning(false);
          localStorage.setItem(STORAGE_KEY_RUNNING, "false");
          localStorage.removeItem(STORAGE_KEY_END_TIME);
          localStorage.setItem(STORAGE_KEY_REMAINING, String(FOCUS_SECONDS));
        }
      } else if (savedRemaining !== null) {
        setRemaining(Math.max(0, Number(savedRemaining)));
        setRunning(false);
      } else if (startOnMount) {
        const endTime = Date.now() + FOCUS_SECONDS * 1000;
        localStorage.setItem(STORAGE_KEY_END_TIME, String(endTime));
        localStorage.setItem(STORAGE_KEY_RUNNING, "true");
        setRemaining(FOCUS_SECONDS);
        setRunning(true);
      }
    };

    syncState();
    const interval = window.setInterval(syncState, 1000);
    window.addEventListener("focus", syncState);
    window.addEventListener("visibilitychange", syncState);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", syncState);
      window.removeEventListener("visibilitychange", syncState);
    };
  }, [startOnMount]);

  const toggleTimer = () => {
    if (running) {
      // Pause
      const savedEndTime = localStorage.getItem(STORAGE_KEY_END_TIME);
      let left = remaining;
      if (savedEndTime) {
        left = Math.max(0, Math.ceil((Number(savedEndTime) - Date.now()) / 1000));
      }
      setRunning(false);
      setRemaining(left);
      localStorage.setItem(STORAGE_KEY_RUNNING, "false");
      localStorage.removeItem(STORAGE_KEY_END_TIME);
      localStorage.setItem(STORAGE_KEY_REMAINING, String(left));
    } else {
      // Start / Resume
      const timeToUse = remaining <= 0 ? FOCUS_SECONDS : remaining;
      const endTime = Date.now() + timeToUse * 1000;
      localStorage.setItem(STORAGE_KEY_END_TIME, String(endTime));
      localStorage.setItem(STORAGE_KEY_RUNNING, "true");
      localStorage.removeItem(STORAGE_KEY_REMAINING);
      if (remaining <= 0) setRemaining(FOCUS_SECONDS);
      setRunning(true);
    }
  };

  const resetTimer = () => {
    setRunning(false);
    setRemaining(FOCUS_SECONDS);
    localStorage.setItem(STORAGE_KEY_RUNNING, "false");
    localStorage.removeItem(STORAGE_KEY_END_TIME);
    localStorage.setItem(STORAGE_KEY_REMAINING, String(FOCUS_SECONDS));
  };

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const progress = 1 - remaining / FOCUS_SECONDS;
  const circumference = 2 * Math.PI * 54;
  const dash = circumference * progress;

  const status = useMemo(() => {
    if (remaining === 0) return "Session complete";
    if (running) return "Deep focus locked";
    return "Ready when you are";
  }, [remaining, running]);

  return (
    <motion.section
      variants={fadeIn}
      className="relative overflow-hidden rounded-2xl border border-emerald-400/20 bg-zinc-950/60 p-6 shadow-[0_0_40px_rgba(16,185,129,0.08)] backdrop-blur-xl"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(52,211,153,0.16),transparent_42%)]" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="relative mx-auto h-44 w-44">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="8"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="url(#timerGlow)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference}`}
              className="drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]"
            />
            <defs>
              <linearGradient id="timerGlow" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#a3e635" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <p className="font-mono text-4xl font-semibold tracking-tight text-zinc-50">
              {pad(minutes)}:{pad(seconds)}
            </p>
          </div>
        </div>

        <div className="flex-1">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/80">Quick start</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Focus timer</h2>
          <p className="mt-1 text-sm text-zinc-400">{status} · 25-minute pomodoro preview</p>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={toggleTimer}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-400 px-4 text-sm font-semibold text-zinc-950 shadow-[0_0_20px_rgba(52,211,153,0.35)]"
            >
              {running ? <IconPause className="h-4 w-4" /> : <IconPlay className="h-4 w-4" />}
              {running ? "Pause" : remaining === 0 ? "Restart" : "Begin"}
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={resetTimer}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-zinc-200 hover:border-emerald-400/30"
            >
              <IconReset className="h-4 w-4" />
              Reset
            </motion.button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}