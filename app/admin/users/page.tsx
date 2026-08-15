"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  Plus,
  UserCheck,
  UserX,
  X,
  Mail,
  User as UserIcon,
  Phone,
  Lock,
  Stethoscope,
  BadgeCheck,
  Building2,
  HeartPulse,
} from "lucide-react";
import { toast } from "sonner";
import AppHeader from "@/components/AppHeader";
import InputWithIcon from "@/components/InputWithIcon";
import { adminApi } from "@/lib/api";
import type { User, UserRole } from "@/lib/types";
import { ROLE_LABELS } from "@/lib/auth";

const STAFF_ROLES: UserRole[] = ["doctor", "nurse", "receptionist", "admin"];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "doctor" as UserRole,
    specialization: "",
    licenseNumber: "",
    hospital: "",
    yearsOfExperience: "",
    department: "",
    nurseLicense: "",
  });

  const load = () => {
    setLoading(true);
    adminApi
      .getUsers({ role: roleFilter, search })
      .then((res) => setUsers(res.data.users))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [roleFilter]);

  const toggleStatus = async (id: string) => {
    try {
      const res = await adminApi.toggleUserStatus(id);
      setUsers((prev) => prev.map((u) => (u._id === id ? res.data.user : u)));
      toast.success(res.data.message);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Failed to update user");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const payload: Record<string, unknown> = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: form.role,
      };
      if (form.role === "doctor") {
        payload.specialization = form.specialization;
        payload.licenseNumber = form.licenseNumber;
        payload.hospital = form.hospital;
        payload.yearsOfExperience = form.yearsOfExperience
          ? Number(form.yearsOfExperience)
          : undefined;
      }
      if (form.role === "nurse") {
        payload.department = form.department;
        payload.nurseLicense = form.nurseLicense;
        payload.hospital = form.hospital;
      }
      if (form.role === "receptionist") {
        payload.department = form.department || "Patient Support";
        payload.hospital = form.hospital;
      }

      const res = await adminApi.createUser(payload);
      toast.success(res.data.message);
      setShowCreate(false);
      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "doctor",
        specialization: "",
        licenseNumber: "",
        hospital: "",
        yearsOfExperience: "",
        department: "",
        nurseLicense: "",
      });
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="px-4 pb-4">
      <AppHeader greeting="Users" subtitle="Manage platform accounts" />

      <button
        type="button"
        onClick={() => setShowCreate(true)}
        className="btn-primary w-full mb-4 flex items-center justify-center gap-2 py-2.5"
      >
        <Plus size={18} /> Create Staff Account
      </button>

      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-5 rounded-b-none sm:rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Create Staff Account</h2>
              <button type="button" onClick={() => setShowCreate(false)} className="text-gray-400 touch-target rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {STAFF_ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm({ ...form, role: r })}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-colors ${
                    form.role === r
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-gray-600 border-gray-200"
                  }`}
                >
                  {ROLE_LABELS[r]}
                </button>
              ))}
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <InputWithIcon icon={UserIcon} placeholder="Full Name" required value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
              <InputWithIcon icon={Mail} type="email" placeholder="Email" required value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
              <InputWithIcon icon={Phone} type="tel" placeholder="Phone" required value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
              <InputWithIcon icon={Lock} type="password" placeholder="Password" required value={form.password} onChange={(v) => setForm({ ...form, password: v })} minLength={8} />

              {form.role === "doctor" && (
                <>
                  <InputWithIcon icon={Stethoscope} placeholder="Specialization" required value={form.specialization} onChange={(v) => setForm({ ...form, specialization: v })} />
                  <InputWithIcon icon={BadgeCheck} placeholder="License Number" required value={form.licenseNumber} onChange={(v) => setForm({ ...form, licenseNumber: v })} />
                  <InputWithIcon icon={Building2} placeholder="Hospital / Clinic" required value={form.hospital} onChange={(v) => setForm({ ...form, hospital: v })} />
                </>
              )}

              {form.role === "nurse" && (
                <>
                  <InputWithIcon icon={HeartPulse} placeholder="Department" required value={form.department} onChange={(v) => setForm({ ...form, department: v })} />
                  <InputWithIcon icon={BadgeCheck} placeholder="Nurse License" required value={form.nurseLicense} onChange={(v) => setForm({ ...form, nurseLicense: v })} />
                  <InputWithIcon icon={Building2} placeholder="Hospital / Clinic" required value={form.hospital} onChange={(v) => setForm({ ...form, hospital: v })} />
                </>
              )}

              {form.role === "receptionist" && (
                <>
                  <InputWithIcon icon={HeartPulse} placeholder="Department" value={form.department} onChange={(v) => setForm({ ...form, department: v })} />
                  <InputWithIcon icon={Building2} placeholder="Hospital / Clinic" required value={form.hospital} onChange={(v) => setForm({ ...form, hospital: v })} />
                </>
              )}

              <button type="submit" disabled={creating} className="btn-primary w-full py-3">
                {creating ? "Creating..." : `Create ${ROLE_LABELS[form.role]}`}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-3 flex-wrap">
        <input
          className="input-field flex-1 min-w-[140px] py-2.5"
          placeholder="Search name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
        />
        <select className="input-field w-auto py-2.5" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All roles</option>
          {Object.entries(ROLE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={28} /></div>
      ) : users.length === 0 ? (
        <div className="card p-8 text-center text-sm text-gray-400">No users found</div>
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u._id} className="card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center shrink-0">
                {u.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{u.name}</p>
                <p className="text-xs text-gray-500 truncate">{u.email}</p>
                <span className="text-[10px] font-medium text-primary capitalize">{ROLE_LABELS[u.role || "patient"]}</span>
                {!u.isActive && <span className="ml-2 text-[10px] text-red-500 font-medium">Inactive</span>}
              </div>
              <button
                type="button"
                onClick={() => toggleStatus(u._id)}
                className={`p-2 rounded-xl border min-h-11 min-w-11 flex items-center justify-center ${u.isActive ? "border-red-200 text-red-500 hover:bg-red-50" : "border-green-200 text-green-600 hover:bg-green-50"}`}
                title={u.isActive ? "Deactivate" : "Activate"}
              >
                {u.isActive ? <UserX size={18} /> : <UserCheck size={18} />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
