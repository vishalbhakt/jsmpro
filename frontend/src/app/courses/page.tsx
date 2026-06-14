"use client";

import PublicLayout from "@/components/PublicLayout";
import { BookOpen, CheckCircle, GraduationCap, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get("/courses/");
        setCourses(res.data.data);
      } catch {
        console.error("Courses fetch failed");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <PublicLayout>
      <div className="py-20 px-6">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-4">
            <div className="text-gold font-black uppercase tracking-[0.2em] text-xs">Our Programs</div>
            <h1 className="text-5xl font-black text-navy leading-tight">Courses & Curriculum</h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
              Comprehensive educational pathways from foundations to advanced middle school learning.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
               {[1,2,3].map(i => <div key={i} className="h-64 bg-white rounded-[3rem] animate-pulse border border-navy/5"></div>)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {courses.map((c, i) => (
                <div key={c.id} className="bg-white p-10 rounded-[3rem] border border-navy/5 shadow-xl hover:border-gold/30 transition-all flex flex-col group">
                   <div className="w-14 h-14 bg-navy rounded-2xl flex items-center justify-center text-gold mb-8 group-hover:scale-110 transition-transform">
                      <GraduationCap className="w-7 h-7" />
                   </div>
                   <h3 className="text-2xl font-black text-navy mb-4">{c.name}</h3>
                   <p className="text-slate-500 font-medium leading-relaxed mb-10 italic">
                      {c.description || "A dedicated program designed for the holistic development of students."}
                   </p>
                   
                   <div className="mt-auto space-y-4">
                      <div className="flex items-center gap-3 text-sm font-bold text-navy">
                         <CheckCircle className="w-4 h-4 text-emerald-500" />
                         Comprehensive Subjects
                      </div>
                      <div className="flex items-center gap-3 text-sm font-bold text-navy">
                         <CheckCircle className="w-4 h-4 text-emerald-500" />
                         Personalized Attention
                      </div>
                   </div>
                </div>
              ))}
            </div>
          )}

          <div className="max-w-4xl mx-auto bg-navy rounded-[3rem] p-12 md:p-16 flex flex-col md:flex-row items-center gap-10 text-white shadow-2xl relative overflow-hidden">
             <div className="space-y-4 relative z-10">
                <h2 className="text-3xl font-black">Interested in a specific course?</h2>
                <p className="text-white/60 font-medium">Download our detailed curriculum brochure to learn more about our methodology.</p>
             </div>
             <button className="btn-gold py-4 px-10 whitespace-nowrap relative z-10 flex items-center gap-2">
                Download PDF <ArrowRight className="w-4 h-4" />
             </button>
             <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-gold/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
