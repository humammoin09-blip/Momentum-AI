"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, X, Check, Target, Sparkles, Database, Upload } from "lucide-react";
import { supabase } from "@/lib/supabase";

type ProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  setUserName: (name: string) => void;
  userTitle: string;
  setUserTitle: (title: string) => void;
  dailyGoal?: string;
  setDailyGoal?: (goal: string) => void;
  userAvatar?: string;
  setUserAvatar?: (avatar: string) => void;
};

export function ProfileModal({
  isOpen,
  onClose,
  userName,
  setUserName,
  userTitle,
  setUserTitle,
  dailyGoal: dailyGoalProp,
  setDailyGoal: setDailyGoalProp,
  userAvatar: userAvatarProp,
  setUserAvatar: setUserAvatarProp,
}: ProfileModalProps) {
  if (!isOpen) return null;

  const [name, setName] = useState(userName);
  const [title, setTitle] = useState(userTitle);
  const [dailyGoal, setDailyGoal] = useState<string>(dailyGoalProp || "6");
  const [selectedAvatar, setSelectedAvatar] = useState<string>(userAvatarProp || "🚀");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(userName);
    setTitle(userTitle);
    const savedGoal = localStorage.getItem("flowstate_daily_goal") || dailyGoalProp || "6";
    const savedAvatar = localStorage.getItem("flowstate_user_avatar") || userAvatarProp || "🚀";
    setDailyGoal(savedGoal);
    setSelectedAvatar(savedAvatar);
  }, [isOpen, userName, userTitle, dailyGoalProp, userAvatarProp]);

  const avatars = ["🚀", "⚡", "💻", "🔥", "🎯", "👑", "🦊"];

  const isCustomImage = (str: string) => {
    return str.startsWith("data:image/") || str.startsWith("http://") || str.startsWith("https://") || str.startsWith("blob:");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (!result) return;

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        const resizedDataUrl = canvas.toDataURL(file.type || "image/png");
        setSelectedAvatar(resizedDataUrl);
      };
      img.onerror = () => {
        setSelectedAvatar(result);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Update local state & localStorage
      setUserName(name);
      setUserTitle(title);
      if (setDailyGoalProp) setDailyGoalProp(dailyGoal);
      if (setUserAvatarProp) setUserAvatarProp(selectedAvatar);

      localStorage.setItem("flowstate_user_name", name);
      localStorage.setItem("flowstate_user_title", title);
      localStorage.setItem("flowstate_daily_goal", dailyGoal);
      localStorage.setItem("flowstate_user_avatar", selectedAvatar);

      // Optional: Sync with Supabase profiles table if configured
      await supabase.from("profiles").upsert({
        id: "current_user", // or user id if auth is active
        display_name: name,
        professional_title: title,
        daily_goal_hours: parseFloat(dailyGoal),
        avatar: selectedAvatar,
        updated_at: new Date(),
      });
    } catch (error) {
      console.error("Error saving profile to Supabase:", error);
    } finally {
      setSaving(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg p-6 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl relative text-white space-y-6"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Profile & Identity Setup</h2>
            <p className="text-xs text-slate-400">Customize your FlowState dashboard presence & goals</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Avatar Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Choose Avatar Icon or Upload Custom Image
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {avatars.map((av) => (
                <button
                  type="button"
                  key={av}
                  onClick={() => setSelectedAvatar(av)}
                  className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center border transition ${
                    selectedAvatar === av
                      ? "bg-emerald-500/20 border-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                      : "bg-slate-950 border-white/10 text-slate-400 hover:border-white/30"
                  }`}
                >
                  {av}
                </button>
              ))}

              {/* Local File Upload Button (type="file" with accept="image/*") */}
              <label
                className={`w-10 h-10 rounded-xl flex items-center justify-center border transition cursor-pointer relative ${
                  isCustomImage(selectedAvatar)
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                    : "bg-slate-950 border-white/10 text-slate-400 hover:border-white/30 hover:text-white"
                }`}
                title="Upload image from device"
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Upload className="w-4 h-4" />
              </label>

              {/* If a custom image is uploaded/selected, show its preview */}
              {isCustomImage(selectedAvatar) && (
                <div
                  className="relative w-10 h-10 rounded-xl overflow-hidden border-2 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                  title="Uploaded Avatar Preview"
                >
                  <img
                    src={selectedAvatar}
                    alt="Custom Avatar"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-emerald-950/20 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-emerald-300 drop-shadow" />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 text-white"
                placeholder="e.g. Alex Vance"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Professional Title / Role
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 text-white"
                placeholder="e.g. Flow Master"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-emerald-400" /> Daily Focus Target (Hours)
            </label>
            <select
              value={dailyGoal}
              onChange={(e) => setDailyGoal(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 text-slate-300 font-mono"
            >
              <option value="4">4 Hours (Light Execution)</option>
              <option value="6">6 Hours (Optimal Deep Work)</option>
              <option value="8">8 Hours (Hardcore Flow)</option>
              <option value="10">10 Hours (Elite Beast Mode)</option>
            </select>
          </div>

          <div className="pt-3 flex items-center justify-between border-t border-white/10">
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              <Database className="w-3 h-3" /> Synced with Local & Supabase Cloud
            </span>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50"
              >
                <Check className="w-4 h-4" /> {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}