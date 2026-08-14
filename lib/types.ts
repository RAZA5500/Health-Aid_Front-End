export type UserRole = "patient" | "doctor" | "nurse" | "receptionist" | "admin";
export type AvailabilityStatus = "Available" | "Busy" | "Offline" | "Available for Video";

export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role?: UserRole;
  phone?: string;
  avatar?: string;
  dueDate?: string;
  lmpDate?: string;
  emergencyContact?: string;
  bloodType?: string;
  bio?: string;
  specialization?: string;
  licenseNumber?: string;
  hospital?: string;
  yearsOfExperience?: number;
  department?: string;
  nurseLicense?: string;
  specialty?: string;
  online?: boolean;
  availability?: AvailabilityStatus;
  clockedIn?: boolean;
  clockedInAt?: string;
  shiftStart?: string;
  shiftEnd?: string;
  preferredDoctor?: string;
  isActive?: boolean;
  authProvider?: "local" | "google" | "apple";
  createdAt?: string;
}

export interface Appointment {
  _id: string;
  doctorName: string;
  specialization: string;
  date: string;
  time: string;
  notes?: string;
  status: "upcoming" | "past" | "cancelled";
  doctor?: string | { _id: string; name: string; specialization?: string };
  patient?: { _id: string; name: string; email?: string; phone?: string };
}

export interface OnDutyDoctor {
  _id: string;
  name: string;
  specialization?: string;
  specialty?: string;
  online?: boolean;
  availability?: AvailabilityStatus;
  clockedIn?: boolean;
  shiftStart?: string;
  shiftEnd?: string;
}

export interface Medication {
  _id: string;
  name: string;
  dosage: string;
  timing: string;
  reminder: boolean;
  taken: boolean;
}

export interface KickSession {
  _id: string;
  kickCount: number;
  durationSeconds: number;
  notes?: string;
  createdAt: string;
}

export interface PregnancyInfo {
  weeks: number;
  days: number;
  totalDays: number;
  progress: number;
  babySize: string;
  babyWeight: string;
  fruitComparison: string;
}

export interface Notification {
  _id: string;
  type: string;
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt: string;
  metadata?: {
    emergencyStatus?: EmergencyStatus;
    emergencyKind?: string;
    patientId?: string;
    doctorName?: string;
  };
}

export type EmergencyStatus =
  | "sent"
  | "delivered"
  | "seen"
  | "accepted"
  | "in_progress"
  | "resolved"
  | "cancelled";

export interface Conversation {
  _id: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
  providerRole?: string;
  type?: "doctor" | "nurse" | "receptionist" | "general-support";
  status?: "pending" | "active" | "locked" | "declined" | "closed";
  title?: string;
  messageRequest?: MessageRequest;
  patient?: { _id: string; name: string; avatar?: string; role?: string };
  provider?: {
    _id: string;
    name: string;
    avatar?: string;
    role?: string;
    specialization?: string;
    specialty?: string;
    department?: string;
    availability?: AvailabilityStatus;
    online?: boolean;
  };
}

export interface MessageRequest {
  _id: string;
  sender: { _id: string; name: string; avatar?: string; email?: string };
  receiver: { _id: string; name: string; avatar?: string; specialization?: string; specialty?: string };
  status: "pending" | "accepted" | "declined" | "cancelled";
  conversation?: string;
  createdAt?: string;
}

export interface ChatMessage {
  _id: string;
  content: string;
  createdAt: string;
  type?: "text" | "system" | "consultation" | "request_accepted" | "request_declined" | "quick_action";
  sender: { _id: string; name: string; avatar?: string; role?: string };
  replyTo?: {
    _id: string;
    content: string;
    deletedForEveryone?: boolean;
    sender?: { _id: string; name: string; avatar?: string; role?: string };
  };
  deletedForEveryone?: boolean;
  deletedAt?: string;
}

export interface StaffMember {
  _id: string;
  name: string;
  avatar?: string;
  role: string;
  specialization?: string;
  specialty?: string;
  department?: string;
  availability?: AvailabilityStatus;
  online?: boolean;
}

export interface VideoConsultation {
  _id: string;
  patient: { _id: string; name: string; avatar?: string };
  doctor: {
    _id: string;
    name: string;
    avatar?: string;
    specialization?: string;
    specialty?: string;
    availability?: AvailabilityStatus;
    online?: boolean;
    hospital?: string;
  };
  status:
    | "requested"
    | "pending"
    | "accepted"
    | "scheduled"
    | "waiting"
    | "active"
    | "completed"
    | "cancelled";
  scheduledAt?: string;
  startedAt?: string;
  endedAt?: string;
  reason?: string;
  conversation?: string;
  createdAt?: string;
}

export interface SupportTicket {
  _id: string;
  subject: string;
  description?: string;
  status: "open" | "assigned" | "resolved";
}

export interface DashboardStats {
  assignedPatients?: number;
  upcomingAppointments?: number;
  unreadMessages?: number;
  unreadNotifications?: number;
  pendingMessageRequests?: number;
  totalUsers?: number;
  patients?: number;
  doctors?: number;
  nurses?: number;
  admins?: number;
  activeUsers?: number;
  inactiveUsers?: number;
  appointments?: number;
  notifications?: number;
}

export interface Assignment {
  _id: string;
  providerRole: string;
  isActive: boolean;
  provider?: { _id: string; name: string; email: string; role: string; specialization?: string; department?: string };
  patient?: { _id: string; name: string; email: string; phone?: string };
}

export interface ConsultationNote {
  _id: string;
  notes: string;
  diagnosis?: string;
  prescription?: string;
  followUpDate?: string;
  createdAt: string;
}

export interface HealthRecord {
  _id: string;
  recordType: string;
  title: string;
  description?: string;
  value?: string;
  unit?: string;
  createdAt: string;
  recordedBy?: { name: string; role: string };
}

export function getRoleDashboardPath(role?: UserRole): string {
  switch (role) {
    case "doctor":
      return "/doctor/dashboard";
    case "nurse":
      return "/nurse/dashboard";
    case "receptionist":
      return "/nurse/messages";
    case "admin":
      return "/admin/dashboard";
    default:
      return "/dashboard";
  }
}
