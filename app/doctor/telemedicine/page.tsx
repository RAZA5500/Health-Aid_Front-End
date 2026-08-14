"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Mic, MicOff, Video, VideoOff } from "lucide-react";
import { toast } from "sonner";
import AppHeader from "@/components/AppHeader";
import MicLevelIndicator from "@/components/MicLevelIndicator";
import { consultationsApi } from "@/lib/api";
import type { VideoConsultation } from "@/lib/types";

const STATUS_LABELS: Record<string, string> = {
  requested: "New request",
  pending: "Pending review",
  accepted: "Accepted — patient can join waiting room",
  scheduled: "Scheduled",
  waiting: "Patient in waiting room",
  active: "Consultation active",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function DoctorTelemedicinePage() {
  const [consultations, setConsultations] = useState<VideoConsultation[]>([]);
  const [activeConsultation, setActiveConsultation] = useState<VideoConsultation | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  const loadConsultations = useCallback(async () => {
    try {
      const res = await consultationsApi.getAll();
      const list = res.data.consultations || [];
      setConsultations(list);
      const current =
        list.find((c: VideoConsultation) => ["waiting", "active"].includes(c.status)) ||
        list.find((c: VideoConsultation) => !["completed", "cancelled"].includes(c.status)) ||
        null;
      setActiveConsultation(current);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Failed to load consultations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConsultations();
  }, [loadConsultations]);

  useEffect(() => {
    if (!activeConsultation || !["waiting", "active"].includes(activeConsultation.status)) {
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
  }, [activeConsultation?.status, activeConsultation?._id]);

  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach((t) => { t.enabled = cameraOn; });
      streamRef.current.getAudioTracks().forEach((t) => { t.enabled = micOn; });
    }
  }, [cameraOn, micOn]);

  const runAction = async (id: string, action: string, successMsg: string) => {
    setActionId(id);
    try {
      const res = await consultationsApi.update(id, action);
      toast.success(successMsg);
      await loadConsultations();
      setActiveConsultation(res.data.consultation);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Action failed");
    } finally {
      setActionId(null);
    }
  };

  const getActions = (c: VideoConsultation) => {
    switch (c.status) {
      case "requested":
      case "pending":
        return (
          <button
            type="button"
            disabled={actionId === c._id}
            onClick={() => runAction(c._id, "accept", "Consultation accepted")}
            className="btn-primary text-sm py-2 px-4"
          >
            Accept Request
          </button>
        );
      case "accepted":
      case "scheduled":
        return (
          <p className="text-xs text-gray-500">Waiting for patient to enter waiting room</p>
        );
      case "waiting":
        return (
          <button
            type="button"
            disabled={actionId === c._id}
            onClick={() => runAction(c._id, "start", "Consultation started")}
            className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
          >
            {actionId === c._id ? <Loader2 className="animate-spin" size={16} /> : <Video size={16} />}
            Start Video Session
          </button>
        );
      case "active":
        return (
          <button
            type="button"
            disabled={actionId === c._id}
            onClick={() => runAction(c._id, "complete", "Consultation completed")}
            className="bg-red-500 text-white text-sm py-2 px-4 rounded-xl font-semibold hover:bg-red-600"
          >
            End Consultation
          </button>
        );
      default:
        return null;
    }
  };

  const inSession = activeConsultation && ["waiting", "active"].includes(activeConsultation.status);

  return (
    <div className="page-content">
      <AppHeader greeting="Telemedicine" subtitle="Video consultations" />

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : (
        <>
          {inSession && activeConsultation && (
            <div className="card p-5 mb-5">
              <h3 className="font-semibold text-gray-900 mb-2">
                Session with {activeConsultation.patient.name}
              </h3>
              <p className="text-sm text-gray-500 mb-3">{STATUS_LABELS[activeConsultation.status]}</p>
              <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video mb-3">
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                {!cameraOn && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white text-sm">
                    Camera off
                  </div>
                )}
              </div>
              <MicLevelIndicator stream={mediaStream} micOn={micOn} />
              <div className="flex justify-center gap-3 mb-3 mt-3">
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
              <div className="flex justify-center">{getActions(activeConsultation)}</div>
            </div>
          )}

          <h2 className="font-semibold text-gray-900 mb-3">Consultation Queue</h2>
          {consultations.length === 0 ? (
            <div className="card p-8 text-center text-sm text-gray-400">No consultation requests</div>
          ) : (
            <div className="space-y-3">
              {consultations.map((c) => (
                <div key={c._id} className="card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900">{c.patient.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{STATUS_LABELS[c.status]}</p>
                      {c.reason && <p className="text-xs text-gray-400 mt-1">{c.reason}</p>}
                    </div>
                    <div className="shrink-0">{getActions(c)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
