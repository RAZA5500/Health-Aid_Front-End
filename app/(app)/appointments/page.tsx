"use client";

import { useState, useEffect, useCallback } from "react";
import AppHeader from "@/components/AppHeader";
import { appointmentsApi, staffApi } from "@/lib/api";
import type { Appointment, OnDutyDoctor } from "@/lib/types";
import { Calendar, Plus, Trash2, Stethoscope, Loader2, Circle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

function getApptColor(specialization: string) {
  if (specialization === "Imaging") return "bg-blue-50 text-blue-600";
  if (specialization === "Lab") return "bg-purple-50 text-purple-600";
  return "bg-primary/10 text-primary";
}

export default function AppointmentsPage() {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [doctors, setDoctors] = useState<OnDutyDoctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [form, setForm] = useState({
    doctorId: "",
    doctorName: "",
    specialization: "",
    date: "",
    time: "",
  });

  const fetchAppointments = useCallback(async () => {
    try {
      const res = await appointmentsApi.getAll(tab);
      setAppointments(res.data || []);
    } catch {
      toast.error("Could not load appointments");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    setLoading(true);
    fetchAppointments();
  }, [fetchAppointments]);

  const loadDoctors = async () => {
    setLoadingDoctors(true);
    try {
      const res = await staffApi.getOnDutyDoctors();
      setDoctors(res.data.doctors || []);
      if ((res.data.doctors || []).length === 0) {
        toast.info("No doctors are on duty right now. Please try again later.");
      }
    } catch {
      toast.error("Could not load on-duty doctors");
      setDoctors([]);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const loadSlots = async (doctorId: string, date: string) => {
    if (!doctorId || !date) {
      setSlots([]);
      return;
    }
    setLoadingSlots(true);
    try {
      const res = await staffApi.getDoctorSlots(doctorId, date);
      setSlots(res.data.slots || []);
      if ((res.data.slots || []).length === 0) {
        toast.info("No available slots for this date");
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Could not load time slots");
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const openForm = () => {
    setShowForm(true);
    setForm({ doctorId: "", doctorName: "", specialization: "", date: "", time: "" });
    setSlots([]);
    loadDoctors();
  };

  const handleDoctorChange = (doctorId: string) => {
    const doc = doctors.find((d) => d._id === doctorId);
    setForm({
      ...form,
      doctorId,
      doctorName: doc?.name || "",
      specialization: doc?.specialization || doc?.specialty || "General",
      date: "",
      time: "",
    });
    setSlots([]);
  };

  const handleDateChange = (date: string) => {
    setForm({ ...form, date, time: "" });
    if (form.doctorId && date) loadSlots(form.doctorId, date);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await appointmentsApi.create({
        doctorId: form.doctorId,
        doctorName: form.doctorName,
        specialization: form.specialization,
        date: form.date,
        time: form.time,
        status: "upcoming",
      });
      toast.success("Appointment booked successfully");
      setShowForm(false);
      fetchAppointments();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Failed to book appointment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await appointmentsApi.delete(id);
      toast.success("Appointment cancelled");
      fetchAppointments();
    } catch {
      toast.error("Failed to delete appointment");
    }
  };

  return (
    <div className="page-content">
      <AppHeader greeting="Appointments" subtitle="Manage your visits" />

      <div className="flex gap-2 mb-4">
        {(["upcoming", "past"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-colors ${
              tab === t ? "bg-primary text-white" : "bg-white text-gray-600 border border-gray-100"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400">Loading...</div>
      ) : appointments.length === 0 ? (
        <div className="card p-8 text-center text-gray-400">
          <Calendar size={40} className="mx-auto mb-3 opacity-40" />
          <p>No {tab} appointments</p>
        </div>
      ) : (
        <div className="space-y-3 mb-4">
          {appointments.map((appt) => (
            <div key={appt._id} className="card p-4 flex items-start gap-3">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${getApptColor(appt.specialization)}`}
              >
                <Stethoscope size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{appt.doctorName}</p>
                <p className="text-sm text-gray-500">{appt.specialization}</p>
                <p className="text-xs text-primary mt-1 font-medium">
                  {format(new Date(appt.date), "MMM d, yyyy")} · {appt.time}
                </p>
              </div>
              {tab === "upcoming" && (
                <button
                  type="button"
                  onClick={() => handleDelete(appt._id)}
                  className="text-gray-300 hover:text-red-400 touch-target rounded-lg shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm ? (
        <form onSubmit={handleCreate} className="card p-4 space-y-3 mb-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Select Doctor (On Duty)</label>
            {loadingDoctors ? (
              <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
                <Loader2 size={16} className="animate-spin" /> Loading doctors...
              </div>
            ) : doctors.length === 0 ? (
              <p className="text-sm text-amber-600 bg-amber-50 rounded-xl p-3">
                No doctors are clocked in right now. Ask your clinic staff to clock in, then try again.
              </p>
            ) : (
              <select
                className="input-field"
                required
                value={form.doctorId}
                onChange={(e) => handleDoctorChange(e.target.value)}
              >
                <option value="">Choose a doctor</option>
                {doctors.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {doc.name} — {doc.specialization || doc.specialty || "Doctor"}
                    {doc.online ? " (Online)" : ""}
                  </option>
                ))}
              </select>
            )}
          </div>

          {form.doctorId && (
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl px-3 py-2 min-w-0">
              <Circle size={8} className="fill-green-500 text-green-500 shrink-0" />
              <span className="truncate">
                <strong>{form.doctorName}</strong> · {form.specialization} · On duty
              </span>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Date</label>
            <input
              className="input-field"
              type="date"
              required
              min={new Date().toISOString().split("T")[0]}
              value={form.date}
              disabled={!form.doctorId}
              onChange={(e) => handleDateChange(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Time (Doctor shift slots)</label>
            {loadingSlots ? (
              <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
                <Loader2 size={16} className="animate-spin" /> Loading slots...
              </div>
            ) : (
              <select
                className="input-field"
                required
                value={form.time}
                disabled={!form.date || slots.length === 0}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              >
                <option value="">
                  {!form.date ? "Select date first" : slots.length === 0 ? "No slots available" : "Choose time"}
                </option>
                {slots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex gap-2">
            <button type="submit" disabled={submitting || !form.doctorId} className="btn-primary flex-1">
              {submitting ? "Booking..." : "Book"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={openForm}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Book New Appointment
        </button>
      )}
    </div>
  );
}
