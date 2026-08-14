"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  MessageCircle,
  User,
  Settings,
  ClipboardList,
} from "lucide-react";
import { useEffect, useState } from "react";
import { messagesApi } from "@/lib/api";

type NavRole = "doctor" | "nurse" | "admin";

const NAV_CONFIG: Record<
  NavRole,
  { href: string; label: string; icon: typeof LayoutDashboard }[]
> = {
  doctor: [
    { href: "/doctor/dashboard", label: "Home", icon: LayoutDashboard },
    { href: "/doctor/patients", label: "Patients", icon: Users },
    { href: "/doctor/appointments", label: "Appts", icon: Calendar },
    { href: "/doctor/messages", label: "Messages", icon: MessageCircle },
    { href: "/doctor/profile", label: "Profile", icon: User },
  ],
  nurse: [
    { href: "/nurse/dashboard", label: "Home", icon: LayoutDashboard },
    { href: "/nurse/patients", label: "Patients", icon: Users },
    { href: "/nurse/appointments", label: "Appts", icon: Calendar },
    { href: "/nurse/messages", label: "Messages", icon: MessageCircle },
    { href: "/nurse/profile", label: "Profile", icon: User },
  ],
  admin: [
    { href: "/admin/dashboard", label: "Home", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/assignments", label: "Assign", icon: ClipboardList },
    { href: "/admin/appointments", label: "Appts", icon: Calendar },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ],
};

export default function DashboardNav({ role }: { role: NavRole }) {
  const pathname = usePathname();
  const items = NAV_CONFIG[role];
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (role === "admin") return;
    messagesApi
      .getConversations()
      .then((res) => setUnreadMessages(res.data.totalUnread || 0))
      .catch(() => {});
  }, [pathname, role]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] safe-bottom">
      <div className="dashboard-container flex justify-around items-center py-2.5 px-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          const showBadge = label === "Messages" && unreadMessages > 0;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-colors relative ${
                active ? "text-secondary" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                {showBadge && (
                  <span className="absolute -top-1.5 -right-2.5 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5">
                    {unreadMessages > 9 ? "9+" : unreadMessages}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium ${active ? "text-secondary" : ""}`}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
