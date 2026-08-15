"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import AppHeader from "@/components/AppHeader";
import ConfirmDialog from "@/components/ConfirmDialog";
import { notificationsApi } from "@/lib/api";
import type { Notification } from "@/lib/types";
import { useNotificationSync } from "@/hooks/useNotificationSync";

function getApiErrorMessage(err: unknown, fallback: string) {
  const data = (err as { response?: { data?: { message?: string }; status?: number } })?.response;
  const status = data?.status;
  const msg = data?.data?.message;
  return msg ? `${msg}${status ? ` (${status})` : ""}` : fallback;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationsApi.getAll({ limit: 50 });
      setNotifications(res.data.notifications || []);
    } catch {
      /* API may be unavailable */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useNotificationSync(fetchNotifications);

  const handleMarkAll = async () => {
    setActionLoading("read-all");
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to mark all as read"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    setActionLoading(id);
    try {
      await notificationsApi.delete(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to delete notification"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteAll = async () => {
    setActionLoading("delete-all");
    try {
      await notificationsApi.deleteAll();
      setNotifications([]);
      setShowDeleteAllConfirm(false);
      toast.success("All notifications deleted");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to delete all notifications"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpen = async (n: Notification) => {
    if (!n.read) {
      try {
        await notificationsApi.markAsRead(n._id);
        setNotifications((prev) => prev.map((item) => (item._id === n._id ? { ...item, read: true } : item)));
      } catch (err) {
        toast.error(getApiErrorMessage(err, "Failed to mark notification as read"));
      }
    }
  };

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div className="page-content">
      <AppHeader greeting="Notifications" subtitle="Stay updated" />

      {!loading && notifications.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {hasUnread && (
            <button
              type="button"
              onClick={handleMarkAll}
              disabled={actionLoading === "read-all"}
              className="inline-flex items-center gap-1.5 text-sm text-primary font-medium px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-colors disabled:opacity-50"
            >
              <CheckCheck size={16} />
              Read all
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowDeleteAllConfirm(true)}
            disabled={actionLoading === "delete-all"}
            className="inline-flex items-center gap-1.5 text-sm text-red-500 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <Trash2 size={16} />
            Delete all
          </button>
        </div>
      )}

      {showDeleteAllConfirm && (
        <ConfirmDialog
          title="Delete all notifications?"
          message="This will permanently remove all notifications. This action cannot be undone."
          confirmLabel={actionLoading === "delete-all" ? "Deleting..." : "Delete all"}
          cancelLabel="Cancel"
          variant="danger"
          onConfirm={handleDeleteAll}
          onCancel={() => setShowDeleteAllConfirm(false)}
        />
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-400">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="card p-8 text-center text-gray-400">
          <Bell size={40} className="mx-auto mb-3 opacity-40" />
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 lg:grid-cols-1 lg:space-y-2">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`card p-4 flex items-start gap-3 hover:shadow-md transition-shadow ${!n.read ? "border-l-4 border-l-primary" : ""}`}
            >
              <Link
                href={n.link || "#"}
                onClick={() => handleOpen(n)}
                className="flex-1 min-w-0 block"
              >
                <p className="font-semibold text-sm text-gray-900">{n.title}</p>
                <p className="text-sm text-gray-500 mt-0.5">{n.body}</p>
                {"metadata" in n && n.metadata?.emergencyStatus && (
                  <p className="text-xs text-primary font-medium mt-1 capitalize">
                    Status: {String(n.metadata.emergencyStatus).replace(/_/g, " ")}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </p>
              </Link>
              <button
                type="button"
                aria-label="Delete notification"
                onClick={() => handleDelete(n._id)}
                disabled={actionLoading === n._id}
                className="text-gray-300 hover:text-red-400 touch-target rounded-lg shrink-0 disabled:opacity-50"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
