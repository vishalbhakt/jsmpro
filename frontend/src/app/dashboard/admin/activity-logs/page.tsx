"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DataTable from "@/components/DataTable";
import { communicationAPI } from "@/lib/api";
import { 
  Activity, 
  Search, 
  Clock, 
  User, 
  Terminal
} from "lucide-react";
import { useToastStore } from "@/store/useToastStore";

export default function AdminActivityLogs() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const addToast = useToastStore(s => s.addToast);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await communicationAPI.activityLogs.list();
      setData(safeArray(res, 'activity logs', addToast));
    } catch (err) {
      console.error("Failed to fetch activity logs", err);
      addToast("Failed to sync system activity logs", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const safeData = Array.isArray(data) ? data : [];
  const filteredData = safeData.filter(log => 
    log.action?.toLowerCase().includes(search.toLowerCase()) ||
    log.actor_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-10 pb-20">
        <div>
          <h1 className="text-4xl font-black text-[#001f3f] tracking-tight flex items-center gap-3">
             <Activity className="w-10 h-10 text-[#d4af37]" />
             Audit Trails
          </h1>
          <p className="text-slate-500 font-medium mt-1">Real-time system action logs, operations, and transaction records.</p>
        </div>

        {/* Search */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-6 rounded-[2.5rem] border border-[#001f3f]/5 shadow-sm">
           <div className="relative flex-1 group w-full">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#d4af37] transition-all" />
              <input 
                placeholder="Search audit trail by actor, action description..."
                className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-[#d4af37]/20 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-[#001f3f] outline-none transition-all"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
           </div>
        </div>

        {/* Audit Trails Table */}
        <DataTable 
          isLoading={loading}
          data={filteredData}
          columns={[
            { key: "created_at", header: "Timestamp", render: v => (
              <div className="flex items-center gap-2 font-bold text-slate-400 text-xs font-mono">
                 <Clock className="w-3.5 h-3.5 text-[#d4af37]" />
                 {new Date(v).toLocaleString()}
              </div>
            )},
            { key: "actor_name", header: "Operator", render: v => (
              <div className="flex items-center gap-2 font-bold text-[#001f3f] text-sm">
                 <User className="w-4 h-4 text-slate-400" />
                 {v || "System / Guest"}
              </div>
            )},
            { key: "action", header: "Action Executed", render: v => (
              <span className="font-semibold text-slate-600 text-xs px-3 py-1 bg-slate-100 rounded-lg font-mono">
                 {v}
              </span>
            )},
            { key: "metadata", header: "JSON Payload", render: v => (
              <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400 max-w-md truncate">
                 <Terminal className="w-3 h-3 text-[#d4af37]" />
                 {JSON.stringify(v)}
              </div>
            )}
          ]}
        />
      </div>
    </DashboardLayout>
  );
}
