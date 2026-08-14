"use client";

import { useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import AppHeader from "@/components/AppHeader";
import { adminApi } from "@/lib/api";
import type { Assignment, User } from "@/lib/types";

export default function AdminAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ providerId: "", patientId: "", providerRole: "doctor" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([adminApi.getAssignments(), adminApi.getUsers()])
      .then(([a, u]) => {
        setAssignments(a.data.assignments);
        setUsers(u.data.users);
      })
      .finally(() => setLoading(false));
  }, []);

  const providers = users.filter((u) => u.role === form.providerRole && u.isActive !== false);
  const patients = users.filter((u) => u.role === "patient" && u.isActive !== false);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await adminApi.createAssignment(form);
      const refreshed = await adminApi.getAssignments();
      setAssignments(refreshed.data.assignments);
      toast.success(res.data.message);
      setForm({ providerId: "", patientId: "", providerRole: form.providerRole });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Failed to create assignment");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await adminApi.removeAssignment(id);
      setAssignments((prev) => prev.filter((a) => a._id !== id));
      toast.success("Assignment removed");
    } catch {
      toast.error("Failed to remove assignment");
    }
  };

  return (
    <div className="px-4 pb-4">
      <AppHeader greeting="Assignments" subtitle="Doctor & nurse patient assignments" />

      <form onSubmit={create} className="card p-4 mb-4 space-y-3">
        <select className="input-field" value={form.providerRole} onChange={(e) => setForm({ ...form, providerRole: e.target.value, providerId: "" })}>
          <option value="doctor">Doctor</option>
          <option value="nurse">Nurse</option>
        </select>
        <select className="input-field" required value={form.providerId} onChange={(e) => setForm({ ...form, providerId: e.target.value })}>
          <option value="">Select {form.providerRole}</option>
          {providers.map((p) => (
            <option key={p._id} value={p._id}>{p.name} ({p.email})</option>
          ))}
        </select>
        <select className="input-field" required value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })}>
          <option value="">Select patient</option>
          {patients.map((p) => (
            <option key={p._id} value={p._id}>{p.name} ({p.email})</option>
          ))}
        </select>
        <button type="submit" disabled={saving} className="btn-primary w-full py-2.5 text-sm">
          {saving ? "Assigning..." : "Create Assignment"}
        </button>
      </form>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={28} /></div>
      ) : assignments.length === 0 ? (
        <div className="card p-8 text-center text-sm text-gray-400">No assignments yet</div>
      ) : (
        <div className="space-y-2">
          {assignments.filter((a) => a.isActive).map((a) => (
            <div key={a._id} className="card p-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm capitalize">{a.providerRole}: {a.provider?.name}</p>
                <p className="text-xs text-gray-500">Patient: {a.patient?.name}</p>
              </div>
              <button type="button" onClick={() => remove(a._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
