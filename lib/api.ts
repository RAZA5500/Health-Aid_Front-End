import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const DEV_API_URL = "http://localhost:2000/api";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production" ? "" : DEV_API_URL);

/** Socket.io server origin — derived from API URL unless overridden. */
export const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  (API_URL ? API_URL.replace(/\/api\/?$/, "") : "");

export const AUTH_SESSION_EXPIRED_EVENT = "auth:session-expired";

const api = axios.create({ baseURL: API_URL, withCredentials: true });

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else if (token) resolve(token);
  });
  failedQueue = [];
}

function shouldSkipRefresh(url?: string) {
  if (!url) return true;
  return (
    url.includes("/auth/refresh") ||
    url.includes("/users/login") ||
    url.includes("/users/signup") ||
    url.includes("/users/auth/")
  );
}

function clearStoredTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
}

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      shouldSkipRefresh(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await api.post("/auth/refresh");
      const newAccessToken = (data.accessToken || data.token) as string;

      if (typeof window !== "undefined") {
        localStorage.setItem("token", newAccessToken);
      }

      processQueue(null, newAccessToken);
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearStoredTokens();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;

export const authApi = {
  signup: (data: Record<string, unknown>) => api.post("/users/signup", data),
  login: (data: { email: string; password: string }) => api.post("/users/login", data),
  refresh: () => api.post("/auth/refresh"),
  logout: () => api.post("/auth/logout"),
  googleAuth: (data: { credential: string }) => api.post("/users/auth/google", data),
  appleAuth: (data: { idToken: string; name?: { firstName?: string; lastName?: string } | string }) =>
    api.post("/users/auth/apple", data),
  oauthStatus: () => api.get("/users/auth/status"),
};

export const dashboardApi = {
  get: () => api.get("/dashboard"),
  updateProfile: (data: Record<string, unknown>) => api.patch("/dashboard/profile", data),
  getCareTeam: () => api.get("/dashboard/care-team"),
};

export const appointmentsApi = {
  getAll: (status?: string) => api.get("/appointments", { params: { status } }),
  create: (data: Record<string, unknown>) => api.post("/appointments", data),
  delete: (id: string) => api.delete(`/appointments/${id}`),
};

export const medicationsApi = {
  getAll: () => api.get("/medications"),
  create: (data: Record<string, unknown>) => api.post("/medications", data),
  toggle: (id: string) => api.patch(`/medications/${id}/toggle`),
  delete: (id: string) => api.delete(`/medications/${id}`),
};

export const kicksApi = {
  getAll: () => api.get("/kicks"),
  create: (data: { kickCount: number; durationSeconds: number; notes?: string }) =>
    api.post("/kicks", data),
};

export const notificationsApi = {
  getAll: (params?: { limit?: number; page?: number }) => api.get("/notifications", { params }),
  getUnreadCount: () => api.get("/notifications/unread-count"),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch("/notifications/read-all"),
  delete: (id: string) => api.delete(`/notifications/${id}`),
  deleteAll: () => api.delete("/notifications/all"),
};

export const messagesApi = {
  getConversations: (search?: string) =>
    api.get("/messages/conversations", { params: search ? { search } : undefined }),
  getMessages: (conversationId: string) => api.get(`/messages/conversations/${conversationId}`),
  send: (data: {
    content: string;
    conversationId?: string;
    recipientId?: string;
    type?: string;
    replyTo?: string;
  }) => api.post("/messages", data),
  startConversation: (data: { patientId?: string; providerId?: string }) =>
    api.post("/messages/conversations", data),
  searchStaff: (params?: { search?: string; category?: string }) =>
    api.get("/messages/staff", { params }),
  createMessageRequest: (receiverId: string, note?: string) =>
    api.post("/messages/requests", { receiverId, note }),
  getMessageRequests: (status?: string) =>
    api.get("/messages/requests", { params: status ? { status } : undefined }),
  updateMessageRequest: (id: string, action: "accept" | "decline" | "cancel") =>
    api.patch(`/messages/requests/${id}`, { action }),
  startGeneralHelp: (message?: string) => api.post("/messages/general-help", { message }),
  updateAvailability: (data: { availability?: string; online?: boolean }) =>
    api.patch("/messages/availability", data),
  sendQuickAction: (conversationId: string, action: string) =>
    api.post("/messages/quick-action", { conversationId, action }),
  deleteMessage: (messageId: string, mode: "me" | "everyone") =>
    api.delete(`/messages/${messageId}`, { data: { mode } }),
  deleteConversation: (conversationId: string) =>
    api.delete(`/messages/conversations/${conversationId}`),
};

export const consultationsApi = {
  getAll: () => api.get("/consultations"),
  getUpcoming: () => api.get("/consultations/upcoming"),
  getDoctors: () => api.get("/consultations/doctors"),
  getOne: (id: string) => api.get(`/consultations/${id}`),
  request: (data: { doctorId?: string; reason?: string; scheduledAt?: string }) =>
    api.post("/consultations", data),
  update: (id: string, action: string, data?: Record<string, unknown>) =>
    api.patch(`/consultations/${id}`, { action, ...data }),
  setPreferredDoctor: (doctorId: string) =>
    api.post("/consultations/preferred-doctor", { doctorId }),
};

export const doctorApi = {
  getDashboard: () => api.get("/doctor/dashboard"),
  getPatients: () => api.get("/doctor/patients"),
  getPatient: (patientId: string) => api.get(`/doctor/patients/${patientId}`),
  addConsultationNote: (data: Record<string, unknown>) => api.post("/doctor/consultation-notes", data),
  addConsultation: (data: Record<string, unknown>) => api.post("/doctor/consultation-notes", data),
};

export const nurseApi = {
  getDashboard: () => api.get("/nurse/dashboard"),
  getPatients: () => api.get("/nurse/patients"),
  getMonitoring: (patientId: string) => api.get(`/nurse/patients/${patientId}/monitoring`),
  getPatient: (patientId: string) => api.get(`/nurse/patients/${patientId}/monitoring`),
  addHealthRecord: (data: Record<string, unknown>) => api.post("/nurse/health-records", data),
  addNurseNote: (data: Record<string, unknown>) => api.post("/nurse/nurse-notes", data),
  addNote: (data: Record<string, unknown>) => api.post("/nurse/nurse-notes", data),
};

export const emergencyApi = {
  trigger: () => api.post("/emergency/trigger"),
  getPending: () => api.get("/emergency/pending"),
  markSeen: (notificationId: string) => api.post("/emergency/seen", { notificationId }),
  accept: (patientId: string, notificationId?: string) =>
    api.post("/emergency/accept", { patientId, notificationId }),
};

export const staffApi = {
  getDutyStatus: () => api.get("/staff/duty-status"),
  clockIn: () => api.post("/staff/clock-in"),
  clockOut: () => api.post("/staff/clock-out"),
  getOnDutyDoctors: () => api.get("/staff/on-duty-doctors"),
  getDoctorSlots: (doctorId: string, date: string) =>
    api.get("/staff/doctor-slots", { params: { doctorId, date } }),
};

export const healthRecordsApi = {
  getAll: (patientId?: string) =>
    api.get("/health-records", { params: patientId ? { patientId } : undefined }),
  create: (data: Record<string, unknown>) => api.post("/health-records", data),
};

export const adminApi = {
  getStats: () => api.get("/admin/stats"),
  getUsers: (params?: { role?: string; search?: string; isActive?: string }) =>
    api.get("/admin/users", { params }),
  toggleUserStatus: (id: string) => api.patch(`/admin/users/${id}/toggle-status`),
  createUser: (data: Record<string, unknown>) => api.post("/admin/users", data),
  getAssignments: () => api.get("/admin/assignments"),
  createAssignment: (data: { providerId: string; patientId: string; providerRole: string }) =>
    api.post("/admin/assignments", data),
  removeAssignment: (id: string) => api.delete(`/admin/assignments/${id}`),
  getAppointments: () => api.get("/admin/appointments"),
  createAppointment: (data: Record<string, unknown>) => api.post("/admin/appointments", data),
  getNotifications: () => api.get("/admin/notifications"),
};
