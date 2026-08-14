"use client";

import StaffShell from "@/components/layout/StaffShell";
import EmergencyAlertModal, { useEmergencyAlerts } from "@/components/EmergencyAlertModal";
import { doctorNavItems } from "@/lib/navigation";
import { useAuth } from "@/context/AuthContext";

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const isOnDutyDoctor = user?.role === "doctor" && !!user?.clockedIn;
  const { alert, dismiss } = useEmergencyAlerts(isOnDutyDoctor);

  return (
    <StaffShell navItems={doctorNavItems} title="Doctor Portal">
      {alert && <EmergencyAlertModal alert={alert} onDismiss={dismiss} />}
      {children}
    </StaffShell>
  );
}
