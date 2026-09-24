"use client";

import { motion } from "framer-motion";
import { navIcons } from "@/components/icons";
import { navItems } from "@/lib/dashboard-data";

type SidebarProps = {
  activeId: string;
  onNavigate: (id: string) => void;
  collapsed?: boolean;
};

export function Sidebar({ activeId, onNavigate, collapsed = false }: SidebarProps) {
  return (
    <aside
      className={`flex h-full flex-col border-r border-white/5 bg-zinc-950/80 backdrop-blur-2xl ${
        collapsed ? "w-[4.75rem] px-2.5" : "w-64 px-3"
      } py-5 transition-[width,padding] duration-300`}
    >
      <div className={`mb-8 flex items-center gap-3 ${collapsed ? "justify-center px-0" : "px-2"}`}>
        <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-400/40">
          <span className="absolute inset-0 rounded-xl bg-emerald-400/20 blur-md" />
          <span className="relative font-mono text-sm font-semibold tracking-tight text-emerald-300">
            FS
          </span>
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-semibold tracking-tight text-zinc-50">FlowState</p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Deep work OS</p>
          </div>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-1" aria-label="Primary">
        {navItems.map((item) => {
          const Icon = navIcons[item.id as keyof typeof navIcons];
          const active = item.id === activeId;
          return (
            <motion.button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              whileHover={{ x: collapsed ? 0 : 3 }}
              whileTap={{ scale: 0.97 }}
              className={`group relative flex items-center gap-3 rounded-xl py-2.5 text-sm transition-colors ${
                collapsed ? "justify-center px-0" : "px-3"
              } ${
                active
                  ? "bg-emerald-500/10 text-emerald-200"
                  : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
              }`}
              aria-current={active ? "page" : undefined}
              title={collapsed ? item.label : undefined}
            >
              {active && (
                <motion.span
                  layoutId="nav-glow"
                  className="absolute inset-0 rounded-xl ring-1 ring-emerald-400/30 shadow-[0_0_24px_rgba(52,211,153,0.12)]"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <Icon className={`relative z-10 h-[18px] w-[18px] ${active ? "text-emerald-300" : ""}`} />
              {!collapsed && (
                <span className="relative z-10 font-medium tracking-tight">{item.label}</span>
              )}
            </motion.button>
          );
        })}
      </nav>

      <div
        className={`mt-auto rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.06] p-3 ${
          collapsed ? "text-center" : ""
        }`}
      >
        <p className={`text-[10px] uppercase tracking-[0.16em] text-zinc-500 ${collapsed ? "hidden" : ""}`}>
          Daily energy
        </p>
        <div className={`mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800 ${collapsed ? "mt-0" : ""}`}>
          <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-emerald-500 to-lime-300 shadow-[0_0_12px_rgba(52,211,153,0.6)]" />
        </div>
        {!collapsed && (
          <p className="mt-2 text-xs text-zinc-400">
            72% — stay in flow until 6:00
          </p>
        )}
      </div>
    </aside>
  );
}
