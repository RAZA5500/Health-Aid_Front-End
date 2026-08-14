import type { User, UserRole } from "./types";
import { getRoleDashboardPath } from "./types";

export function getDashboardPath(role?: UserRole): string {
  return getRoleDashboardPath(role);
}

export const ROLE_LABELS: Record<UserRole, string> = {
  patient: "Patient",
  doctor: "Doctor",
  nurse: "Nurse",
  receptionist: "Receptionist",
  admin: "Admin",
};

export const PUBLIC_PATHS = ["/welcome", "/signup", "/login", "/"];

export const ONBOARDING_PATH = "/onboarding/pregnancy";

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.includes(pathname);
}

export function patientNeedsOnboarding(user?: User | null): boolean {
  return user?.role === "patient" && !user.lmpDate && !user.dueDate;
}

export function getAuthRedirectPath(user?: User | null): string {
  if (patientNeedsOnboarding(user)) {
    return ONBOARDING_PATH;
  }
  return getRoleDashboardPath(user?.role);
}

export function canAccessPath(role: UserRole, pathname: string): boolean {
  if (pathname.startsWith("/onboarding")) {
    return role === "patient";
  }
  if (pathname.startsWith("/doctor")) return role === "doctor" || role === "admin";
  if (pathname.startsWith("/nurse")) return role === "nurse" || role === "receptionist" || role === "admin";
  if (pathname.startsWith("/admin")) return role === "admin";
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/journey") ||
    pathname.startsWith("/community") ||
    pathname.startsWith("/messages") ||
    pathname.startsWith("/notifications") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/appointments") ||
    pathname.startsWith("/medications") ||
    pathname.startsWith("/kicks") ||
    pathname.startsWith("/contractions") ||
    pathname.startsWith("/records") ||
    pathname.startsWith("/telemedicine")
  ) {
    return role === "patient";
  }
  return true;
}
