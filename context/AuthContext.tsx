"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import ConfirmDialog from "@/components/ConfirmDialog";
import type { User, UserRole } from "@/lib/types";
import {
  canAccessPath,
  getAuthRedirectPath,
  isPublicPath,
  ONBOARDING_PATH,
  patientNeedsOnboarding,
} from "@/lib/auth";
import { AUTH_SESSION_EXPIRED_EVENT, authApi, dashboardApi } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User, redirectTo?: string, refreshToken?: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const clearSession = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await dashboardApi.get();
      const profile = res.data.profile;
      setUser({ ...profile, _id: profile._id || profile.id });
    } catch {
      clearSession();
      router.push("/login");
    }
  };

  const login = (newToken: string, newUser: User, redirectTo?: string, refreshToken?: string) => {
    localStorage.setItem("token", newToken);
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
    setToken(newToken);
    setUser(newUser);
    router.push(redirectTo || getAuthRedirectPath(newUser));
  };

  const performLogout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch {
      // Proceed with local logout even if server invalidation fails
    }
    clearSession();
    setShowLogoutConfirm(false);
    toast.success("Signed out successfully");
    router.push("/login");
  };

  const logout = () => {
    setShowLogoutConfirm(true);
  };

  useEffect(() => {
    const stored = localStorage.getItem("token");
    const storedRefresh = localStorage.getItem("refreshToken");
    if (stored || storedRefresh) {
      if (stored) setToken(stored);
      refreshUser()
        .finally(() => {
          const updatedToken = localStorage.getItem("token");
          if (updatedToken) setToken(updatedToken);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleSessionExpired = () => {
      setToken(null);
      setUser(null);
      router.push("/login");
    };

    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);
  }, [router]);

  useEffect(() => {
    if (loading) return;

    if (!token && !isPublicPath(pathname) && !pathname.startsWith("/onboarding")) {
      router.push("/welcome");
      return;
    }

    if (token && isPublicPath(pathname)) {
      router.push(getAuthRedirectPath(user));
      return;
    }

    if (token && user?.role === "patient") {
      const needsOnboarding = patientNeedsOnboarding(user);
      const isEditOnboarding =
        typeof window !== "undefined" && window.location.search.includes("edit=1");
      if (needsOnboarding && pathname !== ONBOARDING_PATH) {
        router.push(ONBOARDING_PATH);
        return;
      }
      if (!needsOnboarding && pathname === ONBOARDING_PATH && !isEditOnboarding) {
        router.push("/dashboard");
        return;
      }
    }

    if (token && user?.role && !canAccessPath(user.role as UserRole, pathname)) {
      router.push(getAuthRedirectPath(user));
    }
  }, [loading, token, pathname, router, user]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser }}>
      {children}
      {showLogoutConfirm && (
        <ConfirmDialog
          title="Sign Out"
          message="Are you sure you want to sign out?"
          confirmLabel="Sign Out"
          cancelLabel="Stay Signed In"
          variant="danger"
          onConfirm={performLogout}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
