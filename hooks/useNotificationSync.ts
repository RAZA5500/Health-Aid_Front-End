"use client";

import { useEffect } from "react";
import { io } from "socket.io-client";
import { SOCKET_URL } from "@/lib/api";

export function useNotificationSync(onUpdate: () => void) {
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;

    const socket = io(SOCKET_URL, { auth: { token } });
    socket.on("notifications_updated", onUpdate);

    const handleLocalUpdate = () => onUpdate();
    window.addEventListener("notifications-changed", handleLocalUpdate);

    return () => {
      socket.off("notifications_updated", onUpdate);
      socket.disconnect();
      window.removeEventListener("notifications-changed", handleLocalUpdate);
    };
  }, [onUpdate]);
}

export function dispatchNotificationsChanged() {
  window.dispatchEvent(new Event("notifications-changed"));
}
