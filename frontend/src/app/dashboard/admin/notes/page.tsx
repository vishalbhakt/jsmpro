"use client";

import { useAuthStore } from "@/store/useAuthStore";
import DashboardLayout from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import { learningAPI, subjectsAPI } from "@/lib/api";
import { fetchList } from "@/lib/apiUtils";
import { 
  Plus, 
  Trash2, 
  Edit,
  FileText, 
  Send,
  Loader2,
  Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToastStore } from "@/store/useToastStore";

export default function AdminNotes() {
  const { user } = useAuthStore();
  const [items, setItems] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingNote, setEditingNote] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", subject: "" });
  const [file, setFile] = useState<File | null>(null);
  const addToast = useToastStore(s => s.addToast);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [notes, subjects] = await Promise.all([
        fetchList(learningAPI.notes.list(), 'Notes', addToast),
        fetchList(subjectsAPI.list(), 'Subjects', addToast)
      ]);
      setItems(notes);
      setSubjects(subjects);
    } catch (err) {
      console.error('Failed to fetch notes data', err);
      addToast('Failed to load notes', 'error');
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
    if (file) fd.append("file", file);

    try {
      if (editingNote) {
        await learningAPI.notes.update(editingNote.id, fd);
        addToast("Notes updated successfully!");
      } else {
        await learningAPI.notes.create(fd);
        addToast("Notes published successfully!");
      }
      setIsAdding(false);
      setEditingNote(null);
      setForm({ title: "", description: "", subject: "" });
      setFile(null);
      fetchData();
    } catch (err: any) {
      console.error("Failed to save notes", err);
      const msg = err.response?.data?.detail || err.response?.data?.error || "Failed to save notes";
      addToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete these notes?")) return;
    try {
      await learningAPI.notes.delete(id);
      setItems(items.filter(i => i.id !== id));
      addToast("Notes removed.");
    } catch {
      addToast("Action failed", "error");
    }
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!user) {
    return mounted ? (
      <div className="flex items-center justify-center h-screen bg-[#f8fafc]">
        <div className="w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
      </div>
    ) : null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-10 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-[#001f3f] tracking-tight">
               Study Materials
            </h1>
            <p className="text-slate-500 font-medium mt-1">
               Upload and organize academic notes across subjects.
            </p>
          </div>
          <button 
            onClick={() => {
              if (isAdding || editingNote) {
                setIsAdding(false);
                setEditingNote(null);
                setForm({ title: "", description: "", subject: "" });
              } else {
                setIsAdding(true);
              }
            }}
            className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
              (isAdding || editingNote) ? "bg-slate-100 text-slate-500" : "bg-[#d4af37] text-white shadow-xl shadow-[#d4af37]/20"
            }`}
          >
             {(isAdding || editingNote) ? "Cancel" : <><Plus className="w-4 h-4" /> Upload Notes</>}
          </button>
        </div>

        <AnimatePresence>
          {(isAdding || editingNote) && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-[3rem] border-2 border-[#d4af37]/20 p-10 shadow-2xl relative overflow-hidden"
            >
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Note Title</label>
                  <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold focus:border-[#d4af37] outline-none transition-all text-[#001f3f]"
                    placeholder="e.g. Chapter 5: Linear Equations"
                    value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Short Description</label>
                  <textarea className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold focus:border-[#d4af37] outline-none min-h-[100px] transition-all text-[#001f3f]"
                    placeholder="Briefly explain what these notes cover..."
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
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Upload PDF/Document {editingNote && "(Leave blank to keep current)"}</label>
                  <input type="file" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold focus:border-[#d4af37] outline-none text-[#001f3f]"
                    onChange={e => setFile(e.target.files?.[0] || null)} />
                </div>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="col-span-2 bg-[#001f3f] text-white py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-[#001f3f]/20 uppercase tracking-[0.2em] font-black text-xs disabled:opacity-70"
                >
                  {saving ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
                  ) : (
                    <><Send className="w-5 h-5" /> {editingNote ? "Save Changes" : "Publish to Repository"}</>
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
                <div className="flex items-center justify-between mb-6">
                   <div className="px-3 py-1 bg-[#d4af37]/10 text-[#d4af37] text-[10px] font-black uppercase tracking-widest rounded-lg">{item.subject_name || `Subject #${item.subject}`}</div>
                   <div className="flex items-center gap-2">
                      <button 
                       onClick={() => {
                         setEditingNote(item);
                         setForm({
                           title: item.title || "",
                           description: item.description || "",
                           subject: item.subject || ""
                         });
                       }}
                       className="p-2 text-slate-200 hover:text-[#d4af37] transition-colors"
                       title="Edit Note"
                      >
                         <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-200 hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                   </div>
                </div>

                <h3 className="text-xl font-black text-[#001f3f] mb-3 line-clamp-1">{item.title}</h3>
                <p className="text-slate-400 text-sm font-medium line-clamp-3 mb-10 leading-relaxed italic">"{item.description}"</p>
                
                <div className="mt-auto pt-6 border-t border-[#001f3f]/5 flex items-center justify-between">
                   <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{new Date(item.created_at).toLocaleDateString()}</div>
                   {item.file && (
                     <a href={item.file} target="_blank" className="w-12 h-12 bg-[#001f3f] text-white rounded-2xl flex items-center justify-center hover:bg-[#d4af37] transition-all shadow-xl active:scale-90">
                        <Download className="w-5 h-5" />
                     </a>
                   )}
                </div>
              </div>
            ))}
            {!items.length && !isAdding && !editingNote && (
              <div className="col-span-full py-40 text-center bg-white rounded-[3rem] border-2 border-dashed border-[#001f3f]/5 flex flex-col items-center">
                 <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <FileText className="w-10 h-10 text-slate-200" />
                 </div>
                 <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Notes repository is currently empty.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
