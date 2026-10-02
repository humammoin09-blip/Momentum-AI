"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Sparkles,
  Clock,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export interface Task {
  id: string;
  title: string;
  priority?: string;
  category?: string;
  completed: boolean;
  duration?: string;
  remainingSeconds?: number;
  created_at?: string;
}

export interface TaskListProps {
  tasks?: Task[];
  setTasks?: React.Dispatch<React.SetStateAction<Task[]>>;
}

export default function TaskList(props?: TaskListProps) {
  const [internalTasks, setInternalTasks] = useState<Task[]>([]);
  const tasks = props?.tasks ?? internalTasks;
  const setTasks = props?.setTasks ?? setInternalTasks;

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("Medium");
  const [newTaskDuration, setNewTaskDuration] = useState("5");
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    fetchTasks();

    const channel = supabase
      .channel("tasks_realtime_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Countdown timer interval with localStorage sync
  useEffect(() => {
    const timer = setInterval(() => {
      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (task.completed || task.remainingSeconds === undefined) return task;
          if (task.remainingSeconds <= 0) return task;

          const newTime = task.remainingSeconds - 1;
          localStorage.setItem(`task_timer_${task.id}`, newTime.toString());

          if (newTime === 120 || newTime === 60) {
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("FlowState Alert ⚡", {
                body: `Task "${task.title}" is due soon! Only ${Math.ceil(newTime / 60)} minutes left.`,
                icon: "/favicon.ico",
              });
            }
          }

          return { ...task, remainingSeconds: newTime };
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const pendingTasks = tasks.filter((t) => !t.completed && t.priority === "High");
    setShowAlert(pendingTasks.length > 0);
  }, [tasks]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) {
        const formattedTasks = data.map((t) => {
          const savedTime = localStorage.getItem(`task_timer_${t.id}`);
          const mins = parseInt(t.duration) || 5;
          return {
            ...t,
            remainingSeconds: savedTime !== null ? parseInt(savedTime) : mins * 60,
          };
        });
        setTasks(formattedTasks);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const durationMins = parseInt(newTaskDuration) || 5;

    try {
      const { data, error } = await supabase
        .from("tasks")
        .insert([
          {
            title: newTaskTitle,
            priority: newTaskPriority,
            completed: false,
            duration: `${durationMins}m`,
          },
        ])
        .select();

      if (error) throw error;
      if (data) {
        const newTaskId = data[0].id;
        const initialSeconds = durationMins * 60;
        localStorage.setItem(`task_timer_${newTaskId}`, initialSeconds.toString());

        const newTask = {
          ...data[0],
          remainingSeconds: initialSeconds,
        };
        setTasks([newTask, ...tasks]);
        setNewTaskTitle("");
        setNewTaskDuration("5");
      }
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const toggleTask = async (id: string, currentStatus: boolean) => {
    try {
      const nextStatus = !currentStatus;
      const { error } = await supabase
        .from("tasks")
        .update({ completed: nextStatus })
        .eq("id", id);

      if (error) throw error;
      
      if (nextStatus) {
        localStorage.removeItem(`task_timer_${id}`);
      }
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === id ? { ...task, completed: nextStatus } : task
        )
      );
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", id);

      if (error) throw error;
      localStorage.removeItem(`task_timer_${id}`);
      setTasks(tasks.filter((task) => task.id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const formatTime = (seconds?: number) => {
    if (seconds === undefined || isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6 text-white">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Sparkles className="text-cyan-400 w-5 h-5" /> Most Important Tasks (MITs)
        </h2>
      </div>

      <AnimatePresence>
        {showAlert && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-3 shadow-lg"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
              <span>
                <strong>Attention Required:</strong> You have high-priority MIT tasks pending focus attention!
              </span>
            </div>
            <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/40 font-mono">
              OS Alerts Active
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={addTask} className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500"
        />
        
        <input
          type="number"
          value={newTaskDuration}
          onChange={(e) => setNewTaskDuration(e.target.value)}
          placeholder="Mins (e.g. 5)"
          className="w-full sm:w-28 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-cyan-500 text-neutral-300 font-mono"
        />

        <select
          value={newTaskPriority}
          onChange={(e) => setNewTaskPriority(e.target.value)}
          className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-cyan-500 text-neutral-400"
        >
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <button
          type="submit"
          className="bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-semibold px-5 py-3 rounded-xl transition flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </form>

      <div className="space-y-3">
        {loading ? (
          <p className="text-neutral-500 text-center py-6">Loading tasks from database...</p>
        ) : tasks.length === 0 ? (
          <p className="text-neutral-500 text-center py-6">No tasks found. Add your first task above!</p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center justify-between p-4 rounded-xl border transition ${
                task.completed
                  ? "bg-neutral-900/40 border-neutral-900 text-neutral-500 line-through"
                  : "bg-neutral-900 border-neutral-800 text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <button onClick={() => toggleTask(task.id, task.completed)}>
                  {task.completed ? (
                    <CheckSquare className="w-5 h-5 text-cyan-400" />
                  ) : (
                    <Square className="w-5 h-5 text-neutral-500" />
                  )}
                </button>
                <span>{task.title}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs px-2.5 py-1 rounded-full bg-neutral-800/80 text-cyan-300 flex items-center gap-1 border border-cyan-500/20 font-mono">
                  <Clock className="w-3 h-3" /> {formatTime(task.remainingSeconds)}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-neutral-800 text-neutral-400">
                  {task.priority}
                </span>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-neutral-500 hover:text-red-400 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}