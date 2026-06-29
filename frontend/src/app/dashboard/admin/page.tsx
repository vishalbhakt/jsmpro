"use client";
import { useAuthStore } from "@/store/useAuthStore";
import DashboardLayout from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import { dashboardAPI } from "@/lib/api";
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  UserCheck, 
  TrendingUp,
  BarChart3,
  Calendar,
  Settings,
  ArrowUpRight,
  Clock,
  MessageSquare,
  ClipboardList,
  Activity,
  Zap,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Search,
  Filter,
  BarChart,
  Send,
  CreditCard,
  Bell
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function AdminOverview() {
  const { user } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardAPI.stats();
        setData(res.data);
      } catch (err) {
        console.error("Stats fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

// Auth guard removed; DashboardLayout handles authentication

  return (
    <DashboardLayout>
      <div className="space-y-12 pb-20">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-5xl font-black text-[#001f3f] tracking-tight flex items-center gap-4">
               Dashboard
               <span className="bg-[#d4af37]/10 text-[#d4af37] text-[10px] px-3 py-1 rounded-full uppercase tracking-[0.2em] font-black border border-[#d4af37]/20">v2.4 Live</span>
            </h1>
            <p className="text-slate-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Real-time Academy Intelligence & Control</p>
          </motion.div>
          
          <div className="flex items-center gap-4">
             <div className="hidden lg:flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-6 py-3 shadow-sm">
                <Clock className="w-4 h-4 text-[#d4af37]" />
                <span className="text-xs font-black text-[#001f3f] uppercase tracking-widest">
                  System Uptime: 99.9%
                </span>
             </div>
             <button className="bg-[#001f3f] text-white p-4 rounded-2xl shadow-xl shadow-[#001f3f]/20 hover:scale-110 transition-all active:scale-95">
                <Filter className="w-5 h-5" />
             </button>
          </div>
        </div>

        {/* Academy Operations Section */}
        <section className="space-y-8">
           <div>
              <h2 className="text-2xl font-black text-[#001f3f] tracking-tight">Academy Operations</h2>
              <p className="text-slate-500 font-medium text-sm">Monitor users, attendance, fees, and academic performance metrics.</p>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              {loading ? (
                Array(6).fill(0).map((_, i) => (
                  <div key={i} className="h-44 bg-white rounded-[2rem] animate-pulse border border-slate-100" />
                ))
              ) : (
                data?.stats?.map((stat: any, index: number) => (
                  <OpCard 
                    key={index}
                    icon={getIcon(stat.label)}
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

        {/* Analytics & Today Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           {/* Performance Trend */}
           <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-[3rem] border border-[#001f3f]/5 shadow-xl shadow-slate-200/50 p-10 relative overflow-hidden group">
                 <div className="flex items-center justify-between mb-12">
                    <div>
                       <h3 className="text-2xl font-black text-[#001f3f]">Performance Trend</h3>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Attendance, Result, and Fee Signals</p>
                    </div>
                    <div className="flex gap-2">
                       {['Week', 'Month', 'Term'].map(t => (
                         <button key={t} className={cn(
                           "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                           t === 'Month' ? "bg-[#001f3f] text-white shadow-lg" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                         )}>{t}</button>
                       ))}
                    </div>
                 </div>

                 {/* Custom SVG Chart */}
                 <div className="h-72 w-full relative flex items-end justify-between px-4">
                    {loading ? (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-300 font-bold uppercase tracking-widest text-xs">Synchronizing Data...</div>
                    ) : (
                      <>
                         <div className="absolute inset-0 flex flex-col justify-between py-2 px-4 pointer-events-none">
                            {[100, 75, 50, 25, 0].map(v => (
                               <div key={v} className="border-t border-slate-100 w-full flex items-start">
                                  <span className="text-[8px] font-black text-slate-300 -mt-2.5">{v}%</span>
                               </div>
                            ))}
                         </div>
                         <div className="flex-1 flex items-end justify-around relative z-10 h-full pt-10">
                            {data?.performance?.map((p: any, i: number) => (
                               <div key={i} className="flex flex-col items-center gap-4 group/bar w-full">
                                  <div className="flex items-end gap-1.5 h-48">
                                     <motion.div 
                                      initial={{ height: 0 }} animate={{ height: `${p.attendance}%` }} transition={{ delay: i * 0.1 }}
                                      className="w-3 bg-[#d4af37] rounded-full relative group"
                                     >
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Att: {p.attendance}%</div>
                                     </motion.div>
                                     <motion.div 
                                      initial={{ height: 0 }} animate={{ height: `${p.results}%` }} transition={{ delay: i * 0.1 + 0.2 }}
                                      className="w-3 bg-[#001f3f] rounded-full relative group"
                                     >
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Res: {p.results}%</div>
                                     </motion.div>
                                     <motion.div 
                                      initial={{ height: 0 }} animate={{ height: `${p.fees}%` }} transition={{ delay: i * 0.1 + 0.4 }}
                                      className="w-3 bg-emerald-400 rounded-full relative group"
                                     >
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Fees: {p.fees}%</div>
                                     </motion.div>
                                  </div>
                                  <span className="text-[10px] font-black text-[#001f3f] uppercase">{p.name}</span>
                               </div>
                            ))}
                         </div>
                      </>
                    )}
                 </div>

                 <div className="mt-10 flex gap-8 justify-center border-t border-slate-50 pt-8">
                    <LegendItem color="bg-[#d4af37]" label="Attendance" />
                    <LegendItem color="bg-[#001f3f]" label="Academic Avg" />
                    <LegendItem color="bg-emerald-400" label="Fee Collection" />
                 </div>
              </div>

              {/* Secondary Grid (Comparison/Reports) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="bg-[#001f3f] p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                    <div className="relative z-10 space-y-6">
                       <div className="flex items-center justify-between">
                          <BarChart className="w-8 h-8 text-[#d4af37]" />
                          <button className="text-[10px] font-black uppercase tracking-widest text-[#d4af37] border border-[#d4af37]/30 px-3 py-1 rounded-lg">View All</button>
                       </div>
                       <h4 className="text-xl font-black italic">Comparative <br/>Analysis</h4>
                       <p className="text-white/40 text-xs font-medium leading-relaxed">Student performance index has increased by <span className="text-[#d4af37] font-bold">12.4%</span> compared to last term.</p>
                       <div className="pt-4">
                          <div className="flex justify-between text-[10px] font-black uppercase text-white/20 mb-2"><span>Target Milestone</span><span>85%</span></div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                             <motion.div initial={{ width: 0 }} animate={{ width: '74%' }} className="h-full bg-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.4)]" />
                          </div>
                       </div>
                    </div>
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#d4af37]/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                 </div>

                 <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col justify-between group hover:border-[#d4af37]/30 transition-all">
                    <div className="space-y-4">
                       <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-[#001f3f] group-hover:bg-[#001f3f] group-hover:text-white transition-all">
                          <Activity className="w-6 h-6" />
                       </div>
                       <h4 className="text-xl font-black text-[#001f3f]">Term Reports</h4>
                       <p className="text-slate-400 text-xs font-medium leading-relaxed">Detailed institutional reports for the current academic session are ready for generation.</p>
                    </div>
                    <button className="w-full bg-slate-50 text-[#001f3f] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#001f3f] hover:text-white transition-all">
                       <Send className="w-3.5 h-3.5" /> Generate Multi-Batch Report
                    </button>
                 </div>
              </div>
           </div>

           {/* Today Activity Panel */}
           <div className="space-y-8">
              <div className="bg-white rounded-[3rem] border border-[#001f3f]/5 shadow-xl shadow-slate-200/50 flex flex-col h-full relative overflow-hidden">
                 <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-20">
                    <h3 className="text-xl font-black text-[#001f3f]">Today's Activity</h3>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                    {loading ? (
                       Array(4).fill(0).map((_, i) => (
                         <div key={i} className="flex gap-4 items-start animate-pulse">
                            <div className="w-10 h-10 bg-slate-100 rounded-xl shrink-0" />
                            <div className="space-y-2 flex-1">
                               <div className="h-3 bg-slate-100 rounded w-1/2" />
                               <div className="h-2 bg-slate-100 rounded w-3/4" />
                            </div>
                         </div>
                       ))
                    ) : (
                       data?.today?.map((event: any, i: number) => (
                         <motion.div 
                          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                          key={i} 
                          className="flex gap-5 items-start group"
                         >
                            <div className={cn(
                               "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-all group-hover:scale-110",
                               event[0] === 'Admission' ? "bg-blue-50 text-blue-500" :
                               event[0] === 'Payment' ? "bg-emerald-50 text-emerald-500" :
                               event[0] === 'Inquiry' ? "bg-rose-50 text-rose-500" :
                               "bg-[#001f3f]/5 text-[#001f3f]"
                            )}>
                               {event[0] === 'Admission' ? <Users className="w-5 h-5" /> :
                                event[0] === 'Payment' ? <CreditCard className="w-5 h-5" /> :
                                event[0] === 'Inquiry' ? <MessageSquare className="w-5 h-5" /> :
                                <Bell className="w-5 h-5" />}
                            </div>
                            <div className="min-w-0">
                               <div className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-0.5">{event[0]}</div>
                               <div className="text-sm font-bold text-[#001f3f] leading-tight group-hover:text-[#d4af37] transition-colors">{event[1]}</div>
                               <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5">
                                  <Clock className="w-3 h-3" /> Just now
                               </div>
                            </div>
                         </motion.div>
                       ))
                    )}
                    {!data?.today?.length && !loading && (
                       <div className="py-20 text-center space-y-4">
                          <Activity className="w-10 h-10 text-slate-100 mx-auto" />
                          <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">No activity recorded for today yet.</p>
                       </div>
                    )}
                 </div>

                 <div className="p-8 border-t border-slate-50">
                    <button className="w-full bg-[#001f3f] text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#001f3f]/20 hover:bg-[#d4af37] transition-all">Audit Global Logs</button>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,31,63,0.1);
          border-radius: 10px;
        }
      `}</style>
    </DashboardLayout>
  );
}

function getIcon(label: string) {
  const l = label.toLowerCase();
  if (l.includes("student")) return Users;
  if (l.includes("teacher")) return GraduationCap;
  if (l.includes("attendance")) return ClipboardList;
  if (l.includes("fee")) return CreditCard;
  if (l.includes("inquir")) return MessageSquare;
  if (l.includes("assignment")) return BookOpen;
  return Activity;
}

function OpCard({ icon: Icon, label, value, trend, color, index }: any) {
  const colors: any = {
    blue: "bg-blue-500 text-blue-500",
    indigo: "bg-indigo-500 text-indigo-500",
    emerald: "bg-emerald-500 text-emerald-500",
    amber: "bg-amber-500 text-amber-500",
    rose: "bg-rose-500 text-rose-500",
    cyan: "bg-cyan-500 text-cyan-500"
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm group hover:border-[#d4af37]/40 hover:shadow-2xl transition-all relative overflow-hidden"
    >
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform", colors[color].split(' ')[0] + "/10", colors[color].split(' ')[1])}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <div className="text-3xl font-black text-[#001f3f] tracking-tight">{value}</div>
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{label}</div>
        {trend && (
           <div className="mt-4 flex items-center gap-1.5 text-[9px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 w-fit px-2 py-1 rounded-lg">
              <Zap className="w-3 h-3 text-[#d4af37]" />
              {trend}
           </div>
        )}
      </div>
      <div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
         <Icon className="w-20 h-24 rotate-12" />
      </div>
    </motion.div>
  );
}

function LegendItem({ color, label }: any) {
  return (
    <div className="flex items-center gap-2">
       <div className={cn("w-2.5 h-2.5 rounded-full", color)}></div>
       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
    </div>
  );
}
