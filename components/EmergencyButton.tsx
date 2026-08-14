"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import ConfirmDialog from "@/components/ConfirmDialog";
import { emergencyApi, notificationsApi } from "@/lib/api";
import { useNotificationSync } from "@/hooks/useNotificationSync";
import type { EmergencyStatus } from "@/lib/types";

const STATUS_LABELS: Record<EmergencyStatus, string> = {
  sent: "Sent",
  delivered: "Delivered to on-duty doctors",
  seen: "Seen by a doctor",
  accepted: "Doctor accepted — help is on the way",
  in_progress: "In progress",
  resolved: "Resolved",
  cancelled: "Cancelled",
};

function formatStatus(status?: EmergencyStatus) {
  if (!status) return null;
  return STATUS_LABELS[status] || status;
}

export default function EmergencyButton() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<EmergencyStatus | null>(null);

  const refreshStatus = useCallback(async () => {
    try {
      const res = await notificationsApi.getAll({ limit: 20 });
      const notifications = res.data.notifications || [];
      const latest = notifications.find(
        (n: { metadata?: { emergencyKind?: string; emergencyStatus?: EmergencyStatus } }) =>
          n.metadata?.emergencyKind === "patient_trigger" ||
          n.metadata?.emergencyKind === "patient_status",
      );
      if (latest?.metadata?.emergencyStatus) {
        setStatus(latest.metadata.emergencyStatus);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  useNotificationSync(refreshStatus);

  const handleEmergency = async () => {
    setLoading(true);
    try {
      const res = await emergencyApi.trigger();
      const count = res.data.doctorsNotified ?? 0;
      const nextStatus = (res.data.alert?.emergencyStatus as EmergencyStatus) || "sent";
      setStatus(nextStatus);
      if (count > 0) {
        toast.success(`Emergency alert sent to ${count} on-duty doctor(s)`);
      } else {
        toast.warning("No doctors on duty. Please call emergency services (112/911).");
      }
      setConfirmOpen(false);
      refreshStatus();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Could not send emergency alert");
    } finally {
      setLoading(false);
    }
  };

  const statusLabel = formatStatus(status || undefined);

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-red-500 text-white font-semibold shadow-lg shadow-red-500/25 hover:bg-red-600 transition-colors animate-pulse hover:animate-none"
      >
        <AlertTriangle size={20} />
        Emergency — Need Help Now
      </button>

      {statusLabel && (
        <p className="text-xs text-center text-gray-500 mt-2">
          Latest alert status: <span className="font-medium text-gray-700">{statusLabel}</span>
        </p>
      )}

      {confirmOpen && (
        <ConfirmDialog
          title="Send emergency alert?"
          message="This will immediately notify all on-duty doctors with your details and appointments. For life-threatening emergencies, also call your local emergency number."
          confirmLabel={loading ? "Sending..." : "Send Alert"}
          cancelLabel="Cancel"
          variant="danger"
          onConfirm={handleEmergency}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
    </>
  );
}
