"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import StatCard, { Users, Calendar, Bell } from "@/components/StatCard";
import { adminApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    patients: 0,
    doctors: 0,
    nurses: 0,
    activeUsers: 0,
    appointments: 0,
    notifications: 0,
  });

  useEffect(() => {
    adminApi.getStats().then((res) => setStats(res.data.stats)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={32} /></div>;

  return (
    <div className="px-4 pb-4">
      <AppHeader greeting={`Admin ${user?.name?.split(" ")[0] || ""}`} subtitle="Platform overview" showWave />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <StatCard label="Total Users" value={stats.totalUsers} icon={Users} />
        <StatCard label="Patients" value={stats.patients} icon={Users} color="bg-primary/15 text-primary" />
        <StatCard label="Doctors" value={stats.doctors} icon={Users} color="bg-secondary/15 text-secondary" />
        <StatCard label="Nurses" value={stats.nurses} icon={Users} color="bg-green-100 text-green-700" />
        <StatCard label="Active Users" value={stats.activeUsers} icon={Users} />
        <StatCard label="Appointments" value={stats.appointments} icon={Calendar} color="bg-secondary/15 text-secondary" />
        <StatCard label="Notifications" value={stats.notifications} icon={Bell} color="bg-red-50 text-red-500" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link href="/admin/users" className="card p-4 hover:shadow-md transition-shadow">
          <p className="font-semibold text-sm">Manage Users</p>
          <p className="text-xs text-gray-500 mt-1">View, filter, activate/deactivate accounts</p>
        </Link>
        <Link href="/admin/assignments" className="card p-4 hover:shadow-md transition-shadow">
          <p className="font-semibold text-sm">Patient Assignments</p>
          <p className="text-xs text-gray-500 mt-1">Assign doctors and nurses to patients</p>
        </Link>
        <Link href="/admin/appointments" className="card p-4 hover:shadow-md transition-shadow">
          <p className="font-semibold text-sm">Appointments</p>
          <p className="text-xs text-gray-500 mt-1">View and create appointments</p>
        </Link>
        <Link href="/admin/settings" className="card p-4 hover:shadow-md transition-shadow">
          <p className="font-semibold text-sm">Settings</p>
          <p className="text-xs text-gray-500 mt-1">Admin profile and sign out</p>
        </Link>
      </div>
    </div>
  );
}
