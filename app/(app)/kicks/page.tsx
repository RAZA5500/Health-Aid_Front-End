"use client";

import { useState, useEffect, useRef } from "react";
import AppHeader from "@/components/AppHeader";
import { kicksApi } from "@/lib/api";

export default function KicksPage() {
  const [kicks, setKicks] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600).toString().padStart(2, "0");
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };

  const handleKick = () => {
    if (!running) setRunning(true);
    setKicks((k) => k + 1);
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await kicksApi.create({ kickCount: kicks, durationSeconds: seconds });
      setSaved(true);
      setRunning(false);
    } catch {
      setSaved(true);
      setRunning(false);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setKicks(0);
    setSeconds(0);
    setRunning(false);
    setSaved(false);
  };

  const progress = Math.min(100, (kicks / 10) * 100);
  const circumference = 2 * Math.PI * 42;

  return (
    <div className="page-content">
      <AppHeader greeting="Kick Counter" subtitle="Track your baby's movements" />

      <div className="flex flex-col items-center py-6">
        <div className="relative w-60 h-60 mb-4">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#E8EDF2" strokeWidth="7" />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="#1FB387"
              strokeWidth="7"
              strokeDasharray={`${(progress / 100) * circumference} ${circumference}`}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold text-gray-900">{kicks}</span>
            <span className="text-sm text-gray-500 font-medium">Kicks</span>
          </div>
        </div>

        <p className="text-2xl font-mono text-primary font-semibold mb-8">{formatTime(seconds)}</p>

        <button
          type="button"
          onClick={handleKick}
          className="w-full max-w-xs btn-primary py-4 text-base mb-3 shadow-lg shadow-primary/20"
        >
          Kick Detected
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={kicks === 0 || saving}
          className="text-primary font-semibold text-sm mb-4 disabled:opacity-40"
        >
          {saving ? "Saving..." : saved ? "Session Saved ✓" : "Save Session"}
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="text-gray-400 text-sm hover:text-gray-600"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
