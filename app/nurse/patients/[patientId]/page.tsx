"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import AppHeader from "@/components/AppHeader";
import { nurseApi } from "@/lib/api";
import type { User, HealthRecord } from "@/lib/types";

export default function NursePatientDetailPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const [patient, setPatient] = useState<User | null>(null);
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ recordType: "vitals", title: "", value: "", unit: "", description: "" });
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    nurseApi.getPatient(patientId).then((res) => {
      setPatient(res.data.patient);
      setRecords(res.data.healthRecords);
    }).finally(() => setLoading(false));
  }, [patientId]);

  const addRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await nurseApi.addHealthRecord({ patientId, ...form });
      setRecords((prev) => [res.data.record, ...prev]);
      setForm({ recordType: "vitals", title: "", value: "", unit: "", description: "" });
      toast.success("Health record added");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Failed to add record");
    } finally {
      setSaving(false);
    }
  };

  const addNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    setSaving(true);
    try {
      const res = await nurseApi.addNote({ patientId, notes: note });
      setRecords((prev) => [res.data.record, ...prev]);
      setNote("");
      toast.success("Nursing note saved");
    } catch {
      toast.error("Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  if (!patient) return <div className="p-8 text-center text-gray-400">Patient not found</div>;

  return (
    <div className="px-4 pb-4">
      <AppHeader greeting={patient.name} subtitle="Health monitoring" />

      <div className="card p-4 mb-4 text-sm space-y-1">
        <p><span className="text-gray-500">Phone:</span> {patient.phone}</p>
        <p><span className="text-gray-500">Emergency:</span> {patient.emergencyContact || "—"}</p>
        <p><span className="text-gray-500">Blood Type:</span> {patient.bloodType || "—"}</p>
      </div>

      <form onSubmit={addRecord} className="card p-4 mb-4 space-y-3">
        <h3 className="font-semibold text-sm">Add Health Record</h3>
        <select className="input-field" value={form.recordType} onChange={(e) => setForm({ ...form, recordType: e.target.value })}>
          <option value="vitals">Vitals</option>
          <option value="weight">Weight</option>
          <option value="blood_pressure">Blood Pressure</option>
          <option value="glucose">Glucose</option>
        </select>
        <input className="input-field" placeholder="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <div className="flex gap-2">
          <input className="input-field flex-1" placeholder="Value" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
          <input className="input-field w-24" placeholder="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
        </div>
        <button type="submit" disabled={saving} className="btn-primary w-full py-2.5 text-sm">{saving ? "Saving..." : "Save Record"}</button>
      </form>

      <form onSubmit={addNote} className="card p-4 mb-4 space-y-3">
        <h3 className="font-semibold text-sm">Nursing Note</h3>
        <textarea className="input-field min-h-[70px] resize-none" placeholder="Observation notes..." value={note} onChange={(e) => setNote(e.target.value)} />
        <button type="submit" disabled={saving} className="btn-secondary w-full py-2.5 text-sm">Save Note</button>
      </form>

      <h3 className="font-semibold text-sm mb-2">Health History</h3>
      {records.length === 0 ? (
        <div className="card p-4 text-sm text-gray-400 text-center">No records yet</div>
      ) : (
        <div className="space-y-2">
          {records.map((r) => (
            <div key={r._id} className="card p-4">
              <p className="font-medium text-sm">{r.title}</p>
              <p className="text-xs text-gray-500">{r.recordType} · {r.value} {r.unit}</p>
              {r.description && <p className="text-sm mt-1">{r.description}</p>}
              <p className="text-[10px] text-gray-400 mt-2">{new Date(r.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
