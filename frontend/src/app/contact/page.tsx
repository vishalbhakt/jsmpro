"use client";

import PublicLayout from "@/components/PublicLayout";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { useState } from "react";
import { cmsAPI } from "@/lib/api";
import { useToastStore } from "@/store/useToastStore";

export default function ContactPage() {
  const [form, setForm] = useState({ 
    full_name: "", 
    email: "", 
    phone: "", 
    subject: "General Inquiry", 
    message: "" 
  });
  const [loading, setLoading] = useState(false);
  const addToast = useToastStore(s => s.addToast);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await cmsAPI.inquiries.create(form);
      addToast("Message sent! We will get back to you shortly.");
      setForm({ full_name: "", email: "", phone: "", subject: "General Inquiry", message: "" });
    } catch (err) {
      console.error("Failed to send inquiry", err);
      addToast("Failed to send message.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="py-20 px-6">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-4">
            <div className="text-[#d4af37] font-black uppercase tracking-[0.2em] text-xs">Reach Out</div>
            <h1 className="text-5xl font-black text-[#001f3f] leading-tight">Contact Us</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Info Cards */}
            <div className="lg:col-span-1 space-y-8">
              <ContactInfoCard icon={MapPin} title="Our Location" detail="RZ-132, Nihal Vihar, 50 Feet Road, Near Hanuman Mandir, New Delhi" />
              <ContactInfoCard icon={Phone} title="Phone Number" detail="+91 9871234567" />
              <ContactInfoCard icon={Mail} title="Email Address" detail="info@jsmacademy.com" />
              <ContactInfoCard icon={Clock} title="Working Hours" detail="Mon – Sat: 8:00 AM – 2:00 PM" />
            </div>

            {/* Form */}
            <div className="lg:col-span-2 bg-white rounded-[3rem] p-10 border border-[#001f3f]/5 shadow-2xl space-y-10">
               <div className="space-y-2 text-center lg:text-left">
                  <h3 className="text-3xl font-black text-[#001f3f]">Send a Message</h3>
                  <p className="text-slate-400 font-medium italic">Have a question? We're here to help.</p>
               </div>

               <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2 col-span-2 md:col-span-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Your Full Name</label>
                    <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 font-bold focus:border-[#d4af37] outline-none transition-all text-[#001f3f]"
                      value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} />
                  </div>
                  <div className="space-y-2 col-span-2 md:col-span-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                    <input type="email" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 font-bold focus:border-[#d4af37] outline-none transition-all text-[#001f3f]"
                      value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
                    <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 font-bold focus:border-[#d4af37] outline-none transition-all text-[#001f3f]"
                      value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Your Message</label>
                    <textarea required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 font-bold focus:border-[#d4af37] outline-none transition-all min-h-[150px] text-[#001f3f]"
                      value={form.message} onChange={e => setForm({...form, message: e.target.value})} />
                  </div>
                  <button type="submit" disabled={loading} className="col-span-2 bg-[#001f3f] text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl hover:bg-opacity-90 active:scale-95 transition-all">
                     {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <><Send className="w-5 h-5" /> Send Message</>}
                  </button>
               </form>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

function ContactInfoCard({ icon: Icon, title, detail }: any) {
  return (
    <div className="flex gap-6 p-8 bg-white rounded-3xl border border-[#001f3f]/5 hover:border-[#d4af37]/30 transition-all group">
      <div className="w-14 h-14 bg-[#001f3f] rounded-2xl flex items-center justify-center text-[#d4af37] shrink-0 shadow-lg shadow-[#001f3f]/10 group-hover:scale-110 transition-transform">
        <Icon className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <h4 className="text-lg font-bold text-[#001f3f]">{title}</h4>
        <p className="text-sm text-slate-500 font-medium leading-relaxed">{detail}</p>
      </div>
    </div>
  );
}
