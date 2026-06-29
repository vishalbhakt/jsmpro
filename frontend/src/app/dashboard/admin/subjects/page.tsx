"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DataTable from "@/components/DataTable";
import { subjectsAPI, classesAPI, teachersAPI } from "@/lib/api";
import { fetchList } from "@/lib/apiUtils";
import { 
  BookOpen, 
  Search, 
  Plus, 
  Trash2, 
  Edit, 
  Filter,
  Download,
  Book,
  User,
  X,
  Zap,
  CheckCircle2,
  ChevronRight,
  Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToastStore } from "@/store/useToastStore";

export default function AdminSubjects() {
  const [data, setData] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingSubject, setEditingSubject] = useState<any | null>(null);
  const [viewSubject, setViewSubject] = useState<any | null>(null);
  const [form, setForm] = useState({ 
    name: "", 
    code: "", 
    classroom: "", 
    teacher: "", 
    description: "" 
  });
  const [submitting, setSubmitting] = useState(false);
  const addToast = useToastStore(s => s.addToast);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subjectsList, classesList, teachersList] = await Promise.all([
        fetchList(subjectsAPI.list(), 'Subjects', addToast),
        fetchList(classesAPI.list(), 'Classes', addToast),
        fetchList(teachersAPI.list(), 'Teachers', addToast)
      ]);
      setData(subjectsList);
      setClasses(classesList);
      setTeachers(teachersList);
    } catch (err) {
      console.error('Failed to fetch subjects data', err);
      addToast('Failed to load subject data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      name: form.name,
      code: form.code,
      classroom: form.classroom ? parseInt(form.classroom.toString()) : null,
      teacher: form.teacher ? parseInt(form.teacher.toString()) : null,
      description: form.description
    };

    try {
       // Simple client‑side validation
       if (!form.name.trim() || !form.code.trim()) {
         addToast('Subject Name and Code are required.', 'error');
         setSubmitting(false);
         return;
       }
       if (editingSubject) {
         await subjectsAPI.update(editingSubject.id, payload);
         addToast('Subject updated successfully.');
       } else {
         await subjectsAPI.create(payload);
         addToast('New subject defined in curriculum.');
       }
      setIsAdding(false);
      setEditingSubject(null);
      setForm({ name: "", code: "", classroom: "", teacher: "", description: "" });
      fetchData();
    } catch (err: any) {
      console.error("Operation failed", err);
      let msg = "Operation failed";
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === "string") msg = data;
        else if (typeof data === "object") {
          msg = Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join(" | ");
        }
      }
      addToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Permanently delete this subject?")) return;
    try {
      await subjectsAPI.delete(id);
      setData(data.filter(s => s.id !== id));
      addToast("Subject removed.");
      } catch (err) {
        const errMsg = err.response?.data ? (typeof err.response.data === 'string' ? err.response.data : Object.entries(err.response.data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ')) : 'Action failed';
        addToast(errMsg, "error");
      }
  };

  const filteredData = data.filter(s => 
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.code?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-10 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-[#001f3f] tracking-tight flex items-center gap-3">
               <BookOpen className="w-10 h-10 text-[#d4af37]" />
               Curriculum Catalog
            </h1>
            <p className="text-slate-500 font-medium mt-1">Define subjects, assign faculty, and manage academic content delivery.</p>
          </div>
          <div className="flex gap-4">
             <button 
              onClick={() => {
                setEditingSubject(null);
                setForm({ name: "", code: "", classroom: "", teacher: "", description: "" });
                setIsAdding(true);
              }}
              className="bg-[#001f3f] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-[#001f3f]/20 hover:scale-105 transition-all active:scale-95"
             >
                <Plus className="w-4 h-4" /> Define Subject
             </button>
             <button className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-400 hover:text-[#001f3f] transition-all">
                <Download className="w-5 h-5" />
             </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-[2rem] border border-[#001f3f]/5 shadow-sm flex flex-col md:flex-row gap-4 items-center">
           <div className="relative flex-1 group w-full">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#d4af37] transition-all" />
              <input 
                placeholder="Search subjects by name or code..."
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
            { key: "name", header: "Subject", render: (v, row) => (
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 font-black text-lg shadow-sm border border-emerald-100">
                    <Book className="w-6 h-6" />
                 </div>
                 <div>
                    <div className="font-black text-[#001f3f] text-base">{v}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{row.code}</div>
                 </div>
              </div>
            )},
            { key: "classroom_name", header: "Class / Batch", render: v => (
              <div className="flex items-center gap-2">
                 <div className="px-3 py-1 bg-slate-100 text-[#001f3f] rounded-lg font-black text-[10px] uppercase tracking-widest">{v || "Shared"}</div>
              </div>
            )},
            { key: "teacher_name", header: "Primary Faculty", render: v => (
              <div className="flex items-center gap-2 text-[#001f3f]">
                 <User className="w-3.5 h-3.5 text-[#d4af37]" />
                 <span className="font-bold text-xs">{v || "Unassigned"}</span>
              </div>
            )},
            { key: "status", header: "Academics", render: () => (
              <div className="flex items-center gap-1 text-emerald-500">
                 <CheckCircle2 className="w-3.5 h-3.5" />
                 <span className="font-black text-[10px] uppercase tracking-widest">Active</span>
              </div>
            )},
            { key: "actions", header: "Control", render: (_, row) => (
              <div className="flex items-center justify-end gap-2">
                 <button 
                  onClick={() => {
                    setEditingSubject(row);
                    setForm({
                      name: row.name || "",
                      code: row.code || "",
                      classroom: row.classroom || "",
                      teacher: row.teacher || "",
                      description: row.description || ""
                    });
                  }}
                  className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-[#001f3f] hover:border-[#001f3f] rounded-xl transition-all"
                 >
                   <Edit className="w-4 h-4" />
                 </button>
                 <button 
                    onClick={() => setViewSubject(row)}
                    className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-[#001f3f] hover:border-[#001f3f] rounded-xl transition-all"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                 <button onClick={() => handleDelete(row.id)} className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-500 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
              </div>
            )}
          ]}
        />

        {/* Define / Edit Subject Modal */}
        <AnimatePresence>
          {(isAdding || editingSubject) && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#001f3f]/60 backdrop-blur-md">
               <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-[3rem] p-12 max-w-4xl w-full shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-12"
               >
                  <div className="flex-1 space-y-8">
                     <div>
                        <h3 className="text-3xl font-black text-[#001f3f]">{editingSubject ? "Edit Subject" : "Subject Definition"}</h3>
                        <p className="text-slate-400 font-medium mt-1 italic">{editingSubject ? "Update academic unit settings and faculty assignments." : "Define a new academic unit and assign faculty."}</p>
                     </div>

                     <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                           <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Subject Name</label>
                           <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-[#d4af37]"
                             value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Subject Code</label>
                           <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-[#d4af37]"
                             value={form.code} onChange={e => setForm({...form, code: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Target Class</label>
                           <select required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-[#d4af37] appearance-none"
                             value={form.classroom} onChange={e => setForm({...form, classroom: e.target.value})}>
                              <option value="">-- Choose Class --</option>
                              {classes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.section})</option>)}
                           </select>
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Assign Faculty</label>
                           <select required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-[#d4af37] appearance-none"
                             value={form.teacher} onChange={e => setForm({...form, teacher: e.target.value})}>
                              <option value="">-- Choose Teacher --</option>
                              {teachers.map(t => <option key={t.id} value={t.id}>{t.user_name}</option>)}
                           </select>
                        </div>
                        <div className="md:col-span-2 space-y-1">
                           <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Description</label>
                           <textarea className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-[#d4af37] min-h-[100px]"
                             value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                        </div>
                        <div className="md:col-span-2 pt-6 flex gap-4">
                           <button type="button" onClick={() => { setIsAdding(false); setEditingSubject(null); }} className="flex-1 py-4 font-black uppercase text-slate-300 text-xs tracking-widest">Cancel</button>
                           <button type="submit" disabled={submitting} className="flex-[2] bg-[#001f3f] text-white py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-[#001f3f]/20 flex items-center justify-center gap-3 active:scale-95 transition-all">
                              {submitting ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : (editingSubject ? "Update Subject" : "Define Academic Unit")}
                           </button>
                        </div>
                     </form>
                  </div>

                  <div className="hidden md:block w-72 bg-emerald-500 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
                     <div className="relative z-10 space-y-6">
                        <Zap className="w-12 h-12 text-[#001f3f] fill-current" />
                        <h4 className="text-2xl font-black italic">Course Architecture</h4>
                        <p className="text-white/80 text-xs leading-relaxed font-medium">Subjects are the building blocks of the institutional curriculum. Ensure proper alignment with classroom schedules and faculty expertise.</p>
                     </div>
                     <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#001f3f]/5 rounded-full blur-3xl"></div>
                  </div>

                  <button onClick={() => { setIsAdding(false); setEditingSubject(null); }} className="absolute top-8 right-8 text-slate-300 hover:text-[#001f3f] transition-all"><X className="w-6 h-6" /></button>
               </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
