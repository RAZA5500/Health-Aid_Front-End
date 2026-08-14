"use client";

import { useEffect, useState } from "react";
import AppHeader from "@/components/AppHeader";
import { Users, Heart, MessageCircle } from "lucide-react";

export default function CommunityPage() {
  return (
    <div className="page-content">
      <AppHeader greeting="Community" subtitle="Connect with other mothers" />

      <div className="card p-8 text-center text-gray-400">
        <Users size={40} className="mx-auto mb-3 opacity-40" />
        <p className="font-medium text-gray-600 mb-1">Community coming soon</p>
        <p className="text-sm">Share experiences and connect with other mothers in a future update.</p>
      </div>

      <div className="flex gap-3 mt-5 md:grid md:grid-cols-3 md:gap-4 opacity-50 pointer-events-none">
        <div className="card flex-1 p-3.5 text-center">
          <Users size={20} className="text-primary mx-auto mb-1" />
          <p className="text-xs text-gray-500">Members</p>
          <p className="font-bold text-gray-900">—</p>
        </div>
        <div className="card flex-1 p-3.5 text-center">
          <Heart size={20} className="text-primary mx-auto mb-1" />
          <p className="text-xs text-gray-500">Posts</p>
          <p className="font-bold text-gray-900">—</p>
        </div>
        <div className="card flex-1 p-3.5 text-center">
          <MessageCircle size={20} className="text-primary mx-auto mb-1" />
          <p className="text-xs text-gray-500">Discussions</p>
          <p className="font-bold text-gray-900">—</p>
        </div>
      </div>
    </div>
  );
}
