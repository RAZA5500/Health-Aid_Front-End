"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import StatCard, { Users, Calendar, MessageCircle, Bell } from "@/components/StatCard";
import { nurseApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { User, Appointment } from "@/lib/types";

export default function NurseDashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ assignedPatients: 0, upcomingAppointments: 0, unreadMessages: 0, unreadNotifications: 0 });
  const [patients, setPatients] = useState<User[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    nurseApi.getDashboard().then((res) => {
      setStats(res.data.stats);
      setPatients(res.data.patients);
      setAppointments(res.data.appointments);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={32} /></div>;

  return (
    <div className="px-4 pb-4">
      <AppHeader greeting={`Nurse ${user?.name?.split(" ")[0] || ""}`} subtitle="Care monitoring overview" showWave />

      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard label="Patients" value={stats.assignedPatients} icon={Users} />
        <StatCard label="Appointments" value={stats.upcomingAppointments} icon={Calendar} color="bg-secondary/15 text-secondary" />
        <StatCard label="Messages" value={stats.unreadMessages} icon={MessageCircle} />
        <StatCard label="Alerts" value={stats.unreadNotifications} icon={Bell} color="bg-red-50 text-red-500" />
      </div>

      <div className="mb-6">
        <div className="flex justify-between mb-3">
          <h2 className="font-semibold">Assigned Patients</h2>
          <Link href="/nurse/patients" className="text-sm text-primary font-medium">View all</Link>
        </div>
        {patients.length === 0 ? (
          <div className="card p-6 text-center text-sm text-gray-400">No patients assigned</div>
        ) : (
          <div className="space-y-2">
            {patients.slice(0, 5).map((p) => (
              <Link key={p._id} href={`/nurse/patients/${p._id}`} className="card p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center">{p.name[0]}</div>
                <div><p className="font-semibold text-sm">{p.name}</p><p className="text-xs text-gray-500">{p.phone}</p></div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="font-semibold mb-3">Upcoming Appointments</h2>
        {appointments.length === 0 ? (
          <div className="card p-6 text-center text-sm text-gray-400">No appointments</div>
        ) : (
          <div className="space-y-2">
            {appointments.slice(0, 3).map((a) => (
              <div key={a._id} className="card p-4">
                <p className="font-semibold text-sm">{a.patient?.name}</p>
                <p className="text-xs text-gray-500">{new Date(a.date).toLocaleDateString()} at {a.time}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
