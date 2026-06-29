"use client";

import { useAuthStore } from "@/store/useAuthStore";
import DashboardLayout from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import { learningAPI, subjectsAPI } from "@/lib/api";
import { fetchList } from "@/lib/apiUtils";
import { 
  Plus, 
  Trash2, 
  Calendar, 
  FileText, 
  Loader2, 
  Send,
  MoreVertical
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToastStore } from "@/store/useToastStore";
import SubmissionReview from "@/components/SubmissionReview";

export default function AdminAssignments() {
  const { user } = useAuthStore();
  const [items, setItems] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reviewing, setReviewing] = useState<number | null>(null);
  const [form, setForm] = useState({ title: "", description: "", subject: "", due_date: "" });
  const [file, setFile] = useState<File | null>(null);
  const addToast = useToastStore(s => s.addToast);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [assignments, subjects] = await Promise.all([
        fetchList(learningAPI.assignments.list(), 'Assignments', addToast),
        fetchList(subjectsAPI.list(), 'Subjects', addToast)
      ]);
      setItems(assignments);
      setSubjects(subjects);
    } catch (err) {
      console.error('Failed to fetch assignments data', err);
      addToast('Failed to load assignments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("subject", form.subject);
    fd.append("due_at", form.due_date);
    if (file) fd.append("attachment", file);

    try {
      await learningAPI.assignments.create(fd);
      setIsAdding(false);
      setForm({ title: "", description: "", subject: "", due_date: "" });
      setFile(null);
      addToast("Assignment published successfully!");
      fetchData();
    } catch (err: any) {
      console.error("Failed to publish assignment", err);
      let msg = "Failed to publish assignment";
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === "string") msg = data;
        else if (typeof data === "object") {
          msg = Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join(" | ");
        }
      }
      addToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this assignment?")) return;
    try {
      await learningAPI.assignments.delete(id);
      setItems(items.filter(i => i.id !== id));
      addToast("Assignment removed.");
    } catch {
      addToast("Action failed", "error");
    }
  };

// Auth guard removed; DashboardLayout handles authentication

  return (
    <DashboardLayout>
      <div className="space-y-10 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-[#001f3f] tracking-tight">
               Assignment Drive
            </h1>
            <p className="text-slate-500 font-medium mt-1">
               Publish and evaluate student tasks across the institution.
            </p>
          </div>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
              isAdding ? "bg-slate-100 text-slate-500" : "bg-[#d4af37] text-white shadow-xl shadow-[#d4af37]/20"
            }`}
          >
             {isAdding ? "Cancel" : <><Plus className="w-4 h-4" /> New Task</>}
          </button>
        </div>

        <AnimatePresence>
          {isAdding && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-[3rem] border-2 border-[#d4af37]/20 p-10 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Assignment Title</label>
                  <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold focus:border-[#d4af37] outline-none transition-all text-[#001f3f]"
                    placeholder="e.g. Mathematics Home Task #4"
                    value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Task Description</label>
                  <textarea className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold focus:border-[#d4af37] outline-none min-h-[120px] transition-all text-[#001f3f]"
                    placeholder="Provide clear instructions for the students..."
                    value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Subject</label>
                  <select required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold focus:border-[#d4af37] outline-none appearance-none cursor-pointer text-[#001f3f]"
                    value={form.subject} onChange={e => setForm({...form, subject: e.target.value})}>
                    <option value="">-- Select Subject --</option>
                    {Array.isArray(subjects) && subjects.map(s => <option key={s.id} value={s.id}>{s.name} (Class {s.classroom_name || s.classroom})</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Submission Deadline</label>
                  <input type="datetime-local" required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold focus:border-[#d4af37] outline-none text-[#001f3f]"
                    value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Instructions File (PDF/Image)</label>
                  <input type="file" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold focus:border-[#d4af37] outline-none text-[#001f3f]"
                    onChange={e => setFile(e.target.files?.[0] || null)} />
                </div>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="col-span-2 bg-[#001f3f] text-white py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-[#001f3f]/20 disabled:opacity-70 font-black text-xs uppercase tracking-widest"
                >
                  {saving ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Publishing Task...</>
                  ) : (
                    <><Send className="w-5 h-5" /> Publish to Subject Stream</>
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3].map(i => <div key={i} className="h-64 bg-white rounded-[2.5rem] animate-pulse border border-[#001f3f]/5"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item) => (
              <div key={item.id} className="bg-white p-8 rounded-[2.5rem] border border-[#001f3f]/5 shadow-sm hover:border-[#d4af37]/30 transition-all flex flex-col group relative">
                <div className="absolute top-4 right-4 p-2 text-slate-200 group-hover:text-[#001f3f] transition-all cursor-default opacity-0 group-hover:opacity-100">
                   <MoreVertical className="w-5 h-5" />
                </div>
                
                <div className="flex items-center gap-2 mb-6">
                   <div className="px-3 py-1 bg-[#001f3f]/5 text-[#001f3f] text-[10px] font-black uppercase tracking-widest rounded-lg">{item.subject_name || `Subject #${item.subject}`}</div>
                </div>

                <h3 className="text-xl font-black text-[#001f3f] mb-3 line-clamp-1">{item.title}</h3>
                <p className="text-slate-400 text-sm font-medium line-clamp-2 mb-8 leading-relaxed italic">"{item.description}"</p>
                
                <div className="space-y-4 mt-auto">
                   <button 
                    onClick={() => setReviewing(item.id)}
                    className="w-full bg-[#001f3f] text-white py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#d4af37] transition-all shadow-lg active:scale-95"
                   >
                      Review Submissions
                   </button>
                   
                   <div className="flex items-center justify-between pt-4 border-t border-[#001f3f]/5">
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                         <Calendar className="w-3.5 h-3.5 text-[#d4af37]" />
                         {new Date(item.due_date).toLocaleDateString()}
                      </div>
                      <button onClick={() => handleDelete(item.id)} className="text-rose-400 hover:text-rose-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                   </div>
                </div>
              </div>
            ))}
            {!items.length && !isAdding && (
              <div className="col-span-full py-40 text-center bg-white rounded-[3rem] border-2 border-dashed border-[#001f3f]/5 flex flex-col items-center">
                 <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <FileText className="w-10 h-10 text-slate-200" />
                 </div>
                 <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No active assignments in the drive.</p>
              </div>
            )}
          </div>
        )}

        <AnimatePresence>
          {reviewing && (
            <SubmissionReview assignmentId={reviewing} onClose={() => setReviewing(null)} />
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
