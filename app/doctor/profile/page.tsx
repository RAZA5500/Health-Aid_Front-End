"use client";

import { LogOut } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import { useAuth } from "@/context/AuthContext";
import { ROLE_LABELS } from "@/lib/auth";

export default function DoctorProfilePage() {
  const { user, logout } = useAuth();

  return (
    <div className="px-4 pb-4">
      <AppHeader greeting="Profile" subtitle="Your account" />
      <div className="card p-6 text-center mb-4">
        <div className="w-16 h-16 rounded-full bg-primary/15 text-primary text-2xl font-bold flex items-center justify-center mx-auto mb-3">
          {user?.name?.[0]}
        </div>
        <p className="font-bold text-lg">{user?.name}</p>
        <p className="text-sm text-gray-500">{ROLE_LABELS.doctor}</p>
      </div>
      <div className="card p-4 space-y-3 text-sm">
        <div><span className="text-gray-500">Email:</span> {user?.email}</div>
        <div><span className="text-gray-500">Specialization:</span> {user?.specialization}</div>
        <div><span className="text-gray-500">Hospital:</span> {user?.hospital}</div>
        <div><span className="text-gray-500">License:</span> {user?.licenseNumber}</div>
      </div>
      <button type="button" onClick={logout} className="btn-secondary w-full mt-4 flex items-center justify-center gap-2">
        <LogOut size={18} /> Sign Out
      </button>
    </div>
  );
}
