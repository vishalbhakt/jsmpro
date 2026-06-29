"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DataTable from "@/components/DataTable";
import { attendanceAPI } from "@/lib/api";
import { fetchList } from "@/lib/apiUtils";
import { 
  CalendarCheck, 
  Search, 
  Trash2, 
  Edit, 
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { useToastStore } from "@/store/useToastStore";

export default function AdminAttendanceRecords() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const addToast = useToastStore(s => s.addToast);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const list = await fetchList(attendanceAPI.records.list(), 'Attendance Records', addToast);
      setData(list);
    } catch (err) {
      console.error('Failed to fetch attendance records', err);
      addToast('Failed to load attendance records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleUpdateStatus = async (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === "present" ? "absent" : "present";
    try {
      await attendanceAPI.records.update(id, { status: nextStatus });
      setData(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
      addToast(`Status updated to ${nextStatus}.`);
    } catch {
      addToast("Update failed.", "error");
    }
  };

  const filteredData = data.filter(r => 
    r.student_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.classroom_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.subject_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-10 pb-20">
        <div>
          <h1 className="text-4xl font-black text-[#001f3f] tracking-tight flex items-center gap-3">
             <CalendarCheck className="w-10 h-10 text-[#d4af37]" />
             Attendance Ledger
          </h1>
          <p className="text-slate-500 font-medium mt-1">Audit individual student attendance entries across all sessions.</p>
        </div>

        {/* Search */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-6 rounded-[2.5rem] border border-[#001f3f]/5 shadow-sm">
           <div className="relative flex-1 group w-full">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#d4af37] transition-all" />
              <input 
                placeholder="Search records by student name, classroom, subject..."
                className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-[#d4af37]/20 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-[#001f3f] outline-none transition-all"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
           </div>
        </div>

        {/* Table */}
        <DataTable 
          isLoading={loading}
          data={filteredData}
          columns={[
            { key: "student_name", header: "Student", render: (v, r) => (
              <div>
                 <div className="font-bold text-[#001f3f]">{v}</div>
                 <div className="text-[10px] text-slate-400 font-medium">Roll No. {r.roll_number || "-"}</div>
              </div>
            )},
            { key: "classroom_name", header: "Classroom / Subject", render: (v, r) => (
              <div>
                 <div className="font-bold text-[#001f3f]">{v}</div>
                 <div className="text-[10px] text-[#d4af37] font-black uppercase tracking-widest">{r.subject_name || "General"}</div>
              </div>
            )},
            { key: "session_date", header: "Session Date", render: v => (
              <div className="flex items-center gap-2 font-bold text-slate-500 text-xs">
                 <Calendar className="w-4 h-4" />
                 {v ? new Date(v).toLocaleDateString() : "-"}
              </div>
            )},
            { key: "status", header: "Attendance Status", render: (v, r) => (
              <button 
                onClick={() => handleUpdateStatus(r.id, v)}
                className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                  v === 'present' ? 'bg-emerald-50 text-emerald-600' :
                  v === 'absent' ? 'bg-rose-50 text-rose-500 animate-pulse' :
                  'bg-amber-50 text-amber-600'
                }`}
              >
                 {v === 'present' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                 {v}
              </button>
            )},
            { key: "remarks", header: "Remarks / Notes", render: v => <span className="text-xs text-slate-400 font-medium italic">"{v || "No remarks"}"</span> }
          ]}
        />
      </div>
    </DashboardLayout>
  );
}
