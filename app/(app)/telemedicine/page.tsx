"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import MicLevelIndicator from "@/components/MicLevelIndicator";
import TelemedicineDoctor from "@/components/illustrations/TelemedicineDoctor";
import {
  CheckCircle,
  Loader2,
  MessageCircle,
  Mic,
  MicOff,
  Video,
  VideoOff,
} from "lucide-react";
import { toast } from "sonner";
import { consultationsApi, messagesApi } from "@/lib/api";
import type { StaffMember, VideoConsultation } from "@/lib/types";

const features = ["Video Consultations", "24/7 Support", "Secure & Private"];

function getTelemedicineErrorMessage(err: unknown) {
  const axiosErr = err as {
    response?: { status?: number; data?: { message?: string } };
    code?: string;
  };
  if (axiosErr.response?.status === 404) {
    return "Telemedicine API unavailable — restart the backend server on port 2000";
  }
  if (!axiosErr.response && axiosErr.code === "ERR_NETWORK") {
    return "Cannot reach server — check that the backend is running";
  }
  return axiosErr.response?.data?.message || "Failed to load telemedicine data";
}

const STATUS_LABELS: Record<string, string> = {
  requested: "Request sent",
  pending: "Pending review",
  accepted: "Accepted by doctor",
  scheduled: "Scheduled",
  waiting: "In waiting room",
  active: "Consultation active",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function TelemedicinePage() {
  const router = useRouter();
  const [consultation, setConsultation] = useState<VideoConsultation | null>(null);
  const [doctors, setDoctors] = useState<StaffMember[]>([]);
  const [preferredDoctorId, setPreferredDoctorId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [upcomingRes, doctorsRes] = await Promise.all([
        consultationsApi.getUpcoming(),
        consultationsApi.getDoctors(),
      ]);
      setConsultation(upcomingRes.data.consultation || null);
      setDoctors(doctorsRes.data.doctors || []);
    } catch (err) {
      console.error("Failed to load telemedicine data:", err);
      toast.error(getTelemedicineErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (consultation?.status !== "waiting" && consultation?.status !== "active") {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setMediaStream(null);
      return;
    }

    let cancelled = false;
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        setMediaStream(stream);
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => toast.error("Camera/microphone access denied"));

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      setMediaStream(null);
    };
  }, [consultation?.status]);

  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach((t) => {
        t.enabled = cameraOn;
      });
      streamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = micOn;
      });
    }
  }, [cameraOn, micOn]);

  const displayDoctor = consultation?.doctor || doctors.find((d) => d._id === preferredDoctorId) || doctors[0];

  const handleRequestConsultation = async () => {
    if (!displayDoctor) {
      toast.error("Please select a doctor first");
      return;
    }
    setActionLoading(true);
    try {
      const res = await consultationsApi.request({ doctorId: displayDoctor._id });
      setConsultation(res.data.consultation);
      toast.success("Video consultation requested");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Could not request consultation");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetPreferred = async (doctorId: string) => {
    setPreferredDoctorId(doctorId);
    try {
      await consultationsApi.setPreferredDoctor(doctorId);
      toast.success("Preferred doctor saved — message request still required to chat");
    } catch {
      toast.error("Failed to save preferred doctor");
    }
  };

  const handleJoinWaitingRoom = async () => {
    if (!consultation) return;
    setActionLoading(true);
    try {
      const res = await consultationsApi.update(consultation._id, "join_waiting");
      setConsultation(res.data.consultation);
      toast.success("Entered waiting room");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Could not join waiting room");
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinConsultation = async () => {
    if (!consultation) return;
    setActionLoading(true);
    try {
      if (consultation.status === "waiting") {
        toast.info("Waiting for doctor to start the session...");
      } else if (consultation.status === "active") {
        toast.success("Consultation is active — video session connected");
      } else if (["accepted", "scheduled"].includes(consultation.status)) {
        await handleJoinWaitingRoom();
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleMessageDoctor = async () => {
    if (!displayDoctor) {
      router.push("/messages");
      return;
    }
    setActionLoading(true);
    try {
      const res = await messagesApi.createMessageRequest(displayDoctor._id);
      router.push(`/messages/${res.data.conversation._id}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Request a message from Messages page");
      router.push("/messages");
    } finally {
      setActionLoading(false);
    }
  };

  const inWaitingRoom = consultation?.status === "waiting" || consultation?.status === "active";

  return (
    <div className="page-content">
      <AppHeader greeting="Talk to a Doctor" subtitle="Telemedicine" />

      {consultation && (
        <div className="card p-5 mb-5">
          <h3 className="font-semibold text-gray-900 mb-2">Upcoming Consultation</h3>
          <p className="text-sm text-gray-600">
            Dr. {consultation.doctor.name} · {STATUS_LABELS[consultation.status]}
          </p>
          {consultation.scheduledAt && (
            <p className="text-xs text-gray-400 mt-1">
              Scheduled: {new Date(consultation.scheduledAt).toLocaleString()}
            </p>
          )}
          {["accepted", "scheduled", "waiting", "active"].includes(consultation.status) && (
            <button
              type="button"
              onClick={handleJoinConsultation}
              disabled={actionLoading}
              className="btn-primary w-full mt-3 py-2.5 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {actionLoading ? <Loader2 className="animate-spin" size={18} /> : <Video size={18} />}
              {consultation.status === "active" ? "Join Consultation" : "Enter Waiting Room"}
            </button>
          )}
        </div>
      )}

      <div className="card p-5 mb-5 overflow-hidden">
        <TelemedicineDoctor className="w-full h-44 mb-2" />
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="animate-spin text-primary" size={24} />
          </div>
        ) : displayDoctor ? (
          <>
            <h2 className="text-lg font-bold text-gray-900 text-center">{displayDoctor.name}</h2>
            <p className="text-gray-500 text-sm text-center mb-2">
              {displayDoctor.specialization || displayDoctor.specialty || "Care Provider"}
            </p>
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                {displayDoctor.availability || "Available"}
              </span>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-lg font-bold text-gray-900 text-center">Care Team</h2>
            <p className="text-gray-500 text-sm text-center mb-2">
              Select your preferred doctor below or use 24/7 General Help in Messages.
            </p>
          </>
        )}
      </div>

      {inWaitingRoom && (
        <div className="card p-5 mb-5">
          <h3 className="font-semibold text-gray-900 mb-3">Waiting Room</h3>
          <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video mb-3">
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            {!cameraOn && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white text-sm">
                Camera off
              </div>
            )}
          </div>
          <MicLevelIndicator stream={mediaStream} micOn={micOn} />
          <p className="text-sm text-gray-500 text-center mb-3 mt-3">
            {consultation?.status === "active"
              ? "Consultation in progress"
              : "Waiting for doctor..."}
          </p>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={() => setCameraOn((v) => !v)}
              className={`p-3 rounded-full ${cameraOn ? "bg-primary/15 text-primary" : "bg-red-100 text-red-600"}`}
            >
              {cameraOn ? <Video size={20} /> : <VideoOff size={20} />}
            </button>
            <button
              type="button"
              onClick={() => setMicOn((v) => !v)}
              className={`p-3 rounded-full ${micOn ? "bg-primary/15 text-primary" : "bg-red-100 text-red-600"}`}
            >
              {micOn ? <Mic size={20} /> : <MicOff size={20} />}
            </button>
          </div>
        </div>
      )}

      <div className="card p-5 mb-5">
        <h3 className="font-semibold text-gray-900 mb-3">My Doctor</h3>
        {doctors.length === 0 ? (
          <p className="text-sm text-gray-400">No doctors available. Contact admin.</p>
        ) : (
          <div className="space-y-2">
            {doctors.map((doc) => (
              <button
                key={doc._id}
                type="button"
                onClick={() => handleSetPreferred(doc._id)}
                className={`w-full p-3 rounded-xl text-left text-sm flex justify-between items-center ${
                  preferredDoctorId === doc._id ? "ring-2 ring-primary/40 bg-primary/5" : "bg-gray-50"
                }`}
              >
                <span className="font-medium">{doc.name}</span>
                <span className="text-xs text-gray-400">{doc.specialization || doc.specialty}</span>
              </button>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-400 mt-2">
          Selecting a doctor requires message request approval before chatting.
        </p>
      </div>

      <div className="card p-5 mb-5 space-y-4">
        {features.map((text) => (
          <div key={text} className="flex items-center gap-3">
            <CheckCircle size={20} className="text-primary shrink-0" />
            <span className="text-gray-700 font-medium text-sm">{text}</span>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={consultation ? handleJoinConsultation : handleRequestConsultation}
        disabled={actionLoading || loading || !displayDoctor}
        className="btn-blue w-full text-lg py-4 flex items-center justify-center gap-2 disabled:opacity-60 mb-3"
      >
        {actionLoading ? (
          <Loader2 className="animate-spin" size={20} />
        ) : (
          <Video size={20} />
        )}
        {consultation ? "Join Consultation" : "Request Video Consultation"}
      </button>

      <button
        type="button"
        onClick={handleMessageDoctor}
        disabled={actionLoading || !displayDoctor}
        className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-60"
      >
        <MessageCircle size={18} />
        Request Message with Doctor
      </button>

      <p className="text-center text-xs text-gray-400 mt-4">
        Secure video consultations with your healthcare team
      </p>
    </div>
  );
}
