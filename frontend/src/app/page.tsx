"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { 
  ArrowRight, 
  GraduationCap, 
  ShieldCheck, 
  Users, 
  Calendar,
  BookOpen,
  Music,
  HeartPulse,
  Computer,
  Trophy
} from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="bg-pearl selection:bg-gold/30">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-navy pt-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gold/10 text-gold rounded-full text-xs font-black uppercase tracking-widest border border-gold/20">
              <ShieldCheck className="w-4 h-4" /> Admission Open for Session 2024-25
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-white leading-[1.05] tracking-tight">
              Nurturing <span className="text-gold">Excellence</span> Since 2014.
            </h1>
            <p className="text-lg text-white/60 max-w-lg leading-relaxed font-medium">
              Join JSM Shiksha Academy, where we combine traditional values with modern learning methodologies to prepare your child for a bright future.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/admission" className="btn-gold py-4 px-10 text-sm tracking-widest uppercase font-black shadow-xl shadow-gold/10 flex items-center gap-3">
                Apply Now <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/about" className="border-2 border-white/10 text-white hover:bg-white/5 py-4 px-10 rounded-xl text-sm uppercase font-black tracking-widest transition-all">
                Learn More
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative hidden lg:block"
          >
            <div className="aspect-square bg-gradient-to-br from-gold/20 to-transparent rounded-[4rem] rotate-6 border border-white/5 p-4 backdrop-blur-3xl overflow-hidden">
               <div className="w-full h-full bg-navy-light/50 rounded-[3rem] border border-white/5 flex items-center justify-center text-white/20">
                  <GraduationCap className="w-64 h-64 opacity-10" />
               </div>
            </div>
            {/* Stats Floaters */}
            <div className="absolute top-10 -left-10 bg-white p-6 rounded-3xl shadow-2xl border border-navy/5 flex items-center gap-4 animate-bounce duration-[4000ms]">
               <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center">
                  <Users className="w-6 h-6" />
               </div>
               <div>
                  <div className="text-2xl font-black text-navy leading-none">500+</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Students</div>
               </div>
            </div>
            <div className="absolute bottom-10 -right-10 bg-white p-6 rounded-3xl shadow-2xl border border-navy/5 flex items-center gap-4 animate-bounce duration-[3000ms]">
               <div className="w-12 h-12 bg-gold/10 text-gold rounded-2xl flex items-center justify-center">
                  <Trophy className="w-6 h-6" />
               </div>
               <div>
                  <div className="text-2xl font-black text-navy leading-none">10+ Years</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Excellence</div>
               </div>
            </div>
          </motion.div>
        </div>
        
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gold/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
      </section>

      {/* Core Highlights */}
      <section className="py-32 max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10 -mt-20 relative z-20">
        {[
          { icon: ShieldCheck, title: "Secure Environment", desc: "Safe, engaging and supportive learning atmosphere for every child." },
          { icon: Users, title: "Expert Faculty", desc: "Personalized attention from highly qualified and dedicated teachers." },
          { icon: GraduationCap, title: "Holistic Growth", desc: "Balanced focus on academics, co-curricular activities and character." }
        ].map((item, i) => (
          <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-navy/5 shadow-xl shadow-navy/5 hover:border-gold/30 transition-all group">
            <div className="w-14 h-14 bg-navy rounded-2xl flex items-center justify-center text-gold mb-8 group-hover:scale-110 transition-transform">
              <item.icon className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black text-navy mb-4 leading-tight">{item.title}</h3>
            <p className="text-slate-500 font-medium leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* About Summary */}
      <section className="py-32 bg-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="relative">
            <div className="aspect-[4/5] bg-slate-100 rounded-[3rem] border border-navy/5 overflow-hidden">
               <div className="w-full h-full flex items-center justify-center text-slate-300 italic font-medium p-12 text-center leading-relaxed">
                  [Professional School Environment Image]
               </div>
            </div>
            <div className="absolute -bottom-10 -right-10 bg-gold p-10 rounded-[2rem] text-navy shadow-2xl hidden md:block">
              <div className="text-4xl font-black mb-1">100%</div>
              <div className="text-xs font-black uppercase tracking-widest opacity-80">Commitment to <br/>Quality Education</div>
            </div>
          </div>
          <div className="space-y-8">
            <div className="text-gold font-black uppercase tracking-[0.2em] text-xs">Our Philosophy</div>
            <h2 className="text-5xl font-black text-navy leading-tight">Where Every Child's <br/><span className="text-gold italic">Potential</span> Is Unlocked.</h2>
            <p className="text-lg text-slate-600 leading-relaxed font-medium">
              JSM Shiksha Academy is dedicated to nurturing young minds from Kindergarten to Grade 8. We provide quality education through a balanced approach that combines academics, discipline, and character development.
            </p>
            <ul className="space-y-4">
              {['Mission-Driven Learning', 'State-of-the-art Infrastructure', 'Empowering Future Leaders'].map(item => (
                <li key={item} className="flex items-center gap-4 text-navy font-bold">
                  <div className="w-6 h-6 bg-gold/20 text-gold rounded-full flex items-center justify-center">
                    <ArrowRight className="w-3 h-3" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/about" className="btn-primary inline-flex mt-4">Discover Our Vision</Link>
          </div>
        </div>
      </section>

      {/* Academic Levels */}
      <section className="py-32 bg-navy relative">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-12 relative z-10">
          <div className="space-y-4">
            <div className="text-gold font-black uppercase tracking-[0.2em] text-xs">Academic Excellence</div>
            <h2 className="text-5xl font-black text-white leading-tight">Levels of Learning</h2>
            <p className="text-white/40 max-w-xl mx-auto font-medium">Progressive educational stages designed for age-appropriate development.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { level: "Kindergarten", name: "(K.G.)", focus: "Play, Learn & Grow" },
              { level: "Primary", name: "(Grades 1-2)", focus: "Strong Foundations" },
              { level: "Prep", name: "(Grades 3-5)", focus: "Concept & Curiosity" },
              { level: "Middle School", name: "(Grades 6-8)", focus: "Preparing for Future" }
            ].map((item, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] hover:bg-gold/10 hover:border-gold/30 transition-all text-left group">
                <div className="text-4xl font-black text-white/10 mb-6 group-hover:text-gold/20 transition-all">0{i+1}</div>
                <h4 className="text-xl font-black text-white">{item.level}</h4>
                <div className="text-gold text-sm font-bold mt-1 mb-6 uppercase tracking-widest">{item.name}</div>
                <p className="text-white/50 text-sm font-medium leading-relaxed">{item.focus}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities */}
      <section className="py-32 bg-pearl">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-navy/5 pb-16">
            <div className="space-y-4">
              <div className="text-gold font-black uppercase tracking-[0.2em] text-xs">Modern Campus</div>
              <h2 className="text-5xl font-black text-navy leading-tight">World-Class Facilities</h2>
            </div>
            <p className="text-slate-500 max-w-md font-medium">We provide students with the resources they need to explore their interests and excel in every field.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: BookOpen, title: "Smart Library", desc: "Rich collection of books and digital learning resources." },
              { icon: Computer, title: "Computer Lab", desc: "Modern systems with high-speed internet for tech-savviness." },
              { icon: Trophy, title: "Sports Ground", desc: "Large playground for outdoor physical activities and sports." },
              { icon: Music, title: "Art & Craft", desc: "Creative environment for artistic expression and imagination." },
              { icon: HeartPulse, title: "Medical Room", desc: "First aid and health monitoring support for every student." },
              { icon: ShieldCheck, title: "Transport", desc: "Safe and reliable transportation services across the city." }
            ].map((f, i) => (
              <div key={i} className="flex gap-6 p-8 bg-white rounded-3xl border border-navy/5 hover:border-gold/30 transition-all group">
                <div className="w-14 h-14 bg-navy/5 text-navy rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-navy group-hover:text-gold transition-all">
                  <f.icon className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-bold text-navy">{f.title}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto bg-gold rounded-[3rem] p-16 md:p-24 text-center space-y-10 relative overflow-hidden shadow-2xl shadow-gold/20">
          <div className="relative z-10 space-y-4">
            <h2 className="text-4xl md:text-6xl font-black text-navy leading-tight">Ready to Start Your <br/>Child's Journey?</h2>
            <p className="text-lg text-navy/60 max-w-lg mx-auto font-bold uppercase tracking-wider italic">Secure their future with JSM Shiksha Academy today.</p>
          </div>
          <div className="relative z-10 flex flex-wrap justify-center gap-4">
            <Link href="/admission" className="bg-navy text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-navy-light transition-all shadow-xl shadow-navy/20">Enroll Now</Link>
            <Link href="/contact" className="bg-white/20 border-2 border-navy/10 text-navy px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-white/40 transition-all">Inquiry</Link>
          </div>
          
          {/* Decors */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-navy/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
