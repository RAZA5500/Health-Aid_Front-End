"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Loader2, Video, X } from "lucide-react";
import { toast } from "sonner";
import AppHeader from "@/components/AppHeader";
import StatCard, { Users, Calendar, MessageCircle, Bell } from "@/components/StatCard";
import { doctorApi, messagesApi, consultationsApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { User, Appointment, MessageRequest, VideoConsultation } from "@/lib/types";

export default function DoctorDashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    assignedPatients: 0,
    upcomingAppointments: 0,
    unreadMessages: 0,
    unreadNotifications: 0,
    pendingMessageRequests: 0,
  });
  const [patients, setPatients] = useState<User[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [messageRequests, setMessageRequests] = useState<MessageRequest[]>([]);
  const [consultations, setConsultations] = useState<VideoConsultation[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [consultationActionId, setConsultationActionId] = useState<string | null>(null);

  const loadDashboard = () => {
    doctorApi
      .getDashboard()
      .then((res) => {
        setStats(res.data.stats);
        setPatients(res.data.patients);
        setAppointments(res.data.appointments);
        setMessageRequests(res.data.messageRequests || []);
        setConsultations(res.data.consultations || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleRequestAction = async (id: string, action: "accept" | "decline") => {
    setProcessingId(id);
    try {
      await messagesApi.updateMessageRequest(id, action);
      toast.success(action === "accept" ? "Message request accepted" : "Message request declined");
      loadDashboard();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Action failed");
    } finally {
      setProcessingId(null);
    }
  };

  const handleConsultationAction = async (id: string, action: string) => {
    setConsultationActionId(id);
    try {
      await consultationsApi.update(id, action);
      toast.success(action === "accept" ? "Consultation accepted" : "Consultation updated");
      loadDashboard();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Consultation action failed");
    } finally {
      setConsultationActionId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="px-4 pb-4">
      <AppHeader
        greeting={`Dr. ${user?.name?.split(" ").pop() || "Doctor"}`}
        subtitle="Your practice overview"
        showWave
      />

      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard label="Patients" value={stats.assignedPatients} icon={Users} />
        <StatCard label="Appointments" value={stats.upcomingAppointments} icon={Calendar} color="bg-secondary/15 text-secondary" />
        <StatCard label="Messages" value={stats.unreadMessages} icon={MessageCircle} />
        <StatCard label="Alerts" value={stats.unreadNotifications} icon={Bell} color="bg-red-50 text-red-500" />
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold text-gray-900">
            Message Requests
            {stats.pendingMessageRequests > 0 && (
              <span className="ml-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                {stats.pendingMessageRequests}
              </span>
            )}
          </h2>
        </div>
        {messageRequests.length === 0 ? (
          <div className="card p-6 text-center text-sm text-gray-400">No pending message requests</div>
        ) : (
          <div className="space-y-2">
            {messageRequests.map((req) => (
              <div key={req._id} className="card p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center shrink-0">
                  {req.sender.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{req.sender.name}</p>
                  <p className="text-xs text-gray-500 truncate">{req.sender.email}</p>
                </div>
                <div className="flex gap-2 shrink-0 self-end sm:self-auto">
                  <button
                    type="button"
                    disabled={processingId === req._id}
                    onClick={() => handleRequestAction(req._id, "accept")}
                    className="touch-target rounded-full bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50"
                    title="Accept"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    type="button"
                    disabled={processingId === req._id}
                    onClick={() => handleRequestAction(req._id, "decline")}
                    className="touch-target rounded-full bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50"
                    title="Decline"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {consultations.length > 0 && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold text-gray-900">Video Consultations</h2>
            <Link href="/doctor/telemedicine" className="text-sm text-primary font-medium">Manage all</Link>
          </div>
          <div className="space-y-2">
            {consultations.map((c) => (
              <div key={c._id} className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{c.patient.name}</p>
                  <p className="text-xs text-gray-500 capitalize mt-1">Status: {c.status}</p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  {(c.status === "requested" || c.status === "pending") && (
                    <button
                      type="button"
                      disabled={consultationActionId === c._id}
                      onClick={() => handleConsultationAction(c._id, "accept")}
                      className="btn-primary text-xs py-2 px-3"
                    >
                      Accept
                    </button>
                  )}
                  {c.status === "waiting" && (
                    <button
                      type="button"
                      disabled={consultationActionId === c._id}
                      onClick={() => handleConsultationAction(c._id, "start")}
                      className="btn-primary text-xs py-2 px-3 flex items-center gap-1"
                    >
                      <Video size={14} /> Start
                    </button>
                  )}
                  {c.status === "active" && (
                    <button
                      type="button"
                      disabled={consultationActionId === c._id}
                      onClick={() => handleConsultationAction(c._id, "complete")}
                      className="text-xs py-2 px-3 rounded-xl bg-red-500 text-white font-semibold"
                    >
                      End
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold text-gray-900">Assigned Patients</h2>
          <Link href="/doctor/patients" className="text-sm text-primary font-medium">View all</Link>
        </div>
        {patients.length === 0 ? (
          <div className="card p-6 text-center text-sm text-gray-400">No patients assigned yet</div>
        ) : (
          <div className="space-y-2">
            {patients.slice(0, 5).map((p) => (
              <Link key={p._id} href={`/doctor/patients/${p._id}`} className="card p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center">
                  {p.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-sm">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.email}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold text-gray-900">Upcoming Appointments</h2>
          <Link href="/doctor/appointments" className="text-sm text-primary font-medium">View all</Link>
        </div>
        {appointments.length === 0 ? (
          <div className="card p-6 text-center text-sm text-gray-400">No upcoming appointments</div>
        ) : (
          <div className="space-y-2">
            {appointments.slice(0, 3).map((a) => (
              <div key={a._id} className="card p-4">
                <p className="font-semibold text-sm">{a.patient?.name || "Patient"}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(a.date).toLocaleDateString()} at {a.time}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
