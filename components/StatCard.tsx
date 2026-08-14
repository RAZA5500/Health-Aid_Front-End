"use client";

import { Users, Calendar, MessageCircle, Bell } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number;
  icon: typeof Users;
  color?: string;
}

export default function StatCard({ label, value, icon: Icon, color = "bg-primary/15 text-primary" }: StatCardProps) {
  return (
    <div className="card p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export { Users, Calendar, MessageCircle, Bell };
