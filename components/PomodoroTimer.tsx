"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Headphones,
  Sparkles,
  Volume2,
  VolumeX,
  Timer,
  Zap,
} from "lucide-react";

export type TimerMode = "focus" | "shortBreak" | "longBreak";

interface PomodoroTimerProps {
  timerActive: boolean;
  setTimerActive: (active: boolean) => void;
  timerTime: string;
  setTimerTime: (time: string) => void;
  onFocusComplete?: () => void;
}

export function PomodoroTimer({
  timerActive,
  setTimerActive,
  timerTime,
  setTimerTime,
  onFocusComplete,
}: PomodoroTimerProps) {
  const modeDurations: Record<TimerMode, number> = {
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  };

  const [mode, setMode] = useState<TimerMode>("focus");
  const [timeLeft, setTimeLeft] = useState<number>(modeDurations.focus);
  const [completedSessions, setCompletedSessions] = useState(2);
  const [selectedSound, setSelectedSound] = useState<string>("Rain");
  const [soundPlaying, setSoundPlaying] = useState(false);

  // Sync parent timer time text
  useEffect(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const formatted = `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
    setTimerTime(formatted);
  }, [timeLeft, setTimerTime]);

  // Timer Countdown Logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);
      if (mode === "focus") {
        setCompletedSessions((prev) => Math.min(prev + 1, 4));
        if (onFocusComplete) onFocusComplete();
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timeLeft, mode, setTimerActive, onFocusComplete]);

  const handleModeChange = (newMode: TimerMode) => {
    setMode(newMode);
    setTimerActive(false);
    setTimeLeft(modeDurations[newMode]);
  };

  const handleReset = () => {
    setTimerActive(false);
    setTimeLeft(modeDurations[mode]);
  };

  const handleSkip = () => {
    setTimerActive(false);
    if (mode === "focus") {
      handleModeChange("shortBreak");
    } else {
      handleModeChange("focus");
    }
  };

  const totalModeDuration = modeDurations[mode];
  const progressRatio = (totalModeDuration - timeLeft) / totalModeDuration;

  // SVG Circular Ring parameters
  const ringRadius = 78;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringDashoffset = ringCircumference - progressRatio * ringCircumference;

  const modeColors: Record<TimerMode, { accent: string; glow: string; badge: string }> = {
    focus: {
      accent: "from-emerald-500 to-teal-400",
      glow: "rgba(16,185,129,0.35)",
      badge: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    },
    shortBreak: {
      accent: "from-cyan-500 to-blue-400",
      glow: "rgba(6,182,212,0.35)",
      badge: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
    },
    longBreak: {
      accent: "from-indigo-500 to-purple-400",
      glow: "rgba(99,102,241,0.35)",
      badge: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
    },
  };

  const sounds = [
    { name: "Rain", icon: "🌧️" },
    { name: "Lo-Fi", icon: "🎵" },
    { name: "Alpha", icon: "🧠" },
    { name: "Silent", icon: "🔇" },
  ];

  return (
    <div className="glass-card relative p-6 rounded-3xl border border-white/10 shadow-2xl flex flex-col justify-between h-full overflow-hidden group">
      {/* Background glow orb */}
      <div
        className="absolute -top-10 -left-10 w-48 h-48 rounded-full blur-3xl transition-all duration-700 pointer-events-none"
        style={{ background: modeColors[mode].glow }}
      />

      {/* Header Controls & Mode Switcher */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-white/[0.05] border border-white/10 text-emerald-400">
              <Timer className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 tracking-wide">
                Focus Engine
              </h2>
              <p className="text-[11px] text-slate-400">
                Pomodoro Cycle 3/4
              </p>
            </div>
          </div>

          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${modeColors[mode].badge}`}
          >
            {mode === "focus"
              ? "Deep Work"
              : mode === "shortBreak"
              ? "Short Rest"
              : "Long Recovery"}
          </span>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-900/80 border border-white/10">
          {(["focus", "shortBreak", "longBreak"] as TimerMode[]).map(
            (m) => (
              <button
                key={m}
                onClick={() => handleModeChange(m)}
                className={`relative py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  mode === m
                    ? "text-white shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {mode === m && (
                  <motion.div
                    layoutId="timerModeIndicator"
                    className="absolute inset-0 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 capitalize">
                  {m === "focus"
                    ? "Focus (25m)"
                    : m === "shortBreak"
                    ? "Break (5m)"
                    : "Rest (15m)"}
                </span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Main Timer Dial & Numerical Countdown */}
      <div className="relative py-6 flex flex-col items-center justify-center">
        <div className="relative w-48 h-48 flex items-center justify-center">
          {/* Outer SVG Ring */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r={ringRadius}
              className="stroke-slate-800/80"
              strokeWidth="6"
              fill="transparent"
            />
            <motion.circle
              cx="96"
              cy="96"
              r={ringRadius}
              className="stroke-emerald-400"
              strokeWidth="6"
              strokeDasharray={ringCircumference}
              animate={{ strokeDashoffset: ringDashoffset }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              strokeLinecap="round"
              fill="transparent"
              style={{
                filter: `drop-shadow(0px 0px 10px ${modeColors[mode].glow})`,
              }}
            />
          </svg>

          {/* Time Display inside Ring */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-4xl sm:text-5xl font-black tracking-tight font-mono text-white drop-shadow-md">
              {timerTime}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1 flex items-center gap-1">
              {timerActive ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  In Progress
                </>
              ) : (
                "Ready to Flow"
              )}
            </span>
          </div>
        </div>

        {/* Session Indicators */}
        <div className="flex items-center gap-2 mt-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`w-2 h-2 rounded-full transition-all ${
                s <= completedSessions
                  ? "bg-emerald-400 shadow-[0_0_8px_#10b981]"
                  : "bg-slate-800 border border-white/10"
              }`}
            />
          ))}
          <span className="text-[10px] text-slate-400 font-mono ml-1">
            Session {completedSessions}/4
          </span>
        </div>
      </div>

      {/* Timer Action Controls & Ambient Sound Select */}
      <div className="space-y-4 pt-2">
        {/* Play/Pause / Reset / Skip Action Buttons */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleReset}
            className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all active:scale-95"
            title="Reset Timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setTimerActive(!timerActive)}
            className={`flex items-center justify-center gap-2 px-8 py-3 rounded-2xl font-extrabold text-sm text-slate-950 transition-all shadow-xl ${
              timerActive
                ? "bg-gradient-to-r from-amber-400 to-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                : "bg-gradient-to-r from-emerald-400 to-teal-300 shadow-[0_0_25px_rgba(16,185,129,0.5)]"
            }`}
          >
            {timerActive ? (
              <>
                <Pause className="w-4 h-4 fill-slate-950" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Start Focus</span>
              </>
            )}
          </motion.button>

          <button
            onClick={handleSkip}
            className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all active:scale-95"
            title="Skip Session"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Ambient Sound Selector */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 font-medium">
            <Headphones className="w-3.5 h-3.5 text-indigo-400" />
            <span>Soundscape:</span>
          </div>

          <div className="flex items-center gap-1.5">
            {sounds.map((s) => (
              <button
                key={s.name}
                onClick={() => {
                  setSelectedSound(s.name);
                  setSoundPlaying(s.name !== "Silent");
                }}
                className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                  selectedSound === s.name
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-[0_0_8px_rgba(99,102,241,0.3)]"
                    : "bg-slate-900/40 text-slate-400 hover:bg-slate-800"
                }`}
              >
                <span>{s.icon}</span>{" "}
                <span className="hidden sm:inline">{s.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
