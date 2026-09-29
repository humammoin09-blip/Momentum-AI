"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar, NavTab } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { StatCards } from "@/components/StatCards";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import TaskList, { Task } from "@/components/TaskList";
import { ConsistencyHeatmap } from "@/components/ConsistencyHeatmap";
import { Sparkles, Flame, Zap, Shield, ArrowRight, BarChart3, Timer, CheckSquare } from "lucide-react";

export default function FlowStateDashboard() {
  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [timerTime, setTimerTime] = useState<string>("25:00");
  const [focusHours, setFocusHours] = useState<number>(5.4);
  const [streakDays, setStreakDays] = useState<number>(14);

  // Request browser notification permissions on app load
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // Background timer sync to keep Header and Sidebar updated when on other tabs or returning from OS focus
  useEffect(() => {
    const syncGlobalTimer = () => {
      if (typeof window === "undefined") return;

      const running = localStorage.getItem("flowstate_pomodoro_running") === "true";
      const targetEndTime = localStorage.getItem("flowstate_pomodoro_target_end_time");
      const savedRemaining = localStorage.getItem("flowstate_pomodoro_remaining");

      if (running && targetEndTime) {
        const left = Math.max(0, Math.ceil((Number(targetEndTime) - Date.now()) / 1000));
        if (left > 0) {
          setTimerActive(true);
          const m = Math.floor(left / 60);
          const s = left % 60;
          setTimerTime(`${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`);
        } else {
          setTimerActive(false);
          setTimerTime("00:00");
        }
      } else if (savedRemaining !== null) {
        setTimerActive(false);
        const rem = Math.max(0, Number(savedRemaining));
        const m = Math.floor(rem / 60);
        const s = rem % 60;
        setTimerTime(`${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`);
      }
    };

    syncGlobalTimer();
    const interval = setInterval(syncGlobalTimer, 1000);
    window.addEventListener("focus", syncGlobalTimer);
    window.addEventListener("visibilitychange", syncGlobalTimer);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", syncGlobalTimer);
      window.removeEventListener("visibilitychange", syncGlobalTimer);
    };
  }, []);

  // Initial Daily MIT Tasks
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Architect FlowState OLED Dashboard Layout",
      category: "Deep Work",
      duration: "60m",
      completed: true,
    },
    {
      id: "2",
      title: "Refactor Framer Motion Staggered Animations",
      category: "Deep Work",
      duration: "45m",
      completed: true,
    },
    {
      id: "3",
      title: "Integrate Pomodoro Timer & Soundscape Audio Engine",
      category: "Urgent",
      duration: "30m",
      completed: true,
    },
    {
      id: "4",
      title: "Build Weekly Consistency Heatmap & Bar Chart",
      category: "Planning",
      duration: "45m",
      completed: true,
    },
    {
      id: "5",
      title: "Review System Performance & Edge Case Lints",
      category: "Quick Win",
      duration: "15m",
      completed: false,
    },
  ]);

  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.length - completedCount;

  // Stagger Container Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" as const },
    },
  };


  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans relative overflow-x-hidden selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Background Radial Neon Mesh Gradient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] opacity-70" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[140px] opacity-70" />
        <div className="absolute top-1/2 right-10 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Left Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingTasksCount={pendingCount}
        timerActive={timerActive}
        timerTime={timerTime}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        {/* Top Header */}
        <Header timerActive={timerActive} timerTime={timerTime} />

        {/* Content Area */}
        <main className="flex-1 px-4 sm:px-8 py-6 space-y-6 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* TOP ROW: 3 Dynamic Stat Cards */}
                <motion.section variants={itemVariants}>
                  <StatCards
                    totalFocusHours={focusHours}
                    streakDays={streakDays}
                    completedTasks={completedCount}
                    totalTasks={tasks.length}
                  />
                </motion.section>

                {/* MIDDLE SECTION: Split Layout (Pomodoro Timer Left, Daily MITs Right) */}
                <motion.section
                  variants={itemVariants}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
                >
                  <div className="lg:col-span-5">
                    <PomodoroTimer
                      timerActive={timerActive}
                      setTimerActive={setTimerActive}
                      timerTime={timerTime}
                      setTimerTime={setTimerTime}
                      onFocusComplete={() => {
                        setFocusHours((prev) => +(prev + 0.42).toFixed(1));
                      }}
                    />
                  </div>

                  <div className="lg:col-span-7">
                    <TaskList tasks={tasks} setTasks={setTasks} />
                  </div>
                </motion.section>

                {/* BOTTOM SECTION: Weekly Consistency Heatmap */}
                <motion.section variants={itemVariants}>
                  <ConsistencyHeatmap />
                </motion.section>
              </motion.div>
            )}

            {activeTab === "timer" && (
              <motion.div
                key="timerTab"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-2xl mx-auto py-8"
              >
                <div className="mb-4 text-center">
                  <h2 className="text-2xl font-extrabold text-white">
                    Full-Screen Focus Chamber
                  </h2>
                  <p className="text-xs text-slate-400">
                    Minimize distractions and step into ultra-deep flow
                  </p>
                </div>
                <div className="h-[520px]">
                  <PomodoroTimer
                    timerActive={timerActive}
                    setTimerActive={setTimerActive}
                    timerTime={timerTime}
                    setTimerTime={setTimerTime}
                    onFocusComplete={() => {
                      setFocusHours((prev) => +(prev + 0.42).toFixed(1));
                    }}
                  />
                </div>
              </motion.div>
            )}

            {activeTab === "tasks" && (
              <motion.div
                key="tasksTab"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-4xl mx-auto py-4"
              >
                <div className="h-[620px]">
                  <TaskList tasks={tasks} setTasks={setTasks} />
                </div>
              </motion.div>
            )}

            {activeTab === "analytics" && (
              <motion.div
                key="analyticsTab"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <ConsistencyHeatmap />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
