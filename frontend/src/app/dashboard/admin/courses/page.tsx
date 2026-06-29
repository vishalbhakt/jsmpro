"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DataTable from "@/components/DataTable";
import { cmsAPI } from "@/lib/api";
import { 
  Library, 
  Search, 
  Plus, 
  Trash2, 
  Edit, 
  X,
  Target,
  GraduationCap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToastStore } from "@/store/useToastStore";

export default function AdminCourses() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any | null>(null);
  
  const [form, setForm] = useState({ 
    title: "", 
    slug: "", 
    description: "", 
    grade_range: "", 
    is_featured: false,
    is_published: true 
  });
  
  const [submitting, setSubmitting] = useState(false);
  const addToast = useToastStore(s => s.addToast);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await cmsAPI.courses.list();
      setData(res.data || []);
    } catch (err) {
      console.error("Failed to fetch courses", err);
      addToast("Failed to sync courses catalog", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getErrorMessage = (err: any) => {
    if (err.response?.data) {
      const data = err.response.data;
      if (typeof data === "string") return data;
      if (Array.isArray(data)) return data.join(", ");
      if (typeof data === "object") {
        return Object.entries(data)
          .map(([key, val]) => {
            const valStr = Array.isArray(val) ? val.join(", ") : String(val);
            return `${key}: ${valStr}`;
          })
          .join(" | ");
      }
    }
    return "Operation failed.";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingCourse) {
        await cmsAPI.courses.update(editingCourse.id, form);
        addToast("Course catalog entry updated.");
      } else {
        await cmsAPI.courses.create(form);
        addToast("Course catalog entry established.");
      }
      setIsAdding(false);
      setEditingCourse(null);
      setForm({ title: "", slug: "", description: "", grade_range: "", is_featured: false, is_published: true });
      fetchData();
    } catch (err: any) {
      console.error("Operation failed", err);
      addToast(getErrorMessage(err), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Permanently archive this course entry?")) return;
    try {
      await cmsAPI.courses.delete(id);
      setData(data.filter(c => c.id !== id));
      addToast("Course archived.");
    } catch {
      addToast("Delete failed", "error");
    }
  };

  const filteredData = data.filter(c => 
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.slug?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-10 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-[#001f3f] tracking-tight flex items-center gap-3">
               <Library className="w-10 h-10 text-[#d4af37]" />
               Academic Courses
            </h1>
            <p className="text-slate-500 font-medium mt-1">Configure curriculum offerings and grades catalogs displayed on public domains.</p>
          </div>
          <button 
            onClick={() => { setEditingCourse(null); setForm({ title: "", slug: "", description: "", grade_range: "", is_featured: false, is_published: true }); setIsAdding(true); }}
            className="bg-[#001f3f] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-[#001f3f]/20 hover:scale-105 transition-all active:scale-95"
          >
             <Plus className="w-4 h-4" /> Add Course
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-6 rounded-[2.5rem] border border-[#001f3f]/5 shadow-sm">
           <div className="relative flex-1 group w-full">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#d4af37] transition-all" />
              <input 
                placeholder="Search courses by title, grade range..."
                className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-[#d4af37]/20 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-[#001f3f] outline-none transition-all"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
           </div>
        </div>

        {/* Data Table */}
        <DataTable 
          isLoading={loading}
          data={filteredData}
          columns={[
            { key: "title", header: "Course Title", render: (v, r) => (
              <div>
                 <div className="font-bold text-[#001f3f]">{v}</div>
                 <div className="text-[10px] text-slate-400 font-mono">/{r.slug}</div>
              </div>
            )},
            { key: "grade_range", header: "Grade Range", render: v => <span className="font-bold text-slate-500">{v || "-"}</span> },
            { key: "is_featured", header: "Featured", render: v => (
              <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${v ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-400"}`}>
                 {v ? "Yes" : "No"}
              </span>
            )},
            { key: "is_published", header: "Status", render: v => (
              <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${v ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                 {v ? "Published" : "Draft"}
              </span>
            )},
            { key: "actions", header: "Control", render: (_, row) => (
              <div className="flex items-center justify-end gap-2">
                 <button 
                  onClick={() => {
                    setEditingCourse(row);
                    setForm({
                      title: row.title || "",
                      slug: row.slug || "",
                      description: row.description || "",
                      grade_range: row.grade_range || "",
                      is_featured: row.is_featured ?? false,
                      is_published: row.is_published ?? true
                    });
                  }}
                  className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-[#d4af37] hover:border-[#d4af37] rounded-xl transition-all"
                 >
                   <Edit className="w-4 h-4" />
                 </button>
                 <button onClick={() => handleDelete(row.id)} className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-500 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
              </div>
            )}
          ]}
        />

        {/* Modal */}
        <AnimatePresence>
          {(isAdding || editingCourse) && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#001f3f]/60 backdrop-blur-md">
               <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-[3rem] p-12 max-w-4xl w-full shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-12"
               >
                  <div className="flex-1 space-y-8 max-h-[80vh] overflow-y-auto pr-4">
                     <div>
                        <h3 className="text-3xl font-black text-[#001f3f]">{editingCourse ? "Edit Course Entry" : "Add Course Entry"}</h3>
                        <p className="text-slate-400 font-medium mt-1 italic">Publish high-fidelity academic syllabus sections on the public site.</p>
                     </div>

                     <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                           <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Course Title</label>
                           <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-[#d4af37]"
                             value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-black uppercase text-slate-400 ml-1">URL Slug</label>
                           <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-[#d4af37]"
                             value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Target Grade Range</label>
                           <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-[#d4af37]"
                             placeholder="e.g. Grades 9 - 12"
                             value={form.grade_range} onChange={e => setForm({...form, grade_range: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Featured Flag</label>
                           <select required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-[#d4af37] appearance-none"
                             value={String(form.is_featured)} onChange={e => setForm({...form, is_featured: e.target.value === "true"})}>
                              <option value="false">Standard Listing</option>
                              <option value="true">Featured Course</option>
                           </select>
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Publishing Status</label>
                           <select required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-[#d4af37] appearance-none"
                             value={String(form.is_published)} onChange={e => setForm({...form, is_published: e.target.value === "true"})}>
                              <option value="true">Published</option>
                              <option value="false">Draft</option>
                           </select>
                        </div>
                        <div className="space-y-1 col-span-2">
                           <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Course Description</label>
                           <textarea required rows={5} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-[#d4af37]"
                             value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                        </div>
                        <div className="md:col-span-2 pt-6 flex gap-4">
                           <button type="button" onClick={() => { setIsAdding(false); setEditingCourse(null); }} className="flex-1 py-4 font-black uppercase text-slate-300 text-xs tracking-widest">Cancel</button>
                           <button type="submit" disabled={submitting} className="flex-[2] bg-[#001f3f] text-white py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-[#001f3f]/20 flex items-center justify-center gap-3 active:scale-95 transition-all">
                              {submitting ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : (editingCourse ? "Update Course" : "Publish Course")}
                           </button>
                        </div>
                     </form>
                  </div>

                  <button onClick={() => { setIsAdding(false); setEditingCourse(null); }} className="absolute top-8 right-8 text-slate-300 hover:text-[#001f3f] transition-all"><X className="w-6 h-6" /></button>
               </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
