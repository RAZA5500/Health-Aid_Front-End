import {
  Home,
  Map,
  Users,
  MessageCircle,
  User,
  Calendar,
  Bell,
  Stethoscope,
  Activity,
  ClipboardList,
  Footprints,
  Pill,
  FileText,
  LayoutDashboard,
} from "lucide-react";
import type { UserRole } from "./types";

export interface NavItem {
  href: string;
  label: string;
  icon: typeof Home;
  badge?: number;
}

export const patientNavItems: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/journey", label: "Journey", icon: Map },
  { href: "/community", label: "Community", icon: Users },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/profile", label: "Profile", icon: User },
];

export const patientSidebarExtras: NavItem[] = [
  { href: "/kicks", label: "Kick Counter", icon: Footprints },
  { href: "/contractions", label: "Contractions", icon: Activity },
  { href: "/appointments", label: "Appointments", icon: Calendar },
  { href: "/medications", label: "Medications", icon: Pill },
  { href: "/records", label: "Health Records", icon: FileText },
  { href: "/telemedicine", label: "Telemedicine", icon: Stethoscope },
  { href: "/notifications", label: "Notifications", icon: Bell },
];

export const doctorNavItems: NavItem[] = [
  { href: "/doctor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/doctor/patients", label: "Patients", icon: Users },
  { href: "/doctor/appointments", label: "Appointments", icon: Calendar },
  { href: "/doctor/telemedicine", label: "Telemedicine", icon: Stethoscope },
  { href: "/doctor/messages", label: "Messages", icon: MessageCircle },
  { href: "/doctor/profile", label: "Profile", icon: User },
];

export const nurseNavItems: NavItem[] = [
  { href: "/nurse/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/nurse/patients", label: "Assigned Patients", icon: Users },
  { href: "/nurse/appointments", label: "Appointments", icon: Calendar },
  { href: "/nurse/messages", label: "Messages", icon: MessageCircle },
  { href: "/nurse/profile", label: "Profile", icon: User },
];

export const adminNavItems: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "User Management", icon: Users },
  { href: "/admin/assignments", label: "Assignments", icon: ClipboardList },
  { href: "/admin/appointments", label: "Appointments", icon: Calendar },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
];

export function getNavItemsForRole(role?: UserRole): NavItem[] {
  switch (role) {
    case "doctor":
      return doctorNavItems;
    case "nurse":
      return nurseNavItems;
    case "admin":
      return adminNavItems;
    default:
      return patientNavItems;
  }
}

export function isStaffRole(role?: UserRole): boolean {
  return role === "doctor" || role === "nurse" || role === "receptionist" || role === "admin";
}
