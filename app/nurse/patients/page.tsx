"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, ChevronRight } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import { nurseApi } from "@/lib/api";
import type { User } from "@/lib/types";

export default function NursePatientsPage() {
  const [patients, setPatients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    nurseApi.getPatients().then((res) => setPatients(res.data.patients)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="px-4 pb-4">
      <AppHeader greeting="Patients" subtitle="Assigned for monitoring" />
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={28} /></div>
      ) : patients.length === 0 ? (
        <div className="card p-8 text-center text-sm text-gray-400">No patients assigned</div>
      ) : (
        <div className="space-y-2">
          {patients.map((p) => (
            <Link key={p._id} href={`/nurse/patients/${p._id}`} className="card p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center">{p.name[0]}</div>
              <div className="flex-1"><p className="font-semibold text-sm">{p.name}</p><p className="text-xs text-gray-500">{p.email}</p></div>
              <ChevronRight size={18} className="text-gray-300" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
