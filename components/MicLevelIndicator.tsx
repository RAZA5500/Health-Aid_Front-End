"use client";

import { Mic, MicOff } from "lucide-react";
import { useMicLevel } from "@/hooks/useMicLevel";

const BAR_COUNT = 7;

type MicLevelIndicatorProps = {
  stream: MediaStream | null;
  micOn: boolean;
};

export default function MicLevelIndicator({ stream, micOn }: MicLevelIndicatorProps) {
  const level = useMicLevel(stream, micOn && !!stream);
  const isSpeaking = micOn && level > 0.04;

  return (
    <div
      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border ${
        micOn ? "bg-primary/5 border-primary/15" : "bg-red-50 border-red-100"
      }`}
      aria-live="polite"
      aria-label={micOn ? (isSpeaking ? "Microphone working" : "Microphone on, speak to test") : "Microphone muted"}
    >
      {micOn ? (
        <Mic size={15} className="text-primary shrink-0" />
      ) : (
        <MicOff size={15} className="text-red-500 shrink-0" />
      )}

      <div className="flex items-end gap-0.5 h-5 flex-1 justify-center">
        {Array.from({ length: BAR_COUNT }).map((_, i) => {
          const barThreshold = (i + 1) / BAR_COUNT;
          const barLevel = micOn ? Math.min(1, level * (1.4 + i * 0.12)) : 0;
          const lit = micOn && barLevel >= barThreshold * 0.35;
          const heightPx = micOn ? 4 + barLevel * 16 : 4;

          return (
            <div
              key={i}
              className={`w-1 rounded-full transition-[height,background-color] duration-75 ${
                micOn ? (lit ? "bg-primary" : "bg-primary/20") : "bg-gray-300"
              }`}
              style={{ height: `${heightPx}px` }}
            />
          );
        })}
      </div>

      <span
        className={`text-[11px] font-medium shrink-0 min-w-[72px] text-right ${
          micOn ? (isSpeaking ? "text-primary" : "text-gray-500") : "text-red-500"
        }`}
      >
        {!micOn ? "Mic muted" : isSpeaking ? "Mic working" : "Speak to test"}
      </span>
    </div>
  );
}
