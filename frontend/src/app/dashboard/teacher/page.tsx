"use client";

import { useAuthStore } from "@/store/useAuthStore";
import DashboardLayout from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import { dashboardAPI } from "@/lib/api";
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  CheckCircle2, 
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
  StickyNote,
  Video,
  Send,
  MoreVertical,
  Filter,
  Plus,
  Trophy,
  Bell
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TeacherOverview() {
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

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-12 pb-20">
        {/* Workspace Branding Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-6">
            <div className="w-20 h-20 bg-[#001f3f] rounded-[2rem] flex items-center justify-center text-[#d4af37] font-black text-3xl shadow-2xl shadow-[#001f3f]/20 border-4 border-white">
               {user.username?.[0].toUpperCase()}
            </div>
            <div>
               <h1 className="text-4xl font-black text-[#001f3f] tracking-tight">{user.first_name || user.username}</h1>
               <div className="flex items-center gap-2 mt-1">
                  <span className="bg-[#d4af37] text-[#001f3f] text-[10px] px-3 py-1 rounded-full uppercase tracking-widest font-black">Teacher</span>
                  <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">JSM Shiksha Academy Portal</span>
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

        {/* Teacher Workspace Section */}
        <section className="space-y-8">
           <div>
              <h2 className="text-2xl font-black text-[#001f3f] tracking-tight">Teacher Workspace</h2>
              <p className="text-slate-500 font-medium text-sm">Track assigned classes, attendance, assignments, notes, and student submissions.</p>
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
                    icon={getTeacherIcon(stat.label)}
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

        {/* Performance & Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           {/* Performance Trend */}
           <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-[3rem] border border-[#001f3f]/5 shadow-xl shadow-slate-200/50 p-10 relative overflow-hidden group">
                 <div className="flex items-center justify-between mb-12 relative z-10">
                    <div>
                       <h3 className="text-2xl font-black text-[#001f3f]">Performance Trend</h3>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Attendance, completion, and student signals</p>
                    </div>
                    <select className="bg-slate-50 border-none rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-[#d4af37]/20">
                       <option>Current Month</option>
                       <option>Previous Term</option>
                    </select>
                 </div>

                 <div className="h-72 w-full relative flex items-end justify-between px-4">
                    {loading ? (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-300 font-bold uppercase tracking-widest text-xs">Analytics Syncing...</div>
                    ) : (
                      <>
                         <div className="absolute inset-0 flex flex-col justify-between py-2 px-4 pointer-events-none opacity-50">
                            {[100, 75, 50, 25, 0].map(v => (
                               <div key={v} className="border-t border-slate-100 w-full flex items-start">
                                  <span className="text-[8px] font-black text-slate-300 -mt-2.5">{v}%</span>
                               </div>
                            ))}
                         </div>
                         <div className="flex-1 flex items-end justify-around relative z-10 h-full pt-10">
                            {data?.performance?.map((p: any, i: number) => (
                               <div key={i} className="flex flex-col items-center gap-4 group/bar w-full">
                                  <div className="flex items-end gap-2 h-48">
                                     <motion.div 
                                      initial={{ height: 0 }} animate={{ height: `${p.attendance}%` }} transition={{ delay: i * 0.1 }}
                                      className="w-4 bg-[#d4af37] rounded-full relative group hover:brightness-110 transition-all cursor-pointer"
                                     />
                                     <motion.div 
                                      initial={{ height: 0 }} animate={{ height: `${p.submissions}%` }} transition={{ delay: i * 0.1 + 0.2 }}
                                      className="w-4 bg-[#001f3f] rounded-full relative group hover:brightness-110 transition-all cursor-pointer"
                                     />
                                  </div>
                                  <span className="text-[10px] font-black text-[#001f3f] uppercase">{p.name}</span>
                               </div>
                            ))}
                         </div>
                      </>
                    )}
                 </div>

                 <div className="mt-10 flex gap-8 justify-center border-t border-slate-50 pt-8">
                    <LegendItem color="bg-[#d4af37]" label="Attendance Logged" />
                    <LegendItem color="bg-[#001f3f]" label="Work Completion" />
                 </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <QuickAction color="blue" icon={Plus} label="Mark Attendance" />
                 <QuickAction color="emerald" icon={Send} label="Publish Task" />
                 <QuickAction color="amber" icon={Trophy} label="Update Results" />
              </div>
           </div>

           {/* Today Section */}
           <div className="space-y-8 h-full">
              <div className="bg-white rounded-[3rem] border border-[#001f3f]/5 shadow-xl shadow-slate-200/50 flex flex-col h-full relative overflow-hidden">
                 <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-20">
                    <h3 className="text-xl font-black text-[#001f3f]">Today</h3>
                    <div className="w-10 h-10 bg-[#001f3f] rounded-xl flex items-center justify-center text-[#d4af37] shadow-lg">
                       <Zap className="w-5 h-5 fill-current" />
                    </div>
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
                               event[0] === 'Submission' ? "bg-emerald-50 text-emerald-500" :
                               event[0] === 'Resource' ? "bg-blue-50 text-blue-500" :
                               "bg-[#001f3f]/5 text-[#001f3f]"
                            )}>
                               {event[0] === 'Submission' ? <Send className="w-5 h-5" /> :
                                event[0] === 'Resource' ? <StickyNote className="w-5 h-5" /> :
                                <Bell className="w-5 h-5" />}
                            </div>
                            <div className="min-w-0">
                               <div className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-0.5">{event[0]}</div>
                               <div className="text-sm font-bold text-[#001f3f] leading-tight group-hover:text-[#d4af37] transition-colors line-clamp-2">{event[1]}</div>
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
                          <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">No workspace activity yet.</p>
                       </div>
                    )}
                 </div>

                 <div className="p-8 border-t border-slate-50">
                    <button className="w-full bg-[#001f3f] text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#001f3f]/20 hover:bg-[#d4af37] transition-all">Clear Feed</button>
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

