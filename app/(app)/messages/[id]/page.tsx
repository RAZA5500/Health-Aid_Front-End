"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/** Legacy route: /messages/[id] → unified /messages?c=id */
export default function MessageThreadRedirectPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  useEffect(() => {
    if (id) {
      router.replace(`/messages?c=${encodeURIComponent(id)}`);
    } else {
      router.replace("/messages");
    }
  }, [id, router]);

  return (
    <div className="flex justify-center py-20">
      <Loader2 className="animate-spin text-primary" size={32} />
    </div>
  );
}
