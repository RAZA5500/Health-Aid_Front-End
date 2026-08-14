"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, Users, MessageCircle, User } from "lucide-react";
import { messagesApi } from "@/lib/api";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/journey", label: "Journey", icon: Map },
  { href: "/community", label: "Community", icon: Users },
  { href: "/messages", label: "Messages", icon: MessageCircle, badgeKey: "messages" as const },
  { href: "/profile", label: "Profile", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    messagesApi
      .getConversations()
      .then((res) => setUnreadMessages(res.data.totalUnread || 0))
      .catch(() => {});
  }, [pathname]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] safe-bottom lg:hidden">
      <div className="responsive-container mx-auto flex justify-around items-center py-2.5 px-1">
        {navItems.map(({ href, label, icon: Icon, badgeKey }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          const badge = badgeKey === "messages" ? unreadMessages : 0;
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
                {badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2.5 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5">
                    {badge > 9 ? "9+" : badge}
                  </span>
                ) : null}
              </div>
              <span className={`text-[10px] font-medium ${active ? "text-secondary" : ""}`}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
