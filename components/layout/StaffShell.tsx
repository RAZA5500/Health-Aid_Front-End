"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import SidebarNav from "@/components/layout/SidebarNav";
import StaffDutyPanel from "@/components/staff/StaffDutyPanel";
import { useAuth } from "@/context/AuthContext";
import type { NavItem } from "@/lib/navigation";

interface StaffShellProps {
  children: React.ReactNode;
  navItems: NavItem[];
  title: string;
}

export default function StaffShell({ children, navItems, title }: StaffShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();
  const isStaff = ["doctor", "nurse", "receptionist"].includes(user?.role || "");
  const showContent = !isStaff || user?.clockedIn;

  return (
    <div className="min-h-screen bg-background flex overflow-x-hidden">
      {/* Desktop sidebar */}
      <SidebarNav items={navItems} title={title} />

      {/* Mobile drawer overlay */}
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
              <span className="font-bold text-gray-900">{title}</span>
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
              {navItems.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(href + "/");
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
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 safe-top">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="touch-target rounded-lg hover:bg-gray-50"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <span className="font-bold text-gray-900 truncate">{title}</span>
        </header>

        <main className="flex-1 p-4 md:p-6 safe-bottom overflow-x-hidden min-w-0">
          <div className="w-full max-w-6xl mx-auto">
            {isStaff && <StaffDutyPanel />}
            {showContent ? children : null}
          </div>
        </main>
      </div>
    </div>
  );
}
