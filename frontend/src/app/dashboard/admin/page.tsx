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
  Settings
} from "lucide-react";
import { motion } from "framer-motion";

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

  if (!user) return null;

  const getIcon = (label: string) => {
     if (label.includes("Student")) return Users;
     if (label.includes("Teacher")) return GraduationCap;
     if (label.includes("Course") || label.includes("Subject")) return BookOpen;
     return UserCheck;
  };

  return (
    <DashboardLayout>
      <div className="space-y-10 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-[#001f3f] tracking-tight">
              Admin Control Panel
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Global system monitoring and institutional management.
            </p>
          </div>
          <div className="flex gap-3">
             <button className="p-3 bg-white border border-[#001f3f]/5 rounded-2xl shadow-sm hover:text-[#d4af37] transition-all"><Settings className="w-5 h-5" /></button>
             <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-[#001f3f]/5 shadow-sm">
                <Calendar className="w-5 h-5 text-[#d4af37]" />
                <span className="text-sm font-black text-[#001f3f] uppercase tracking-widest">
                  {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                </span>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
           {loading ? (
             [1,2,3,4].map(i => <div key={i} className="h-48 bg-white rounded-[2.5rem] animate-pulse border border-[#001f3f]/5" />)
           ) : (
             data?.stats?.map((stat: any, index: number) => (
               <StatCard 
                 key={index}
                 icon={getIcon(stat.label)} 
                 label={stat.label} 
                 value={stat.value} 
                 color={["bg-blue-500", "bg-indigo-500", "bg-emerald-500", "bg-amber-500"][index % 4]} 
               />
             ))
           )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           <div className="lg:col-span-2 bg-white rounded-[3rem] border border-[#001f3f]/5 p-10 shadow-sm space-y-10">
              <div className="flex items-center justify-between">
                 <h3 className="text-2xl font-black text-[#001f3f]">Registration Trends</h3>
                 <TrendingUp className="text-emerald-500 w-6 h-6" />
              </div>
              <div className="h-64 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-300 font-black uppercase tracking-widest italic border-2 border-dashed border-[#001f3f]/5">
                 [Interactive Analytics Engine]
              </div>
           </div>

           <div className="bg-[#001f3f] rounded-[3rem] p-10 text-white shadow-2xl flex flex-col justify-between relative overflow-hidden h-96 md:h-auto">
              <div className="space-y-8 relative z-10">
                 <BarChart3 className="w-12 h-12 text-[#d4af37]" />
                 <h3 className="text-3xl font-black leading-tight">Financial <br/>Insight</h3>
                 <p className="text-white/40 font-medium leading-relaxed">System performance is optimal. Fee collection monitoring active for current academic year.</p>
              </div>
              <button className="bg-[#d4af37] text-[#001f3f] w-full py-4 uppercase font-black tracking-widest text-xs relative z-10 shadow-xl shadow-[#d4af37]/10 rounded-2xl hover:bg-opacity-90 transition-all">Full Audit</button>
              
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#d4af37]/5 rounded-full blur-3xl"></div>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-[#001f3f]/5 shadow-sm group hover:border-[#d4af37]/30 transition-all flex flex-col justify-between h-48 relative overflow-hidden">
      <div className={`w-14 h-14 ${color} bg-opacity-10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform relative z-10`}>
        <Icon className={`w-7 h-7 ${color.replace('bg-', 'text-')}`} />
      </div>
      <div className="relative z-10">
        <div className="text-4xl font-black text-[#001f3f] leading-none mb-1">{value ?? 0}</div>
        <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{label}</div>
      </div>
      <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:opacity-10 transition-opacity">
         <Icon className="w-24 h-24 rotate-12" />
      </div>
    </div>
  );
}
