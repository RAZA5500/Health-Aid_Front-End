"use client";

import StaffShell from "@/components/layout/StaffShell";
import { adminNavItems } from "@/lib/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <StaffShell navItems={adminNavItems} title="Admin Portal">{children}</StaffShell>;
}
