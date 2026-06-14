"use client";

import PublicLayout from "@/components/PublicLayout";
import { motion } from "framer-motion";
import { ShieldCheck, Target, Heart, Users } from "lucide-react";

export default function AboutPage() {
  return (
    <PublicLayout>
      <div className="py-20 px-6">
        <div className="max-w-7xl mx-auto space-y-24">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="text-gold font-black uppercase tracking-[0.2em] text-xs">Our Story</div>
            <h1 className="text-5xl md:text-7xl font-black text-navy leading-tight">Empowering Minds <br/>Since 2014.</h1>
          </div>

          {/* Mission/Vision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="bg-white p-12 rounded-[3rem] border border-navy/5 shadow-xl space-y-6">
              <div className="w-16 h-16 bg-navy rounded-2xl flex items-center justify-center text-gold">
                <Target className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-black text-navy">Our Mission</h2>
              <p className="text-slate-500 font-medium leading-relaxed italic">
                "To provide a safe, engaging, and supportive learning environment where every student receives personalized attention and opportunities for holistic growth."
              </p>
            </div>
            <div className="bg-navy p-12 rounded-[3rem] shadow-xl space-y-6 text-white">
              <div className="w-16 h-16 bg-gold rounded-2xl flex items-center justify-center text-navy">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-black">Our Vision</h2>
              <p className="text-white/60 font-medium leading-relaxed italic">
                "To prepare young minds for a bright and successful future by combining expert faculty excellence with modern infrastructure and character building."
              </p>
            </div>
          </div>

          {/* Values */}
          <div className="space-y-16">
            <div className="text-center">
              <h2 className="text-4xl font-black text-navy">Core Values</h2>
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
