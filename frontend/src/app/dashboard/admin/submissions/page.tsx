"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DataTable from "@/components/DataTable";
import { learningAPI } from "@/lib/api";
import { fetchList } from "@/lib/apiUtils";
import { 
  Send, 
  Search, 
  Trash2, 
  Download, 
  Calendar, 
  CheckCircle, 
  Clock 
} from "lucide-react";
import { useToastStore } from "@/store/useToastStore";

export default function AdminSubmissions() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const addToast = useToastStore(s => s.addToast);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const list = await fetchList(learningAPI.submissions.list(), 'Submissions', addToast);
      setData(list);
    } catch (err) {
      console.error('Failed to fetch submissions', err);
      addToast('Failed to load submissions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Permanently archive this submission?")) return;
    try {
      await learningAPI.submissions.delete(id);
      setData(data.filter(s => s.id !== id));
      addToast("Submission archived.");
    } catch {
      addToast("Delete failed", "error");
    }
  };

  const filteredData = data.filter(s => 
    s.student_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.assignment_title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-10 pb-20">
        <div>
          <h1 className="text-4xl font-black text-[#001f3f] tracking-tight flex items-center gap-3">
             <Send className="w-10 h-10 text-[#d4af37]" />
             Assignment Submissions
          </h1>
          <p className="text-slate-500 font-medium mt-1">Review student task uploads, grades, and evaluation feedback.</p>
        </div>

        {/* Search */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-6 rounded-[2.5rem] border border-[#001f3f]/5 shadow-sm">
           <div className="relative flex-1 group w-full">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#d4af37] transition-all" />
              <input 
                placeholder="Search submissions by student name, task title..."
                className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-[#d4af37]/20 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-[#001f3f] outline-none transition-all"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
           </div>
        </div>

        {/* DataTable */}
        <DataTable 
          isLoading={loading}
          data={filteredData}
          columns={[
            { key: "student_name", header: "Student Name", render: (v, r) => (
              <div>
                 <div className="font-bold text-[#001f3f]">{v || `Student #${r.student}`}</div>
                 <div className="text-[10px] text-slate-400 font-medium">Task: {r.assignment_title || `Assignment #${r.assignment}`}</div>
              </div>
            )},
            { key: "submitted_at", header: "Submitted Date", render: v => (
              <div className="flex items-center gap-2 font-bold text-slate-500">
                 <Calendar className="w-4 h-4" />
                 {new Date(v).toLocaleString()}
              </div>
            )},
            { key: "obtained_marks", header: "Score", render: (v, r) => (
              <span className="font-black text-[#001f3f]">
                 {v !== null ? `${v} / ${r.max_marks || 100}` : "Not Graded"}
              </span>
            )},
            { key: "status", header: "Status", render: (v, r) => (
              <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${r.obtained_marks !== null ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-500"}`}>
                 {r.obtained_marks !== null ? "Graded" : "Pending Review"}
              </span>
            )},
            { key: "actions", header: "Control", render: (_, row) => (
              <div className="flex items-center justify-end gap-2">
                 {row.file && (
                   <a 
                    href={row.file} 
                    target="_blank" 
                    className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-[#001f3f] hover:border-[#001f3f] rounded-xl transition-all"
                    title="Download Uploaded File"
                   >
                     <Download className="w-4 h-4" />
                   </a>
                 )}
                 <button onClick={() => handleDelete(row.id)} className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-500 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
              </div>
            )}
          ]}
        />
      </div>
    </DashboardLayout>
  );
}
