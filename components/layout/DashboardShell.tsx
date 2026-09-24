"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconClose } from "@/components/icons";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";

type DashboardShellProps = {
  children: React.ReactNode;
  onStartFocus: () => void;
};

export function DashboardShell({ children, onStartFocus }: DashboardShellProps) {
  const [activeId, setActiveId] = useState("overview");
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="relative flex min-h-screen bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-[-8rem] h-80 w-80 rounded-full bg-emerald-500/15 blur-[110px]" />
        <div className="absolute right-[-6rem] top-24 h-72 w-72 rounded-full bg-teal-400/10 blur-[120px]" />
        <div className="absolute bottom-[-8rem] left-1/3 h-80 w-80 rounded-full bg-emerald-600/10 blur-[130px]" />
      </div>

      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex">
        <Sidebar activeId={activeId} onNavigate={setActiveId} />
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              aria-label="Close navigation overlay"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="relative h-full w-64"
            >
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="absolute right-3 top-4 z-10 grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-zinc-300"
                aria-label="Close navigation"
              >
                <IconClose className="h-4 w-4" />
              </button>
              <Sidebar
                activeId={activeId}
                onNavigate={(id) => {
                  setActiveId(id);
                  setMobileOpen(false);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex min-h-screen flex-1 flex-col lg:pl-64">
        <Navbar onMenuClick={() => setMobileOpen(true)} onStartFocus={onStartFocus} />
        {children}
      </div>
    </div>
  );
}
