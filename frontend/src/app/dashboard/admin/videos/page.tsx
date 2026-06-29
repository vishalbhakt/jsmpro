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
  Video, 
  Play, 
  Loader2, 
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToastStore } from "@/store/useToastStore";

export default function AdminVideos() {
  const { user } = useAuthStore();
  const [items, setItems] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", subject: "", video_url: "" });
  const [file, setFile] = useState<File | null>(null);
  const addToast = useToastStore(s => s.addToast);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [videos, subjects] = await Promise.all([
        fetchList(learningAPI.videos.list(), 'Videos', addToast),
        fetchList(subjectsAPI.list(), 'Subjects', addToast)
      ]);
      setItems(videos);
      setSubjects(subjects);
    } catch (err) {
      console.error('Failed to fetch videos data', err);
      addToast('Failed to load videos', 'error');
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
    if (form.video_url) fd.append("video_url", form.video_url);
    if (file) fd.append("video_file", file);

    try {
      if (editingVideo) {
        await learningAPI.videos.update(editingVideo.id, fd);
        addToast("Video lesson updated successfully!");
      } else {
        await learningAPI.videos.create(fd);
        addToast("Video lesson published successfully!");
      }
      setIsAdding(false);
      setEditingVideo(null);
      setForm({ title: "", description: "", subject: "", video_url: "" });
      setFile(null);
      fetchData();
    } catch (err: any) {
      console.error("Failed to save video", err);
      const msg = err.response?.data?.detail || err.response?.data?.error || "Failed to save video";
      addToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this video?")) return;
    try {
      await learningAPI.videos.delete(id);
      setItems(items.filter(i => i.id !== id));
      addToast("Video removed.");
    } catch {
      addToast("Action failed", "error");
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-10 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-[#001f3f] tracking-tight">
               Video Library
            </h1>
            <p className="text-slate-500 font-medium mt-1">
               Publish and manage recorded lessons across the institution.
            </p>
          </div>
          <button 
            onClick={() => {
              if (isAdding || editingVideo) {
                setIsAdding(false);
                setEditingVideo(null);
                setForm({ title: "", description: "", subject: "", video_url: "" });
              } else {
                setIsAdding(true);
              }
            }}
            className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
              (isAdding || editingVideo) ? "bg-slate-100 text-slate-500" : "bg-[#d4af37] text-white shadow-xl shadow-[#d4af37]/20"
            }`}
          >
             {(isAdding || editingVideo) ? "Cancel" : <><Plus className="w-4 h-4" /> Add Lesson</>}
          </button>
        </div>

        <AnimatePresence>
          {(isAdding || editingVideo) && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-[3rem] border-2 border-[#d4af37]/20 p-10 shadow-2xl relative overflow-hidden"
            >
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Video Title</label>
                  <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold focus:border-[#d4af37] outline-none transition-all text-[#001f3f]"
                    placeholder="e.g. Introduction to Calculus"
                    value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Summary</label>
                  <textarea className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold focus:border-[#d4af37] outline-none min-h-[100px] transition-all text-[#001f3f]"
                    placeholder="Briefly explain what students will learn in this video..."
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
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">External Link (YouTube/Vimeo)</label>
                  <input type="url" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold focus:border-[#d4af37] outline-none text-[#001f3f]"
                    placeholder="https://youtube.com/..."
                    value={form.video_url} onChange={e => setForm({...form, video_url: e.target.value})} />
                </div>
                <div className="col-span-2 space-y-2 text-center py-4 border-2 border-dashed border-[#001f3f]/5 rounded-3xl bg-slate-50">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">— OR —</p>
                   <label className="text-[10px] font-black uppercase tracking-widest text-[#001f3f] bg-[#d4af37] px-6 py-2 rounded-lg cursor-pointer hover:bg-opacity-90 transition-all">Upload MP4 File {editingVideo && "(Leave blank to keep current)"}</label>
                   <input type="file" className="hidden" accept="video/*"
                    onChange={e => setFile(e.target.files?.[0] || null)} />
                   {file && <div className="mt-4 text-xs font-bold text-emerald-500">Selected: {file.name}</div>}
                </div>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="col-span-2 bg-[#001f3f] text-white py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-[#001f3f]/20 uppercase tracking-[0.2em] font-black text-xs disabled:opacity-70"
                >
                  {saving ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
                  ) : (
                    <><Video className="w-5 h-5" /> {editingVideo ? "Save Changes" : "Publish Video Lesson"}</>
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
              <div key={item.id} className="bg-white rounded-[2.5rem] border border-[#001f3f]/5 shadow-sm hover:border-[#d4af37]/30 transition-all flex flex-col group relative overflow-hidden">
                <div className="aspect-video bg-[#001f3f] flex items-center justify-center relative overflow-hidden">
                   {item.thumbnail ? (
                     <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                   ) : (
                     <Video className="w-12 h-12 text-white/10 group-hover:scale-125 transition-transform duration-700" />
                   )}
                   <div className="absolute inset-0 bg-[#001f3f]/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 bg-[#d4af37] rounded-full flex items-center justify-center text-[#001f3f] shadow-2xl">
                         <Play className="w-6 h-6 fill-current" />
                      </div>
                   </div>
                </div>
                <div className="p-8 space-y-4 flex flex-col flex-1">
                   <div className="px-3 py-1 bg-[#001f3f]/5 text-[#001f3f] text-[10px] font-black uppercase tracking-widest rounded-lg w-fit">{item.subject_name || `Subject #${item.subject}`}</div>
                   <h3 className="text-xl font-black text-[#001f3f] line-clamp-1">{item.title}</h3>
                   <p className="text-slate-400 text-sm font-medium line-clamp-2 leading-relaxed italic">"{item.description}"</p>
                   
                   <div className="mt-auto pt-6 border-t border-[#001f3f]/5 flex items-center justify-between">
                      <a href={item.video_url || item.video_file} target="_blank" className="flex items-center gap-2 text-[10px] font-black text-[#001f3f] uppercase tracking-widest hover:text-[#d4af37] transition-all">
                         <Play className="w-4 h-4" /> Watch Now
                      </a>
                      <div className="flex items-center gap-2">
                         <button 
                          onClick={() => {
                            setEditingVideo(item);
                            setForm({
                              title: item.title || "",
                              description: item.description || "",
                              subject: item.subject || "",
                              video_url: item.video_url || ""
                            });
                          }}
                          className="p-2 text-slate-400 hover:text-[#d4af37] transition-colors"
                          title="Edit Lesson"
                         >
                            <Edit className="w-4 h-4" />
                         </button>
                         <button onClick={() => handleDelete(item.id)} className="p-2 text-rose-300 hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
