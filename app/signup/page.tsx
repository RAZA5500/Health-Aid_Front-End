"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, User, Mail, Phone, Lock } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import AuthPageLayout from "@/components/auth/AuthPageLayout";
import InputWithIcon from "@/components/InputWithIcon";
import OAuthButtons from "@/components/OAuthButtons";

export default function SignupPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    terms: false,
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.terms) {
      toast.error("Please accept the Terms & Conditions");
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.signup({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
      });
      toast.success("Account created! Let's set up your pregnancy details.");
      login(res.data.token, res.data.user, res.data.redirectTo);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Signup failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageLayout
      title="Create Patient Account"
      subtitle="Join HealthAid to track your pregnancy journey"
      brandingTitle="Start Your Journey"
      brandingDescription="Create your account to monitor milestones, manage appointments, and receive personalized care guidance."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputWithIcon
          icon={User}
          placeholder="Full Name"
          required
          value={form.name}
          onChange={(v) => setForm({ ...form, name: v })}
        />
        <InputWithIcon
          icon={Mail}
          type="email"
          placeholder="Email Address"
          required
          value={form.email}
          onChange={(v) => setForm({ ...form, email: v })}
        />
        <InputWithIcon
          icon={Phone}
          type="tel"
          placeholder="Phone Number"
          required
          value={form.phone}
          onChange={(v) => setForm({ ...form, phone: v })}
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
            placeholder="Password (8+ chars, 1 uppercase, 1 number)"
            required
            minLength={8}
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

        <label className="flex items-start gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={form.terms}
            onChange={(e) => setForm({ ...form, terms: e.target.checked })}
            className="mt-0.5 accent-primary"
          />
          I agree to the Terms & Conditions and Privacy Policy
        </label>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>

      <OAuthButtons mode="signup" />

      <p className="mt-4 text-center text-xs text-gray-400">
        Doctors, nurses, and admin accounts are created by your clinic administrator.
      </p>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary">
          Sign In
        </Link>
      </p>
    </AuthPageLayout>
  );
}
