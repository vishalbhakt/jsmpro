"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DataTable from "@/components/DataTable";
import api, { teachersAPI, subjectsAPI } from "@/lib/api";
import { 
  Users, 
  BookOpen, 
  Save, 
  Trash2, 
  Plus, 
  X,
  ShieldCheck,
  Search,
  Briefcase
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToastStore } from "@/store/useToastStore";

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [search, setSearch] = useState("");
  const addToast = useToastStore(s => s.addToast);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tRes, sRes] = await Promise.all([
        teachersAPI.list(),
        subjectsAPI.list()
      ]);
      setTeachers(tRes.data.data);
      setSubjects(sRes.data.data);
    } catch {
      addToast("Failed to fetch faculty data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateSubjects = async () => {
    try {
      await api.patch(`/teachers/${editing.id}/`, { 
        subject_ids: editing.subject_ids 
      });
      addToast("Subject allocation updated!");
      setEditing(null);
      fetchData();
    } catch {
      addToast("Failed to update subjects", "error");
    }
  };

  const toggleSubject = (id: number) => {
    const current = editing.subject_ids || [];
    if (current.includes(id)) {
      setEditing({ ...editing, subject_ids: current.filter((sid: number) => sid !== id) });
    } else {
      setEditing({ ...editing, subject_ids: [...current, id] });
    }
  };

  const filteredTeachers = teachers.filter(t => 
    t.user.first_name.toLowerCase().includes(search.toLowerCase()) ||
    t.user.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-10 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-navy tracking-tight">Faculty Management</h1>
            <p className="text-slate-500 font-medium mt-1">Allocate subjects and manage teacher professional details.</p>
          </div>
          <div className="relative w-full max-w-md group">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-gold transition-all" />
             <input 
               placeholder="Search teachers by name..."
               className="w-full bg-white border border-navy/5 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold text-navy focus:border-gold outline-none shadow-sm transition-all"
               value={search}
               onChange={e => setSearch(e.target.value)}
             />
          </div>
        </div>

        <DataTable 
          isLoading={loading}
          data={filteredTeachers}
          columns={[
            { key: "user", header: "Instructor", render: (v) => (
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-navy rounded-xl flex items-center justify-center text-gold font-black text-xs uppercase">{v.first_name[0]}</div>
                 <div>
                    <div className="font-bold text-navy">{v.first_name} {v.last_name}</div>
                    <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">@{v.username}</div>
                 </div>
              </div>
            )},
            { key: "qualification", header: "Qualification" },
            { key: "subjects", header: "Assigned Subjects", render: (subs) => (
               <div className="flex flex-wrap gap-1.5 max-w-xs">
                  {Array.isArray(subs) && subs.map((s: any) => (
                    <span key={s.id} className="px-2 py-0.5 bg-gold/10 text-gold text-[9px] font-black rounded-md border border-gold/5">{s.name}</span>
                  ))}
                  {(!Array.isArray(subs) || !subs.length) && <span className="text-[9px] text-slate-300 font-bold italic">No subjects assigned</span>}
               </div>
            )},
            { key: "actions", header: "Management", render: (_, row) => (
              <button 
                onClick={() => setEditing({ ...row, subject_ids: Array.isArray(row.subjects) ? row.subjects.map((s: any) => s.id) : [] })}
                className="flex items-center gap-2 bg-navy text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-navy-light transition-all"
              >
                <BookOpen className="w-3 h-3" />
                Assign Subjects
              </button>
            )}
          ]}
        />

        <AnimatePresence>
          {editing && (
            <div className="fixed inset-0 z-[110] bg-navy/80 backdrop-blur-md flex items-center justify-center p-6">
               <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[3rem] max-w-2xl w-full p-12 space-y-10 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8">
                     <button onClick={() => setEditing(null)} className="text-slate-300 hover:text-navy transition-colors"><X /></button>
                  </div>
                  
                  <div className="space-y-2">
                     <h3 className="text-3xl font-black text-navy">Subject Allocation</h3>
                     <p className="text-slate-400 font-medium">Assigning subjects to <span className="text-gold font-bold">{editing.user.first_name} {editing.user.last_name}</span></p>
                  </div>

                  <div className="space-y-6">
                     <div className="max-h-64 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3 pr-2 custom-scrollbar">
                        {subjects.map(s => {
                           const isSelected = editing.subject_ids.includes(s.id);
                           return (
                             <div 
                              key={s.id} 
                              onClick={() => toggleSubject(s.id)}
                              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between group ${
                                isSelected ? "border-gold bg-gold/5" : "border-slate-100 hover:border-slate-200"
                              }`}
                             >
                                <div>
                                   <div className={`text-sm font-bold ${isSelected ? "text-navy" : "text-slate-500"}`}>{s.name}</div>
                                   <div className="text-[9px] text-slate-400 font-black uppercase">{s.course_name}</div>
                                </div>
                                {isSelected ? <ShieldCheck className="w-4 h-4 text-gold" /> : <Plus className="w-4 h-4 text-slate-200 group-hover:text-slate-400" />}
                             </div>
                           );
                        })}
                     </div>

                     <div className="pt-6 border-t border-navy/5 flex gap-4">
                        <button onClick={() => setEditing(null)} className="flex-1 font-black text-slate-400 uppercase tracking-widest text-[10px]">Cancel</button>
                        <button onClick={handleUpdateSubjects} className="flex-1 btn-primary py-4 uppercase font-black tracking-widest text-xs shadow-xl shadow-navy/20">Save Allocation</button>
                     </div>
                  </div>
                  
                  {/* Decor */}
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gold/5 rounded-full blur-3xl"></div>
               </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
