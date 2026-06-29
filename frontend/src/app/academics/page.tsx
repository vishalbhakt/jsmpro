"use client";

import PublicLayout from "@/components/PublicLayout";
import { useEffect, useState } from "react";
import { classesAPI, subjectsAPI } from "@/lib/api";
import { safeArray } from "@/lib/apiUtils";
import { GraduationCap, BookOpen, UserCheck, Sparkles, BookMarked, Layers } from "lucide-react";

export default function AcademicsPage() {
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classRes, subjectRes] = await Promise.all([
          classesAPI.list().catch(() => ({ data: [] })),
          subjectsAPI.list().catch(() => ({ data: [] }))
        ]);
        setClassrooms(safeArray(classRes, "Classrooms"));
        setSubjects(safeArray(subjectRes, "Subjects"));
      } catch (err) {
        console.error("Academics data fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const levels = [
    { 
      title: "Kindergarten (K.G.)", 
      desc: "Play, Learn & Grow", 
      details: "Focusing on motor skills, social interaction, and basic phonics in a fun, safe environment.",
      icon: Sparkles
    },
    { 
      title: "Primary (Grades 1–2)", 
      desc: "Building Strong Foundations", 
      details: "Developing core literacy and numeracy skills with an introduction to environmental studies.",
      icon: BookOpen
    },
    { 
      title: "Prep (Grades 3–5)", 
      desc: "Concept Clarity & Curiosity Development", 
      details: "Enhancing analytical thinking and self-expression through structured subject exploration.",
      icon: UserCheck
    },
    { 
      title: "Middle School (Grades 6–8)", 
      desc: "Preparing Students for a Bright Future", 
      details: "Advanced curriculum focused on career orientation, complex problem solving, and social responsibility.",
      icon: GraduationCap
    }
  ];

  return (
    <PublicLayout>
      <div className="py-20 px-6">
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="text-center space-y-4">
            <div className="text-[#d4af37] font-black uppercase tracking-[0.2em] text-xs">Curriculum</div>
            <h1 className="text-5xl font-black text-[#001f3f] leading-tight">Academic Structure & Levels</h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
              Progressive educational stages designed for age-appropriate development and learning.
            </p>
          </div>

          {/* Academic Levels list */}
          <div className="grid grid-cols-1 gap-12">
            {levels.map((level, i) => (
              <div key={i} className="bg-white flex flex-col md:flex-row items-center gap-10 p-10 rounded-[3rem] border border-navy/5 shadow-xl hover:border-[#d4af37]/30 transition-all group">
                <div className="w-24 h-24 bg-[#001f3f] rounded-[2rem] flex items-center justify-center text-[#d4af37] shrink-0 group-hover:scale-110 transition-transform">
                  <level.icon className="w-10 h-10" />
                </div>
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <h3 className="text-3xl font-black text-navy">{level.title}</h3>
                    <div className="px-4 py-1 bg-gold/10 text-gold rounded-full text-xs font-black uppercase tracking-widest">{level.desc}</div>
                  </div>
                  <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-3xl">
                    {level.details}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Dynamic Classes and Subjects sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Dynamic Classrooms List */}
            <div className="bg-white p-10 rounded-[3rem] border border-navy/5 shadow-xl space-y-8">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                <Layers className="w-8 h-8 text-[#d4af37]" />
                <h3 className="text-2xl font-black text-[#001f3f]">Active Classes Offered</h3>
              </div>
              
              {loading ? (
                <div className="space-y-4 animate-pulse">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-12 bg-slate-50 border border-slate-100 rounded-xl" />
                  ))}
                </div>
              ) : classrooms.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {classrooms.map((cls) => (
                    <div key={cls.id} className="p-4 bg-slate-50 border border-slate-100 hover:border-gold/30 rounded-2xl transition-all">
                      <div className="font-black text-[#001f3f] text-sm uppercase tracking-wide">{cls.name || `${cls.grade} - ${cls.section}`}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Class Teacher: {cls.class_teacher_name || "Assigned"}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 font-medium italic">No classrooms set up currently.</p>
              )}
            </div>

            {/* Dynamic Subjects List */}
            <div className="bg-white p-10 rounded-[3rem] border border-navy/5 shadow-xl space-y-8">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                <BookMarked className="w-8 h-8 text-[#d4af37]" />
                <h3 className="text-2xl font-black text-[#001f3f]">Our Curriculum Subjects</h3>
              </div>

              {loading ? (
                <div className="space-y-4 animate-pulse">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-12 bg-slate-50 border border-slate-100 rounded-xl" />
                  ))}
                </div>
              ) : subjects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {subjects.map((sub) => (
                    <div key={sub.id} className="p-4 bg-slate-50 border border-slate-100 hover:border-gold/30 rounded-2xl transition-all">
                      <div className="font-black text-[#001f3f] text-sm uppercase tracking-wide">{sub.name}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Code: {sub.code || "SUB-N/A"}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 font-medium italic">No subjects configured currently.</p>
              )}
            </div>
          </div>

          {/* Holistic Learning Banner */}
          <div className="bg-navy p-16 rounded-[3rem] text-center space-y-8 text-white relative overflow-hidden shadow-2xl">
            <h2 className="text-3xl font-black relative z-10">Holistic Learning Methodology</h2>
            <p className="text-white/60 max-w-2xl mx-auto font-medium relative z-10 leading-relaxed text-sm">
              Our teaching approach combines interactive classroom sessions, digital learning resources, regular assessments, and personalized mentoring to ensure every student excels.
            </p>
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
