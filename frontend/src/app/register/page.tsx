"use client";

import { useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import { UserPlus, Loader2, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const [form, setForm] = useState({ 
    username: "", 
    email: "", 
    password: "", 
    password_confirm: "", 
    first_name: "", 
    last_name: "", 
    role: "STUDENT", 
    phone: "" 
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/auth/register/", form);
      setSuccess(true);
    } catch (err: any) {
      setError(Object.values(err.response?.data?.error || {}).flat().join(", ") || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-3xl p-10 text-center space-y-6">
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-navy">Registration Received!</h2>
          <p className="text-slate-500 font-medium leading-relaxed">
            Your account has been created successfully. An admin will review and approve your profile shortly.
          </p>
          <Link href="/login" className="btn-primary inline-block w-full">
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-6 py-12">
      <div className="w-full max-w-xl bg-white rounded-3xl p-8 shadow-2xl space-y-8">
        <div className="text-center space-y-2">
          <img src="/logo.png" alt="JSM Logo" className="w-24 h-24 object-contain mx-auto mb-4" />
          <h2 className="text-3xl font-black text-navy">Create Account</h2>
          <p className="text-slate-400 font-medium">Join the JSM Shiksha Academy</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5 col-span-2 md:col-span-1">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">First Name</label>
            <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold focus:border-gold outline-none" 
              value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} />
          </div>
          <div className="space-y-1.5 col-span-2 md:col-span-1">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Last Name</label>
            <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold focus:border-gold outline-none" 
              value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} />
          </div>
          <div className="space-y-1.5 col-span-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Username</label>
            <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold focus:border-gold outline-none" 
              value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
          </div>
          <div className="space-y-1.5 col-span-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Email Address</label>
            <input type="email" required className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold focus:border-gold outline-none" 
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div className="space-y-1.5 col-span-2 md:col-span-1">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Role</label>
            <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold focus:border-gold outline-none"
              value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
              <option value="STUDENT">Student</option>
              <option value="TEACHER">Teacher</option>
              <option value="PARENT">Parent</option>
            </select>
          </div>
          <div className="space-y-1.5 col-span-2 md:col-span-1">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Phone</label>
            <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold focus:border-gold outline-none" 
              value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
          </div>
          <div className="space-y-1.5 col-span-2 md:col-span-1">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Password</label>
            <input type="password" required className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold focus:border-gold outline-none" 
              value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          </div>
          <div className="space-y-1.5 col-span-2 md:col-span-1">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Confirm Password</label>
            <input type="password" required className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold focus:border-gold outline-none" 
              value={form.password_confirm} onChange={e => setForm({...form, password_confirm: e.target.value})} />
          </div>

          <button type="submit" disabled={loading} className="col-span-2 bg-navy text-white py-4 rounded-xl font-black text-sm tracking-widest uppercase flex items-center justify-center gap-2 transition-all hover:bg-navy-light disabled:opacity-50 mt-4">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account →"}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-slate-100">
          <p className="text-slate-400 text-sm font-bold">
            Already have an account? <Link href="/login" className="text-gold">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
