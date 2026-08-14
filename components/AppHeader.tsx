"use client";

import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import NotificationDropdown from "@/components/NotificationDropdown";
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
    <header className="flex items-center justify-between px-4 md:px-6 py-4">
      <div>
        {greeting && (
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            {greeting}
            {showWave && " 👋"}
          </h1>
        )}
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2.5">
        <NotificationDropdown />
        <Link
          href={defaultMessagesHref}
          className="relative p-2.5 rounded-full bg-white shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
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
          className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm border-2 border-primary/20"
        >
          {user?.name?.[0]?.toUpperCase() || "U"}
        </Link>
      </div>
    </header>
  );
}
