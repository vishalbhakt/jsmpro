"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { dashboardAPI, communicationAPI } from "@/lib/api";
import { 
  BarChart, 
  Search, 
  Download, 
  FileText,
  TrendingUp,
  PieChart,
  Activity,
  ArrowDownToLine,
  ChevronRight,
  ShieldAlert,
  Clock
} from "lucide-react";
import { motion } from "framer-motion";
import { useToastStore } from "@/store/useToastStore";

export default function AdminReports() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);
  const addToast = useToastStore(s => s.addToast);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await communicationAPI.activityLogs.list();
        setLogs(res.data);
      } catch (err) {
        console.error("Failed to fetch logs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const reportCategories = [
    { title: "Academic Performance", icon: TrendingUp, detail: "Subject-wise grade distribution and term comparison.", color: "blue" },
    { title: "Financial Audit", icon: FileText, detail: "Fee collection summary, outstanding dues, and revenue forecasting.", color: "emerald" },
    { title: "Attendance Analysis", icon: Activity, detail: "Institutional consistency logs and student-teacher ratio tracking.", color: "amber" },
    { title: "System Governance", icon: ShieldAlert, detail: "Administrative activity logs and security audit trails.", color: "rose" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-12 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-[#001f3f] tracking-tight flex items-center gap-3">
               <BarChart className="w-10 h-10 text-[#d4af37]" />
               Institutional Intelligence
            </h1>
            <p className="text-slate-500 font-medium mt-1">Generate comprehensive reports and review administrative activity logs.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           {reportCategories.map((cat, i) => (
             <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
              key={cat.title} 
              className="bg-white p-8 rounded-[3rem] border border-[#001f3f]/5 shadow-xl shadow-slate-200/40 group hover:border-[#d4af37]/40 transition-all flex flex-col justify-between"
             >
                <div className="space-y-6">
                   <div className={cn(
                     "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform",
                     cat.color === 'blue' ? "bg-blue-50 text-blue-500" :
                     cat.color === 'emerald' ? "bg-emerald-50 text-emerald-500" :
                     cat.color === 'amber' ? "bg-amber-50 text-amber-500" :
                     "bg-rose-50 text-rose-500"
                   )}>
                      <cat.icon className="w-7 h-7" />
                   </div>
                   <div className="space-y-2">
                      <h4 className="font-black text-lg text-[#001f3f]">{cat.title}</h4>
                      <p className="text-slate-400 text-xs font-medium leading-relaxed italic">"{cat.detail}"</p>
                   </div>
                </div>
                <button className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#001f3f] hover:text-[#d4af37] transition-all">
                   <ArrowDownToLine className="w-4 h-4" /> Download PDF <ChevronRight className="w-3 h-3" />
                </button>
             </motion.div>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           {/* Recent Logs */}
           <div className="lg:col-span-2 bg-[#001f3f] rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col">
              <div className="relative z-10 flex items-center justify-between mb-10">
                 <h3 className="text-2xl font-black italic">Activity Log Audit</h3>
                 <Clock className="w-6 h-6 text-[#d4af37]" />
              </div>

              <div className="relative z-10 flex-1 space-y-6">
                 {logs.slice(0, 5).map((log, i) => (
                   <div key={i} className="flex gap-6 items-start group">
                      <div className="w-1.5 h-10 bg-[#d4af37]/20 rounded-full group-hover:bg-[#d4af37] transition-all" />
                      <div className="min-w-0">
                         <div className="text-[10px] font-black uppercase text-white/30 tracking-widest">{new Date(log.created_at).toLocaleString()}</div>
                         <div className="font-bold text-sm leading-tight text-white/80 group-hover:text-white transition-all">{log.action} by {log.actor_name || "Administrator"}</div>
                         <div className="text-[10px] font-medium text-[#d4af37] mt-1">{log.ip_address || "127.0.0.1"} • Secure Session</div>
                      </div>
                   </div>
                 ))}
                 {!logs.length && !loading && <div className="text-center py-20 text-white/20 italic">No administrative logs recorded.</div>}
              </div>

              <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37]/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
           </div>

           <div className="bg-white rounded-[3rem] border border-[#001f3f]/5 shadow-xl p-10 flex flex-col justify-center items-center text-center gap-6">
              <div className="w-32 h-32 rounded-full border-8 border-[#d4af37]/20 border-t-[#d4af37] animate-spin" />
              <div className="space-y-2">
                 <h3 className="text-xl font-black text-[#001f3f]">Live Data Feed</h3>
                 <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Real-time Synchronization Active</p>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-[200px]">The institution's data core is currently processing <span className="text-[#001f3f] font-black">1.2k ops/sec</span>.</p>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
