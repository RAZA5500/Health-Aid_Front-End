"use client";

import { Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import AppHeader from "@/components/AppHeader";
import MessagesPanel from "@/components/MessagesPanel";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

function MessagesPageContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialConversationId = searchParams.get("c") || undefined;

  return (
    <div className="page-content">
      <AppHeader greeting="Messages" subtitle="Your conversations" />
      <MessagesPanel
        userRole={user?.role || "patient"}
        userId={user?._id}
        initialConversationId={initialConversationId}
      />
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      }
    >
      <MessagesPageContent />
    </Suspense>
  );
}
