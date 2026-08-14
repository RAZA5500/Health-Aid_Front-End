"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import HealthAidLogo from "@/components/illustrations/HealthAidLogo";
import { useAuth } from "@/context/AuthContext";
import type { NavItem } from "@/lib/navigation";
import { LogOut } from "lucide-react";

interface SidebarNavProps {
  items: NavItem[];
  extras?: NavItem[];
  title?: string;
}

export default function SidebarNav({ items, extras = [], title = "HealthAid" }: SidebarNavProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const renderLink = ({ href, label, icon: Icon }: NavItem) => {
    const active = isActive(href);
    return (
      <Link
        key={href}
        href={href}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
          active
            ? "bg-primary/10 text-primary"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        }`}
      >
        <Icon size={20} strokeWidth={active ? 2.5 : 2} />
        {label}
      </Link>
    );
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white border-r border-gray-100 h-screen sticky top-0">
      <div className="p-5 border-b border-gray-100">
        <Link href={items[0]?.href || "/dashboard"} className="flex items-center gap-3">
          <HealthAidLogo size={40} animated />
          <span className="font-bold text-gray-900">{title}</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-1">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
          Main
        </p>
        {items.map(renderLink)}

        {extras.length > 0 && (
          <>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 mt-5 mb-2">
              Tools
            </p>
            {extras.map(renderLink)}
          </>
        )}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role || "patient"}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
