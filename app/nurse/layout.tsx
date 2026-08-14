"use client";

import StaffShell from "@/components/layout/StaffShell";
import { nurseNavItems } from "@/lib/navigation";

export default function NurseLayout({ children }: { children: React.ReactNode }) {
  return <StaffShell navItems={nurseNavItems} title="Nurse Portal">{children}</StaffShell>;
}
