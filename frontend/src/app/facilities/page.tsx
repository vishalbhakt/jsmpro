"use client";

import PublicLayout from "@/components/PublicLayout";
import { BookOpen, Computer, Trophy, Palette, Bus, HeartPulse } from "lucide-react";

export default function FacilitiesPage() {
  const facilities = [
    { 
      icon: BookOpen, 
      title: "Smart Library", 
      desc: "Our library is a haven for young readers, featuring a rich collection of books, encyclopedias, and digital learning resources to foster a habit of lifelong reading." 
    },
    { 
      icon: Computer, 
      title: "Computer Lab", 
      desc: "Equipped with modern systems and high-speed internet, our lab ensures students become tech-savvy and proficient in essential digital skills from an early age." 
    },
    { 
      icon: Trophy, 
      title: "Sports Ground", 
      desc: "A large and safe playground for outdoor sports, physical training, and team-building activities, essential for a student's physical well-being." 
    },
    { 
      icon: Palette, 
      title: "Art & Craft Room", 
      desc: "A creative learning environment where students explore their imagination through painting, clay modeling, and various craft projects." 
    },
    { 
      icon: Bus, 
      title: "Transport Facility", 
      desc: "Safe and reliable school transportation services with GPS tracking and trained staff to ensure the security of every student." 
    },
    { 
      icon: HeartPulse, 
      title: "Medical Room", 
      desc: "A dedicated first aid and health monitoring support center with qualified staff to handle minor injuries and regular health check-ups." 
    }
  ];

  return (
    <PublicLayout>
      <div className="py-20 px-6">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-4">
            <div className="text-gold font-black uppercase tracking-[0.2em] text-xs">Infrastructure</div>
            <h1 className="text-5xl font-black text-navy leading-tight">World-Class Facilities</h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
              We provide a supportive and modern environment that allows students to focus on their growth and exploration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {facilities.map((f, i) => (
              <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-navy/5 shadow-xl hover:border-gold/30 transition-all group flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 bg-navy rounded-3xl flex items-center justify-center text-gold group-hover:scale-110 transition-transform shadow-lg shadow-navy/10">
                  <f.icon className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-navy">{f.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed text-sm">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-gold p-12 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-gold/20">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-navy">Safety First Environment</h2>
              <p className="text-navy/60 font-bold uppercase tracking-wider text-xs italic">CCTV Monitoring • 24/7 Security • Fire Safety Certified</p>
            </div>
            <div className="w-16 h-16 bg-navy/10 rounded-full flex items-center justify-center text-navy animate-pulse">
               <Trophy className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
