"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Bell } from "lucide-react";
import { adminApi } from "@/lib/api";

interface AdminNotification {
  _id: string;
  title: string;
  body: string;
  type: string;
  createdAt: string;
  user?: { name: string; role: string };
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getNotifications().then((res) => setNotifications(res.data.notifications || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Platform Notifications</h1>
      {loading ? (
        <div className="text-center py-10 text-gray-400">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="card p-8 text-center text-gray-400">
          <Bell size={40} className="mx-auto mb-3 opacity-40" />
          <p>No notifications</p>
        </div>
      ) : (
        <div className="space-y-2 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
          {notifications.map((n) => (
            <div key={n._id} className="card p-4">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="font-semibold text-sm text-gray-900">{n.title}</p>
                <span className="text-[10px] text-gray-400 capitalize">{n.type}</span>
              </div>
              <p className="text-sm text-gray-500">{n.body}</p>
              <p className="text-xs text-gray-400 mt-1">
                {n.user?.name} ({n.user?.role}) · {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
