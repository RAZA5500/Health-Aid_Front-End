"use client";

import { Suspense } from "react";
import PregnancyDetailsForm from "@/components/PregnancyDetailsForm";

export default function PregnancyOnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PregnancyDetailsForm />
    </Suspense>
  );
}
