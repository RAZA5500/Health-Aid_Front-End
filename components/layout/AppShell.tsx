"use client";

import BottomNav from "@/components/BottomNav";
import SidebarNav from "@/components/layout/SidebarNav";
import { patientNavItems, patientSidebarExtras } from "@/lib/navigation";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex">
      <SidebarNav items={patientNavItems} extras={patientSidebarExtras} title="HealthAid" />

      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 pb-20 lg:pb-6 safe-bottom">
          <div className="w-full max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto">
            {children}
          </div>
        </main>
        <div className="lg:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
