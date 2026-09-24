"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { initialTasks, type Task, type TaskPriority } from "@/lib/dashboard-data";
import { fadeIn } from "@/lib/motion";

const priorityStyles: Record<TaskPriority, string> = {
  high: "border-rose-400/30 bg-rose-400/10 text-rose-200",
  medium: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  low: "border-zinc-500/30 bg-zinc-500/10 text-zinc-300",
};

export function RecentTasks() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const toggle = (id: string) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, done: !task.done } : task)),
    );
  };

  const remaining = tasks.filter((task) => !task.done).length;

  return (
    <motion.section
      variants={fadeIn}
      className="rounded-2xl border border-white/8 bg-white/[0.035] p-5 backdrop-blur-xl"
    >
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Queue</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">Recent tasks</h2>
        </div>
        <p className="text-sm text-zinc-400">
          {remaining} open · {tasks.length - remaining} done
        </p>
      </div>

      <ul className="space-y-2">
        <AnimatePresence initial={false}>
          {tasks.map((task) => (
            <motion.li
              key={task.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="group flex items-center gap-3 rounded-xl border border-white/5 bg-zinc-950/40 px-3 py-3 transition hover:border-emerald-400/20"
            >
              <button
                type="button"
                onClick={() => toggle(task.id)}
                aria-pressed={task.done}
                aria-label={`Mark ${task.title} ${task.done ? "incomplete" : "complete"}`}
                className="relative grid h-6 w-6 shrink-0 place-items-center"
              >
                <motion.span
                  className={`h-6 w-6 rounded-md border ${
                    task.done
                      ? "border-emerald-400 bg-emerald-400"
                      : "border-white/20 bg-transparent"
                  }`}
                  animate={{ scale: task.done ? [1, 1.18, 1] : 1 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                />
                <AnimatePresence>
                  {task.done && (
                    <motion.svg
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      exit={{ opacity: 0 }}
                      viewBox="0 0 24 24"
                      className="absolute h-3.5 w-3.5 text-zinc-950"
                    >
                      <motion.path
                        d="M5 13l4 4L19 7"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.28 }}
                      />
                    </motion.svg>
                  )}
                </AnimatePresence>
              </button>

              <div className="min-w-0 flex-1">
                <p
                  className={`truncate text-sm font-medium ${
                    task.done ? "text-zinc-500 line-through" : "text-zinc-100"
                  }`}
                >
                  {task.title}
                </p>
                <p className="truncate text-xs text-zinc-500">
                  {task.project} · {task.due}
                </p>
              </div>

              <span
                className={`hidden rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] sm:inline ${priorityStyles[task.priority]}`}
              >
                {task.priority}
              </span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </motion.section>
  );
}
