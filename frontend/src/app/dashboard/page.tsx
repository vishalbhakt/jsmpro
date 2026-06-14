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
  TrendingUp,
  Layout
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardAPI.stats();
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (!user) return null;

  const getIcon = (label: string) => {
    if (label.includes("Student")) return Users;
    if (label.includes("Teacher")) return Users;
    if (label.includes("Course") || label.includes("Assignment") || label.includes("Subject")) return BookOpen;
    if (label.includes("Fee") || label.includes("Payment")) return Clock;
    return TrendingUp;
  };

  const getColor = (index: number) => {
    const colors = ["bg-blue-500", "bg-amber-500", "bg-emerald-500", "bg-indigo-500", "bg-rose-500"];
    return colors[index % colors.length];
  };

  return (
    <DashboardLayout>
      <div className="space-y-10">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-[#001f3f] tracking-tight">
              Hello, {user.first_name || user.username} 👋
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Welcome back to your {user.role} command center.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-[#001f3f]/5 shadow-sm">
            <Clock className="w-4 h-4 text-[#d4af37]" />
            <span className="text-sm font-bold text-[#001f3f]">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-[#001f3f]/5 shadow-sm h-32 animate-pulse" />
            ))
          ) : (
            data?.stats?.map((stat: any, index: number) => (
              <StatCard 
                key={index}
                icon={getIcon(stat.label)} 
                label={stat.label} 
                value={stat.value} 
                trend={stat.trend}
                color={getColor(index)} 
              />
            ))
          )}
        </div>

        {/* Recent Activity / Announcements */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-3xl border border-[#001f3f]/5 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#001f3f]">Today's Activity</h3>
              <button className="text-[#d4af37] text-xs font-black uppercase tracking-widest hover:text-opacity-80 transition-all">View All</button>
            </div>
            <div className="space-y-4">
              {data?.today?.map((item: any, index: number) => (
                <div key={index} className="group flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-[#001f3f]/5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#001f3f]/5 rounded-xl flex items-center justify-center text-[#001f3f] font-black text-[10px] group-hover:bg-[#d4af37]/10 group-hover:text-[#d4af37] transition-all px-1 text-center">
                      {item[0]}
                    </div>
                    <div>
                      <div className="font-bold text-[#001f3f]">{item[1]}</div>
                      <div className="text-xs text-slate-400 font-medium">System Notification</div>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover:text-[#d4af37] transition-all" />
                </div>
              ))}
              {!data?.today?.length && !loading && (
                <div className="text-center py-10 text-slate-400 font-medium italic">No new activity today.</div>
              )}
            </div>
          </div>

          <div className="bg-[#001f3f] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              <h3 className="text-xl font-bold text-[#d4af37]">Performance</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Insights based on current semester records.
              </p>
              <div className="space-y-4">
                {data?.performance?.slice(0, 3).map((p: any, i: number) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/40">
                      <span>{p.name} Activity</span>
                      <span>{p.attendance}%</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#d4af37] rounded-full transition-all duration-1000" 
                        style={{ width: `${p.attendance}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#d4af37]/5 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ icon: Icon, label, value, trend, color }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-[#001f3f]/5 shadow-sm group hover:border-[#d4af37]/30 transition-all">
      <div className={`w-12 h-12 ${color} bg-opacity-10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      <div className="text-2xl font-black text-[#001f3f]">{value ?? 0}</div>
      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">{label}</div>
      {trend && <div className="text-[10px] font-medium text-slate-400 mt-2">{trend}</div>}
    </div>
  );
}
