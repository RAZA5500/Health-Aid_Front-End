"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import { AlertTriangle, X, Phone, Mail, Calendar, User, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { emergencyApi, SOCKET_URL } from "@/lib/api";

export type EmergencyStatus =
  | "sent"
  | "delivered"
  | "seen"
  | "accepted"
  | "in_progress"
  | "resolved"
  | "cancelled";

export interface EmergencyAlertPayload {
  notificationId?: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  emergencyContact: string;
  bloodType: string;
  dueDate?: string | null;
  lmpDate?: string | null;
  appointments: Array<{
    _id: string;
    doctorName: string;
    specialization: string;
    date: string;
    time: string;
  }>;
  triggeredAt: string;
  emergencyStatus?: EmergencyStatus;
}

function pickLatestAlert(alerts: EmergencyAlertPayload[]) {
  if (!alerts.length) return null;
  return [...alerts].sort(
    (a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime(),
  )[0];
}

export function useEmergencyAlerts(enabled: boolean) {
  const [alert, setAlert] = useState<EmergencyAlertPayload | null>(null);
  const alertRef = useRef<EmergencyAlertPayload | null>(null);

  const showAlert = useCallback((payload: EmergencyAlertPayload) => {
    alertRef.current = payload;
    setAlert(payload);
  }, []);

  const loadPending = useCallback(async () => {
    try {
      const res = await emergencyApi.getPending();
      const latest = pickLatestAlert(res.data.alerts || []);
      if (latest) showAlert(latest);
    } catch {
      /* ignore — doctor may not be clocked in yet */
    }
  }, [showAlert]);

  useEffect(() => {
    if (!enabled) {
      alertRef.current = null;
      setAlert(null);
      return;
    }

    loadPending();

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;

    const socket = io(SOCKET_URL, { auth: { token } });

    socket.on("connect", () => {
      loadPending();
    });

    socket.on("emergency_alert", (payload: EmergencyAlertPayload) => {
      showAlert(payload);
    });

    return () => {
      socket.off("connect");
      socket.off("emergency_alert");
      socket.disconnect();
    };
  }, [enabled, loadPending, showAlert]);

  const dismiss = useCallback(() => {
    alertRef.current = null;
    setAlert(null);
  }, []);

  return { alert, dismiss, reloadPending: loadPending };
}

interface EmergencyAlertModalProps {
  alert: EmergencyAlertPayload;
  onDismiss: () => void;
}

export default function EmergencyAlertModal({ alert, onDismiss }: EmergencyAlertModalProps) {
  const router = useRouter();
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (!alert.notificationId) return;
    if (alert.emergencyStatus === "seen" || alert.emergencyStatus === "accepted") return;
    emergencyApi.markSeen(alert.notificationId).catch(() => {
      /* non-blocking */
    });
  }, [alert.notificationId, alert.emergencyStatus]);

  const handleAccept = async () => {
    setAccepting(true);
    try {
      await emergencyApi.accept(alert.patientId, alert.notificationId);
      onDismiss();
      toast.success("Emergency alert accepted — patient assigned to you");
      router.push(`/doctor/patients/${alert.patientId}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Failed to accept emergency alert");
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-red-950/60 backdrop-blur-sm">
      <div
        role="alertdialog"
        aria-modal="true"
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border-4 border-red-500 animate-[pulse_1s_ease-in-out_3] rounded-b-none sm:rounded-2xl"
      >
        <div className="bg-red-500 text-white px-4 sm:px-5 py-4 rounded-t-xl flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <AlertTriangle size={24} className="animate-bounce shrink-0" />
            <h2 className="font-bold text-base sm:text-lg truncate">EMERGENCY ALERT</h2>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="touch-target rounded-full hover:bg-red-600 shrink-0"
            aria-label="Dismiss alert"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 font-bold flex items-center justify-center text-lg shrink-0">
              {alert.patientName[0]}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-gray-900 text-lg truncate">{alert.patientName}</p>
              <p className="text-xs text-red-600 font-medium">
                Alert triggered {format(new Date(alert.triggeredAt), "h:mm a")}
              </p>
            </div>
          </div>

          <div className="grid gap-2 text-sm">
            {alert.patientPhone && (
              <p className="flex items-center gap-2 text-gray-700">
                <Phone size={14} className="text-red-500 shrink-0" /> {alert.patientPhone}
              </p>
            )}
            <p className="flex items-center gap-2 text-gray-700">
              <Mail size={14} className="text-red-500 shrink-0" /> {alert.patientEmail}
            </p>
            {alert.emergencyContact && (
              <p className="flex items-center gap-2 text-gray-700">
                <User size={14} className="text-red-500 shrink-0" /> Emergency: {alert.emergencyContact}
              </p>
            )}
            {alert.bloodType && (
              <p className="text-gray-600">Blood type: <strong>{alert.bloodType}</strong></p>
            )}
          </div>

          {alert.appointments.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1">
                <Calendar size={12} /> Upcoming Appointments
              </p>
              <div className="space-y-2">
                {alert.appointments.map((a) => (
                  <div key={a._id} className="bg-gray-50 rounded-xl p-3 text-sm">
                    <p className="font-semibold text-gray-900">{a.doctorName}</p>
                    <p className="text-gray-500 text-xs">{a.specialization}</p>
                    <p className="text-primary text-xs font-medium mt-1">
                      {format(new Date(a.date), "MMM d, yyyy")} · {a.time}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleAccept}
            disabled={accepting}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 min-h-11"
          >
            {accepting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Accepting...
              </>
            ) : (
              "Accept Alert & View Patient"
            )}
          </button>
          <button type="button" onClick={onDismiss} className="btn-secondary w-full min-h-11">
            Dismiss Alert
          </button>
        </div>
      </div>
    </div>
  );
}
