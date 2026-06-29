"use client";

import { useState } from "react";
import { authAPI } from "@/lib/api";
import Link from "next/link";
import { UserPlus, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const [form, setForm] = useState({ 
    username: "", 
    email: "", 
    password: "", 
    password_confirm: "", 
    first_name: "", 
    last_name: "", 
    role: "student", 
    phone: "" 
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.password_confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await authAPI.register(form);
      setSuccess(true);
    } catch (err: any) {
      console.error("Registration error:", err);
      const backendError = err.response?.data;
      if (typeof backendError === 'object') {
         const messages = Object.entries(backendError).map(([key, val]) => {
            const field = key.charAt(0).toUpperCase() + key.slice(1);
            return `${field}: ${Array.isArray(val) ? val.join(", ") : val}`;
         });
         setError(messages.join(" | "));
      } else {
         setError("Registration failed. Please check your details.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#001f3f] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-[3rem] p-12 text-center space-y-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-[#001f3f]">Onboarding Sent!</h2>
            <p className="text-slate-400 font-medium leading-relaxed italic">
              Your profile has been recorded. An institutional head will review and authorize your credentials shortly.
            </p>
          </div>
          <Link href="/login" className="block w-full bg-[#001f3f] text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-[#001f3f]/20 hover:scale-[1.02] active:scale-95 transition-all">
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#001f3f] flex items-center justify-center p-6 py-12">
      <div className="w-full max-w-2xl bg-white rounded-[3rem] p-12 shadow-2xl space-y-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#d4af37]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="text-center space-y-3 relative z-10">
          <img src="/logo.png" alt="JSM Logo" className="w-20 h-20 object-contain mx-auto mb-4" />
          <h2 className="text-4xl font-black text-[#001f3f] tracking-tight">Create Account</h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Enroll in the JSM Shiksha Academy Ecosystem</p>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-600 p-5 rounded-2xl text-xs font-black uppercase tracking-wider border border-rose-100 flex items-center gap-4 relative z-10">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          <div className="space-y-1.5 col-span-2 md:col-span-1">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">First Name</label>
            <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-[#001f3f] focus:border-[#d4af37] outline-none transition-all" 
              value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} />
          </div>
          <div className="space-y-1.5 col-span-2 md:col-span-1">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Last Name</label>
            <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-[#001f3f] focus:border-[#d4af37] outline-none transition-all" 
              value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} />
          </div>
          <div className="space-y-1.5 col-span-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Desired Username</label>
            <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-[#001f3f] focus:border-[#d4af37] outline-none transition-all" 
              value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
          </div>
          <div className="space-y-1.5 col-span-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Institutional Email</label>
            <input type="email" required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-[#001f3f] focus:border-[#d4af37] outline-none transition-all" 
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div className="space-y-1.5 col-span-2 md:col-span-1">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">System Role</label>
            <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-[#001f3f] focus:border-[#d4af37] outline-none appearance-none cursor-pointer"
              value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>
          <div className="space-y-1.5 col-span-2 md:col-span-1">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Phone Reference</label>
            <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-[#001f3f] focus:border-[#d4af37] outline-none transition-all" 
              value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
          </div>
          <div className="space-y-1.5 col-span-2 md:col-span-1">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Secure Password</label>
            <input type="password" required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-[#001f3f] focus:border-[#d4af37] outline-none transition-all" 
              value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          </div>
          <div className="space-y-1.5 col-span-2 md:col-span-1">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Confirm Access</label>
            <input type="password" required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-[#001f3f] focus:border-[#d4af37] outline-none transition-all" 
              value={form.password_confirm} onChange={e => setForm({...form, password_confirm: e.target.value})} />
          </div>

          <button type="submit" disabled={loading} className="col-span-2 bg-[#001f3f] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all hover:bg-opacity-90 shadow-2xl shadow-[#001f3f]/20 disabled:opacity-50 mt-6 active:scale-95">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Initiate Onboarding →"}
          </button>
        </form>

        <div className="text-center pt-8 border-t border-slate-50 relative z-10">
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest">
            Already registered? <Link href="/login" className="text-[#d4af37] hover:text-opacity-80 transition-all ml-2 underline decoration-[#d4af37]/30 underline-offset-4">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