function getTeacherIcon(label: string) {
  const l = label.toLowerCase();
  if (l.includes("student")) return Users;
  if (l.includes("assignment")) return Send;
  if (l.includes("submission")) return CheckCircle2;
  if (l.includes("classes")) return School;
  if (l.includes("note")) return StickyNote;
  if (l.includes("video")) return Video;
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
      className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm group hover:border-[#d4af37]/40 hover:shadow-2xl transition-all relative overflow-hidden h-44 flex flex-col justify-between"
    >
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner", colors[color].split(' ')[0] + "/10", colors[color].split(' ')[1])}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-3xl font-black text-[#001f3f] tracking-tight">{value}</div>
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{label}</div>
        {trend && (
           <div className="mt-2 text-[8px] font-black text-[#d4af37] uppercase tracking-widest bg-[#d4af37]/5 px-2 py-0.5 rounded w-fit italic">
              {trend}
           </div>
        )}
      </div>
      <Icon className="absolute -top-4 -right-4 w-24 h-24 text-[#001f3f]/[0.02] -rotate-12 group-hover:rotate-0 group-hover:text-[#d4af37]/5 transition-all duration-700" />
    </motion.div>
  );
}

function QuickAction({ icon: Icon, label, color }: any) {
   const colors: any = {
      blue: "bg-blue-50 text-blue-600 hover:bg-blue-600",
      emerald: "bg-emerald-50 text-emerald-600 hover:bg-emerald-600",
      amber: "bg-amber-50 text-amber-600 hover:bg-amber-600"
   };
   return (
      <button className={cn(
         "p-6 rounded-[2rem] border border-slate-100 flex flex-col items-center gap-4 transition-all shadow-sm group active:scale-95",
         colors[color],
         "hover:text-white hover:shadow-xl hover:shadow-slate-200 hover:-translate-y-1"
      )}>
         <Icon className="w-6 h-6" />
         <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      </button>
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

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

function School({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}
