"use client";

import { useAuthStore } from "@/store/useAuthStore";
import DashboardLayout from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { 
  CheckCircle, 
  Clock, 
  CreditCard,
  Bell,
  Calendar,
  ArrowRight,
  TrendingUp,
  FileText
} from "lucide-react";
import { motion } from "framer-motion";

export default function StudentOverview() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/dashboard/stats/");
        setStats(res.data.data);
      } catch (err) {
        console.error("Failed to fetch stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-10 pb-20">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-navy tracking-tight">
              Hi, {user.first_name || user.username} 👋
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Ready to learn something new today?
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-navy/5 shadow-sm">
             <Calendar className="w-5 h-5 text-gold" />
             <span className="text-sm font-black text-navy uppercase tracking-widest">
               {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
             </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard 
            icon={CheckCircle} 
            label="Attendance" 
            value={`${stats?.attendance_percentage ?? 0}%`} 
            color="bg-emerald-500" 
            desc="Keep it above 75%"
          />
          <StatCard 
            icon={Clock} 
            label="Assignments" 
            value={stats?.my_assignments} 
            color="bg-rose-500" 
            desc="Pending submissions"
          />
          <StatCard 
            icon={CreditCard} 
            label="Pending Fees" 
            value={stats?.pending_payments} 
            color="bg-amber-500" 
            desc="Due this month"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Announcements */}
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-navy/5 p-10 shadow-sm space-y-8">
             <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-navy">Latest Updates</h3>
                <Bell className="w-6 h-6 text-gold animate-bounce" />
             </div>
             
             <div className="space-y-4">
                {stats?.recent_announcements?.map((a: any) => (
                  <div key={a.id} className="p-6 bg-slate-50 rounded-3xl border border-navy/5 flex items-start gap-4 hover:bg-white hover:shadow-xl transition-all cursor-default group">
                     <div className="w-12 h-12 bg-gold/10 text-gold rounded-2xl flex items-center justify-center shrink-0 font-black text-xs group-hover:bg-navy group-hover:text-gold transition-all">📢</div>
                     <div>
                        <div className="font-black text-navy leading-tight mb-1">{a.title}</div>
                        <p className="text-sm text-slate-400 font-medium line-clamp-2">{a.content}</p>
                        <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-3">{new Date(a.created_at).toLocaleDateString()}</div>
                     </div>
                  </div>
                ))}
                {!stats?.recent_announcements?.length && (
                  <div className="text-center py-20 text-slate-300 font-medium italic">No new announcements.</div>
                )}
             </div>
          </div>

          {/* Performance & Tips */}
          <div className="space-y-8">
             <div className="bg-navy rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden flex flex-col justify-between h-64">
                <div className="relative z-10">
                   <h3 className="text-2xl font-black text-gold mb-3">Academic Tip</h3>
                   <p className="text-white/60 font-medium italic leading-relaxed">"Consistency is key. Try to complete your assignments 24 hours before the deadline."</p>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
             </div>

             <div className="bg-white rounded-[2.5rem] border border-navy/5 p-10 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                   <h3 className="text-xl font-bold text-navy">My Performance</h3>
                   <TrendingUp className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                   <div className="h-full bg-gold rounded-full" style={{ width: '85%' }}></div>
                </div>
                <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-400">
                   <span>Overall Progress</span>
                   <span className="text-navy">85%</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ icon: Icon, label, value, color, desc }: any) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-navy/5 shadow-sm group hover:border-gold/30 transition-all flex flex-col justify-between h-52 relative overflow-hidden">
      <div className={`w-14 h-14 ${color} bg-opacity-10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform relative z-10`}>
        <Icon className={`w-7 h-7 ${color.replace('bg-', 'text-')}`} />
      </div>
      <div className="relative z-10">
        <div className="text-4xl font-black text-navy leading-none mb-2">{value ?? 0}</div>
        <div className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</div>
        <div className="text-[10px] font-bold text-slate-300 mt-1">{desc}</div>
      </div>
      <div className={`absolute -bottom-10 -right-10 w-32 h-32 ${color} opacity-[0.03] rounded-full blur-2xl group-hover:opacity-[0.05] transition-opacity`}></div>
    </div>
  );
}
