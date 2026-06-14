"use client";

import { useAuthStore } from "@/store/useAuthStore";
import DashboardLayout from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import { learningAPI } from "@/lib/api"; // Assuming results are in learning or academics? Actually let's check api.ts.
// In api.ts, resultsAPI = crud('/results');
import { resultsAPI } from "@/lib/api";
import { 
  Trophy, 
  Download, 
  BarChart3, 
  ChevronRight,
  Medal
} from "lucide-react";
import { motion } from "framer-motion";
import { useToastStore } from "@/store/useToastStore";

export default function StudentResults() {
  const { user } = useAuthStore();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const addToast = useToastStore(s => s.addToast);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await resultsAPI.list();
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch results", err);
        addToast("Failed to fetch exam results", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  const totalPossibleMarks = data.reduce((sum, r) => sum + (parseFloat(r.max_marks) || 0), 0);
  const totalObtainedMarks = data.reduce((sum, r) => sum + (parseFloat(r.marks_obtained) || 0), 0);
  const overallPercentage = totalPossibleMarks > 0 ? Math.round((totalObtainedMarks / totalPossibleMarks) * 100) : 0;

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-10 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-[#001f3f] tracking-tight">
              Academic Performance
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Your official grades and examination marksheets.
            </p>
          </div>
          <button className="bg-[#d4af37] text-[#001f3f] px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-[#d4af37]/20 hover:bg-opacity-90 transition-all">
             <Download className="w-4 h-4" /> Download Full Transcript
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-1 bg-[#001f3f] rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between h-80">
              <div className="relative z-10 space-y-2">
                 <div className="text-[#d4af37] font-black uppercase tracking-widest text-[10px]">Academic Standing</div>
                 <h2 className="text-5xl font-black italic">{overallPercentage >= 80 ? 'Distinction' : overallPercentage >= 60 ? 'First Class' : 'Pass'}</h2>
              </div>
              <div className="relative z-10 flex items-end justify-between">
                 <div>
                    <div className="text-3xl font-black text-white">{overallPercentage}%</div>
                    <div className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">Weighted Average</div>
                 </div>
                 <Trophy className="w-16 h-16 text-[#d4af37] opacity-50" />
              </div>
              {/* Background Glow */}
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#d4af37]/10 rounded-full blur-3xl"></div>
           </div>

           <div className="lg:col-span-2 bg-white rounded-[3rem] border border-[#001f3f]/5 p-10 shadow-sm flex flex-col justify-center">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xl font-bold text-[#001f3f]">Subject-wise Analytics</h3>
                 <BarChart3 className="w-5 h-5 text-slate-300" />
              </div>
              <div className="space-y-6">
                 {data.slice(0, 3).map((r, i) => (
                   <div key={i} className="space-y-2">
                      <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-500">
                         <span>{r.subject_name}</span>
                         <span className="text-[#001f3f]">{Math.round((r.marks_obtained / r.max_marks) * 100)}%</span>
                      </div>
                      <div className="h-2 bg-slate-50 rounded-full overflow-hidden border border-[#001f3f]/[0.02]">
                         <div className="h-full bg-[#d4af37] rounded-full" style={{ width: `${(r.marks_obtained / r.max_marks) * 100}%` }}></div>
                      </div>
                   </div>
                 ))}
                 {!data.length && <div className="text-center py-10 text-slate-300 font-medium italic">No result data to visualize.</div>}
              </div>
           </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-[#001f3f]/5 shadow-sm overflow-hidden">
           <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                   <th className="px-8 py-5">Assessment</th>
                   <th className="px-6 py-5">Subject</th>
                   <th className="px-6 py-5 text-center">Marks</th>
                   <th className="px-6 py-5 text-center">Grade</th>
                   <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#001f3f]/5">
                 {data.map((r, i) => (
                   <tr key={i} className="hover:bg-slate-50/50 transition-all group">
                      <td className="px-8 py-5">
                         <div className="font-bold text-[#001f3f]">{r.assessment_title || "Semester Exam"}</div>
                         <div className="text-[10px] text-slate-400 font-medium mt-0.5">{r.session_date ? new Date(r.session_date).toLocaleDateString() : "Final"}</div>
                      </td>
                      <td className="px-6 py-5 font-bold text-slate-500">{r.subject_name}</td>
                      <td className="px-6 py-5 text-center font-black text-[#001f3f]">{r.marks_obtained} <span className="text-slate-300 font-medium text-xs">/ {r.max_marks}</span></td>
                      <td className="px-6 py-5">
                         <div className="w-8 h-8 bg-[#d4af37]/10 text-[#d4af37] rounded-lg flex items-center justify-center font-black text-xs mx-auto">
                            {r.marks_obtained / r.max_marks >= 0.9 ? 'A+' : r.marks_obtained / r.max_marks >= 0.8 ? 'A' : r.marks_obtained / r.max_marks >= 0.7 ? 'B' : 'C'}
                         </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                         <button className="p-2 text-slate-300 hover:text-[#d4af37] hover:bg-[#d4af37]/5 rounded-xl transition-all"><Download className="w-4 h-4" /></button>
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
           {!data.length && !loading && (
             <div className="py-32 text-center text-slate-300 font-medium italic">Your exam results will appear here once published.</div>
           )}
        </div>
      </div>
    </DashboardLayout>
  );
}
