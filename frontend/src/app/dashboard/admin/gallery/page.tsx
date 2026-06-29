"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { cmsAPI } from "@/lib/api";
import { 
  ImageIcon, 
  Search, 
  Plus, 
  Trash2, 
  Edit, 
  Filter,
  Download,
  Camera,
  X,
  Maximize2,
  Zap,
  Globe
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToastStore } from "@/store/useToastStore";

export default function AdminGallery() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ title: "", category: "events", image: null as File | null });
  const [submitting, setSubmitting] = useState(false);
  const addToast = useToastStore(s => s.addToast);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const list = await fetchList(cmsAPI.gallery.list(), 'Gallery', addToast);
      setData(list);
    } catch (err) {
      console.error("Failed to fetch gallery", err);
      addToast("Failed to sync media vault", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.image) return;
    setSubmitting(true);
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("category", form.category);
    fd.append("image", form.image);

    try {
      await cmsAPI.gallery.create(fd);
      addToast("Media asset published to public gallery.");
      setIsAdding(false);
      setForm({ title: "", category: "events", image: null });
      fetchGallery();
    } catch (err: any) {
      console.error("Upload failed", err);
      addToast("Upload failed.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Permanently delete this media asset?")) return;
    try {
      await cmsAPI.gallery.delete(id);
      setData(data.filter(i => i.id !== id));
      addToast("Asset removed.");
    } catch {
      addToast("Purge failed.", "error");
    }
  };

  const filteredData = data.filter(i => 
    i.title?.toLowerCase().includes(search.toLowerCase()) ||
    i.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-10 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-[#001f3f] tracking-tight flex items-center gap-3">
               <Camera className="w-10 h-10 text-[#d4af37]" />
               Media Vault
            </h1>
            <p className="text-slate-500 font-medium mt-1">Manage institutional image assets and public-facing activity galleries.</p>
          </div>
          <div className="flex gap-4">
             <button 
              onClick={() => setIsAdding(true)}
              className="bg-[#001f3f] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-[#001f3f]/20 hover:scale-105 transition-all active:scale-95"
             >
                <Plus className="w-4 h-4" /> Upload Asset
             </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-[2rem] border border-[#001f3f]/5 shadow-sm flex flex-col md:flex-row gap-4 items-center">
           <div className="relative flex-1 group w-full">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#d4af37] transition-all" />
              <input 
                placeholder="Search gallery by title or category..."
                className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-[#d4af37]/20 rounded-xl pl-12 pr-4 py-3.5 text-sm font-bold text-[#001f3f] outline-none transition-all"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
           </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
             {Array(8).fill(0).map((_, i) => <div key={i} className="aspect-square bg-white rounded-[2.5rem] animate-pulse border border-slate-100" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredData.map((item, i) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                key={item.id} 
                className="group relative aspect-square bg-white rounded-[2.5rem] overflow-hidden border border-[#001f3f]/5 shadow-lg hover:shadow-2xl transition-all"
              >
                 <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                 <div className="absolute inset-0 bg-gradient-to-t from-[#001f3f] via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                 
                 <div className="absolute inset-0 p-8 flex flex-col justify-end text-white translate-y-4 group-hover:translate-y-0 transition-transform">
                    <div className="text-[8px] font-black uppercase tracking-[0.3em] text-[#d4af37] mb-1">{item.category}</div>
                    <h4 className="font-black text-lg leading-tight line-clamp-2">{item.title}</h4>
                    
                    <div className="mt-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                       <button className="flex-1 bg-white/20 backdrop-blur-md text-white p-3 rounded-xl hover:bg-[#d4af37] hover:text-[#001f3f] transition-all"><Maximize2 className="w-4 h-4 mx-auto" /></button>
                       <button onClick={() => handleDelete(item.id)} className="flex-1 bg-rose-500 text-white p-3 rounded-xl hover:bg-rose-600 transition-all"><Trash2 className="w-4 h-4 mx-auto" /></button>
                    </div>
                 </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Upload Modal */}
        <AnimatePresence>
          {isAdding && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#001f3f]/60 backdrop-blur-md">
               <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-[3rem] p-12 max-w-4xl w-full shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-12"
               >
                  <div className="flex-1 space-y-8">
                     <div>
                        <h3 className="text-3xl font-black text-[#001f3f]">Publish Media</h3>
                        <p className="text-slate-400 font-medium mt-1 italic">Add new institutional captures to the digital vault.</p>
                     </div>

                     <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1 col-span-2">
                           <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Asset Title</label>
                           <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-[#d4af37]"
                             value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Annual Sports Day 2026" />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Category</label>
                           <select required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-[#d4af37] appearance-none"
                             value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                              <option value="events">Events</option>
                              <option value="classroom">Classroom</option>
                              <option value="sports">Sports</option>
                              <option value="competitions">Competitions</option>
                              <option value="infrastructure">Infrastructure</option>
                           </select>
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Image File</label>
                           <input required type="file" accept="image/*" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-2.5 font-bold outline-none focus:border-[#d4af37] text-xs"
                             onChange={e => setForm({...form, image: e.target.files?.[0] || null})} />
                        </div>
                        <div className="md:col-span-2 pt-6 flex gap-4">
                           <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-4 font-black uppercase text-slate-300 text-xs tracking-widest">Cancel</button>
                           <button type="submit" disabled={submitting} className="flex-[2] bg-[#001f3f] text-white py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-[#001f3f]/20 flex items-center justify-center gap-3 active:scale-95 transition-all">
                              {submitting ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : "Publish Asset"}
                           </button>
                        </div>
                     </form>
                  </div>

                  <div className="hidden md:block w-72 bg-[#001f3f] rounded-[2.5rem] p-10 text-white relative overflow-hidden text-center flex flex-col justify-center">
                     <div className="relative z-10 space-y-6">
                        <Globe className="w-12 h-12 text-[#d4af37] mx-auto animate-pulse" />
                        <h4 className="text-2xl font-black italic text-[#d4af37]">Global Reach</h4>
                        <p className="text-white/40 text-[10px] leading-relaxed font-black uppercase tracking-[0.15em]">Media published here is visible to all prospective parents and global visitors on the institutional website.</p>
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
