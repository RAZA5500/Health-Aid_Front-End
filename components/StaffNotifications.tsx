"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { notificationsApi } from "@/lib/api";
import type { Notification } from "@/lib/types";
import { Bell } from "lucide-react";

export default function StaffNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationsApi
      .getAll({ limit: 50 })
      .then((res) => setNotifications(res.data.notifications || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleMarkRead = async (id: string) => {
    await notificationsApi.markAsRead(id);
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
  };

  if (loading) return <div className="text-center py-10 text-gray-400">Loading...</div>;

  if (notifications.length === 0) {
    return (
      <div className="card p-8 text-center text-gray-400">
        <Bell size={40} className="mx-auto mb-3 opacity-40" />
        <p>No notifications</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {notifications.map((n) => (
        <Link
          key={n._id}
          href={n.link || "#"}
          onClick={() => !n.read && handleMarkRead(n._id)}
          className={`card p-4 block hover:shadow-md transition-shadow ${!n.read ? "border-l-4 border-l-primary" : ""}`}
        >
          <p className="font-semibold text-sm text-gray-900">{n.title}</p>
          <p className="text-sm text-gray-500 mt-0.5">{n.body}</p>
          <p className="text-xs text-gray-400 mt-1">
            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
          </p>
        </Link>
      ))}
    </div>
  );
}
