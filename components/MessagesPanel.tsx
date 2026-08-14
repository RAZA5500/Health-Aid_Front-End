"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CornerUpLeft, Loader2, MessageSquarePlus, Search, Send, Trash2, Video, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { consultationsApi, messagesApi, SOCKET_URL } from "@/lib/api";
import type { ChatMessage, Conversation, StaffMember } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import ConfirmDialog from "@/components/ConfirmDialog";
import { dispatchNotificationsChanged } from "@/hooks/useNotificationSync";

type StaffCategory = "doctors" | "nurses" | "reception";

const DELETE_FOR_EVERYONE_MS = 60 * 60 * 1000;
const LONG_PRESS_MS = 500;

const PATIENT_SYSTEM_TITLES = new Set(["24/7 General Help", "Video Consultation"]);

function formatDoctorName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "Care Provider";
  if (/^dr\.?\s/i.test(trimmed)) return trimmed;
  return `Dr. ${trimmed}`;
}

function isStaffRole(role?: string) {
  return role === "doctor" || role === "nurse" || role === "receptionist";
}

function getDisplayName(conv: Conversation, userRole?: string) {
  if (userRole === "patient") {
    if (conv.title && PATIENT_SYSTEM_TITLES.has(conv.title)) return conv.title;
    const provider = conv.provider;
    if (!provider?.name) return "Care Provider";
    if (provider.role === "doctor" || conv.type === "doctor") {
      return formatDoctorName(provider.name);
    }
    return provider.name;
  }

  if (isStaffRole(userRole)) {
    return conv.patient?.name || "Patient";
  }

  return conv.patient?.name || conv.provider?.name || conv.title || "Conversation";
}

function getSubtitle(conv: Conversation, userRole?: string) {
  if (userRole === "patient") {
    return (
      conv.provider?.specialization ||
      conv.provider?.specialty ||
      conv.provider?.department ||
      conv.provider?.role ||
      ""
    );
  }
  return conv.patient?.role || "Patient";
}

function getAvatarColor(name: string) {
  const colors = [
    "bg-primary/15 text-primary",
    "bg-secondary/15 text-secondary",
    "bg-green-100 text-green-700",
    "bg-purple-100 text-purple-700",
  ];
  return colors[name.charCodeAt(0) % colors.length];
}

function availabilityIndicator(staff?: { availability?: string; online?: boolean }) {
  const status = staff?.availability || (staff?.online ? "Available" : "Offline");
  if (status === "Available" || status === "Available for Video") {
    return { dot: "🟢", label: status === "Available for Video" ? "Available for Video" : "Available" };
  }
  if (status === "Busy") return { dot: "🟡", label: "Busy" };
  return { dot: "⚪", label: "Offline" };
}

function isSystemMessage(msg: ChatMessage) {
  return ["system", "consultation", "request_accepted", "request_declined", "quick_action"].includes(
    msg.type || "",
  );
}

function canDeleteForEveryone(msg: ChatMessage, currentUserId?: string) {
  if (!currentUserId || msg.sender?._id !== currentUserId) return false;
  if (isSystemMessage(msg)) return false;
  if (msg.deletedForEveryone) return false;
  return Date.now() - new Date(msg.createdAt).getTime() <= DELETE_FOR_EVERYONE_MS;
}

function truncateReply(text: string, max = 80) {
  const trimmed = text.trim();
  return trimmed.length > max ? `${trimmed.slice(0, max)}…` : trimmed;
}

interface MessagesPanelProps {
  basePath?: string;
  userRole?: string;
  userId?: string;
  initialConversationId?: string;
}

function getApiErrorMessage(err: unknown, fallback: string) {
  const axiosErr = err as {
    response?: { status?: number; data?: { message?: string } };
    code?: string;
  };
  if (!axiosErr.response && axiosErr.code === "ERR_NETWORK") {
    return "Cannot reach server — check that the backend is running";
  }
  return axiosErr.response?.data?.message || fallback;
}

