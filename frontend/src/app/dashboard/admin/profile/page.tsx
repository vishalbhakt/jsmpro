"use client";

import { useAuthStore } from "@/store/useAuthStore";
import DashboardLayout from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import api, { authAPI } from "@/lib/api";
import { User, Mail, Phone, MapPin, Save, Shield, Loader2, Camera, Settings } from "lucide-react";
import { useToastStore } from "@/store/useToastStore";

export default function AdminProfile() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const addToast = useToastStore(s => s.addToast);

  const fetchProfile = async () => {
    try {
      const res = await authAPI.profile();
      setProfile(res.data.data);
    } catch {
      addToast("Failed to fetch admin profile", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authAPI.updateProfile(profile);
      addToast("Admin settings updated successfully!");
    } catch {
      addToast("Update failed", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <DashboardLayout>
      <div className="max-w-4xl space-y-10 pb-20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-navy tracking-tight text-justify">System Administrator</h1>
            <p className="text-slate-500 font-medium mt-1">Manage global account settings and security credentials.</p>
          </div>
          <div className="w-14 h-14 bg-navy rounded-2xl flex items-center justify-center text-gold shadow-xl shadow-navy/10">
             <Settings className="w-7 h-7" />
          </div>
        </div>

        <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Avatar Section */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-[3rem] border border-navy/5 p-10 text-center shadow-sm relative overflow-hidden group">
              <div className="w-32 h-32 bg-navy rounded-full mx-auto mb-6 flex items-center justify-center text-gold text-4xl font-black ring-8 ring-gold/5 transition-all group-hover:ring-gold/10 relative">
                {(profile.username?.[0] || "?").toUpperCase()}
                <div className="absolute inset-0 bg-navy/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                   <Camera className="text-white w-8 h-8" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-navy">{profile.first_name} {profile.last_name}</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-gold mt-1">Institutional {profile.role}</p>
            </div>
            
            <div className="bg-navy rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <Shield className="w-5 h-5 text-gold" />
                <span className="text-[10px] font-black uppercase tracking-widest">System Authority</span>
              </div>
              <div className="flex items-center gap-2 relative z-10">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-emerald-400">Master Access Active</span>
              </div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
            </div>
          </div>

          {/* Details Section */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[3rem] border border-navy/5 p-10 shadow-sm space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InputGroup icon={User} label="First Name" value={profile.first_name} 
                  onChange={(v: string) => setProfile({...profile, first_name: v})} />
                <InputGroup icon={User} label="Last Name" value={profile.last_name} 
                  onChange={(v: string) => setProfile({...profile, last_name: v})} />
                <InputGroup icon={Mail} label="Email Address" value={profile.email} 
                  onChange={(v: string) => setProfile({...profile, email: v})} />
                <InputGroup icon={Phone} label="Contact Number" value={profile.phone} 
                  onChange={(v: string) => setProfile({...profile, phone: v})} />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 text-justify">Office Address</label>
                <div className="relative group">
                   <MapPin className="absolute left-5 top-5 w-4 h-4 text-slate-300 group-focus-within:text-gold transition-all" />
                   <textarea 
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl pl-14 pr-6 py-4 font-bold focus:border-gold outline-none min-h-[120px] transition-all text-navy"
                    value={profile.address || ''}
                    onChange={e => setProfile({...profile, address: e.target.value})}
                    placeholder="Enter school office location..."
                  />
                </div>
              </div>

              <button type="submit" disabled={saving} className="btn-primary w-full py-5 flex items-center justify-center gap-3 shadow-xl shadow-navy/10 rounded-2xl">
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Commit Admin Changes</>}
              </button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

function InputGroup({ icon: Icon, label, value, onChange }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
      <div className="relative group">
        <Icon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-gold transition-all" />
        <input 
          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-14 pr-6 py-4 font-bold focus:border-gold outline-none transition-all text-navy"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}
