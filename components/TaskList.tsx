"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Sparkles,
  Flame,
  Tag,
  Clock,
  Filter,
  CheckCircle2,
} from "lucide-react";

export interface Task {
  id: string;
  title: string;
  category: "Deep Work" | "Urgent" | "Planning" | "Quick Win";
  duration: string;
  completed: boolean;
}

interface TaskListProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

export function TaskList({ tasks, setTasks }: TaskListProps) {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    "Deep Work" | "Urgent" | "Planning" | "Quick Win"
  >("Deep Work");
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [showAddForm, setShowAddForm] = useState(false);

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      category: selectedCategory,
      duration: "45m",
      completed: false,
    };

    setTasks((prev) => [newTask, ...prev]);
    setNewTaskTitle("");
    setShowAddForm(false);
  };

  const filteredTasks = tasks.filter((t) => {
    if (filterCategory === "All") return true;
    return t.category === filterCategory;
  });

  const categoryBadgeStyles: Record<Task["category"], string> = {
    "Deep Work": "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    Urgent: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    Planning: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    "Quick Win": "bg-amber-500/10 text-amber-400 border-amber-500/30",
  };

  return (
    <div className="glass-card relative p-6 rounded-3xl border border-white/10 shadow-2xl flex flex-col justify-between h-full overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div>
        {/* Header Title & Progress */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
                <CheckSquare className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-100 tracking-wide">
                Daily Most Important Tasks (MITs)
              </h2>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Focus on top priorities to unlock peak state
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-[0_0_12px_rgba(16,185,129,0.25)] transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add MIT</span>
          </button>
        </div>

        {/* Task Completion Progress Meter */}
        <div className="py-3 space-y-1.5">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-slate-300">
              Daily Progress:{" "}
              <strong className="text-emerald-400 font-mono">
                {completedCount}/{totalCount}
              </strong>{" "}
              Completed
            </span>
            <span className="text-slate-400 font-mono">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-900 border border-white/5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.6)]"
            />
          </div>
        </div>

        {/* Filter Category Chips */}
        <div className="flex items-center gap-1.5 pt-1 pb-3 overflow-x-auto">
          <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0 mr-1" />
          {["All", "Deep Work", "Urgent", "Planning", "Quick Win"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
                filterCategory === cat
                  ? "bg-slate-800 text-slate-100 border border-white/20 shadow-sm"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Add Task Quick Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={addTask}
              className="mb-4 p-3 rounded-2xl bg-slate-900/90 border border-emerald-500/30 space-y-3"
            >
              <input
                type="text"
                placeholder="What is your top priority task today?"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                autoFocus
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-white/10 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />

              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-1.5">
                  {(
                    ["Deep Work", "Urgent", "Planning", "Quick Win"] as const
                  ).map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all border ${
                        selectedCategory === cat
                          ? categoryBadgeStyles[cat]
                          : "text-slate-400 border-white/5"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  className="px-3 py-1 text-xs font-bold text-slate-950 rounded-lg bg-emerald-400 hover:bg-emerald-300 transition-all shadow-md"
                >
                  Save Task
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Checklist Items */}
        <div className="space-y-2.5 max-h-[310px] overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {filteredTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                layout
                className={`group flex items-center justify-between p-3 rounded-2xl border transition-all duration-200 ${
                  task.completed
                    ? "bg-white/[0.02] border-white/5 opacity-60"
                    : "bg-slate-900/50 hover:bg-slate-900/80 border-white/10 hover:border-white/20 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Interactive Checkbox */}
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`flex items-center justify-center w-5 h-5 rounded-lg border transition-all shrink-0 ${
                      task.completed
                        ? "bg-emerald-500 border-emerald-400 text-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                        : "border-white/20 hover:border-emerald-400 text-transparent"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                  </button>

                  {/* Task Content */}
                  <div className="flex flex-col min-w-0">
                    <span
                      className={`text-xs font-semibold truncate transition-all ${
                        task.completed
                          ? "line-through text-slate-500"
                          : "text-slate-200 group-hover:text-white"
                      }`}
                    >
                      {task.title}
                    </span>

                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                          categoryBadgeStyles[task.category]
                        }`}
                      >
                        {task.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {task.duration}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all ml-2"
                  title="Delete task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredTasks.length === 0 && (
            <div className="py-8 text-center text-slate-500 text-xs">
              No tasks found in this category. Click "+ Add MIT" to create one!
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" /> Auto-sync enabled
        </span>
        <span className="font-mono text-slate-500">
          Completed today: {completedCount}
        </span>
      </div>
    </div>
  );
}
