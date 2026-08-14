"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import AuthPageLayout from "@/components/auth/AuthPageLayout";
import InputWithIcon from "@/components/InputWithIcon";
import OAuthButtons from "@/components/OAuthButtons";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login(form);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      login(res.data.token, res.data.user, res.data.redirectTo, res.data.refreshToken);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageLayout
      title="Welcome Back"
      subtitle="Sign in to HealthAid"
      brandingTitle="Your Health Companion"
      brandingDescription="Track milestones, connect with care providers, and stay informed throughout your pregnancy journey."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputWithIcon
          icon={Mail}
          type="email"
          placeholder="Email Address"
          required
          value={form.email}
          onChange={(v) => setForm({ ...form, email: v })}
        />
        <div className="relative">
          <Lock
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-primary"
            aria-hidden
          />
          <input
            className="input-field input-field-icon pr-12"
            type={showPwd ? "text" : "password"}
            placeholder="Password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button
            type="button"
            onClick={() => setShowPwd(!showPwd)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            aria-label={showPwd ? "Hide password" : "Show password"}
          >
            {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <OAuthButtons mode="login" />

      <p className="mt-6 text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-semibold text-primary">
          Sign Up
        </Link>
      </p>
    </AuthPageLayout>
  );
}
