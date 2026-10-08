"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Sparkles,
  Flame,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Target,
  RefreshCw,
  Bell,
  Play,
  Quote,
  CheckCircle2,
  Skull,
  Swords,
} from "lucide-react";
import {
  DisciplineAssessment,
  fetchDisciplineCoaching,
} from "@/lib/discipline-service";
import { sendTestStreakAlert } from "@/lib/streak-protection";

interface AIDisciplineCoachProps {
  focusHours: number;
  dailyGoal: number;
  streakDays: number;
  completedTasks: number;
  totalTasks: number;
  userName: string;
  onStartFocusSession?: () => void;
  onOpenStreakLossModal?: () => void;
}

export function AIDisciplineCoach({
  focusHours,
  dailyGoal,
  streakDays,
  completedTasks,
  totalTasks,
  userName,
  onStartFocusSession,
  onOpenStreakLossModal,
}: AIDisciplineCoachProps) {
  const [tone, setTone] = useState<"reality-check" | "tactical" | "stoic">("reality-check");
  const [assessment, setAssessment] = useState<DisciplineAssessment | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);
  const [notificationTestSent, setNotificationTestSent] = useState<boolean>(false);

  // Auto-fetch or refresh assessment when metrics or tone change
  const loadAssessment = async (selectedTone = tone) => {
    setLoading(true);
    try {
      const result = await fetchDisciplineCoaching({
        focusHours,
        dailyGoal,
        streakDays,
        completedTasks,
        totalTasks,
        userName,
        tone: selectedTone,
      });
      setAssessment(result);
      setLastRefreshed(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    } catch (err) {
      console.warn("Failed to retrieve coaching evaluation:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssessment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusHours, dailyGoal, streakDays, completedTasks, totalTasks]);

  const handleToneChange = (newTone: "reality-check" | "tactical" | "stoic") => {
    setTone(newTone);
    loadAssessment(newTone);
  };

  const handleTestNotification = () => {
    const success = sendTestStreakAlert({ streakDays, focusHours });
    if (success) {
      setNotificationTestSent(true);
      setTimeout(() => setNotificationTestSent(false), 4000);
    }
  };

  const completionPercent = dailyGoal > 0 ? Math.min(100, Math.round((focusHours / dailyGoal) * 100)) : 0;
  const taskRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Status badges
  const getVerdictBadge = () => {
    if (!assessment) return null;
    switch (assessment.verdict) {
      case "CRITICAL_DRIFT":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 border border-rose-500/40 text-rose-400">
            <Skull className="w-3.5 h-3.5 text-rose-400" />
            CRITICAL DRIFT - ZERO FOCUS
          </span>
        );
      case "BEHIND_SCHEDULE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 border border-amber-500/40 text-amber-400">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            BEHIND DAILY TARGET
          </span>
        );
      case "ON_TRACK":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 border border-indigo-500/40 text-indigo-400">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            MOMENTUM BUILDING
          </span>
        );
      case "AHEAD_OF_SCHEDULE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 border border-emerald-500/40 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            TARGET EXECUTED
          </span>
        );
    }
  };

  return (
    <div className="relative rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950/90 border border-slate-800 shadow-xl overflow-hidden backdrop-blur-md">
      {/* Subtle top glowing bar based on status */}
      <div
        className={`h-1 w-full bg-gradient-to-r ${
          assessment?.verdict === "CRITICAL_DRIFT"
            ? "from-rose-600 via-amber-500 to-rose-600"
            : assessment?.verdict === "BEHIND_SCHEDULE"
            ? "from-amber-500 via-orange-400 to-amber-500"
            : "from-emerald-500 via-cyan-400 to-indigo-500"
        }`}
      />

      <div className="p-5 sm:p-6 space-y-5">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
              <Brain className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  AI Discipline Coach & Reality Check
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono tracking-wider font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    gemini-3.5-flash-lite
                  </span>
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Psychological accountability powered by Google Gemini AI
              </p>
            </div>
          </div>

          {/* Action & Tone Controls */}
          <div className="flex items-center flex-wrap gap-2">
            <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => handleToneChange("reality-check")}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  tone === "reality-check"
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Reality Check
              </button>
              <button
                type="button"
                onClick={() => handleToneChange("tactical")}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  tone === "tactical"
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Tactical
              </button>
              <button
                type="button"
                onClick={() => handleToneChange("stoic")}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  tone === "stoic"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Stoic
              </button>
            </div>

            <button
              type="button"
              onClick={() => loadAssessment()}
              disabled={loading}
              title="Refresh AI reality check"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* Live Metrics Accountability Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/80">
          <div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Focus vs Target
            </div>
            <div className="text-sm font-bold text-slate-100 flex items-center gap-1.5 mt-0.5">
              <span>{focusHours.toFixed(1)}h</span>
              <span className="text-slate-500 text-xs">/ {dailyGoal}h</span>
              <span className={`text-[11px] font-semibold ${completionPercent >= 100 ? "text-emerald-400" : "text-amber-400"}`}>
                ({completionPercent}%)
              </span>
            </div>
          </div>

          <div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Active Streak
            </div>
            <div className="text-sm font-bold text-amber-400 flex items-center gap-1.5 mt-0.5">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>{streakDays} Days</span>
            </div>
          </div>

          <div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Task Completion
            </div>
            <div className="text-sm font-bold text-indigo-300 flex items-center gap-1.5 mt-0.5">
              <Target className="w-3.5 h-3.5 text-indigo-400" />
              <span>{completedTasks}/{totalTasks}</span>
              <span className="text-slate-500 text-xs">({taskRate}%)</span>
            </div>
          </div>

          <div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Discipline Score
            </div>
            <div className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  (assessment?.disciplineScore || 0) > 75
                    ? "bg-emerald-400"
                    : (assessment?.disciplineScore || 0) > 40
                    ? "bg-amber-400"
                    : "bg-rose-400"
                }`}
              />
              <span>{assessment ? `${assessment.disciplineScore}/100` : "Calculating..."}</span>
            </div>
          </div>
        </div>

        {/* AI Coaching Output Box */}
        <div className="relative rounded-xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {getVerdictBadge()}
              {lastRefreshed && (
                <span className="text-[10px] text-slate-500">
                  Evaluated at {lastRefreshed}
                </span>
              )}
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestNotification}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-all"
                title="Test strategic evening streak protection notification"
              >
                <Bell className="w-3 h-3 text-amber-400" />
                {notificationTestSent ? "Alert Sent! ✓" : "Test Streak Shield"}
              </button>

              {onOpenStreakLossModal && (
                <button
                  type="button"
                  onClick={onOpenStreakLossModal}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all"
                  title="View Broken Streak Psychological Recovery Intervention"
                >
                  <Swords className="w-3 h-3 text-rose-400" />
                  Rebuild Mindset
                </button>
              )}
            </div>
          </div>

          {/* Coaching Headline & Message */}
          <div className="space-y-2">
            {loading ? (
              <div className="py-6 flex flex-col items-center justify-center gap-2 text-slate-400">
                <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
                <span className="text-xs">Consulting AI Discipline Coach...</span>
              </div>
            ) : assessment ? (
              <>
                <h4 className="text-base font-extrabold text-slate-100 tracking-tight">
                  {assessment.headline}
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed font-sans">
                  {assessment.coachingMessage}
                </p>

                {/* Direct Action Directive */}
                {assessment.actionableDirective && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3 p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/30">
                    <div className="flex items-start gap-2.5 text-xs text-indigo-200">
                      <Zap className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-white">Immediate Directive: </span>
                        <span>{assessment.actionableDirective}</span>
                      </div>
                    </div>

                    {onStartFocusSession && (
                      <button
                        type="button"
                        onClick={onStartFocusSession}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md shrink-0 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Execute 25m Block
                      </button>
                    )}
                  </div>
                )}

                {/* Psychological Stoic Quote */}
                {assessment.quote && (
                  <div className="pt-2 border-t border-slate-800/80 flex items-start gap-2 text-xs text-slate-400 italic">
                    <Quote className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                    <span>
                      &ldquo;{assessment.quote}&rdquo;{" "}
                      {assessment.author && (
                        <span className="not-italic text-slate-500 font-medium">
                          — {assessment.author}
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
