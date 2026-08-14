"use client";

import { useState, useEffect, useRef } from "react";
import AppHeader from "@/components/AppHeader";
import { Play, Square, Timer } from "lucide-react";

export default function ContractionsPage() {
  const [contractions, setContractions] = useState<number[]>([]);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const handleStart = () => {
    setRunning(true);
    setElapsed(0);
  };
  const handleStop = () => {
    setRunning(false);
    if (elapsed > 0) setContractions((c) => [...c, elapsed]);
    setElapsed(0);
  };

  return (
    <div className="page-content">
      <AppHeader greeting="Contractions Timer" subtitle="Track contraction patterns" />

      <div className="card p-8 text-center mb-5">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Timer size={28} className="text-red-500" />
        </div>
        <p className="text-5xl font-mono font-bold text-gray-900 mb-2">{formatTime(elapsed)}</p>
        <p className="text-gray-500 text-sm mb-6">Current contraction</p>
        <div className="flex gap-3 justify-center">
          {!running ? (
            <button type="button" onClick={handleStart} className="btn-primary flex items-center gap-2 px-8">
              <Play size={18} /> Start
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStop}
              className="bg-red-500 text-white font-semibold rounded-xl px-8 py-3 flex items-center gap-2 hover:bg-red-600"
            >
              <Square size={18} /> Stop
            </button>
          )}
        </div>
      </div>

      {contractions.length > 0 && (
        <div className="card p-4">
          <h3 className="font-semibold mb-3">History ({contractions.length})</h3>
          <div className="space-y-2">
            {contractions.map((dur, i) => (
              <div
                key={i}
                className="flex justify-between text-sm py-2 border-b border-gray-50 last:border-0"
              >
                <span className="text-gray-500">Contraction #{i + 1}</span>
                <span className="font-mono font-medium text-primary">{formatTime(dur)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
