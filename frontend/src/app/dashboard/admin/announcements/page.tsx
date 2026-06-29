"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { communicationAPI, classesAPI } from "@/lib/api";
import { fetchList } from "@/lib/apiUtils";
import { 
  Megaphone, 
  Plus, 
  Trash2, 
  Pin, 
  Clock, 
  Users, 
  Send, 
  Globe, 
  Loader2, 
  X 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToastStore } from "@/store/useToastStore";

export default function AdminAnnouncements() {
  const [data, setData] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ 
    title: "", 
    body: "", 
    audience: "students", 
    classroom: "", 
    pinned: false 
  });
  const [submitting, setSubmitting] = useState(false);
  const addToast = useToastStore(s => s.addToast);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const [aList, cList] = await Promise.all([
        fetchList(communicationAPI.announcements.list(), 'Announcements', addToast),
        fetchList(classesAPI.list(), 'Classes', addToast)
      ]);
      setData(aList);
      setClasses(cList);
    } catch (err) {
      console.error("Failed to fetch announcements", err);
      addToast("Failed to sync communication stream", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      ...form,
      classroom: form.classroom || null
    };
    try {
      await communicationAPI.announcements.create(payload);
      addToast("Announcement broadcasted successfully.");
      setIsAdding(false);
      setForm({ title: "", body: "", audience: "students", classroom: "", pinned: false });
      fetchAnnouncements();
    } catch (err: any) {
      console.error("Broadcast failed", err);
      let msg = "Broadcast failed.";
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
    if (!confirm("Remove this announcement?")) return;
    try {
      await communicationAPI.announcements.delete(id);
      setData(prev => prev.filter(a => a.id !== id));
      addToast("Announcement retracted.");
    } catch {
      addToast("Action failed", "error");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-10 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-[#001f3f] tracking-tight flex items-center gap-3">
               <Megaphone className="w-10 h-10 text-[#d4af37]" />
               Broadcast Center
            </h1>
            <p className="text-slate-500 font-medium mt-1">Communicate with students, staff, and parents across the entire school network.</p>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-[#001f3f] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-[#001f3f]/20 hover:scale-105 transition-all active:scale-95"
          >
             <Plus className="w-4 h-4" /> New Announcement
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             {Array(4).fill(0).map((_, i) => <div key={i} className="h-64 bg-white rounded-[3rem] animate-pulse border border-slate-100" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {data.map((item, i) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                key={item.id} 
                className="bg-white p-10 rounded-[3.5rem] border border-[#001f3f]/5 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:border-[#d4af37]/30 transition-all flex flex-col"
              >
                 <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                       <div className="px-3 py-1 bg-[#d4af37]/10 text-[#d4af37] text-[9px] font-black uppercase tracking-widest rounded-lg border border-[#d4af37]/20">
                          {item.audience}
                       </div>
                       {item.pinned && <Pin className="w-4 h-4 text-[#d4af37] fill-current" />}
                    </div>
                    <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-200 hover:text-rose-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                 </div>

                 <h3 className="text-2xl font-black text-[#001f3f] mb-4 group-hover:text-[#d4af37] transition-colors">{item.title}</h3>
                 <p className="text-slate-500 font-medium text-sm leading-relaxed mb-10 line-clamp-3 italic">"{item.body}"</p>

                 <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                       <Clock className="w-4 h-4 text-[#d4af37]" />
                       {new Date(item.published_at || item.created_at).toLocaleDateString()}
                    </div>
                    {item.classroom_name && (
                       <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black text-[#001f3f] uppercase tracking-widest">
                          <Users className="w-3 h-3 text-[#d4af37]" /> {item.classroom_name}
                       </div>
                    )}
                 </div>
                 
                 <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#d4af37]/5 rounded-full blur-2xl group-hover:bg-[#d4af37]/10 transition-colors" />
              </motion.div>
            ))}
            {!data.length && (
              <div className="col-span-full py-40 text-center bg-white rounded-[4rem] border-2 border-dashed border-[#001f3f]/5 flex flex-col items-center">
                 <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <Megaphone className="w-10 h-10 text-slate-200" />
                  </div>
                 <p className="text-slate-300 font-black uppercase tracking-widest text-xs italic">No active broadcasts.</p>
              </div>
            )}
          </div>
        )}

        {/* Modal */}
        <AnimatePresence>
          {isAdding && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#001f3f]/60 backdrop-blur-md">
               <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-[3rem] p-12 max-w-4xl w-full shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-12"
               >
                  <div className="flex-1 space-y-8">
                     <div>
                        <h3 className="text-3xl font-black text-[#001f3f]">Create Broadcast</h3>
                        <p className="text-slate-400 font-medium mt-1 italic">Publish important updates or reminders to the school network.</p>
                     </div>

                     <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1 col-span-2">
                           <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Announcement Title</label>
                           <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-[#d4af37]"
                             value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Schedule Update for Finals" />
                        </div>
                        <div className="space-y-1 col-span-2">
                           <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Message Content</label>
                           <textarea required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-[#d4af37] min-h-[120px]"
                             value={form.body} onChange={e => setForm({...form, body: e.target.value})} placeholder="Type your announcement here..." />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Target Audience</label>
                           <select required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-[#d4af37] appearance-none"
                             value={form.audience} onChange={e => setForm({...form, audience: e.target.value})}>
                              <option value="all">All School</option>
                              <option value="students">All Students</option>
                              <option value="classroom">Specific Class</option>
                           </select>
                        </div>
                        {form.audience === 'classroom' && (
                           <div className="space-y-1">
                              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Select Class</label>
                              <select required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-[#d4af37] appearance-none"
                                value={form.classroom} onChange={e => setForm({...form, classroom: e.target.value})}>
                                 <option value="">-- Choose Class --</option>
                                 {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                              </select>
                           </div>
                        )}
                        <div className="md:col-span-2 flex items-center gap-3 py-4">
                           <input type="checkbox" id="pin" className="w-5 h-5 rounded accent-[#d4af37]" checked={form.pinned} onChange={e => setForm({...form, pinned: e.target.checked})} />
                           <label htmlFor="pin" className="text-xs font-black uppercase text-[#001f3f] tracking-widest cursor-pointer">Pin to top of feed</label>
                        </div>
                        <div className="md:col-span-2 pt-6 flex gap-4">
                           <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-4 font-black uppercase text-slate-300 text-xs tracking-widest">Cancel</button>
                           <button type="submit" disabled={submitting} className="flex-[2] bg-[#001f3f] text-white py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-[#001f3f]/20 flex items-center justify-center gap-3 active:scale-95 transition-all">
                              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Publish Broadcast</>}
                           </button>
                        </div>
                     </form>
                  </div>

                  <div className="hidden md:block w-72 bg-[#001f3f] rounded-[2.5rem] p-10 text-white relative overflow-hidden flex flex-col justify-center text-center">
                     <div className="relative z-10 space-y-6">
                        <Globe className="w-12 h-12 text-[#d4af37] mx-auto" />
                        <h4 className="text-2xl font-black italic text-[#d4af37]">Instant Sync</h4>
                        <p className="text-white/40 text-[10px] leading-relaxed font-black uppercase tracking-[0.15em]">Published announcements are immediately pushed to student dashboards and mobile app notifications.</p>
                     </div>
                     <div className="absolute top-0 right-0 w-40 h-40 bg-[#d4af37]/5 rounded-full blur-3xl"></div>
                  </div>

                  <button onClick={() => setIsAdding(false)} className="absolute top-8 right-8 text-slate-300 hover:text-[#001f3f] transition-all"><X className="w-6 h-6" /></button>
               </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
