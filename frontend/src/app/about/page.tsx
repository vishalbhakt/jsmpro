"use client";

import PublicLayout from "@/components/PublicLayout";
import { useEffect, useState } from "react";
import { cmsAPI } from "@/lib/api";
import { ShieldCheck, Target, Heart, Users, MessageSquare, GraduationCap, Trophy, Users2 } from "lucide-react";

export default function AboutPage() {
  const [data, setData] = useState({
    description: "JSM Shiksha Academy is dedicated to nurturing young minds from Kindergarten to Grade 8. We provide quality education through a balanced approach that combines academics, discipline, and character development.",
    mission: "To provide a safe, engaging, and supportive learning environment where every student receives personalized attention and opportunities for holistic growth.",
    vision: "To prepare young minds for a bright and successful future by combining expert faculty excellence with modern infrastructure and character building.",
    principalMessage: "Welcome to JSM Shiksha Academy. We believe in providing quality education that goes beyond academic excellence, focusing on the overall character and discipline of our students.",
    stats: {
      students: 500,
      teachers: 45,
      courses: 12,
      excellence_years: 12
    }
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [aboutRes, missionRes, visionRes, principalRes, statsRes] = await Promise.all([
          cmsAPI.pages.get("about").catch(() => null),
          cmsAPI.pages.get("about-mission").catch(() => null),
          cmsAPI.pages.get("about-vision").catch(() => null),
          cmsAPI.pages.get("about-principal").catch(() => null),
          cmsAPI.pages.get("about-statistics").catch(() => null),
        ]);

        const parsedStats = statsRes?.data?.body ? JSON.parse(statsRes.data.body) : data.stats;

        setData({
          description: aboutRes?.data?.body || data.description,
          mission: missionRes?.data?.body || data.mission,
          vision: visionRes?.data?.body || data.vision,
          principalMessage: principalRes?.data?.body || data.principalMessage,
          stats: parsedStats
        });
      } catch (err) {
        console.error("Error loading about page dynamic content", err);
      }
    };
    loadData();
  }, []);

  return (
    <PublicLayout>
      <div className="py-20 px-6">
        <div className="max-w-7xl mx-auto space-y-24">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="text-[#d4af37] font-black uppercase tracking-[0.2em] text-xs">Our Story</div>
            <h1 className="text-5xl md:text-7xl font-black text-[#001f3f] leading-tight">Empowering Minds <br/>Since 2014.</h1>
            <p className="text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed pt-4 text-lg">
              {data.description}
            </p>
          </div>

          {/* Mission/Vision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="bg-white p-12 rounded-[3rem] border border-navy/5 shadow-xl space-y-6">
              <div className="w-16 h-16 bg-[#001f3f] rounded-2xl flex items-center justify-center text-[#d4af37]">
                <Target className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-black text-[#001f3f]">Our Mission</h2>
              <p className="text-slate-500 font-medium leading-relaxed italic">
                "{data.mission}"
              </p>
            </div>
            <div className="bg-[#001f3f] p-12 rounded-[3rem] shadow-xl space-y-6 text-white">
              <div className="w-16 h-16 bg-[#d4af37] rounded-2xl flex items-center justify-center text-[#001f3f]">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-black">Our Vision</h2>
              <p className="text-white/60 font-medium leading-relaxed italic">
                "{data.vision}"
              </p>
            </div>
          </div>

          {/* Principal Message */}
          <div className="bg-slate-50 rounded-[3.5rem] border border-slate-100 p-12 md:p-16 grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            <div className="lg:col-span-1 text-center lg:text-left space-y-4">
              <div className="w-24 h-24 bg-[#001f3f] text-[#d4af37] rounded-3xl flex items-center justify-center font-black text-3xl mx-auto lg:mx-0 shadow-lg border-2 border-white">
                P
              </div>
              <div>
                <h4 className="text-xl font-black text-[#001f3f]">Message from the Principal</h4>
                <p className="text-[#d4af37] text-xs font-black uppercase tracking-widest mt-1">JSM Shiksha Academy</p>
              </div>
            </div>
            <div className="lg:col-span-2 border-t lg:border-t-0 lg:border-l border-slate-200/60 pt-8 lg:pt-0 lg:pl-12">
              <MessageSquare className="w-8 h-8 text-[#d4af37] mb-6 opacity-30" />
              <p className="text-slate-600 font-medium leading-relaxed italic text-justify text-base">
                "{data.principalMessage}"
              </p>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="bg-[#001f3f] rounded-[3.5rem] p-12 md:p-16 text-white grid grid-cols-2 lg:grid-cols-4 gap-10 text-center relative overflow-hidden">
            <div className="space-y-2 relative z-10">
              <Users className="w-8 h-8 text-[#d4af37] mx-auto mb-2" />
              <div className="text-4xl md:text-5xl font-black">{data.stats.students}+</div>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Enrolled Students</p>
            </div>
            <div className="space-y-2 relative z-10">
              <Users2 className="w-8 h-8 text-[#d4af37] mx-auto mb-2" />
              <div className="text-4xl md:text-5xl font-black">{data.stats.teachers}+</div>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Expert Teachers</p>
            </div>
            <div className="space-y-2 relative z-10">
              <GraduationCap className="w-8 h-8 text-[#d4af37] mx-auto mb-2" />
              <div className="text-4xl md:text-5xl font-black">{data.stats.courses}+</div>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Academic Courses</p>
            </div>
            <div className="space-y-2 relative z-10">
              <Trophy className="w-8 h-8 text-[#d4af37] mx-auto mb-2" />
              <div className="text-4xl md:text-5xl font-black">{data.stats.excellence_years}+ Years</div>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Academic Excellence</p>
            </div>
            <div className="absolute -right-24 -top-24 w-72 h-72 bg-[#d4af37]/5 rounded-full blur-3xl"></div>
          </div>

          {/* Values */}
          <div className="space-y-16">
            <div className="text-center">
              <h2 className="text-4xl font-black text-[#001f3f]">Core Values</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: Heart, label: "Compassion", desc: "Nurturing each child with care." },
                { icon: ShieldCheck, label: "Discipline", desc: "Building strong character foundations." },
                { icon: Users, label: "Collaboration", desc: "Working together for student success." },
                { icon: Target, label: "Excellence", desc: "Striving for quality in everything." }
              ].map((v, i) => (
                <div key={i} className="text-center p-8 bg-white rounded-3xl border border-navy/5">
                  <v.icon className="w-10 h-10 text-gold mx-auto mb-4" />
                  <h4 className="text-xl font-bold text-navy mb-2">{v.label}</h4>
                  <p className="text-sm text-slate-400 font-medium">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
