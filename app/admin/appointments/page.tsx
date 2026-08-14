"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import AppHeader from "@/components/AppHeader";
import { adminApi } from "@/lib/api";
import type { Appointment, User } from "@/lib/types";

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    patientId: "",
    doctorId: "",
    doctorName: "",
    specialization: "Obstetrician",
    date: "",
    time: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([adminApi.getAppointments(), adminApi.getUsers()])
      .then(([a, u]) => {
        setAppointments(a.data.appointments);
        setUsers(u.data.users);
      })
      .finally(() => setLoading(false));
  }, []);

  const patients = users.filter((u) => u.role === "patient");
  const doctors = users.filter((u) => u.role === "doctor");

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.createAppointment(form);
      const refreshed = await adminApi.getAppointments();
      setAppointments(refreshed.data.appointments);
      toast.success("Appointment created");
      setForm({ patientId: "", doctorId: "", doctorName: "", specialization: "Obstetrician", date: "", time: "", notes: "" });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Failed to create appointment");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-4 pb-4">
      <AppHeader greeting="Appointments" subtitle="Platform-wide schedule" />

      <form onSubmit={create} className="card p-4 mb-4 space-y-3">
        <select className="input-field" required value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })}>
          <option value="">Select patient</option>
          {patients.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
        <select
          className="input-field"
          value={form.doctorId}
          onChange={(e) => {
            const doc = doctors.find((d) => d._id === e.target.value);
            setForm({ ...form, doctorId: e.target.value, doctorName: doc?.name || "" });
          }}
        >
          <option value="">Select doctor (optional)</option>
          {doctors.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
        </select>
        <input className="input-field" placeholder="Doctor name" required value={form.doctorName} onChange={(e) => setForm({ ...form, doctorName: e.target.value })} />
        <input className="input-field" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        <input className="input-field" placeholder="Time (e.g. 10:30 AM)" required value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
        <button type="submit" disabled={saving} className="btn-primary w-full py-2.5 text-sm">{saving ? "Creating..." : "Create Appointment"}</button>
      </form>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={28} /></div>
      ) : (
        <div className="space-y-2">
          {appointments.map((a) => (
            <div key={a._id} className="card p-4">
              <p className="font-semibold text-sm">{a.patient?.name || "Patient"} → {a.doctorName}</p>
              <p className="text-xs text-gray-500">{new Date(a.date).toLocaleDateString()} at {a.time} · {a.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
