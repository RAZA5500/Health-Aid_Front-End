"use client";

import { MessageCircle, Menu } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import NotificationDropdown from "@/components/NotificationDropdown";
import { useMobileNav } from "@/components/layout/MobileNavContext";
import { messagesApi } from "@/lib/api";

interface AppHeaderProps {
  greeting?: string;
  subtitle?: string;
  showWave?: boolean;
  messagesHref?: string;
  profileHref?: string;
}

export default function AppHeader({
  greeting,
  subtitle,
  showWave = false,
  messagesHref,
  profileHref,
}: AppHeaderProps) {
  const { user } = useAuth();
  const mobileNav = useMobileNav();
  const [unreadMessages, setUnreadMessages] = useState(0);

  const defaultMessagesHref =
    messagesHref ||
    (user?.role === "doctor"
      ? "/doctor/messages"
      : user?.role === "nurse"
        ? "/nurse/messages"
        : "/messages");

  const defaultProfileHref =
    profileHref ||
    (user?.role === "doctor"
      ? "/doctor/profile"
      : user?.role === "nurse"
        ? "/nurse/profile"
        : user?.role === "admin"
          ? "/admin/settings"
          : "/profile");

  useEffect(() => {
    if (!user) return;
    messagesApi
      .getConversations()
      .then((res) => setUnreadMessages(res.data.totalUnread || 0))
      .catch(() => {});
    const interval = setInterval(() => {
      messagesApi
        .getConversations()
        .then((res) => setUnreadMessages(res.data.totalUnread || 0))
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <header className="flex items-center justify-between gap-2 px-4 md:px-6 py-4 min-w-0">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {mobileNav && (
          <button
            type="button"
            onClick={mobileNav.openMenu}
            className="lg:hidden touch-target shrink-0 rounded-full bg-white shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} className="text-gray-600" />
          </button>
        )}
        <div className="min-w-0">
          {greeting && (
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">
              {greeting}
              {showWave && " 👋"}
            </h1>
          )}
          {subtitle && <p className="text-sm text-gray-500 mt-0.5 truncate">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        <NotificationDropdown />
        <Link
          href={defaultMessagesHref}
          className="relative touch-target rounded-full bg-white shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <MessageCircle size={20} className="text-gray-600" />
          {unreadMessages > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
              {unreadMessages > 9 ? "9+" : unreadMessages}
            </span>
          )}
        </Link>
        <Link
          href={defaultProfileHref}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm border-2 border-primary/20 shrink-0"
        >
          {user?.name?.[0]?.toUpperCase() || "U"}
        </Link>
      </div>
    </header>
  );
}
