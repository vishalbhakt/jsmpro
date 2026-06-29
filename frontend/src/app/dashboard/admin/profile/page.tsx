"use client";

import { useAuthStore } from "@/store/useAuthStore";
import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";
import { authAPI } from "@/lib/api";
import { 
  UserCircle, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Camera,
  Save,
  Loader2,
  Lock,
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { useToastStore } from "@/store/useToastStore";

export default function AdminProfile() {
  const { user, setAuth, token, refreshToken } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || ""
  });
  const addToast = useToastStore(s => s.addToast);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.updateProfile(form);
      addToast("Administrative profile updated.");
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
                   <span className="bg-[#d4af37] text-[#001f3f] text-[10px] px-3 py-1 rounded-full uppercase tracking-widest font-black border border-[#d4af37]/20 shadow-sm">Master Admin</span>
                   <span className="text-slate-400 font-bold text-xs uppercase tracking-widest ml-2 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" /> Authorized Identity
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
                       <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none focus:border-[#d4af37] text-[#001f3f]"
                         value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Last Name</label>
                       <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none focus:border-[#d4af37] text-[#001f3f]"
                         value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Email Address</label>
                       <div className="relative">
                          <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                          <input required disabled type="email" className="w-full bg-slate-100 border-2 border-slate-100 rounded-2xl pl-12 pr-5 py-4 font-bold outline-none text-slate-400 cursor-not-allowed"
                            value={form.email} />
                       </div>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Phone Number</label>
                       <div className="relative">
                          <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                          <input className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-5 py-4 font-bold outline-none focus:border-[#d4af37] text-[#001f3f]"
                            value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                       </div>
                    </div>
                    <div className="md:col-span-2 space-y-1">
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Official Address</label>
                       <div className="relative">
                          <MapPin className="absolute left-5 top-4 w-4 h-4 text-slate-300" />
                          <textarea className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-5 py-4 font-bold outline-none focus:border-[#d4af37] min-h-[120px] text-[#001f3f]"
                            value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
                       </div>
                    </div>
                    
                    <div className="md:col-span-2 pt-6">
                       <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-[#001f3f] text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-[#001f3f]/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-all hover:bg-opacity-90"
                       >
                          {loading ? <Loader2 className="animate-spin" /> : <><Save className="w-4 h-4" /> Save Preferences</>}
                       </button>
                    </div>
                 </form>
              </div>
           </div>

           <div className="space-y-8">
              <div className="bg-[#001f3f] rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between h-72">
                 <div className="relative z-10 space-y-4">
                    <Lock className="w-10 h-10 text-[#d4af37]" />
                    <h3 className="text-2xl font-black italic">Security Control</h3>
                    <p className="text-white/40 text-xs font-medium leading-relaxed">Protect your administrative access by updating your credentials periodically.</p>
                 </div>
                 <button className="relative z-10 w-full bg-[#d4af37] text-[#001f3f] py-4 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2">
                    Change Password <ChevronRight className="w-3 h-3" />
                 </button>
                 <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#d4af37]/5 rounded-full blur-3xl"></div>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-[#001f3f]/5 p-10 shadow-xl space-y-6">
                 <h4 className="text-xl font-black text-[#001f3f]">System Metadata</h4>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs">
                       <span className="font-bold text-slate-400 uppercase tracking-widest">Account Created</span>
                       <span className="font-black text-[#001f3f]">{user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                       <span className="font-bold text-slate-400 uppercase tracking-widest">Last Login</span>
                       <span className="font-black text-[#001f3f]">Just now</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                       <span className="font-bold text-slate-400 uppercase tracking-widest">Access Node</span>
                       <span className="font-black text-[#001f3f]">Delhi, IN</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
