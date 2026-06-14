"use client";

import PublicLayout from "@/components/PublicLayout";
import { useState } from "react";
import api from "@/lib/api";
import { useToastStore } from "@/store/useToastStore";
import { FileText, CheckCircle, Send, AlertCircle, Info } from "lucide-react";

export default function AdmissionPage() {
  const [form, setForm] = useState({ 
    student_name: "", 
    parent_name: "", 
    phone: "", 
    email: "", 
    target_class: "", 
    message: "" 
  });
  const [loading, setLoading] = useState(false);
  const addToast = useToastStore(s => s.addToast);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/enquiries/", form);
      addToast("Inquiry submitted successfully! We will call you soon.");
      setForm({ student_name: "", parent_name: "", phone: "", email: "", target_class: "", message: "" });
    } catch {
      addToast("Failed to submit inquiry. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div className="space-y-12">
            <div className="space-y-4">
              <div className="text-gold font-black uppercase tracking-[0.2em] text-xs">Admissions 2024-25</div>
              <h1 className="text-5xl font-black text-navy leading-tight">Join Our Academy</h1>
              <p className="text-lg text-slate-500 font-medium">Limited seats available. We invite parents to visit our campus or submit an inquiry below.</p>
            </div>

            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="w-12 h-12 bg-navy text-gold rounded-xl flex items-center justify-center shrink-0 font-black text-lg shadow-lg shadow-navy/10">1</div>
                <div className="space-y-2">
                  <h4 className="text-xl font-bold text-navy">Submit Inquiry</h4>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed text-justify">Fill the form on this page or visit the school office to collect the prospectus.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-12 h-12 bg-navy text-gold rounded-xl flex items-center justify-center shrink-0 font-black text-lg shadow-lg shadow-navy/10">2</div>
                <div className="space-y-2">
                  <h4 className="text-xl font-bold text-navy">Interaction</h4>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed text-justify">A short interaction session with the student and parents will be scheduled.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-12 h-12 bg-navy text-gold rounded-xl flex items-center justify-center shrink-0 font-black text-lg shadow-lg shadow-navy/10">3</div>
                <div className="space-y-2">
                  <h4 className="text-xl font-bold text-navy">Documentation</h4>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed text-justify">Submit the required documents (Birth Certificate, Aadhaar, Photos, Transfer Certificate).</p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-8 rounded-3xl flex items-start gap-4">
              <Info className="w-6 h-6 text-amber-500 shrink-0" />
              <div className="space-y-1">
                <h5 className="font-black text-amber-900 text-sm uppercase tracking-widest">Notice</h5>
                <p className="text-sm text-amber-800/70 font-bold italic leading-relaxed">Admission is granted on a first-come, first-served basis subject to seat availability.</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-[3rem] p-10 border-2 border-navy/5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <h3 className="text-3xl font-black text-navy mb-8">Inquiry Form</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Student Name</label>
                  <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 font-bold focus:border-gold outline-none transition-all" 
                    value={form.student_name} onChange={e => setForm({...form, student_name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Parent Name</label>
                  <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 font-bold focus:border-gold outline-none transition-all" 
                    value={form.parent_name} onChange={e => setForm({...form, parent_name: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
                  <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 font-bold focus:border-gold outline-none transition-all" 
                    value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Target Class</label>
                  <select required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 font-bold focus:border-gold outline-none transition-all"
                    value={form.target_class} onChange={e => setForm({...form, target_class: e.target.value})}>
                    <option value="">Select Class</option>
                    {['K.G.', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Message / Queries</label>
                <textarea className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 font-bold focus:border-gold outline-none transition-all min-h-[120px]" 
                  value={form.message} onChange={e => setForm({...form, message: e.target.value})} />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-4 flex items-center justify-center gap-3">
                {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <><Send className="w-4 h-4" /> Submit Inquiry</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
