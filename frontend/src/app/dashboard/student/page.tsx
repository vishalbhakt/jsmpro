"use client";

import { useAuthStore } from "@/store/useAuthStore";
import DashboardLayout from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import { dashboardAPI } from "@/lib/api";
import { 
  CheckCircle2, 
  Clock, 
  CreditCard,
  Bell,
  Calendar,
  ArrowRight,
  TrendingUp,
  FileText,
  Zap,
  GraduationCap,
  BookOpen,
  ArrowUpRight,
  Target
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function StudentOverview() {
  const { user } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardAPI.stats();
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch student metrics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-12 pb-20">
        {/* Scholar Branding Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-6">
            <div className="w-20 h-20 bg-[#001f3f] rounded-[2rem] flex items-center justify-center text-[#d4af37] font-black text-3xl shadow-2xl shadow-[#001f3f]/20 border-4 border-white relative">
               {user.username?.[0].toUpperCase()}
               <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white animate-pulse" />
            </div>
            <div>
               <h1 className="text-4xl font-black text-[#001f3f] tracking-tight">Hi, {user.first_name || user.username} 👋</h1>
               <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="bg-[#d4af37] text-[#001f3f] text-[10px] px-3 py-1 rounded-full uppercase tracking-widest font-black">Student</span>
                  <span className="text-slate-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                     <GraduationCap className="w-4 h-4 text-[#d4af37]" /> {user.profile?.classroom_name || "Unassigned Batch"}
                  </span>
               </div>
            </div>
          </motion.div>
          
          <div className="flex items-center gap-4">
             <div className="bg-white border border-slate-200 rounded-2xl px-6 py-3 shadow-sm flex items-center gap-3">
                <Calendar className="w-4 h-4 text-[#d4af37]" />
                <span className="text-xs font-black text-[#001f3f] uppercase tracking-widest">
                  {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
                </span>
             </div>
          </div>
        </div>

        {/* Operational Analytics */}
        <section className="space-y-8">
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="h-44 bg-white rounded-[2rem] animate-pulse border border-slate-100" />
                ))
              ) : (
                data?.stats?.map((stat: any, index: number) => (
                  <MetricCard 
                    key={index}
                    icon={getStudentIcon(stat.label)}
                    label={stat.label}
                    value={stat.value}
                    trend={stat.trend}
                    color={stat.color || "blue"}
                    index={index}
                  />
                ))
              )}
           </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           {/* Activity & Updates */}
           <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-[3rem] border border-[#001f3f]/5 shadow-xl shadow-slate-200/50 p-10 relative overflow-hidden group">
                 <div className="flex items-center justify-between mb-10">
                    <h3 className="text-2xl font-black text-[#001f3f]">Latest Updates</h3>
                    <Bell className="w-6 h-6 text-[#d4af37] animate-bounce" />
                 </div>
                 
                 <div className="space-y-6">
                    {data?.today?.map((event: any, i: number) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        key={i} 
                        className="p-6 bg-slate-50 rounded-[2rem] border border-transparent hover:border-[#d4af37]/30 hover:bg-white hover:shadow-xl transition-all cursor-default group/item flex items-center justify-between"
                      >
                         <div className="flex items-start gap-5">
                            <div className="w-14 h-14 bg-[#001f3f] rounded-2xl flex items-center justify-center text-[#d4af37] shadow-lg shadow-[#001f3f]/10 shrink-0">
                               {event[0] === 'Alert' ? <Zap className="w-6 h-6 fill-current" /> : <Bell className="w-6 h-6" />}
                            </div>
                            <div>
                               <div className="text-[10px] font-black uppercase tracking-widest text-[#d4af37] mb-1">{event[0]}</div>
                               <h4 className="font-black text-[#001f3f] leading-tight text-lg group-hover/item:text-[#d4af37] transition-colors">{event[1]}</h4>
                               <div className="flex items-center gap-2 mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                  <Clock className="w-3 h-3" /> Just now
                               </div>
                            </div>
                         </div>
                         <ArrowUpRight className="w-6 h-6 text-slate-200 group-hover/item:text-[#d4af37] transition-all" />
                      </motion.div>
                    ))}
                    {!data?.today?.length && !loading && (
                      <div className="py-20 text-center space-y-4">
                         <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto shadow-inner">
                            <Bell className="w-6 h-6 text-slate-200" />
                         </div>
                         <p className="text-xs font-black uppercase text-slate-300 tracking-[0.2em]">No new broadcasts</p>
                      </div>
                    )}
                 </div>
              </div>

              {/* Weekly Learning Progress */}
              <div className="bg-[#001f3f] rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden h-64 flex items-center">
                 <div className="relative z-10 flex-1 space-y-4">
                    <h3 className="text-3xl font-black italic text-[#d4af37]">Scholar Status</h3>
                    <p className="text-white/40 font-medium max-w-sm leading-relaxed">Your academic consistency is monitored in real-time. Keep completing tasks to maintain your rank.</p>
                    <div className="flex items-center gap-8 pt-4">
                       <div>
                          <div className="text-2xl font-black text-white">92%</div>
                          <div className="text-[9px] font-black uppercase tracking-widest text-[#d4af37]">Consistency</div>
                       </div>
                       <div className="w-px h-10 bg-white/10" />
                       <div>
                          <div className="text-2xl font-black text-white">#04</div>
                          <div className="text-[9px] font-black uppercase tracking-widest text-[#d4af37]">Global Rank</div>
                       </div>
                    </div>
                 </div>
                 <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37]/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
                 <Target className="absolute -bottom-8 -right-8 w-48 h-48 text-[#d4af37]/5 rotate-12" />
              </div>
           </div>

           {/* Performance Sidebar */}
           <div className="space-y-8">
              <div className="bg-white rounded-[3rem] border border-[#001f3f]/5 shadow-xl shadow-slate-200/50 p-10 space-y-8 flex flex-col justify-center">
                 <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-[#001f3f]">Performance</h3>
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                 </div>
                 
                 <div className="space-y-8">
                    {data?.performance?.map((p: any, i: number) => (
                      <div key={i} className="space-y-3">
                         <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{p.name} Score</span>
                            <span className="font-black text-[#001f3f] text-sm">{p.results}%</span>
                         </div>
                         <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                            <motion.div 
                              initial={{ width: 0 }} animate={{ width: `${p.results}%` }} transition={{ duration: 1, delay: i * 0.1 }}
                              className="h-full bg-[#d4af37] rounded-full shadow-[0_0_10px_rgba(212,175,55,0.3)]" 
                            />
                         </div>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="bg-[#d4af37] rounded-[3rem] p-10 text-[#001f3f] shadow-2xl relative overflow-hidden flex flex-col justify-between h-72 group">
                 <div className="relative z-10 space-y-4">
                    <BookOpen className="w-10 h-10" />
                    <h3 className="text-2xl font-black italic">Next Assessment</h3>
                    <p className="font-black uppercase tracking-widest text-[10px] opacity-60">Calculus Finals • June 22, 2026</p>
                 </div>
                 <button className="relative z-10 w-full bg-[#001f3f] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-[#001f3f]/20 hover:scale-[1.02] active:scale-95 transition-all">
                    Prepare Now <ArrowRight className="w-4 h-4 ml-2 inline" />
                 </button>
                 <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#001f3f]/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
              </div>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function getStudentIcon(label: string) {
  const l = label.toLowerCase();
  if (l.includes("task") || l.includes("assignment")) return FileText;
  if (l.includes("fee") || l.includes("due")) return CreditCard;
  if (l.includes("attendance")) return CheckCircle2;
  return Target;
}

function MetricCard({ icon: Icon, label, value, trend, color, index }: any) {
  const colors: any = {
    blue: "bg-blue-500 text-blue-500",
    emerald: "bg-emerald-500 text-emerald-500",
    amber: "bg-amber-500 text-amber-500",
    rose: "bg-rose-500 text-rose-500",
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:border-[#d4af37]/40 hover:shadow-2xl transition-all relative overflow-hidden h-48 flex flex-col justify-between"
    >
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner", colors[color].split(' ')[0] + "/10", colors[color].split(' ')[1])}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <div className="text-4xl font-black text-[#001f3f] tracking-tight">{value}</div>
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">{label}</div>
        {trend && (
           <div className="mt-3 text-[9px] font-black text-[#d4af37] uppercase tracking-[0.1em] bg-[#d4af37]/5 px-2 py-0.5 rounded w-fit italic">
              {trend}
           </div>
        )}
      </div>
      <Icon className="absolute -top-4 -right-4 w-28 h-28 text-[#001f3f]/[0.02] -rotate-12 group-hover:rotate-0 group-hover:text-[#d4af37]/5 transition-all duration-700" />
    </motion.div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
