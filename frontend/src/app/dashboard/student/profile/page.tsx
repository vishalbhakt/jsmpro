"use client";

import { useAuthStore } from "@/store/useAuthStore";
import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";
import { authAPI } from "@/lib/api";
import { 
  UserCircle, 
  Mail, 
  Phone, 
  GraduationCap, 
  Calendar,
  Save,
  Loader2,
  Lock,
  ChevronRight,
  BookOpen,
  History,
  ShieldCheck,
  Camera,
  Heart,
  Users,
  CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";
import { useToastStore } from "@/store/useToastStore";

export default function StudentProfile() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const addToast = useToastStore(s => s.addToast);

  const [form, setForm] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    phone: user?.phone || "",
    date_of_birth: user?.profile?.date_of_birth || "",
    blood_group: user?.profile?.blood_group || "",
    guardian_name: user?.profile?.guardian_name || "",
    guardian_phone: user?.profile?.guardian_phone || ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.updateProfile(form);
      addToast("Student profile updated.");
    } catch {
      addToast("Update failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-12 pb-20 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-6">
             <div className="w-24 h-24 bg-[#001f3f] rounded-[2.5rem] flex items-center justify-center text-[#d4af37] font-black text-4xl shadow-2xl shadow-[#001f3f]/20 border-4 border-white relative group cursor-pointer">
                {user.username?.[0].toUpperCase()}
                <div className="absolute inset-0 bg-[#001f3f]/60 rounded-[2.5rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <Camera className="w-8 h-8 text-white" />
                </div>
             </div>
             <div>
                <h1 className="text-4xl font-black text-[#001f3f] tracking-tight">{user.full_name}</h1>
                <div className="flex items-center gap-2 mt-1">
                   <span className="bg-[#d4af37] text-[#001f3f] text-[10px] px-3 py-1 rounded-full uppercase tracking-widest font-black">Student</span>
                   <span className="text-slate-400 font-bold text-xs uppercase tracking-widest ml-2 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-[#d4af37]" /> {user.profile?.classroom_name || "Unassigned"}
                   </span>
                </div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           <div className="lg:col-span-2">
              <div className="bg-white rounded-[3rem] border border-[#001f3f]/5 shadow-xl shadow-slate-200/50 p-10 space-y-10">
                 <div className="flex items-center justify-between border-b border-slate-50 pb-8">
                    <h3 className="text-2xl font-black text-[#001f3f]">Personal Registry</h3>
                    <UserCircle className="text-slate-200 w-8 h-8" />
                 </div>

                 <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-1">First Name</label>
                       <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-[#d4af37] text-[#001f3f]"
                         value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Last Name</label>
                       <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-[#d4af37] text-[#001f3f]"
                         value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Date of Birth</label>
                       <div className="relative">
                          <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                          <input type="date" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-5 py-3.5 font-bold outline-none focus:border-[#d4af37] text-[#001f3f]"
                            value={form.date_of_birth} onChange={e => setForm({...form, date_of_birth: e.target.value})} />
                       </div>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Blood Group</label>
                       <div className="relative">
                          <Heart className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                          <input className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-5 py-3.5 font-bold outline-none focus:border-[#d4af37] text-[#001f3f]"
                            value={form.blood_group} onChange={e => setForm({...form, blood_group: e.target.value})} placeholder="e.g. O+" />
                       </div>
                    </div>

                    <div className="md:col-span-2 pt-8 border-t border-slate-50">
                       <h4 className="text-sm font-black text-[#001f3f] uppercase tracking-widest mb-6">Guardian Information</h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-1">
                             <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Guardian Name</label>
                             <div className="relative">
                                <Users className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                <input className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-5 py-3.5 font-bold outline-none focus:border-[#d4af37] text-[#001f3f]"
                                  value={form.guardian_name} onChange={e => setForm({...form, guardian_name: e.target.value})} />
                             </div>
                          </div>
                          <div className="space-y-1">
                             <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Guardian Phone</label>
                             <div className="relative">
                                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                <input className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-5 py-3.5 font-bold outline-none focus:border-[#d4af37] text-[#001f3f]"
                                  value={form.guardian_phone} onChange={e => setForm({...form, guardian_phone: e.target.value})} />
                             </div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="md:col-span-2 pt-6">
                       <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-[#001f3f] text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-[#001f3f]/20 flex items-center justify-center gap-3 active:scale-95 transition-all"
                       >
                          {loading ? <Loader2 className="animate-spin" /> : <><Save className="w-4 h-4" /> Save Academic Identity</>}
                       </button>
                    </div>
                 </form>
              </div>
           </div>

           <div className="space-y-8">
              <div className="bg-[#001f3f] rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between h-80">
                 <div className="relative z-10 space-y-4">
                    <ShieldCheck className="w-10 h-10 text-[#d4af37]" />
                    <h3 className="text-2xl font-black italic">Admission Proof</h3>
                    <p className="text-white/40 text-xs font-bold leading-relaxed uppercase tracking-widest">Enrollment Verified for <br/><span className="font-black text-[#d4af37]">Session 2026-27</span></p>
                 </div>
                 <div className="relative z-10 bg-white/5 border border-white/10 p-4 rounded-2xl">
                    <div className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em] mb-1">Scholar ID</div>
                    <div className="font-mono text-xl font-black text-[#d4af37]">{user.profile?.admission_number || "ADM-00000"}</div>
                 </div>
                 <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#d4af37]/5 rounded-full blur-3xl"></div>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-[#001f3f]/5 p-10 shadow-xl space-y-6 text-center">
                 <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                 </div>
                 <div>
                    <h4 className="text-xl font-black text-[#001f3f]">Account Status</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#d4af37] mt-1 italic">Verified Student</p>
                 </div>
                 <p className="text-slate-400 text-xs font-medium leading-relaxed italic">Your account is fully synchronized with the institutional core.</p>
              </div>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
