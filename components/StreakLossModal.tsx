"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Quote,
  X,
  Play,
  ShieldAlert,
  ArrowRight,
  Brain,
} from "lucide-react";
import {
  StreakLossIntervention,
  fetchStreakLossQuote,
} from "@/lib/discipline-service";

interface StreakLossModalProps {
  isOpen: boolean;
  onClose: () => void;
  previousStreak: number;
  userName: string;
  onRebuildStreak?: () => void;
}

export function StreakLossModal({
  isOpen,
  onClose,
  previousStreak,
  userName,
  onRebuildStreak,
}: StreakLossModalProps) {
  const [intervention, setIntervention] = useState<StreakLossIntervention | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const loadIntervention = async () => {
    setLoading(true);
    try {
      const data = await fetchStreakLossQuote({
        userName,
        previousStreak,
      });
      setIntervention(data);
    } catch (err) {
      console.warn("Failed to retrieve streak loss quote:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadIntervention();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRebuild = () => {
    onClose();
    if (onRebuildStreak) {
      onRebuildStreak();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5, bounce: 0.15 }}
          className="relative w-full max-w-xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-rose-500/30 rounded-3xl shadow-2xl overflow-hidden z-10 my-8"
        >
          {/* Top glowing ambient hazard accent */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-rose-600 via-amber-500 to-rose-600" />
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-rose-500/10 rounded-full blur-[80px] pointer-events-none" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Header Badge & Title */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-inner">
                  <ShieldAlert className="w-8 h-8 text-rose-500" />
                </div>
                <div className="absolute -bottom-1 -right-1 p-1 bg-slate-950 rounded-full">
                  <Flame className="w-4 h-4 text-amber-500" />
                </div>
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-rose-500/15 border border-rose-500/30 text-rose-400 mb-2">
                  Streak Interrupted
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  The Chain Was Broken.
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
                  {previousStreak > 0
                    ? `Your streak of ${previousStreak} consecutive days has lapsed. Yesterday was missed.`
                    : "A day without focused effort has passed. The chain rests at zero."}
                </p>
              </div>
            </div>

            {/* Psychological Quote Card */}
            <div className="relative rounded-2xl bg-slate-950/80 border border-slate-800/90 p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 font-semibold text-rose-400">
                  <Quote className="w-3.5 h-3.5" />
                  Stoic Reality Check
                </span>
                <span className="font-mono text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">
                  {intervention?.modelUsed || "gemini-3.5-flash-lite"}
                </span>
              </div>

              {loading ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <RotateCcw className="w-5 h-5 animate-spin text-rose-400" />
                  <span className="text-xs">Invoking Psychological Discipline Engine...</span>
                </div>
              ) : (
                <>
                  <blockquote className="text-sm sm:text-base font-serif text-slate-200 italic leading-relaxed">
                    &ldquo;{intervention?.quote || "You have power over your mind - not outside events. Realize this, and you will find strength. Never let one lost battle lose the war."}&rdquo;
                  </blockquote>
                  <div className="text-xs font-semibold text-slate-400 text-right">
                    — {intervention?.author || "Marcus Aurelius"}
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 text-xs text-slate-300 leading-relaxed font-sans">
                    <p className="text-amber-200/90 font-medium mb-1">
                      {intervention?.headline || "Never Miss Twice."}
                    </p>
                    <p className="text-slate-400">
                      {intervention?.psychologicalMessage ||
                        "Missing one day is an accident; missing two is the beginning of a new habit. Regret is useless unless converted into immediate discipline. Reclaim your standard right now."}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Why You Started Reminder */}
            <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Brain className="w-3.5 h-3.5 text-indigo-400" />
                <span>The Iron Law of Momentum:</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                The pain of discipline weighs ounces. The pain of regret weighs tons. You didn&apos;t start this journey to quit when resistance appeared. The only failure is staying down.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleRebuild}
                className="w-full sm:flex-1 py-3 px-5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                Rebuild The Chain (Start 25m Focus)
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto py-3 px-5 rounded-xl font-medium text-xs text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition-colors"
              >
                I Acknowledge
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
