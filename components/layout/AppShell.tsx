"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import SidebarNav from "@/components/layout/SidebarNav";
import { MobileNavContext } from "@/components/layout/MobileNavContext";
import { patientNavItems, patientSidebarExtras } from "@/lib/navigation";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <MobileNavContext.Provider value={{ openMenu: () => setMobileOpen(true) }}>
      <div className="min-h-screen bg-background flex overflow-x-hidden">
        <SidebarNav items={patientNavItems} extras={patientSidebarExtras} title="HealthAid" />

        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/40"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            />
            <div className="absolute left-0 top-0 bottom-0 w-[min(18rem,85vw)] bg-white shadow-xl flex flex-col safe-top safe-bottom">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <span className="font-bold text-gray-900">HealthAid</span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="touch-target rounded-lg hover:bg-gray-50"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-1">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                  Main
                </p>
                {patientNavItems.map(({ href, label, icon: Icon }) => {
                  const active = isActive(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium min-h-11 ${
                        active ? "bg-primary/10 text-primary" : "text-gray-600"
                      }`}
                    >
                      <Icon size={20} />
                      {label}
                    </Link>
                  );
                })}
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 mt-5 mb-2">
                  Tools
                </p>
                {patientSidebarExtras.map(({ href, label, icon: Icon }) => {
                  const active = isActive(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium min-h-11 ${
                        active ? "bg-primary/10 text-primary" : "text-gray-600"
                      }`}
                    >
                      <Icon size={20} />
                      {label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
          <main className="flex-1 pb-20 lg:pb-6 safe-bottom overflow-x-hidden">
            <div className="w-full max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto min-w-0">
              {children}
            </div>
          </main>
          <div className="lg:hidden">
            <BottomNav />
          </div>
        </div>
      </div>
    </MobileNavContext.Provider>
  );
}
