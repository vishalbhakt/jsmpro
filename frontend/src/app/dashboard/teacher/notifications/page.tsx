"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { communicationAPI } from "@/lib/api";
import { 
  Bell, 
  Search, 
  Trash2, 
  CheckCircle2,
  Calendar,
  X,
  Clock,
  Inbox,
  AlertCircle,
  Info,
  Zap,
  MoreVertical
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToastStore } from "@/store/useToastStore";

export default function TeacherNotifications() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const addToast = useToastStore(s => s.addToast);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await communicationAPI.notifications.list();
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
      addToast("Failed to sync alerts", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await communicationAPI.notifications.update(id, { read_at: new Date().toISOString() });
      setData(data.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
    } catch {
      addToast("Update failed", "error");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await communicationAPI.notifications.delete(id);
      setData(data.filter(n => n.id !== id));
      addToast("Alert dismissed.");
    } catch {
      addToast("Action failed", "error");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-10 pb-20 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-[#001f3f] tracking-tight flex items-center gap-3">
               <Bell className="w-10 h-10 text-[#d4af37]" />
               Alert Center
            </h1>
            <p className="text-slate-500 font-medium mt-1">Institutional notifications, system alerts, and academic reminders.</p>
          </div>
          <button className="text-[10px] font-black uppercase tracking-widest text-[#001f3f] hover:text-[#d4af37] transition-all">Mark all as read</button>
        </div>

        {loading ? (
          <div className="space-y-4">
             {Array(5).fill(0).map((_, i) => <div key={i} className="h-24 bg-white rounded-3xl animate-pulse border border-slate-100" />)}
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((item, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                key={item.id} 
                className={cn(
                  "bg-white p-6 rounded-[2rem] border transition-all flex items-center gap-6 group relative overflow-hidden",
                  item.read_at ? 'border-[#001f3f]/5 opacity-60' : 'border-[#d4af37]/30 shadow-lg shadow-[#d4af37]/5'
                )}
              >
                 <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-all group-hover:scale-110",
                    item.category === 'academic' ? "bg-blue-50 text-blue-500" :
                    item.category === 'system' ? "bg-rose-50 text-rose-500" :
                    "bg-[#d4af37]/10 text-[#d4af37]"
                 )}>
                    {item.category === 'academic' ? <Zap className="w-6 h-6" /> :
                     item.category === 'system' ? <AlertCircle className="w-6 h-6" /> :
                     <Info className="w-6 h-6" />}
                 </div>

                 <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                       <h3 className="font-black text-[#001f3f] truncate">{item.title}</h3>
                       {!item.read_at && <div className="w-2 h-2 bg-[#d4af37] rounded-full animate-pulse" />}
                    </div>
                    <p className="text-slate-500 text-sm font-medium line-clamp-1">{item.message}</p>
                    <div className="flex items-center gap-3 mt-2">
                       <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {new Date(item.created_at).toLocaleString()}
                       </span>
                    </div>
                 </div>

                 <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!item.read_at && (
                      <button onClick={() => handleMarkRead(item.id)} className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"><CheckCircle2 className="w-4 h-4" /></button>
                    )}
                    <button onClick={() => handleDelete(item.id)} className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-600 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
                 </div>
                 
                 <div className="absolute top-0 right-0 p-4 pointer-events-none opacity-[0.02]">
                    <Bell className="w-16 h-16 rotate-12" />
                 </div>
              </motion.div>
            ))}
            {!data.length && (
              <div className="py-40 text-center bg-white rounded-[3rem] border-2 border-dashed border-[#001f3f]/5 flex flex-col items-center">
                 <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <Inbox className="w-10 h-10 text-slate-200" />
                 </div>
                 <p className="text-slate-300 font-black uppercase tracking-widest text-xs italic">Clear Inbox</p>
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
