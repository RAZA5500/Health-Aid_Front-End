"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, HeartPulse, Phone, User } from "lucide-react";
import { toast } from "sonner";
import { addDays, format } from "date-fns";
import { dashboardApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import AuthPageLayout from "@/components/auth/AuthPageLayout";
import InputWithIcon from "@/components/InputWithIcon";

type DateMode = "lmp" | "due";

function toDateInput(value?: string | null) {
  if (!value) return "";
  try {
    return format(new Date(value), "yyyy-MM-dd");
  } catch {
    return "";
  }
}

export default function PregnancyDetailsForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = searchParams.get("edit") === "1";
  const { user, refreshUser } = useAuth();
  const [mode, setMode] = useState<DateMode>("lmp");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [lmpDate, setLmpDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!user || initialized) return;
    setName(user.name || "");
    setPhone(user.phone || "");
    setEmergencyContact(user.emergencyContact || "");
    setBloodType(user.bloodType || "");
    if (user.lmpDate) {
      setMode("lmp");
      setLmpDate(toDateInput(user.lmpDate));
    } else if (user.dueDate) {
      setMode("due");
      setDueDate(toDateInput(user.dueDate));
    }
    setInitialized(true);
  }, [user, initialized]);

  const maxLmp = format(new Date(), "yyyy-MM-dd");
  const minDue = format(addDays(new Date(), 1), "yyyy-MM-dd");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    if (!phone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }
    if (mode === "lmp" && !lmpDate) {
      toast.error("Please enter your last menstrual period date");
      return;
    }
    if (mode === "due" && !dueDate) {
      toast.error("Please enter your expected due date");
      return;
    }
    if (!emergencyContact.trim()) {
      toast.error("Emergency contact is required for your safety");
      return;
    }

    setLoading(true);
    try {
      const payload: Record<string, string> = {
        name: name.trim(),
        phone: phone.trim(),
        emergencyContact: emergencyContact.trim(),
        bloodType: bloodType.trim(),
      };
      if (mode === "lmp") {
        payload.lmpDate = new Date(lmpDate).toISOString();
        payload.dueDate = "";
      } else {
        payload.dueDate = new Date(dueDate).toISOString();
        payload.lmpDate = "";
      }

      await dashboardApi.updateProfile(payload);
      await refreshUser();
      toast.success(isEdit ? "Details updated successfully!" : "Pregnancy details saved!");
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Failed to save your details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageLayout
      title={isEdit ? "Update Your Details" : "Set Up Your Pregnancy"}
      subtitle={
        isEdit
          ? "Update your personal and pregnancy information"
          : "We need your details to calculate your pregnancy week accurately"
      }
      brandingTitle={isEdit ? "Keep Care Updated" : "Personalized Care"}
      brandingDescription={
        isEdit
          ? "Keeping your details up to date ensures your care team and calculations remain completely accurate."
          : "Track your milestones accurately, get tailored medical guidance, and keep your care team informed throughout your journey."
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputWithIcon icon={User} placeholder="Full Name" required value={name} onChange={setName} />
        <InputWithIcon icon={Phone} type="tel" placeholder="Phone Number" required value={phone} onChange={setPhone} />

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMode("lmp")}
            className={`py-2.5 px-3 rounded-xl text-sm font-semibold border transition-colors ${
              mode === "lmp"
                ? "bg-primary text-white border-primary"
                : "bg-white text-gray-600 border-gray-200 hover:border-primary/40"
            }`}
          >
            Last Period (LMP)
          </button>
          <button
            type="button"
            onClick={() => setMode("due")}
            className={`py-2.5 px-3 rounded-xl text-sm font-semibold border transition-colors ${
              mode === "due"
                ? "bg-primary text-white border-primary"
                : "bg-white text-gray-600 border-gray-200 hover:border-primary/40"
            }`}
          >
            Due Date
          </button>
        </div>

        {mode === "lmp" ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Menstrual Period</label>
            <div className="relative">
              <Calendar
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-primary"
                aria-hidden
              />
              <input
                type="date"
                className="input-field input-field-icon"
                required
                max={maxLmp}
                value={lmpDate}
                onChange={(e) => setLmpDate(e.target.value)}
              />
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Expected Due Date</label>
            <div className="relative">
              <Calendar
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-primary"
                aria-hidden
              />
              <input
                type="date"
                className="input-field input-field-icon"
                required
                min={minDue}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
        )}

        <InputWithIcon
          icon={Phone}
          type="tel"
          placeholder="Emergency Contact (required)"
          required
          value={emergencyContact}
          onChange={setEmergencyContact}
        />
        <InputWithIcon icon={HeartPulse} placeholder="Blood Type (e.g. O+)" value={bloodType} onChange={setBloodType} />

        <div className="space-y-2 pt-2">
          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
            {loading ? "Saving..." : isEdit ? "Save Changes" : "Continue to Dashboard"}
          </button>
          {isEdit && (
            <button type="button" onClick={() => router.push("/dashboard")} className="btn-secondary w-full">
              Cancel
            </button>
          )}
        </div>
      </form>
    </AuthPageLayout>
  );
}
