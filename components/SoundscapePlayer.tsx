"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Volume2, VolumeX, Music, CloudRain, Flame, Radio } from "lucide-react";

export const SOUND_CHANGE_EVENT = "flowstate_sound_change";

export default function SoundscapePlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSound, setCurrentSound] = useState<string>("Rain");
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [activeYtId, setActiveYtId] = useState<string | null>(null);

  // Exact YouTube IDs provided by user for Alpha & Lo-Fi
  const ytStreams: { [key: string]: string } = {
    "Lo-Fi": "lTRiuFIWV54", // 1 A.M Study Session
    "Alpha": "WPni755-Krg", // Study Music Alpha Waves
  };

  const stopRain = () => {
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
  };

  const startRain = () => {
    stopRain();
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
    gainNode.connect(ctx.destination);

    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(700, ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(gainNode);
    whiteNoise.start();
  };

  const handleSoundChange = useCallback((soundName: string, broadcast = true) => {
    setCurrentSound(soundName);
    stopRain();
    setActiveYtId(null);

    if (soundName === "Silent") {
      setIsPlaying(false);
      localStorage.setItem("flowstate_active_soundscape", "Silent");
      localStorage.setItem("flowstate_soundscape_playing", "false");
    } else {
      setIsPlaying(true);
      localStorage.setItem("flowstate_active_soundscape", soundName);
      localStorage.setItem("flowstate_soundscape_playing", "true");
      if (soundName === "Rain") {
        startRain();
      } else if (ytStreams[soundName]) {
        setActiveYtId(ytStreams[soundName]);
      }
    }

    if (broadcast && typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent(SOUND_CHANGE_EVENT, {
          detail: { name: soundName, playing: soundName !== "Silent" },
        })
      );
    }
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      handleSoundChange("Silent", true);
    } else {
      handleSoundChange(currentSound || "Rain", true);
    }
  };

  // Sync with external sound change events from PomodoroTimer sound buttons
  useEffect(() => {
    const handleExternalSoundChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ name: string; playing: boolean }>;
      if (customEvent.detail && customEvent.detail.name) {
        const soundName = customEvent.detail.name;
        handleSoundChange(soundName, false);
      }
    };

    window.addEventListener(SOUND_CHANGE_EVENT, handleExternalSoundChange);
    return () => {
      window.removeEventListener(SOUND_CHANGE_EVENT, handleExternalSoundChange);
    };
  }, [handleSoundChange]);

  // Initial sync from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSound = localStorage.getItem("flowstate_active_soundscape");
      const savedPlaying = localStorage.getItem("flowstate_soundscape_playing") === "true";

      if (savedSound) {
        setCurrentSound(savedSound);
        if (savedPlaying && savedSound !== "Silent") {
          setIsPlaying(true);
          if (savedSound === "Rain") startRain();
          else if (ytStreams[savedSound]) setActiveYtId(ytStreams[savedSound]);
        }
      }
    }
  }, []);

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3 text-white shadow-xl">
      {/* Hidden YouTube Iframe for Lo-Fi and Alpha */}
      {activeYtId && isPlaying && (
        <iframe
          src={`https://www.youtube.com/embed/${activeYtId}?autoplay=1&loop=1&playlist=${activeYtId}`}
          allow="autoplay"
          className="hidden"
        />
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
          <Music className="w-3.5 h-3.5 text-cyan-400" /> Soundscapes
        </h3>
        <button
          onClick={togglePlay}
          className={`p-2 rounded-xl transition ${
            isPlaying ? "bg-cyan-500 text-neutral-950" : "bg-neutral-800 text-neutral-400 hover:text-white"
          }`}
        >
          {isPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {["Rain", "Lo-Fi", "Alpha", "Silent"].map((name) => (
          <button
            key={name}
            onClick={() => handleSoundChange(name, true)}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition flex items-center gap-2 border ${
              currentSound === name && isPlaying
                ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-300"
                : "bg-neutral-950/50 border-neutral-800 text-neutral-400 hover:bg-neutral-800 hover:text-white"
            }`}
          >
            {name === "Rain" && <CloudRain className="w-3.5 h-3.5" />}
            {name === "Lo-Fi" && <Radio className="w-3.5 h-3.5" />}
            {name === "Alpha" && <Flame className="w-3.5 h-3.5" />}
            {name === "Silent" && <VolumeX className="w-3.5 h-3.5" />}
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}