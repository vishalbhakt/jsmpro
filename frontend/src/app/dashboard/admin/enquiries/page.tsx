"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import api, { enquiriesAPI } from "@/lib/api";
import { 
  MessageSquare, 
  Trash2, 
  Mail, 
  Phone, 
  CheckCircle2,
  Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToastStore } from "@/store/useToastStore";

export default function AdminEnquiries() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const addToast = useToastStore(s => s.addToast);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const res = await enquiriesAPI.list();
      setData(res.data.data);
    } catch {
      addToast("Failed to fetch enquiries", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleResolve = async (id: number) => {
    try {
      await enquiriesAPI.update(id, { is_resolved: true });
      addToast("Enquiry marked as resolved.");
      fetchEnquiries();
    } catch {
      addToast("Action failed.", "error");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Remove this enquiry permanently?")) return;
    try {
      await enquiriesAPI.delete(id);
      setData(data.filter(i => i.id !== id));
      addToast("Enquiry deleted.");
    } catch {
      addToast("Delete failed.", "error");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-10 pb-20">
        <div>
          <h1 className="text-4xl font-black text-navy tracking-tight">Admission Inbox</h1>
          <p className="text-slate-500 font-medium mt-1">Review and manage incoming enquiries from prospective parents.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {[1,2,3,4].map(i => <div key={i} className="h-64 bg-white rounded-[3rem] animate-pulse border border-navy/5"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {data.map((item) => (
              <div key={item.id} className={`bg-white p-10 rounded-[3rem] border border-navy/5 shadow-sm hover:shadow-2xl transition-all flex flex-col gap-8 relative overflow-hidden group ${item.is_resolved ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                 <div className="flex justify-between items-start relative z-10">
                    <div className="w-14 h-14 bg-gold/10 text-gold rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-gold/5">
                       {item.target_class[0]}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                       <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{new Date(item.created_at).toLocaleDateString()}</span>
                       {item.is_resolved && (
                         <div className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-[8px] font-black uppercase tracking-[0.2em]">Resolved</div>
                       )}
                    </div>
                 </div>

                 <div className="relative z-10 space-y-2">
                    <h3 className="text-2xl font-black text-navy">{item.student_name}</h3>
                    <p className="text-gold font-black uppercase tracking-[0.15em] text-xs">Target: {item.target_class}</p>
                 </div>

                 <div className="relative z-10 space-y-4 bg-slate-50 p-6 rounded-[2rem] border border-navy/5">
                    <div className="flex items-center gap-3 text-sm font-bold text-navy/70"><Phone className="w-4 h-4 text-gold" /> {item.phone}</div>
                    <div className="flex items-center gap-3 text-sm font-bold text-navy/70"><Mail className="w-4 h-4 text-gold" /> {item.parent_name}</div>
                    <div className="pt-4 border-t border-navy/5 italic text-slate-400 font-medium leading-relaxed">
                       "{item.message}"
                    </div>
                 </div>

                 <div className="relative z-10 flex gap-4 mt-auto">
                    {!item.is_resolved && (
                      <button 
                        onClick={() => handleResolve(item.id)}
                        className="flex-1 bg-emerald-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20"
                      >
                         Mark Resolved
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all border border-rose-100 shadow-xl shadow-rose-500/10"
                    >
                       <Trash2 className="w-6 h-6" />
                    </button>
                 </div>

                 <div className="absolute -bottom-10 -right-10 p-10 text-navy/5 transform rotate-12 group-hover:rotate-0 transition-transform">
                    <MessageSquare className="w-32 h-32" />
                 </div>
              </div>
            ))}
            {!data.length && (
              <div className="col-span-full py-40 text-center bg-white rounded-[3rem] border-2 border-dashed border-navy/5 flex flex-col items-center">
                 <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <MessageSquare className="w-10 h-10 text-slate-200" />
                 </div>
                 <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Your inbox is clean. No new inquiries.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
