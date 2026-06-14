"use client";

import { useAuthStore } from "@/store/useAuthStore";
import DashboardLayout from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import { dashboardAPI } from "@/lib/api";
import { 
  Users, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  ArrowUpRight,
  Calendar
} from "lucide-react";
import { motion } from "framer-motion";

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
      <div className="space-y-10 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-[#001f3f] tracking-tight">
              Hi, {user.first_name || user.username} 🏫
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Manage your daily academic operations.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-[#001f3f]/5 shadow-sm">
             <Calendar className="w-5 h-5 text-[#d4af37]" />
             <span className="text-sm font-black text-[#001f3f] uppercase tracking-widest">
               {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
             </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
           {data?.stats?.map((stat: any, index: number) => (
             <StatCard 
               key={index}
               icon={stat.label.includes('Student') ? Users : BookOpen} 
               label={stat.label} 
               value={stat.value} 
               color={index % 2 === 0 ? "bg-blue-500" : "bg-emerald-500"} 
             />
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="bg-white p-8 rounded-[2.5rem] border border-[#001f3f]/5 shadow-sm">
             <h3 className="text-xl font-bold text-[#001f3f] mb-6">Recent Activity</h3>
             <div className="space-y-4">
                {data?.today?.map((item: any, index: number) => (
                  <div key={index} className="p-4 bg-slate-50 rounded-2xl border border-[#001f3f]/5">
                    <div className="font-bold text-[#001f3f] text-sm">{item[1]}</div>
                    <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{item[0]}</div>
                  </div>
                ))}
                {!data?.today?.length && !loading && (
                  <div className="text-center py-10 text-slate-300 italic font-medium">No activity today.</div>
                )}
             </div>
           </div>
           <div className="bg-[#001f3f] p-8 rounded-[2.5rem] text-white shadow-xl flex flex-col justify-center relative overflow-hidden">
             <div className="relative z-10">
                <h3 className="text-2xl font-black text-[#d4af37] mb-2">Teacher Pro-Tip</h3>
                <p className="text-white/60 font-medium italic">"Use the Bulk Attendance feature to save time during morning roll call."</p>
             </div>
             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#d4af37]/5 rounded-full blur-3xl"></div>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-[#001f3f]/5 shadow-sm group hover:border-[#d4af37]/30 transition-all flex flex-col justify-between h-48">
      <div className={`w-14 h-14 ${color} bg-opacity-10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className={`w-7 h-7 ${color.replace('bg-', 'text-')}`} />
      </div>
      <div>
        <div className="text-3xl font-black text-[#001f3f] leading-none">{value ?? 0}</div>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">{label}</div>
      </div>
    </div>
  );
}
