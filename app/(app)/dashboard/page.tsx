"use client";

import { useAuth } from "@/context/AuthContext";
import { getPregnancyInfo } from "@/lib/pregnancy";
import AppHeader from "@/components/AppHeader";
import QuickTool from "@/components/QuickTool";
import FetusIllustration from "@/components/illustrations/FetusIllustration";
import {
  Footprints,
  Timer,
  Calendar,
  Pill,
  FileText,
  Stethoscope,
  Calculator,
  Baby,
  HeartHandshake,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import EmergencyButton from "@/components/EmergencyButton";

const categories = [
  { label: "Pregnancy Calculation", color: "bg-blue-100 text-blue-600", icon: Calculator },
  { label: "During Pregnancy", color: "bg-pink-100 text-pink-600", icon: Baby },
  { label: "After Birth", color: "bg-green-100 text-green-600", icon: HeartHandshake },
  { label: "Doctor via Mother's Connector", color: "bg-purple-100 text-purple-600", icon: Stethoscope },
];

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const pregnancy = getPregnancyInfo(user?.dueDate, user?.lmpDate);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <div className="page-content">
      <AppHeader
        greeting={`Hi ${firstName}`}
        subtitle={
          pregnancy
            ? `You're ${pregnancy.weeks} weeks pregnant`
            : "Complete your profile to track your pregnancy"
        }
        showWave
      />

      {!pregnancy && (
        <Link
          href="/onboarding/pregnancy"
          className="card p-4 mb-5 flex items-center gap-3 border-primary/30 bg-primary/5 hover:shadow-md transition-shadow"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
            <AlertCircle size={20} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm">Complete your pregnancy profile</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Add your LMP or due date to see accurate week tracking
            </p>
          </div>
          <span className="text-primary text-xs font-semibold shrink-0">Set up →</span>
        </Link>
      )}

      <div className="flex gap-3 overflow-x-auto pb-3 mb-5 scrollbar-hide -mx-1 px-1 md:grid md:grid-cols-2 md:overflow-visible lg:grid-cols-4">
        {categories.map(({ label, color, icon: Icon }) => (
          <div
            key={label}
            className="card min-w-[130px] md:min-w-0 p-3 shrink-0 md:shrink flex flex-col items-center gap-2 hover:shadow-md transition-shadow"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
              <Icon size={20} />
            </div>
            <p className="text-[11px] font-medium text-gray-700 text-center leading-tight">{label}</p>
          </div>
        ))}
      </div>

      <div className="card p-5 mb-5">
        <div className="flex items-start justify-between mb-1">
          <div>
            <p className="text-sm font-semibold text-gray-800">My Pregnancy</p>
            {pregnancy ? (
              <h2 className="text-2xl font-bold text-gray-900 mt-1">
                {pregnancy.weeks} Weeks + {pregnancy.days} Days
              </h2>
            ) : (
              <h2 className="text-lg font-bold text-gray-500 mt-1">No data yet</h2>
            )}
          </div>
          <div className="w-20 h-20 shrink-0">
            <FetusIllustration className="w-full h-full" />
          </div>
        </div>

        {pregnancy ? (
          <>
            <div className="mb-4 mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span>Pregnancy Progress</span>
                <span className="font-semibold text-primary">{pregnancy.progress}%</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${pregnancy.progress}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-3 gap-2 text-center mb-4">
              <div className="bg-background rounded-xl p-2.5">
                <p className="text-[10px] text-gray-500 mb-0.5">Baby Size</p>
                <p className="font-bold text-xs text-gray-800">{pregnancy.babySize}</p>
              </div>
              <div className="bg-background rounded-xl p-2.5">
                <p className="text-[10px] text-gray-500 mb-0.5">Baby Weight</p>
                <p className="font-bold text-xs text-gray-800">{pregnancy.babyWeight}</p>
              </div>
              <div className="bg-background rounded-xl p-2.5">
                <p className="text-[10px] text-gray-500 mb-0.5">About as big as</p>
                <p className="font-bold text-xs text-gray-800">
                  {pregnancy.fruitComparison.replace(/^a /, "")}
                </p>
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500 mb-4 mt-2">
            Enter your last menstrual period or expected due date to unlock personalized tracking.
          </p>
        )}

        <Link
          href="/onboarding/pregnancy?edit=1"
          className="btn-primary w-full text-center block text-sm py-2.5"
        >
          {pregnancy ? "Update My Details" : "Add Pregnancy Details"}
        </Link>
      </div>

      <div className="mb-5">
        <EmergencyButton />
      </div>

      <h3 className="font-semibold text-gray-800 mb-3 text-[15px]">Quick Tools</h3>
      <div className="flex gap-4 overflow-x-auto pb-3 mb-5 scrollbar-hide px-1 md:grid md:grid-cols-3 md:overflow-visible lg:grid-cols-5">
        <QuickTool href="/kicks" label="Kick Counter" icon={Footprints} color="bg-blue-500" />
        <QuickTool href="/contractions" label="Contractions Timer" icon={Timer} color="bg-red-500" />
        <QuickTool href="/appointments" label="Appointments" icon={Calendar} color="bg-green-500" />
        <QuickTool href="/medications" label="Medications" icon={Pill} color="bg-yellow-500" />
        <QuickTool href="/records" label="Health Records" icon={FileText} color="bg-primary" />
      </div>

      <Link
        href="/telemedicine"
        className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
      >
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
          <Stethoscope size={24} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900">Talk to a Doctor</p>
          <p className="text-sm text-gray-500">Video consultations · 24/7 support</p>
        </div>
        <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium shrink-0">
          Online
        </span>
      </Link>
    </div>
  );
}
