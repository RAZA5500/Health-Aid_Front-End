"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getPregnancyInfo } from "@/lib/pregnancy";
import AppHeader from "@/components/AppHeader";
import { LogOut, Mail, Phone, Calendar, Edit2, HeartPulse, User } from "lucide-react";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const pregnancy = getPregnancyInfo(user?.dueDate, user?.lmpDate);

  return (
    <div className="page-content">
      <AppHeader greeting="Profile" subtitle="Your account" />

      <div className="card p-5 text-center mb-5">
        <div className="w-20 h-20 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-primary/20">
          <span className="text-3xl font-bold text-primary">{user?.name?.[0]?.toUpperCase() || "U"}</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900">{user?.name || "User"}</h2>
        {pregnancy ? (
          <>
            <p className="text-primary font-medium text-sm mt-1">
              {pregnancy.weeks} weeks + {pregnancy.days} days pregnant
            </p>
            <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden max-w-[200px] mx-auto">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${pregnancy.progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">{pregnancy.progress}% complete</p>
          </>
        ) : (
          <p className="text-gray-500 text-sm mt-1">Pregnancy details not set</p>
        )}
      </div>

      <div className="card divide-y divide-gray-100 mb-5">
        {[
          { icon: Mail, label: "Email", value: user?.email },
          { icon: Phone, label: "Phone", value: user?.phone || "Not set" },
          {
            icon: Calendar,
            label: user?.lmpDate ? "LMP Date" : "Due Date",
            value: user?.lmpDate
              ? new Date(user.lmpDate).toLocaleDateString()
              : user?.dueDate
                ? new Date(user.dueDate).toLocaleDateString()
                : "Not set",
          },
          { icon: User, label: "Emergency Contact", value: user?.emergencyContact || "Not set" },
          { icon: HeartPulse, label: "Blood Type", value: user?.bloodType || "Not set" },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3 p-4">
            <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
              <Icon size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-gray-400">{label}</p>
              <p className="text-sm font-medium text-gray-800">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <Link
        href="/onboarding/pregnancy?edit=1"
        className="btn-primary w-full flex items-center justify-center gap-2 mb-4"
      >
        <Edit2 size={16} /> Update My Details
      </Link>

      <button
        type="button"
        onClick={logout}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-200 text-red-500 font-medium hover:bg-red-50 transition-colors"
      >
        <LogOut size={18} /> Sign Out
      </button>
    </div>
  );
}
