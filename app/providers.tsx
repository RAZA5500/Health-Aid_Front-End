"use client";

import { AuthProvider } from "@/context/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "sonner";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export default function Providers({ children }: { children: React.ReactNode }) {
  const content = (
    <AuthProvider>
      {children}
      <Toaster
        position="top-center"
        richColors
        closeButton
        toastOptions={{
          className: "font-sans text-sm",
          style: { fontFamily: "var(--font-poppins), system-ui, sans-serif" },
        }}
      />
    </AuthProvider>
  );

  if (!GOOGLE_CLIENT_ID) {
    return content;
  }

  return <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>{content}</GoogleOAuthProvider>;
}