export default function MessagesPanel({
  userRole = "patient",
  userId,
  initialConversationId,
}: MessagesPanelProps) {
  const { token } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [canSend, setCanSend] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");
  const [staffResults, setStaffResults] = useState<StaffMember[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [sending, setSending] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalCategory, setModalCategory] = useState<StaffCategory>("doctors");
  const [modalStaff, setModalStaff] = useState<StaffMember[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [startingHelp, setStartingHelp] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [deleteMenuId, setDeleteMenuId] = useState<string | null>(null);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [showDeleteChatConfirm, setShowDeleteChatConfirm] = useState(false);
  const [deletingChat, setDeletingChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const deleteMenuRef = useRef<HTMLDivElement | null>(null);

  const fetchConversations = useCallback(async (query?: string) => {
    try {
      const res = await messagesApi.getConversations(query);
      const list = (res.data.conversations ?? []) as Array<Conversation | null | undefined>;
      setConversations(list.filter((c): c is Conversation => Boolean(c?._id)));
    } catch (err) {
      console.error("Failed to load conversations:", err);
      toast.error(getApiErrorMessage(err, "Failed to load conversations"));
      setConversations([]);
    } finally {
      setLoadingList(false);
    }
  }, []);

  const fetchStaffSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setStaffResults([]);
      return;
    }
    try {
      const res = await messagesApi.searchStaff({ search: query });
      setStaffResults(res.data.staff || []);
    } catch {
      setStaffResults([]);
    }
  }, []);

  const fetchMessages = useCallback(async (id: string) => {
    setLoadingChat(true);
    try {
      const res = await messagesApi.getMessages(id);
      const raw = (res.data.messages || []).filter(Boolean) as ChatMessage[];
      const unique = raw.filter(
        (msg, index, arr) => msg?._id && arr.findIndex((m) => m?._id === msg._id) === index,
      );
      setMessages(unique);
      setSelectedConv(res.data.conversation);
      setCanSend(res.data.canSend !== false);
      setConversations((prev) =>
        prev
          .filter((c): c is Conversation => Boolean(c?._id))
          .map((c) => (c._id === id ? { ...c, unreadCount: 0 } : c)),
      );
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        toast.error("This conversation is no longer available");
        setSelectedId(null);
        setSelectedConv(null);
        setMessages([]);
        if (typeof window !== "undefined") {
          window.history.replaceState({}, "", "/messages");
        }
        fetchConversations();
      } else {
        toast.error(getApiErrorMessage(err, "Failed to load messages"));
      }
    } finally {
      setLoadingChat(false);
    }
  }, [fetchConversations]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (initialConversationId) {
      setSelectedId(initialConversationId);
    }
  }, [initialConversationId]);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      fetchConversations(search || undefined);
      fetchStaffSearch(search);
    }, 300);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [search, fetchConversations, fetchStaffSearch]);

  useEffect(() => {
    if (selectedId) {
      setReplyingTo(null);
      setDeleteMenuId(null);
      setActiveMessageId(null);
      fetchMessages(selectedId);
    }
  }, [selectedId, fetchMessages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!token || !selectedId) return;
    const socket = io(SOCKET_URL, { auth: { token } });
    socketRef.current = socket;
    socket.emit("join_conversation", selectedId);
    socket.on("new_message", (msg: ChatMessage) => {
      if (!msg?._id) return;
      setMessages((prev) => (prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]));
    });
    socket.on(
      "message_deleted",
      (payload: {
        messageId: string;
        mode: "me" | "everyone";
        userId?: string;
        message?: ChatMessage;
      }) => {
        if (payload.mode === "me" && payload.userId === userId) {
          setMessages((prev) => prev.filter((m) => m._id !== payload.messageId));
          return;
        }
        if (payload.mode === "everyone" && payload.message) {
          setMessages((prev) =>
            prev.map((m) => (m._id === payload.messageId ? payload.message! : m)),
          );
        }
      },
    );
    socket.on("message_request_updated", () => {
      fetchConversations(search || undefined);
    });
    return () => {
      socket.emit("leave_conversation", selectedId);
      socket.disconnect();
    };
  }, [token, selectedId, fetchConversations, search, userId]);

  useEffect(() => {
    if (!token) return;
    const socket = io(SOCKET_URL, { auth: { token } });
    socket.on("conversation_deleted", (payload: { conversationId: string; userId?: string }) => {
      if (payload.userId === userId) {
        setConversations((prev) => prev.filter((c) => c._id !== payload.conversationId));
        if (selectedId === payload.conversationId) {
          setSelectedId(null);
          setSelectedConv(null);
          setMessages([]);
        }
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [token, userId, selectedId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (deleteMenuRef.current && !deleteMenuRef.current.contains(e.target as Node)) {
        setDeleteMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadModalStaff = async (category: StaffCategory) => {
    setModalLoading(true);
    try {
      const res = await messagesApi.searchStaff({ category });
      setModalStaff(res.data.staff || []);
    } catch (err) {
      console.error("Failed to load staff:", err);
      toast.error(getApiErrorMessage(err, "Failed to load staff"));
      setModalStaff([]);
    } finally {
      setModalLoading(false);
    }
  };

  const openModal = () => {
    setShowModal(true);
    setModalCategory("doctors");
    loadModalStaff("doctors");
  };

  const handleSelectStaff = async (staff: StaffMember) => {
    setRequestingId(staff._id);
    try {
      if (staff.role === "doctor" && userRole === "patient") {
        const res = await messagesApi.createMessageRequest(staff._id);
        const conv = res.data.conversation;
        toast.success(
          res.data.alreadyAccepted
            ? "Conversation already active"
            : "Message request sent — waiting for doctor approval",
        );
        setShowModal(false);
        await fetchConversations();
        setSelectedId(conv._id);
      } else {
        const res = await messagesApi.startConversation({ providerId: staff._id });
        toast.success("Conversation started");
        setShowModal(false);
        await fetchConversations();
        setSelectedId(res.data.conversation._id);
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Could not start conversation");
    } finally {
      setRequestingId(null);
    }
  };

  const handleGeneralHelp = async () => {
    setStartingHelp(true);
    try {
      const res = await messagesApi.startGeneralHelp();
      toast.success(`Connected with ${res.data.provider.name}`);
      await fetchConversations();
      setSelectedId(res.data.conversation._id);
    } catch (err: unknown) {
      const data = (err as { response?: { status?: number; data?: { message?: string; noStaffAvailable?: boolean } } })
        ?.response?.data;
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (data?.noStaffAvailable) {
        toast.error(data.message || "All specialists currently assisting other patients.");
      } else if (status === 404) {
        toast.error("Support API unavailable — restart the backend server on port 2000");
      } else {
        toast.error(data?.message || getApiErrorMessage(err, "Could not connect to support"));
      }
    } finally {
      setStartingHelp(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedId || !canSend) return;
    setSending(true);
    try {
      const res = await messagesApi.send({
        content: newMessage,
        conversationId: selectedId,
        replyTo: replyingTo?._id,
      });
      setMessages((prev) => {
        if (prev.some((m) => m._id === res.data.message._id)) return prev;
        return [...prev, res.data.message];
      });
      setNewMessage("");
      setReplyingTo(null);
      fetchConversations(search || undefined);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId: string, mode: "me" | "everyone") => {
    setDeleteMenuId(null);
    setActiveMessageId(null);
    try {
      const res = await messagesApi.deleteMessage(messageId, mode);
      if (mode === "me") {
        setMessages((prev) => prev.filter((m) => m._id !== messageId));
      } else if (res.data.message) {
        setMessages((prev) => prev.map((m) => (m._id === messageId ? res.data.message : m)));
      }
      toast.success(mode === "me" ? "Message deleted for you" : "Message deleted for everyone");
      dispatchNotificationsChanged();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Failed to delete message");
    }
  };

  const handleDeleteChat = async () => {
    if (!selectedId) return;
    setDeletingChat(true);
    try {
      await messagesApi.deleteConversation(selectedId);
      setConversations((prev) => prev.filter((c) => c._id !== selectedId));
      setSelectedId(null);
      setSelectedConv(null);
      setMessages([]);
      setShowDeleteChatConfirm(false);
      toast.success("Chat deleted");
      dispatchNotificationsChanged();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Failed to delete chat");
    } finally {
      setDeletingChat(false);
    }
  };

  const handleMessageTouchStart = (messageId: string) => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    longPressTimer.current = setTimeout(() => {
      setActiveMessageId(messageId);
    }, LONG_PRESS_MS);
  };

  const handleMessageTouchEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const handleStartVideo = async () => {
    if (!selectedConv?.provider?._id) return;
    try {
      const res = await consultationsApi.request({
        doctorId: selectedConv.provider._id,
        reason: "Video consultation from chat",
      });
      toast.success("Video consultation requested");
      await fetchMessages(selectedId!);
      if (res.data.consultation?.conversation) {
        toast.info("Check Telemedicine page to join when ready");
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Could not start video consultation");
    }
  };

  const videoEligible =
    userRole === "patient" &&
    selectedConv?.type === "doctor" &&
    selectedConv?.status === "active" &&
    (selectedConv?.provider?.availability === "Available for Video" ||
      selectedConv?.provider?.availability === "Available");

  const filteredConversations = conversations;
  const isSearching = search.trim().length > 0;
  const showStaffInSearch = isSearching;
  const hasResults = filteredConversations.length > 0 || staffResults.length > 0;

  const chatLockedReason =
    selectedConv?.status === "declined"
      ? "Your message request was declined"
      : selectedConv?.status === "pending"
        ? "Waiting for doctor approval"
        : null;

  const showChat = selectedId !== null;
  const selected = selectedConv || conversations.find((c) => c._id === selectedId);

  return (
    <div className="flex flex-col lg:flex-row gap-0 lg:gap-4 lg:min-h-[calc(100vh-12rem)]">
      <div
        className={`lg:w-80 xl:w-96 shrink-0 flex flex-col ${
          showChat ? "hidden lg:flex" : "flex"
        }`}
      >
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-gray-400"
              aria-hidden
            />
            <input
              className="input-field input-field-icon"
              placeholder="Search messages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {userRole === "patient" && (
            <button
              type="button"
              onClick={openModal}
              className="btn-primary px-3 shrink-0 flex items-center gap-1"
              title="New Message"
            >
              <MessageSquarePlus size={18} />
            </button>
          )}
        </div>

        {userRole === "patient" && (
          <button
            type="button"
            onClick={handleGeneralHelp}
            disabled={startingHelp}
            className="card p-3 mb-3 text-left text-sm font-medium text-primary hover:shadow-md transition-shadow disabled:opacity-60"
          >
            {startingHelp ? "Connecting..." : "24/7 General Help"}
          </button>
        )}

        <div className="space-y-2 flex-1 overflow-y-auto">
          {loadingList ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-primary" size={24} />
            </div>
          ) : !hasResults ? (
            <div className="card p-6 text-center text-sm text-gray-400">
              {isSearching
                ? "No conversations or healthcare staff found."
                : "No conversations yet. Tap + to message staff or use 24/7 General Help above."}
            </div>
          ) : (
            <>
              {filteredConversations.map((conv) => {
                const name = getDisplayName(conv, userRole);
                const active = selectedId === conv._id;
                const avail = userRole === "patient" ? availabilityIndicator(conv.provider) : null;
                return (
                  <div
                    key={conv._id}
                    className={`group relative card p-4 flex items-center gap-3 w-full text-left border-l-4 transition-all duration-200 ${
                      active
                        ? "bg-primary/10 border-l-primary shadow-none"
                        : "border-l-transparent hover:shadow-md"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedId(conv._id)}
                      className="flex items-center gap-3 flex-1 min-w-0 text-left"
                    >
                      <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center font-bold shrink-0 ${getAvatarColor(name)}`}
                      >
                        {name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline gap-2">
                          <p className="font-semibold text-sm text-gray-900 truncate">{name}</p>
                          {conv.lastMessageAt && (
                            <span className="text-xs text-gray-400 shrink-0">
                              {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: false })}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 truncate">
                          {avail ? `${avail.dot} ${avail.label}` : getSubtitle(conv, userRole)}
                          {conv.status === "pending" && " · Pending approval"}
                          {conv.status === "declined" && " · Declined"}
                        </p>
                        <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                      </div>
                      {(conv.unreadCount ?? 0) > 0 && (
                        <span className="w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      title="Delete chat"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedId(conv._id);
                        setShowDeleteChatConfirm(true);
                      }}
                      className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-opacity shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}

              {showStaffInSearch &&
                staffResults
                  .filter((s) => !filteredConversations.some((c) => c.provider?._id === s._id))
                  .map((staff) => {
                    const avail = availabilityIndicator(staff);
                    return (
                      <button
                        key={`staff-${staff._id}`}
                        type="button"
                        onClick={() => handleSelectStaff(staff)}
                        disabled={requestingId === staff._id}
                        className="card p-4 flex items-center gap-3 w-full text-left hover:shadow-md border border-dashed border-primary/20"
                      >
                        <div
                          className={`w-11 h-11 rounded-full flex items-center justify-center font-bold shrink-0 ${getAvatarColor(staff.name)}`}
                        >
                          {staff.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900 truncate">{staff.name}</p>
                          <p className="text-xs text-gray-400">
                            {avail.dot} {avail.label} ·{" "}
                            {staff.specialization || staff.specialty || staff.department || staff.role}
                          </p>
                          <p className="text-xs text-primary">Tap to {staff.role === "doctor" ? "request message" : "start chat"}</p>
                        </div>
                      </button>
                    );
                  })}
            </>
          )}
        </div>
      </div>

      <div
        className={`flex-1 flex flex-col card min-h-[400px] lg:min-h-0 ${
          showChat ? "flex" : "hidden lg:flex"
        }`}
      >
        {selected ? (
          <>
            <div className="p-4 border-b border-gray-100 flex items-center gap-3 group">
              <button
                type="button"
                className="lg:hidden text-primary text-sm font-medium"
                onClick={() => {
                  setSelectedId(null);
                  setSelectedConv(null);
                }}
              >
                ← Back
              </button>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${getAvatarColor(getDisplayName(selected, userRole))}`}
              >
                {getDisplayName(selected, userRole)[0]}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{getDisplayName(selected, userRole)}</p>
                <p className="text-xs text-gray-400 capitalize">{getSubtitle(selected, userRole)}</p>
              </div>
              <button
                type="button"
                title="Delete chat"
                onClick={() => setShowDeleteChatConfirm(true)}
                className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-opacity"
              >
                <Trash2 size={18} />
              </button>
              {videoEligible && (
                <button
                  type="button"
                  onClick={handleStartVideo}
                  className="btn-blue px-3 py-2 text-xs flex items-center gap-1"
                >
                  <Video size={14} /> Start Video Consultation
                </button>
              )}
            </div>

            {chatLockedReason && (
              <div className="px-4 py-2 bg-amber-50 text-amber-800 text-sm text-center border-b border-amber-100">
                {chatLockedReason}
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingChat ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="animate-spin text-primary" size={28} />
                </div>
              ) : (
                messages.filter(Boolean).map((msg, index) => {
                  const isOwn = msg.sender?._id === userId;
                  const isSystem = isSystemMessage(msg);
                  const showActions =
                    !isSystem && (activeMessageId === msg._id || deleteMenuId === msg._id);
                  const showDeleteEveryone = canDeleteForEveryone(msg, userId);

                  if (isSystem) {
                    return (
                      <div key={msg._id || `msg-${index}`} className="flex justify-center">
                        <p className="text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full max-w-[90%] text-center">
                          {msg.content}
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg._id || `msg-${index}`}
                      className={`group flex items-end gap-1.5 ${isOwn ? "justify-end" : "justify-start"}`}
                      onTouchStart={() => handleMessageTouchStart(msg._id)}
                      onTouchEnd={handleMessageTouchEnd}
                      onTouchMove={handleMessageTouchEnd}
                    >
                      {!isOwn && (
                        <div
                          className={`flex items-center gap-0.5 shrink-0 transition-opacity duration-150 ${
                            showActions
                              ? "opacity-100"
                              : "opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto"
                          }`}
                        >
                          <button
                            type="button"
                            title="Reply"
                            onClick={() => {
                              setReplyingTo(msg);
                              setActiveMessageId(null);
                            }}
                            className="p-1.5 rounded-full text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors"
                          >
                            <CornerUpLeft size={15} />
                          </button>
                          <div className="relative" ref={deleteMenuId === msg._id ? deleteMenuRef : undefined}>
                            <button
                              type="button"
                              title="Delete"
                              onClick={() =>
                                setDeleteMenuId((prev) => (prev === msg._id ? null : msg._id))
                              }
                              className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                            {deleteMenuId === msg._id && (
                              <div className="absolute bottom-full left-0 mb-1 z-20 min-w-[160px] bg-white rounded-xl shadow-lg border border-gray-100 py-1 text-xs">
                                <button
                                  type="button"
                                  className="w-full px-3 py-2 text-left hover:bg-gray-50 text-gray-700"
                                  onClick={() => handleDeleteMessage(msg._id, "me")}
                                >
                                  Delete for me
                                </button>
                                {showDeleteEveryone && (
                                  <button
                                    type="button"
                                    className="w-full px-3 py-2 text-left hover:bg-red-50 text-red-600"
                                    onClick={() => handleDeleteMessage(msg._id, "everyone")}
                                  >
                                    Delete for everyone
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div
                        className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                          msg.deletedForEveryone
                            ? "bg-gray-50 text-gray-400 italic border border-gray-100"
                            : isOwn
                              ? "bg-primary text-white rounded-br-md"
                              : "bg-gray-100 text-gray-800 rounded-bl-md"
                        }`}
                      >
                        {msg.replyTo && !msg.deletedForEveryone && (
                          <div
                            className={`mb-2 pl-2 border-l-2 text-xs ${
                              isOwn ? "border-white/50 text-white/80" : "border-primary text-gray-500"
                            }`}
                          >
                            <p className="font-semibold truncate">
                              {msg.replyTo.sender?.name || "User"}
                            </p>
                            <p className="truncate opacity-90">
                              {msg.replyTo.deletedForEveryone
                                ? "Message deleted"
                                : truncateReply(msg.replyTo.content)}
                            </p>
                          </div>
                        )}
                        {msg.content}
                        <p
                          className={`text-[10px] mt-1 ${
                            msg.deletedForEveryone
                              ? "text-gray-400"
                              : isOwn
                                ? "text-white/70"
                                : "text-gray-400"
                          }`}
                        >
                          {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                        </p>
                      </div>

                      {isOwn && (
                        <div
                          className={`flex items-center gap-0.5 shrink-0 transition-opacity duration-150 ${
                            showActions
                              ? "opacity-100"
                              : "opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto"
                          }`}
                        >
                          <button
                            type="button"
                            title="Reply"
                            onClick={() => {
                              setReplyingTo(msg);
                              setActiveMessageId(null);
                            }}
                            className="p-1.5 rounded-full text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors"
                          >
                            <CornerUpLeft size={15} />
                          </button>
                          <div className="relative" ref={deleteMenuId === msg._id ? deleteMenuRef : undefined}>
                            <button
                              type="button"
                              title="Delete"
                              onClick={() =>
                                setDeleteMenuId((prev) => (prev === msg._id ? null : msg._id))
                              }
                              className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                            {deleteMenuId === msg._id && (
                              <div className="absolute bottom-full right-0 mb-1 z-20 min-w-[160px] bg-white rounded-xl shadow-lg border border-gray-100 py-1 text-xs">
                                <button
                                  type="button"
                                  className="w-full px-3 py-2 text-left hover:bg-gray-50 text-gray-700"
                                  onClick={() => handleDeleteMessage(msg._id, "me")}
                                >
                                  Delete for me
                                </button>
                                {showDeleteEveryone && (
                                  <button
                                    type="button"
                                    className="w-full px-3 py-2 text-left hover:bg-red-50 text-red-600"
                                    onClick={() => handleDeleteMessage(msg._id, "everyone")}
                                  >
                                    Delete for everyone
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {userRole === "receptionist" && selectedId && canSend && (
              <div className="px-4 py-2 border-t border-gray-100 flex flex-wrap gap-2">
                {[
                  ["book_appointment", "Book Appointment"],
                  ["reschedule", "Reschedule"],
                  ["find_doctor", "Find Doctor"],
                  ["telemedicine_help", "Telemedicine Help"],
                  ["technical_help", "Technical Help"],
                  ["general_question", "General Question"],
                ].map(([action, label]) => (
                  <button
                    key={action}
                    type="button"
                    className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
                    onClick={async () => {
                      try {
                        await messagesApi.sendQuickAction(selectedId, action);
                        await fetchMessages(selectedId);
                      } catch {
                        toast.error("Failed to send quick action");
                      }
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleSend} className="p-4 border-t border-gray-100 flex flex-col gap-2">
              {replyingTo && (
                <div className="flex items-start gap-2 px-3 py-2 bg-primary/5 border-l-4 border-primary rounded-lg text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-primary">
                      Replying to {replyingTo.sender?.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {replyingTo.deletedForEveryone
                        ? "Message deleted"
                        : truncateReply(replyingTo.content)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReplyingTo(null)}
                    className="p-1 rounded-full hover:bg-gray-100 text-gray-400 shrink-0"
                    aria-label="Cancel reply"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <input
                  className="input-field flex-1 disabled:opacity-50"
                  placeholder={canSend ? "Type a message..." : chatLockedReason || "Chat locked"}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={!canSend}
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim() || !canSend}
                  className="btn-primary px-4 flex items-center gap-1 disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm p-8 text-center">
            Select a conversation to start messaging
          </div>
        )}
      </div>

      {showDeleteChatConfirm && (
        <ConfirmDialog
          title="Delete chat?"
          message="This will remove the conversation from your inbox. The other person will still have the chat unless they delete it too."
          confirmLabel={deletingChat ? "Deleting..." : "Delete for me"}
          cancelLabel="Cancel"
          variant="danger"
          onConfirm={handleDeleteChat}
          onCancel={() => setShowDeleteChatConfirm(false)}
        />
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="card w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Start a Conversation</h3>
              <button type="button" onClick={() => setShowModal(false)} className="p-1 rounded-full hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            <div className="flex gap-2 p-4 border-b border-gray-100">
              {(["doctors", "nurses", "reception"] as StaffCategory[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setModalCategory(cat);
                    loadModalStaff(cat);
                  }}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg capitalize ${
                    modalCategory === cat ? "bg-primary text-white" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {cat === "reception" ? "Reception" : cat}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {modalLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-primary" size={24} />
                </div>
              ) : modalStaff.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">
                  {modalCategory === "doctors"
                    ? "No doctors available. Contact admin."
                    : "No staff available in this category"}
                </p>
              ) : (
                modalStaff.map((staff) => {
                  const avail = availabilityIndicator(staff);
                  return (
                    <button
                      key={staff._id}
                      type="button"
                      disabled={requestingId === staff._id}
                      onClick={() => handleSelectStaff(staff)}
                      className="w-full card p-3 flex items-center gap-3 text-left hover:shadow-md disabled:opacity-60"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${getAvatarColor(staff.name)}`}
                      >
                        {staff.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{staff.name}</p>
                        <p className="text-xs text-gray-400">
                          {avail.dot} {avail.label} ·{" "}
                          {staff.specialization || staff.specialty || staff.department}
                        </p>
                      </div>
                      <span className="text-xs text-primary shrink-0">
                        {staff.role === "doctor" ? "Request" : "Message"}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
