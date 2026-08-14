"use client";

import { useState } from "react";
import { Clock, LogIn, LogOut, Loader2, Circle } from "lucide-react";
import { toast } from "sonner";
import { staffApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { formatDistanceToNow } from "date-fns";

export default function StaffDutyPanel() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);

  if (!user || !["doctor", "nurse", "receptionist"].includes(user.role || "")) return null;

  const handleClockIn = async () => {
    setLoading(true);
    try {
      await staffApi.clockIn();
      await refreshUser();
      toast.success("You are now on duty");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Could not clock in");
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    setLoading(true);
    try {
      await staffApi.clockOut();
      await refreshUser();
      toast.success("You are now off duty");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Could not clock out");
    } finally {
      setLoading(false);
    }
  };

  const roleLabel =
    user.role === "doctor" ? "Doctor" : user.role === "nurse" ? "Nurse" : "Receptionist";

  if (!user.clockedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="card w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Clock size={32} className="text-primary" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Clock In to Start</h2>
          <p className="text-sm text-gray-500 mb-6">
            Welcome, {user.name}. Clock in as {roleLabel} to access your dashboard, appointments,
            messages, and patient tools.
          </p>
          <button
            type="button"
            onClick={handleClockIn}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
            Clock In / Check In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <div className="card p-4 flex flex-wrap items-center justify-between gap-3 border-l-4 border-l-primary">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Clock size={20} className="text-primary" />
            </div>
            <Circle size={10} className="absolute -top-0.5 -right-0.5 fill-green-500 text-green-500" />
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900 flex items-center gap-2">
              On Duty
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                {user.availability || "Available"}
              </span>
            </p>
            <p className="text-xs text-gray-500">
              {roleLabel}
              {user.clockedInAt
                ? ` · since ${formatDistanceToNow(new Date(user.clockedInAt), { addSuffix: true })}`
                : ""}
              {user.shiftStart && user.shiftEnd ? ` · Shift ${user.shiftStart}–${user.shiftEnd}` : ""}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleClockOut}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-red-500 px-3 py-2 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
          Clock Out
        </button>
      </div>
    </div>
  );
}
