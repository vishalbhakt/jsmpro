"use client";

import PublicLayout from "@/components/PublicLayout";
import { GraduationCap, BookOpen, UserCheck, Sparkles } from "lucide-react";

export default function AcademicsPage() {
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
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-4">
            <div className="text-gold font-black uppercase tracking-[0.2em] text-xs">Curriculum</div>
            <h1 className="text-5xl font-black text-navy leading-tight">Academic Structure</h1>
          </div>

          <div className="grid grid-cols-1 gap-12">
            {levels.map((level, i) => (
              <div key={i} className="bg-white flex flex-col md:flex-row items-center gap-10 p-10 rounded-[3rem] border border-navy/5 shadow-xl hover:border-gold/30 transition-all group">
                <div className="w-24 h-24 bg-navy rounded-[2rem] flex items-center justify-center text-gold shrink-0 group-hover:scale-110 transition-transform">
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

          <div className="bg-navy p-16 rounded-[3rem] text-center space-y-8 text-white relative overflow-hidden">
            <h2 className="text-3xl font-black relative z-10">Holistic Learning Methodology</h2>
            <p className="text-white/60 max-w-2xl mx-auto font-medium relative z-10 leading-relaxed">
              Our teaching approach combines interactive classroom sessions, digital learning resources, regular assessments, and personalized mentoring to ensure every student excels.
            </p>
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
