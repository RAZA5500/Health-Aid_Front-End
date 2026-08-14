"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, Baby, FileText } from "lucide-react";
import { toast } from "sonner";
import AppHeader from "@/components/AppHeader";
import { doctorApi } from "@/lib/api";
import type { User, Appointment, ConsultationNote } from "@/lib/types";
import { getPregnancyInfo } from "@/lib/pregnancy";

export default function DoctorPatientDetailPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const [patient, setPatient] = useState<User | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notes, setNotes] = useState<ConsultationNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [noteForm, setNoteForm] = useState({ notes: "", diagnosis: "", prescription: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoadError(null);
    doctorApi
      .getPatient(patientId)
      .then((res) => {
        setPatient(res.data.patient);
        setAppointments(res.data.appointments);
        setNotes(res.data.consultationNotes);
      })
      .catch((err: unknown) => {
        const status = (err as { response?: { status?: number; data?: { message?: string } } })?.response?.status;
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
        if (status === 403) setLoadError("You do not have access to this patient's profile.");
        else if (status === 404) setLoadError("Patient not found.");
        else setLoadError(msg || "Failed to load patient profile.");
      })
      .finally(() => setLoading(false));
  }, [patientId]);

  const pregnancy = patient?.lmpDate || patient?.dueDate
    ? getPregnancyInfo(patient.dueDate, patient.lmpDate)
    : null;

  const addNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteForm.notes.trim()) return;
    setSaving(true);
    try {
      const res = await doctorApi.addConsultation({ patientId, ...noteForm });
      setNotes((prev) => [res.data.note, ...prev]);
      setNoteForm({ notes: "", diagnosis: "", prescription: "" });
      toast.success("Consultation note saved");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  }

  if (loadError) return <div className="p-8 text-center text-gray-400">{loadError}</div>;
  if (!patient) return <div className="p-8 text-center text-gray-400">Patient not found.</div>;

  return (
    <div className="px-4 pb-4">
      <AppHeader greeting={patient.name} subtitle="Patient profile & health info" />

      <div className="card p-4 mb-4">
        <p className="text-sm text-gray-500">Contact</p>
        <p className="font-medium">{patient.phone || "—"}</p>
        <p className="text-sm text-gray-500 mt-2">Email</p>
        <p className="font-medium">{patient.email}</p>
        {patient.emergencyContact && (
          <>
            <p className="text-sm text-gray-500 mt-2">Emergency Contact</p>
            <p className="font-medium">{patient.emergencyContact}</p>
          </>
        )}
        {patient.bloodType && (
          <>
            <p className="text-sm text-gray-500 mt-2">Blood Type</p>
            <p className="font-medium">{patient.bloodType}</p>
          </>
        )}
      </div>

      {pregnancy && (
        <div className="card p-4 mb-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-coral/50 flex items-center justify-center">
            <Baby size={20} className="text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm">Pregnancy Tracking</p>
            <p className="text-xs text-gray-500">
              Week {pregnancy.weeks}+{pregnancy.days} · {pregnancy.fruitComparison}
            </p>
          </div>
        </div>
      )}

      <div className="mb-4">
        <h3 className="font-semibold text-sm mb-2 flex items-center gap-2"><FileText size={16} /> Add Consultation Note</h3>
        <form onSubmit={addNote} className="card p-4 space-y-3">
          <textarea
            className="input-field min-h-[80px] resize-none"
            placeholder="Consultation notes..."
            required
            value={noteForm.notes}
            onChange={(e) => setNoteForm({ ...noteForm, notes: e.target.value })}
          />
          <input className="input-field" placeholder="Diagnosis (optional)" value={noteForm.diagnosis} onChange={(e) => setNoteForm({ ...noteForm, diagnosis: e.target.value })} />
          <input className="input-field" placeholder="Prescription (optional)" value={noteForm.prescription} onChange={(e) => setNoteForm({ ...noteForm, prescription: e.target.value })} />
          <button type="submit" disabled={saving} className="btn-primary w-full py-2.5 text-sm">
            {saving ? "Saving..." : "Save Note"}
          </button>
        </form>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold text-sm mb-2">Consultation History</h3>
        {notes.length === 0 ? (
          <div className="card p-4 text-sm text-gray-400 text-center">No consultation notes yet</div>
        ) : (
          <div className="space-y-2">
            {notes.map((n) => (
              <div key={n._id} className="card p-4">
                <p className="text-sm">{n.notes}</p>
                {n.diagnosis && <p className="text-xs text-gray-500 mt-1">Diagnosis: {n.diagnosis}</p>}
                <p className="text-[10px] text-gray-400 mt-2">{new Date(n.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="font-semibold text-sm mb-2">Appointments</h3>
        {appointments.length === 0 ? (
          <div className="card p-4 text-sm text-gray-400 text-center">No appointments</div>
        ) : (
          <div className="space-y-2">
            {appointments.map((a) => (
              <div key={a._id} className="card p-4">
                <p className="font-medium text-sm">{a.doctorName}</p>
                <p className="text-xs text-gray-500">{new Date(a.date).toLocaleDateString()} · {a.time} · {a.status}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
