"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getPregnancyInfo, getTrimester, TRIMESTER_TIPS } from "@/lib/pregnancy";
import AppHeader from "@/components/AppHeader";
import FetusIllustration from "@/components/illustrations/FetusIllustration";
import PregnantWomanIllustration from "@/components/illustrations/PregnantWomanIllustration";
import { Sparkles } from "lucide-react";

export default function JourneyPage() {
  const { user } = useAuth();
  const pregnancy = getPregnancyInfo(user?.dueDate, user?.lmpDate);
  const currentTrimester = pregnancy ? getTrimester(pregnancy.weeks) : 1;
  const [activeTab, setActiveTab] = useState<1 | 2 | 3>(currentTrimester);

  const tab = TRIMESTER_TIPS[activeTab];

  if (!pregnancy) {
    return (
      <div className="page-content">
        <AppHeader greeting="Pregnancy Journey" subtitle="Set up your dates first" />
        <div className="card p-8 text-center">
          <p className="text-gray-500 mb-4">
            Add your pregnancy dates to explore trimester tips and weekly insights.
          </p>
          <Link href="/onboarding/pregnancy" className="btn-primary inline-block">
            Add Pregnancy Details
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <AppHeader greeting="Pregnancy Journey" subtitle={`Week ${pregnancy.weeks}`} />

      <div className="flex gap-1 mb-5 border-b border-gray-100">
        {([1, 2, 3] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setActiveTab(t)}
            className={`flex-1 py-3 text-xs sm:text-sm font-semibold transition-colors relative min-h-11 ${
              activeTab === t ? "text-primary" : "text-gray-400"
            }`}
          >
            {t === 1 ? "1st" : t === 2 ? "2nd" : "3rd"} Trimester
            {activeTab === t && (
              <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className="card p-5 mb-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 shrink-0">
            <FetusIllustration className="w-full h-full" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Your baby is</p>
            <p className="text-xl font-bold text-gray-900">
              {pregnancy.weeks} Weeks + {pregnancy.days} Days
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-background rounded-xl p-3 text-center">
            <p className="text-xs text-gray-500">Length</p>
            <p className="font-bold text-sm">{pregnancy.babySize}</p>
          </div>
          <div className="bg-background rounded-xl p-3 text-center">
            <p className="text-xs text-gray-500">Weight</p>
            <p className="font-bold text-sm">{pregnancy.babyWeight}</p>
          </div>
        </div>
      </div>

      <div className="card p-5 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-lavender rounded-lg flex items-center justify-center">
            <Sparkles size={16} className="text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900">This Week</h3>
        </div>
        <p className="text-gray-600 text-sm leading-relaxed">{tab.insight}</p>
      </div>

      <div className="card p-5 bg-primary text-white mb-4">
        <h3 className="font-semibold mb-2">Tip of the Week</h3>
        <p className="text-sm leading-relaxed text-white/95">{tab.tip}</p>
      </div>

      <div className="card p-4 flex items-center gap-3 bg-gradient-to-r from-primary/5 to-secondary/5">
        <PregnantWomanIllustration className="w-24 h-20 shrink-0" />
        <div>
          <p className="font-semibold text-sm text-gray-800">Today&apos;s Tip</p>
          <p className="text-xs text-gray-500 mt-1">Stay hydrated and take gentle walks daily.</p>
        </div>
      </div>
    </div>
  );
}
