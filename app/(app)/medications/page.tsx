"use client";

import { useState, useEffect } from "react";
import AppHeader from "@/components/AppHeader";
import { medicationsApi } from "@/lib/api";
import type { Medication } from "@/lib/types";
import { Check, Plus, Pill, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function MedicationsPage() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", dosage: "", timing: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchMeds = async () => {
    try {
      const res = await medicationsApi.getAll();
      setMedications(res.data);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Failed to load medications");
      setMedications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeds();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await medicationsApi.create({ ...form, reminder: true });
      toast.success("Medication added");
      setShowForm(false);
      setForm({ name: "", dosage: "", timing: "" });
      await fetchMeds();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Failed to add medication");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await medicationsApi.toggle(id);
      await fetchMeds();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Failed to update medication");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await medicationsApi.delete(id);
      toast.success("Medication removed");
      await fetchMeds();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Failed to delete medication");
    }
  };

  return (
    <div className="page-content">
      <AppHeader greeting="Medications" subtitle="Daily medication tracker" />

      {loading ? (
        <div className="text-center py-10 text-gray-400">Loading...</div>
      ) : (
        <div className="space-y-3 mb-4">
          {medications.length === 0 ? (
            <div className="card p-8 text-center text-gray-400">
              <Pill size={40} className="mx-auto mb-3 opacity-40" />
              <p>No medications added yet</p>
              <p className="text-xs mt-1">Tap below to add your first medication</p>
            </div>
          ) : (
            medications.map((med) => (
              <div
                key={med._id}
                className={`card p-4 flex items-center gap-3 ${med.taken ? "opacity-60" : ""}`}
              >
                <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center shrink-0">
                  <Pill size={18} className="text-yellow-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-semibold text-sm ${
                      med.taken ? "line-through text-gray-400" : "text-gray-900"
                    }`}
                  >
                    {med.name}
                  </p>
                  <p className="text-xs text-gray-500">{med.dosage}</p>
                  <p className="text-xs text-primary font-medium mt-0.5">{med.timing}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle(med._id)}
                  className={`shrink-0 w-9 h-9 rounded-full border-2 flex items-center justify-center transition-colors ${
                    med.taken
                      ? "border-primary bg-primary text-white"
                      : "border-gray-200 text-gray-300 hover:border-primary hover:text-primary"
                  }`}
                  aria-label={med.taken ? "Mark not taken" : "Mark taken"}
                >
                  {med.taken && <Check size={16} />}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(med._id)}
                  className="text-gray-300 hover:text-red-400 shrink-0"
                  aria-label="Delete medication"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {showForm ? (
        <form onSubmit={handleCreate} className="card p-4 space-y-3 mb-4">
          <input
            className="input-field"
            placeholder="Medication Name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="input-field"
            placeholder="Dosage (e.g. 1 Tablet - Daily)"
            required
            value={form.dosage}
            onChange={(e) => setForm({ ...form, dosage: e.target.value })}
          />
          <input
            className="input-field"
            placeholder="Time (e.g. 08:00 AM)"
            required
            value={form.timing}
            onChange={(e) => setForm({ ...form, timing: e.target.value })}
          />
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? "Adding..." : "Add"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="btn-secondary w-full flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Add Medication
        </button>
      )}
    </div>
  );
}
