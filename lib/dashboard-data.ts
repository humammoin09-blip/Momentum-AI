import { supabase } from "@/lib/supabase";

export type NavItem = {
  id: string;
  label: string;
  href: string;
};

export const navItems: NavItem[] = [
  { id: "overview", label: "Overview", href: "#" },
  { id: "focus", label: "Focus", href: "#" },
  { id: "tasks", label: "Tasks", href: "#" },
  { id: "calendar", label: "Calendar", href: "#" },
  { id: "insights", label: "Insights", href: "#" },
  { id: "settings", label: "Settings", href: "#" },
];

export type StatCard = {
  id: string;
  label: string;
  value: string;
  delta: string;
  trend: "up" | "steady";
  hint: string;
};

export const stats: StatCard[] = [
  {
    id: "focus",
    label: "Focus hours today",
    value: "4.6h",
    delta: "+38m vs yesterday",
    trend: "up",
    hint: "Deep work blocks",
  },
  {
    id: "completion",
    label: "Task completion",
    value: "86%",
    delta: "12 of 14 shipped",
    trend: "up",
    hint: "Daily throughput",
  },
  {
    id: "streak",
    label: "Current streak",
    value: "21d",
    delta: "Personal best",
    trend: "steady",
    hint: "Consistency lock",
  },
];

export type TaskPriority = "high" | "medium" | "low";

export type Task = {
  id: string;
  title: string;
  project: string;
  due: string;
  priority: TaskPriority;
  done: boolean;
};

export const initialTasks: Task[] = [
  {
    id: "t1",
    title: "Ship dashboard motion polish",
    project: "FlowState",
    due: "Today · 5:00 PM",
    priority: "high",
    done: false,
  },
  {
    id: "t2",
    title: "Review weekly focus report",
    project: "Rituals",
    due: "Today · 6:30 PM",
    priority: "medium",
    done: false,
  },
  {
    id: "t3",
    title: "Draft sprint goals with Maya",
    project: "Team",
    due: "Tomorrow · 10:00 AM",
    priority: "high",
    done: false,
  },
  {
    id: "t4",
    title: "Archive completed deep-work notes",
    project: "Knowledge",
    due: "Tomorrow · 4:00 PM",
    priority: "low",
    done: true,
  },
  {
    id: "t5",
    title: "Schedule recovery block",
    project: "Wellbeing",
    due: "Fri · 2:00 PM",
    priority: "medium",
    done: false,
  },
];
