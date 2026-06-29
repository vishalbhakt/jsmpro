"use client";

import PublicLayout from "@/components/PublicLayout";
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, GraduationCap } from "lucide-react";
import { useState } from "react";
import { cmsAPI } from "@/lib/api";
import { useToastStore } from "@/store/useToastStore";

export default function ContactPage() {
  const [activeForm, setActiveForm] = useState<"contact" | "inquiry">("contact");
  const [loading, setLoading] = useState(false);
  const addToast = useToastStore(s => s.addToast);

  const [contactForm, setContactForm] = useState({ 
    name: "", 
    email: "", 
    phone: "", 
    subject: "General Inquiry", 
    message: "" 
  });

  const [inquiryForm, setInquiryForm] = useState({
    student_name: "",
    parent_name: "",
    phone: "",
    email: "",
    target_class: "",
    message: ""
  });

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await cmsAPI.contactMessages.create(contactForm);
      addToast("Message sent! We will get back to you shortly.");
      setContactForm({ name: "", email: "", phone: "", subject: "General Inquiry", message: "" });
    } catch (err) {
      console.error("Failed to send contact message", err);
      addToast("Failed to send message.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        student_name: inquiryForm.student_name,
        parent_name: inquiryForm.parent_name,
        guardian_name: inquiryForm.parent_name,
        phone: inquiryForm.phone,
        email: inquiryForm.email,
        preferred_class: inquiryForm.target_class,
        message: inquiryForm.message
      };
      await cmsAPI.inquiries.create(payload);
      addToast("Admission inquiry submitted successfully! We will call you soon.");
      setInquiryForm({ student_name: "", parent_name: "", phone: "", email: "", target_class: "", message: "" });
    } catch (err) {
      console.error("Failed to submit inquiry", err);
      addToast("Failed to submit inquiry. Please try again.", "error");
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
            <h1 className="text-5xl font-black text-[#001f3f] leading-tight">Contact & Inquiries</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Info Cards */}
            <div className="lg:col-span-1 space-y-8">
              <ContactInfoCard icon={MapPin} title="Our Location" detail="RZ-132, Nihal Vihar, 50 Feet Road, Near Hanuman Mandir, New Delhi" />
              <ContactInfoCard icon={Phone} title="Phone Number" detail="+91 9871234567" />
              <ContactInfoCard icon={Mail} title="Email Address" detail="info@jsmacademy.com" />
              <ContactInfoCard icon={Clock} title="Working Hours" detail="Mon – Sat: 8:00 AM – 2:00 PM" />
            </div>

            {/* Form Container */}
            <div className="lg:col-span-2 bg-white rounded-[3rem] p-10 border border-[#001f3f]/5 shadow-2xl space-y-10">
               {/* Form Selector Tabs */}
               <div className="flex border-b border-slate-100 gap-6 pb-px">
                 <button
                   onClick={() => setActiveForm("contact")}
                   className={`pb-4 px-2 text-xs font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${
                     activeForm === "contact"
                       ? "border-[#d4af37] text-[#001f3f] font-black"
                       : "border-transparent text-slate-400 hover:text-[#001f3f]"
                   }`}
                 >
                   <MessageSquare className="w-4 h-4" /> General Query
                 </button>
                 <button
                   onClick={() => setActiveForm("inquiry")}
                   className={`pb-4 px-2 text-xs font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${
                     activeForm === "inquiry"
                       ? "border-[#d4af37] text-[#001f3f] font-black"
                       : "border-transparent text-slate-400 hover:text-[#001f3f]"
                   }`}
                 >
                   <GraduationCap className="w-4 h-4" /> Admission Inquiry
                 </button>
               </div>

               {activeForm === "contact" ? (
                 <form onSubmit={handleContactSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2 col-span-2 md:col-span-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Your Full Name</label>
                      <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 font-bold focus:border-[#d4af37] outline-none transition-all text-[#001f3f]"
                        value={contactForm.name} onChange={e => setContactForm({...contactForm, name: e.target.value})} />
                    </div>
                    <div className="space-y-2 col-span-2 md:col-span-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                      <input type="email" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 font-bold focus:border-[#d4af37] outline-none transition-all text-[#001f3f]"
                        value={contactForm.email} onChange={e => setContactForm({...contactForm, email: e.target.value})} />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
                      <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 font-bold focus:border-[#d4af37] outline-none transition-all text-[#001f3f]"
                        value={contactForm.phone} onChange={e => setContactForm({...contactForm, phone: e.target.value})} />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Your Message</label>
                      <textarea required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 font-bold focus:border-[#d4af37] outline-none transition-all min-h-[150px] text-[#001f3f]"
                        value={contactForm.message} onChange={e => setContactForm({...contactForm, message: e.target.value})} />
                    </div>
                    <button type="submit" disabled={loading} className="col-span-2 bg-[#001f3f] text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl hover:bg-opacity-90 active:scale-95 transition-all">
                       {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <><Send className="w-5 h-5" /> Send Message</>}
                    </button>
                 </form>
               ) : (
                 <form onSubmit={handleInquirySubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Student Name</label>
                      <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 font-bold focus:border-[#d4af37] outline-none transition-all text-[#001f3f]"
                        value={inquiryForm.student_name} onChange={e => setInquiryForm({...inquiryForm, student_name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Parent/Guardian Name</label>
                      <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 font-bold focus:border-[#d4af37] outline-none transition-all text-[#001f3f]"
                        value={inquiryForm.parent_name} onChange={e => setInquiryForm({...inquiryForm, parent_name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
                      <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 font-bold focus:border-[#d4af37] outline-none transition-all text-[#001f3f]"
                        value={inquiryForm.phone} onChange={e => setInquiryForm({...inquiryForm, phone: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                      <input type="email" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 font-bold focus:border-[#d4af37] outline-none transition-all text-[#001f3f]"
                        value={inquiryForm.email} onChange={e => setInquiryForm({...inquiryForm, email: e.target.value})} />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Target Class</label>
                      <select required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 font-bold focus:border-[#d4af37] outline-none transition-all text-[#001f3f] appearance-none"
                        value={inquiryForm.target_class} onChange={e => setInquiryForm({...inquiryForm, target_class: e.target.value})}>
                        <option value="">Select Class</option>
                        {['K.G.', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2 col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Message / Query Details</label>
                      <textarea required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 font-bold focus:border-[#d4af37] outline-none transition-all min-h-[150px] text-[#001f3f]"
                        value={inquiryForm.message} onChange={e => setInquiryForm({...inquiryForm, message: e.target.value})} />
                    </div>
                    <button type="submit" disabled={loading} className="col-span-2 bg-[#001f3f] text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl hover:bg-opacity-90 active:scale-95 transition-all">
                       {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <><Send className="w-5 h-5" /> Submit Inquiry</>}
                    </button>
                 </form>
               )}
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
