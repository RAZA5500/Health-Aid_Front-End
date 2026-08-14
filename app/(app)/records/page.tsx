"use client";

import { useEffect, useState } from "react";
import AppHeader from "@/components/AppHeader";
import { healthRecordsApi } from "@/lib/api";
import { FileText, Download, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface HealthRecord {
  _id: string;
  title: string;
  recordType: string;
  createdAt: string;
  description?: string;
}

export default function RecordsPage() {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    healthRecordsApi
      .getAll()
      .then((res) => setRecords(res.data || []))
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-content">
      <AppHeader greeting="Health Records" subtitle="Your medical documents" />

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-primary" size={28} />
        </div>
      ) : records.length === 0 ? (
        <div className="card p-8 text-center text-gray-400">
          <FileText size={40} className="mx-auto mb-3 opacity-40" />
          <p>No health records yet</p>
          <p className="text-sm mt-1">Records from your care team will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((record) => (
            <div key={record._id} className="card p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
                <FileText size={18} className="text-teal-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-gray-900">{record.title}</p>
                <p className="text-xs text-gray-500">
                  {format(new Date(record.createdAt), "MMM d, yyyy")} · {record.recordType}
                </p>
              </div>
              <button type="button" className="text-gray-400 hover:text-primary" aria-label="Download">
                <Download size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
