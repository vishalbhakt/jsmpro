"use client";

import { useAuthStore } from "@/store/useAuthStore";
import DashboardLayout from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import { classesAPI, subjectsAPI } from "@/lib/api";
import { 
  GraduationCap, 
  BookOpen, 
  Plus, 
  Trash2, 
  ChevronRight,
  ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToastStore } from "@/store/useToastStore";

export default function AdminAcademics() {
  const { user } = useAuthStore();
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState<string | null>(null);
  const [form, setForm] = useState({ 
    name: "", 
    section: "", 
    academic_year: "2025-26", 
    description: "", 
    classroom: "",
    code: "" 
  });
  const addToast = useToastStore(s => s.addToast);

  const fetchData = async () => {
    try {
      const [cRes, sRes] = await Promise.all([
        classesAPI.list(),
        subjectsAPI.list()
      ]);
      setClasses(cRes.data);
      setSubjects(sRes.data);
    } catch (err) {
      console.error("Failed to fetch academic data", err);
      addToast("Failed to fetch academic data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isAdding === 'class') {
        await classesAPI.create({
          name: form.name,
          section: form.section,
          academic_year: form.academic_year
        });
      } else {
        await subjectsAPI.create({
          name: form.name,
          code: form.code,
          classroom: form.classroom,
          description: form.description
        });
      }
      
      addToast(`${isAdding} added successfully!`);
      setIsAdding(null);
      setForm({ name: "", section: "", academic_year: "2025-26", description: "", classroom: "", code: "" });
      fetchData();
    } catch (err: any) {
      console.error("Failed to save entry", err);
      addToast(err.response?.data?.detail || "Failed to save entry", "error");
    }
  };

  const handleDelete = async (type: 'class' | 'subject', id: number) => {
    if (!confirm(`Delete this ${type}? This will remove all related data.`)) return;
    try {
      if (type === 'class') await classesAPI.delete(id);
      else await subjectsAPI.delete(id);
      addToast(`${type} removed.`);
      fetchData();
    } catch {
      addToast("Delete failed", "error");
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-10 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-[#001f3f] tracking-tight">
              Academic Infrastructure
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Define and manage the school's classes and subject offerings.
            </p>
          </div>
          <div className="flex gap-4">
             <button onClick={() => setIsAdding('class')} className="bg-[#001f3f] text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-opacity-90 transition-all shadow-xl shadow-[#001f3f]/10">
                <Plus className="w-4 h-4" /> New Class
             </button>
             <button onClick={() => setIsAdding('subject')} className="bg-[#d4af37] text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-opacity-90 transition-all shadow-xl shadow-[#d4af37]/10">
                <Plus className="w-4 h-4" /> New Subject
             </button>
          </div>
        </div>

        <AnimatePresence>
          {isAdding && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white p-10 rounded-[3rem] border-2 border-[#d4af37]/20 shadow-2xl space-y-8">
               <h3 className="text-2xl font-black text-[#001f3f] capitalize">Add New {isAdding}</h3>
               <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Name</label>
                     <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none focus:border-[#d4af37]"
                       value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder={isAdding === 'class' ? "e.g. Grade 10" : "e.g. Mathematics"} />
                  </div>

                  {isAdding === 'class' ? (
                    <>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Section</label>
                        <input className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none focus:border-[#d4af37]"
                          value={form.section} onChange={e => setForm({...form, section: e.target.value})} placeholder="e.g. A" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Academic Year</label>
                        <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none focus:border-[#d4af37]"
                          value={form.academic_year} onChange={e => setForm({...form, academic_year: e.target.value})} placeholder="e.g. 2025-26" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Subject Code</label>
                        <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none focus:border-[#d4af37]"
                          value={form.code} onChange={e => setForm({...form, code: e.target.value})} placeholder="e.g. MATH101" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Target Class</label>
                        <select required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none focus:border-[#d4af37]"
                          value={form.classroom} onChange={e => setForm({...form, classroom: e.target.value})}>
                          <option value="">-- Choose Class --</option>
                          {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.section && `(${c.section})`}</option>)}
                        </select>
                      </div>
                      <div className="col-span-2 space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Description</label>
                        <textarea className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none focus:border-[#d4af37] min-h-[100px]"
                          value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                      </div>
                    </>
                  )}
                  
                  <div className="col-span-2 flex gap-4 pt-4 border-t border-[#001f3f]/5">
                     <button type="button" onClick={() => setIsAdding(null)} className="flex-1 font-black text-slate-400 uppercase tracking-widest text-xs">Cancel</button>
                     <button type="submit" className="flex-1 bg-[#001f3f] text-white py-4 rounded-2xl uppercase font-black tracking-widest text-xs shadow-xl">Create {isAdding}</button>
                  </div>
               </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
           {/* Classes */}
           <div className="bg-white rounded-[2.5rem] border border-[#001f3f]/5 shadow-sm p-8 space-y-8 flex flex-col h-[600px]">
              <div className="flex items-center justify-between">
                 <h3 className="text-xl font-bold text-[#001f3f] flex items-center gap-3"><GraduationCap className="text-[#d4af37]" /> Active Classes</h3>
                 <span className="px-3 py-1 bg-[#001f3f]/5 text-[#001f3f] rounded-lg text-[10px] font-black">{classes.length}</span>
              </div>
              <div className="flex-1 overflow-auto space-y-4 pr-2 custom-scrollbar">
                 {Array.isArray(classes) && classes.map(c => (
                   <div key={c.id} className="p-6 bg-slate-50 rounded-3xl border border-[#001f3f]/5 flex justify-between items-center group hover:bg-white hover:shadow-lg transition-all">
                      <div>
                         <div className="font-bold text-[#001f3f]">{c.name} {c.section && ` - Section ${c.section}`}</div>
                         <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Year: {c.academic_year}</div>
                      </div>
                      <button onClick={() => handleDelete('class', c.id)} className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                   </div>
                 ))}
              </div>
           </div>

           {/* Subjects */}
           <div className="bg-white rounded-[2.5rem] border border-[#001f3f]/5 shadow-sm p-8 space-y-8 flex flex-col h-[600px]">
              <div className="flex items-center justify-between">
                 <h3 className="text-xl font-bold text-[#001f3f] flex items-center gap-3"><BookOpen className="text-[#d4af37]" /> Subjects</h3>
                 <span className="px-3 py-1 bg-[#001f3f]/5 text-[#001f3f] rounded-lg text-[10px] font-black">{subjects.length}</span>
              </div>
              <div className="flex-1 overflow-auto space-y-4 pr-2 custom-scrollbar">
                 {Array.isArray(subjects) && subjects.map(s => (
                   <div key={s.id} className="p-6 bg-slate-50 rounded-3xl border border-[#001f3f]/5 flex justify-between items-center group hover:bg-white hover:shadow-lg transition-all">
                      <div>
                         <div className="font-bold text-[#001f3f]">{s.name} ({s.code})</div>
                         <div className="text-[10px] text-[#d4af37] font-black uppercase tracking-widest mt-1">Class ID: {s.classroom}</div>
                      </div>
                      <button onClick={() => handleDelete('subject', s.id)} className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
