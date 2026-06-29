"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { fetchList } from '@/lib/apiUtils';
import { 
  Mail, 
  Trash2, 
  Phone, 
  CheckCircle2,
  Calendar,
  X,
  Clock,
  ArrowUpRight,
  Inbox
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToastStore } from "@/store/useToastStore";

export default function AdminContactMessages() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const addToast = useToastStore(s => s.addToast);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const list = await fetchList(cmsAPI.contactMessages.list(), 'Contact Messages', addToast);
      setData(list);
    } catch (err) {
      console.error("Failed to fetch contact messages", err);
      addToast("Failed to sync contact messages", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleResolve = async (id: number) => {
    try {
      await cmsAPI.contactMessages.update(id, { status: "resolved" });
      addToast("Message marked as resolved.");
      fetchMessages();
    } catch {
      addToast("Action failed.", "error");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Permanently remove this message?")) return;
    try {
      await cmsAPI.contactMessages.delete(id);
      setData(data.filter(i => i.id !== id));
      addToast("Message purged.");
    } catch {
      addToast("Purge failed.", "error");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-10 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-[#001f3f] tracking-tight flex items-center gap-3">
               <Mail className="w-10 h-10 text-[#d4af37]" />
               Contact Messages
            </h1>
            <p className="text-slate-500 font-medium mt-1">Institutional record of general contact messages sent from the public website.</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {[1,2,3,4].map(i => <div key={i} className="h-96 bg-white rounded-[3rem] animate-pulse border border-[#001f3f]/5"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {data.map((item, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                key={item.id} 
                className={cn(
                  "bg-white p-10 rounded-[3rem] border border-[#001f3f]/5 shadow-sm hover:shadow-2xl transition-all flex flex-col gap-8 relative overflow-hidden group",
                  item.status === 'resolved' ? 'opacity-60 grayscale-[0.5]' : ''
                )}
              >
                 <div className="flex justify-between items-start relative z-10">
                    <div className="w-16 h-16 bg-[#001f3f] text-[#d4af37] rounded-2xl flex items-center justify-center font-black text-2xl shadow-xl shadow-[#001f3f]/10 group-hover:scale-110 transition-transform">
                       {(item.name?.[0] || "?").toUpperCase()}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                       <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{new Date(item.created_at).toLocaleDateString()}</span>
                       {item.status === 'resolved' ? (
                         <div className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-[8px] font-black uppercase tracking-[0.2em]">Resolved</div>
                       ) : (
                         <div className="px-3 py-1 bg-amber-500 text-white rounded-lg text-[8px] font-black uppercase tracking-[0.2em] animate-pulse">{item.status || "New"}</div>
                       )}
                    </div>
                 </div>

                  <div className="relative z-10 space-y-2">
                     <h3 className="text-3xl font-black text-[#001f3f]">{item.name}</h3>
                     <div className="flex items-center gap-3 text-[#d4af37] font-black uppercase tracking-[0.15em] text-[10px]">
                        <ArrowUpRight className="w-3 h-3" />
                        {item.subject || "General Message"}
                     </div>
                  </div>

                  <div className="relative z-10 space-y-4 bg-slate-50 p-6 rounded-[2rem] border border-[#001f3f]/5">
                     <div className="flex items-center gap-4 text-xs font-bold text-[#001f3f]/70"><Phone className="w-4 h-4 text-[#d4af37]" /> {item.phone || "No phone"}</div>
                     <div className="flex items-center gap-4 text-xs font-bold text-[#001f3f]/70"><Mail className="w-4 h-4 text-[#d4af37]" /> {item.email}</div>
                     <div className="pt-6 border-t border-[#001f3f]/10 italic text-slate-400 font-medium leading-relaxed text-sm">
                        "{item.message}"
                     </div>
                  </div>

                  <div className="relative z-10 flex gap-4 mt-auto pt-4">
                     {item.status !== 'resolved' && (
                       <button 
                         onClick={() => handleResolve(item.id)}
                         className="flex-1 bg-emerald-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                       >
                          Resolve
                       </button>
                     )}
                     <button 
                       onClick={() => handleDelete(item.id)}
                       className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all border border-rose-100 shadow-xl shadow-rose-500/10 active:scale-95"
                     >
                        <Trash2 className="w-6 h-6" />
                     </button>
                  </div>

                  <div className="absolute -bottom-10 -right-10 p-10 text-[#001f3f]/[0.02] transform rotate-12 group-hover:rotate-0 transition-transform">
                     <Mail className="w-48 h-48" />
                  </div>
              </motion.div>
            ))}
            {!data.length && (
              <div className="col-span-full py-40 text-center bg-white rounded-[4rem] border-2 border-dashed border-[#001f3f]/5 flex flex-col items-center">
                 <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <Inbox className="w-10 h-10 text-slate-200" />
                 </div>
                 <p className="text-slate-300 font-black uppercase tracking-[0.3em] text-xs italic">No messages</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
