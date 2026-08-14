"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import { appointmentsApi } from "@/lib/api";
import type { Appointment } from "@/lib/types";

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appointmentsApi.getAll("upcoming").then((res) => setAppointments(res.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="px-4 pb-4">
      <AppHeader greeting="Appointments" subtitle="Your schedule" />
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={28} /></div>
      ) : appointments.length === 0 ? (
        <div className="card p-8 text-center text-sm text-gray-400">No upcoming appointments</div>
      ) : (
        <div className="space-y-2">
          {appointments.map((a) => (
            <div key={a._id} className="card p-4">
              <p className="font-semibold text-sm">{a.patient?.name || a.doctorName}</p>
              <p className="text-xs text-gray-500 mt-1">{a.specialization}</p>
              <p className="text-xs text-primary mt-2 font-medium">
                {new Date(a.date).toLocaleDateString()} at {a.time}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
