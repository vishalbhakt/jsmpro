"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DataTable from "@/components/DataTable";
import { attendanceAPI, classesAPI, subjectsAPI } from "@/lib/api";
import { fetchList } from "@/lib/apiUtils";
import { 
  CalendarCheck, 
  Search, 
  Plus, 
  Trash2, 
  Eye, 
  Filter,
  Download,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  MoreVertical
} from "lucide-react";
import { useToastStore } from "@/store/useToastStore";

export default function AdminAttendanceSessions() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const addToast = useToastStore(s => s.addToast);

  const fetchData = async () => {
    setLoading(true);
    try {
      const list = await fetchList(attendanceAPI.sessions.list(), 'Attendance Sessions', addToast);
      setData(list);
    } catch (err) {
      console.error('Failed to fetch attendance sessions', err);
      addToast('Failed to load attendance sessions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Remove this attendance session?")) return;
    try {
      await attendanceAPI.sessions.delete(id);
      setData(data.filter(s => s.id !== id));
      addToast("Session removed.");
    } catch {
      addToast("Action failed", "error");
    }
  };

  const filteredData = data.filter(s => 
    s.classroom_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.subject_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-10 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-[#001f3f] tracking-tight flex items-center gap-3">
               <CalendarCheck className="w-10 h-10 text-[#d4af37]" />
               Attendance Audit
            </h1>
            <p className="text-slate-500 font-medium mt-1">Review verified attendance sessions and institutional consistency logs.</p>
          </div>
          <div className="flex gap-4">
             <button className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-400 hover:text-[#001f3f] transition-all">
                <Download className="w-5 h-5" />
             </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-[2rem] border border-[#001f3f]/5 shadow-sm flex flex-col md:flex-row gap-4 items-center">
           <div className="relative flex-1 group w-full">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#d4af37] transition-all" />
              <input 
                placeholder="Search sessions by class or subject..."
                className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-[#d4af37]/20 rounded-xl pl-12 pr-4 py-3.5 text-sm font-bold text-[#001f3f] outline-none transition-all"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
           </div>
        </div>

        <DataTable 
          isLoading={loading}
          data={filteredData}
          columns={[
            { key: "date", header: "Session Date", render: v => (
              <div className="flex items-center gap-3 font-black text-[#001f3f]">
                 <Calendar className="w-4 h-4 text-[#d4af37]" />
                 {new Date(v).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
              </div>
            )},
            { key: "classroom_name", header: "Classroom" },
            { key: "subject_name", header: "Subject", render: v => <span className="text-[#d4af37] font-black uppercase text-[10px] tracking-widest">{v}</span> },
            { key: "taken_by_name", header: "Instructor", render: v => (
              <div className="flex items-center gap-2 text-slate-500">
                 <User className="w-3.5 h-3.5" />
                 <span className="font-bold text-xs">{v}</span>
              </div>
            )},
            { key: "created_at", header: "Timestamp", render: v => <span className="text-slate-400 font-medium text-[10px]">{new Date(v).toLocaleTimeString()}</span> },
            { key: "actions", header: "Control", render: (_, row) => (
              <div className="flex items-center justify-end gap-2">
                 <button className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-[#001f3f] hover:border-[#001f3f] rounded-xl transition-all"><Eye className="w-4 h-4" /></button>
                 <button onClick={() => handleDelete(row.id)} className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-500 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
              </div>
            )}
          ]}
        />
      </div>
    </DashboardLayout>
  );
}
