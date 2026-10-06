"use client";

import { supabase } from "@/lib/supabase";
import React, { useState, useEffect, useCallback, useRef } from "react";
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
  SlidersHorizontal,
  AlertTriangle,
} from "lucide-react";

export type TimerMode = "focus" | "shortBreak" | "longBreak";

interface PomodoroTimerProps {
  timerActive: boolean;
  setTimerActive: (active: boolean) => void;
  timerTime: string;
  setTimerTime: (time: string) => void;
  onFocusComplete?: () => void;
}

const STORAGE_KEY_TARGET_END_TIME = "flowstate_pomodoro_target_end_time";
const STORAGE_KEY_RUNNING = "flowstate_pomodoro_running";
const STORAGE_KEY_MODE = "flowstate_pomodoro_mode";
const STORAGE_KEY_REMAINING = "flowstate_pomodoro_remaining";
const STORAGE_KEY_COMPLETED_SESSIONS = "flowstate_pomodoro_completed_sessions";
const STORAGE_KEY_FOCUS_DURATION = "flowstate_pomodoro_focus_duration_mins";

export function PomodoroTimer({
  timerActive,
  setTimerActive,
  timerTime,
  setTimerTime,
  onFocusComplete,
}: PomodoroTimerProps) {
  // Custom focus duration in minutes (default: 25)
  const [customFocusMins, setCustomFocusMins] = useState<number>(25);
  const [showCustomDuration, setShowCustomDuration] = useState<boolean>(false);
  const [pendingModeSwitch, setPendingModeSwitch] = useState<TimerMode | null>(null);

  const modeDurations: Record<TimerMode, number> = {
    focus: customFocusMins * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  };

  const [mode, setMode] = useState<TimerMode>("focus");
  const [timeLeft, setTimeLeft] = useState<number>(modeDurations.focus);
  const [completedSessions, setCompletedSessions] = useState(2);
  const [selectedSound, setSelectedSound] = useState<string>("Rain");
  const [soundPlaying, setSoundPlaying] = useState(false);

  const isCompletingRef = useRef(false);
  const notifiedTimesRef = useRef<Set<number>>(new Set());

  // Load custom focus duration on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedCustom = localStorage.getItem(STORAGE_KEY_FOCUS_DURATION);
    if (savedCustom) {
      const parsed = parseInt(savedCustom, 10);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 120) {
        setCustomFocusMins(parsed);
      }
    }
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleTimerCompletion = useCallback((currentMode: TimerMode) => {
    if (isCompletingRef.current) return;
    isCompletingRef.current = true;

    setTimerActive(false);
    localStorage.setItem(STORAGE_KEY_RUNNING, "false");
    localStorage.removeItem(STORAGE_KEY_TARGET_END_TIME);

    const defaultDuration = modeDurations[currentMode];
    localStorage.setItem(STORAGE_KEY_REMAINING, String(defaultDuration));
    setTimeLeft(defaultDuration);
    setTimerTime(formatTime(defaultDuration));

    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      new Notification("FlowState Focus Complete! 🎯", {
        body: "Great job! Your focus session is complete.",
        icon: "/favicon.ico",
      });
    }

    if (currentMode === "focus") {
      setCompletedSessions((prev) => {
        const next = Math.min(prev + 1, 4);
        localStorage.setItem(STORAGE_KEY_COMPLETED_SESSIONS, String(next));
        return next;
      });

      const sessionMins = customFocusMins || 25;
      const newSessionRecord = {
        duration_minutes: sessionMins,
        mode: "focus",
        created_at: new Date().toISOString(),
      };

      // Always cache in localStorage for robust offline persistence
      if (typeof window !== "undefined") {
        try {
          const cached = localStorage.getItem("flowstate_cached_focus_sessions");
          const existing = cached ? JSON.parse(cached) : [];
          existing.unshift(newSessionRecord);
          localStorage.setItem("flowstate_cached_focus_sessions", JSON.stringify(existing.slice(0, 100)));
        } catch {
          // ignore cache error
        }
      }

      (async () => {
        try {
          const { error } = await supabase
            .from("focus_sessions")
            .insert([
              {
                duration_minutes: sessionMins,
                mode: "focus",
              },
            ]);
          if (error) console.warn("Supabase focus session sync notice (saved to local cache):", error);
        } catch (err) {
          console.warn("Offline/Network notice saving focus session:", err);
        }
      })();

      if (onFocusComplete) onFocusComplete();
    }

    setTimeout(() => {
      isCompletingRef.current = false;
    }, 1000);
  }, [customFocusMins, modeDurations, onFocusComplete, setTimerActive, setTimerTime]);

  const syncStateFromStorage = useCallback(() => {
    if (typeof window === "undefined") return;

    const savedMode = (localStorage.getItem(STORAGE_KEY_MODE) as TimerMode) || "focus";
    const savedRunning = localStorage.getItem(STORAGE_KEY_RUNNING) === "true";
    const savedTargetEndTime = localStorage.getItem(STORAGE_KEY_TARGET_END_TIME);
    const savedRemaining = localStorage.getItem(STORAGE_KEY_REMAINING);
    const savedCompleted = localStorage.getItem(STORAGE_KEY_COMPLETED_SESSIONS);
    const savedSound = localStorage.getItem("flowstate_active_soundscape");
    const savedSoundPlaying = localStorage.getItem("flowstate_soundscape_playing") === "true";

    if (savedSound) {
      setSelectedSound(savedSound);
      setSoundPlaying(savedSoundPlaying);
    }

    setMode(savedMode);
    if (savedCompleted) {
      setCompletedSessions(parseInt(savedCompleted, 10));
    }

    if (savedRunning && savedTargetEndTime) {
      const targetEndTime = Number(savedTargetEndTime);
      const now = Date.now();
      const left = Math.max(0, Math.ceil((targetEndTime - now) / 1000));
      if (left > 0) {
        setTimeLeft(left);
        setTimerActive(true);
        setTimerTime(formatTime(left));
      } else {
        handleTimerCompletion(savedMode);
      }
    } else if (savedRemaining !== null) {
      const remaining = Math.max(0, Number(savedRemaining));
      setTimeLeft(remaining);
      setTimerActive(false);
      setTimerTime(formatTime(remaining));
    } else {
      const defaultTime = modeDurations[savedMode];
      setTimeLeft(defaultTime);
      setTimerActive(false);
      setTimerTime(formatTime(defaultTime));
    }
  }, [handleTimerCompletion, modeDurations, setTimerActive, setTimerTime]);

  useEffect(() => {
    syncStateFromStorage();
  }, [syncStateFromStorage]);

  // Sync soundscape selection with external events (e.g. sidebar player)
  useEffect(() => {
    const handleSoundChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ name: string; playing: boolean }>;
      if (customEvent.detail && customEvent.detail.name) {
        setSelectedSound(customEvent.detail.name);
        setSoundPlaying(customEvent.detail.playing);
      }
    };

    window.addEventListener("flowstate_sound_change", handleSoundChange);
    return () => {
      window.removeEventListener("flowstate_sound_change", handleSoundChange);
    };
  }, []);

  const handleSoundSelect = (soundName: string) => {
    setSelectedSound(soundName);
    const playing = soundName !== "Silent";
    setSoundPlaying(playing);

    if (typeof window !== "undefined") {
      localStorage.setItem("flowstate_active_soundscape", soundName);
      localStorage.setItem("flowstate_soundscape_playing", String(playing));
      window.dispatchEvent(
        new CustomEvent("flowstate_sound_change", {
          detail: { name: soundName, playing },
        })
      );
    }
  };

  useEffect(() => {
    const tick = () => {
      const savedRunning = localStorage.getItem(STORAGE_KEY_RUNNING) === "true";
      const savedTargetEndTime = localStorage.getItem(STORAGE_KEY_TARGET_END_TIME);
      const savedMode = (localStorage.getItem(STORAGE_KEY_MODE) as TimerMode) || "focus";

      if (savedRunning && savedTargetEndTime) {
        const targetEndTime = Number(savedTargetEndTime);
        const now = Date.now();
        const left = Math.max(0, Math.ceil((targetEndTime - now) / 1000));

        // Low time notification trigger (2 mins = 120s, 1 min = 60s)
        if (left === 120 || left === 60) {
          if (!notifiedTimesRef.current.has(left)) {
            notifiedTimesRef.current.add(left);
            if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
              new Notification("FlowState Focus Alert ⚡", {
                body: `Focus session ending soon! ${Math.ceil(left / 60)} minute${left > 60 ? "s" : ""} remaining.`,
                icon: "/favicon.ico",
              });
            }
          }
        }

        if (left > 120) {
          notifiedTimesRef.current.clear();
        }

        if (left <= 0) {
          handleTimerCompletion(savedMode);
        } else {
          setTimeLeft(left);
          setTimerActive(true);
          setTimerTime(formatTime(left));
        }
      }
    };

    const interval = setInterval(tick, 1000);
    window.addEventListener("focus", tick);
    window.addEventListener("visibilitychange", tick);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", tick);
      window.removeEventListener("visibilitychange", tick);
    };
  }, [handleTimerCompletion, setTimerActive, setTimerTime]);

  const toggleTimer = () => {
    const savedRunning = localStorage.getItem(STORAGE_KEY_RUNNING) === "true";

    if (savedRunning) {
      // Pause
      const savedTargetEndTime = localStorage.getItem(STORAGE_KEY_TARGET_END_TIME);
      let left = timeLeft;
      if (savedTargetEndTime) {
        left = Math.max(0, Math.ceil((Number(savedTargetEndTime) - Date.now()) / 1000));
      }
      localStorage.setItem(STORAGE_KEY_RUNNING, "false");
      localStorage.removeItem(STORAGE_KEY_TARGET_END_TIME);
      localStorage.setItem(STORAGE_KEY_REMAINING, String(left));

      setTimeLeft(left);
      setTimerActive(false);
      setTimerTime(formatTime(left));
    } else {
      // Start / Resume
      const timeToUse = timeLeft <= 0 ? modeDurations[mode] : timeLeft;
      const targetEndTime = Date.now() + timeToUse * 1000;

      localStorage.setItem(STORAGE_KEY_TARGET_END_TIME, String(targetEndTime));
      localStorage.setItem(STORAGE_KEY_RUNNING, "true");
      localStorage.setItem(STORAGE_KEY_MODE, mode);
      localStorage.removeItem(STORAGE_KEY_REMAINING);

      setTimeLeft(timeToUse);
      setTimerActive(true);
      setTimerTime(formatTime(timeToUse));
    }
  };

  // State-protected mode change: prevents accidental resets while active
  const applyModeChange = (newMode: TimerMode) => {
    setMode(newMode);
    const duration = modeDurations[newMode];

    localStorage.setItem(STORAGE_KEY_MODE, newMode);
    localStorage.setItem(STORAGE_KEY_RUNNING, "false");
    localStorage.removeItem(STORAGE_KEY_TARGET_END_TIME);
    localStorage.setItem(STORAGE_KEY_REMAINING, String(duration));

    setTimeLeft(duration);
    setTimerActive(false);
    setTimerTime(formatTime(duration));
    setPendingModeSwitch(null);
  };

  const handleModeChange = (newMode: TimerMode) => {
    if (newMode === mode) return;

    // Check if a session is currently running
    const isRunning = timerActive || localStorage.getItem(STORAGE_KEY_RUNNING) === "true";
    if (isRunning) {
      // State Protection: prompt the user to confirm switching modes instead of silently resetting
      setPendingModeSwitch(newMode);
      return;
    }

    applyModeChange(newMode);
  };

  // Fully resets the current mode's timer back to default duration, clears target end time, and pauses
  const handleReset = () => {
    const duration = modeDurations[mode];

    localStorage.setItem(STORAGE_KEY_RUNNING, "false");
    localStorage.removeItem(STORAGE_KEY_TARGET_END_TIME);
    localStorage.setItem(STORAGE_KEY_REMAINING, String(duration));

    setTimeLeft(duration);
    setTimerActive(false);
    setTimerTime(formatTime(duration));
    setPendingModeSwitch(null);
  };

  const handleSkip = () => {
    const nextMode: TimerMode = mode === "focus" ? "shortBreak" : "focus";
    applyModeChange(nextMode);
  };

  // Set custom duration for Focus mode
  const handleSetCustomFocus = (mins: number) => {
    const validMins = Math.max(1, Math.min(120, mins));
    setCustomFocusMins(validMins);
    localStorage.setItem(STORAGE_KEY_FOCUS_DURATION, String(validMins));

    if (mode === "focus" && !timerActive) {
      const newDurationSec = validMins * 60;
      setTimeLeft(newDurationSec);
      setTimerTime(formatTime(newDurationSec));
      localStorage.setItem(STORAGE_KEY_REMAINING, String(newDurationSec));
    }
  };

  const totalModeDuration = modeDurations[mode];
  const progressRatio = totalModeDuration > 0 ? (totalModeDuration - timeLeft) / totalModeDuration : 0;

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

          <div className="flex items-center gap-2">
            {mode === "focus" && (
              <button
                onClick={() => setShowCustomDuration(!showCustomDuration)}
                className={`p-1.5 rounded-lg border text-xs transition-all flex items-center gap-1 ${
                  showCustomDuration
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                    : "bg-slate-900/60 border-white/10 text-slate-400 hover:text-slate-200"
                }`}
                title="Customize Focus Duration"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="text-[10px] font-mono">{customFocusMins}m</span>
              </button>
            )}

            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${modeColors[mode].badge}`}
            >
              {mode === "focus"
                ? `Deep Work (${customFocusMins}m)`
                : mode === "shortBreak"
                ? "Short Rest"
                : "Long Recovery"}
            </span>
          </div>
        </div>

        {/* Custom Duration Selector Dropdown / Inline Controls */}
        <AnimatePresence>
          {showCustomDuration && mode === "focus" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 rounded-2xl bg-slate-900/90 border border-white/10 backdrop-blur-xl space-y-2 overflow-hidden"
            >
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Focus Session Length:
                </span>
                <span className="font-mono text-emerald-400 font-bold">{customFocusMins} minutes</span>
              </div>
              <div className="flex items-center gap-2">
                {[15, 20, 25, 40, 50, 60].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => handleSetCustomFocus(mins)}
                    className={`flex-1 py-1 rounded-lg text-xs font-semibold font-mono transition-all border ${
                      customFocusMins === mins
                        ? "bg-emerald-500/25 border-emerald-500/50 text-emerald-300 shadow-sm"
                        : "bg-slate-800/60 border-white/5 text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="range"
                  min="5"
                  max="90"
                  step="5"
                  value={customFocusMins}
                  onChange={(e) => handleSetCustomFocus(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
                    ? `Focus (${customFocusMins}m)`
                    : m === "shortBreak"
                    ? "Break (5m)"
                    : "Rest (15m)"}
                </span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Mode Switch State Protection Modal */}
      <AnimatePresence>
        {pendingModeSwitch && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-4 z-30 rounded-2xl bg-slate-950/95 backdrop-blur-2xl border border-amber-500/30 p-5 flex flex-col justify-center items-center text-center space-y-4 shadow-2xl"
          >
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Focus Session Active</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Your current session countdown is still running. Switching modes will pause and change your active cycle.
              </p>
            </div>
            <div className="flex items-center gap-3 w-full max-w-xs">
              <button
                onClick={() => setPendingModeSwitch(null)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-slate-850 hover:bg-slate-800 text-slate-300 border border-white/10 transition-all"
              >
                Keep Active
              </button>
              <button
                onClick={() => applyModeChange(pendingModeSwitch)}
                className="flex-1 py-2 rounded-xl text-xs font-extrabold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-lg"
              >
                Switch & Reset
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
            onClick={toggleTimer}
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
                onClick={() => handleSoundSelect(s.name)}
                className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                  selectedSound === s.name && soundPlaying
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
