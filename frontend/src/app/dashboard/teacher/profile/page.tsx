"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import api, { authAPI, subjectsAPI } from "@/lib/api";
import { User, Mail, Phone, MapPin, Save, Shield, Loader2, Camera, Briefcase } from "lucide-react";
import { useToastStore } from "@/store/useToastStore";

export default function TeacherProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const addToast = useToastStore(s => s.addToast);

  const fetchData = async () => {
    try {
      const [profRes, subRes] = await Promise.all([
        authAPI.profile(),
        subjectsAPI.list()
      ]);
      setProfile(profRes.data.data);
      setSubjects(subRes.data.data);
    } catch {
      addToast("Failed to fetch profile", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authAPI.updateProfile(profile);
      addToast("Professional profile updated!");
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
        <div>
          <h1 className="text-4xl font-black text-navy tracking-tight">Professional Identity</h1>
          <p className="text-slate-500 font-medium mt-1">Manage your academic credentials and contact information.</p>
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
              <p className="text-[10px] font-black uppercase tracking-widest text-gold mt-1">{profile.role} Personnel</p>
              
              <div className="mt-6 pt-6 border-t border-navy/5">
                 <div className="text-[10px] font-black text-slate-300 uppercase mb-2">Qualifications</div>
                 <div className="font-bold text-navy text-sm">{profile.teacher_profile?.qualification || 'Not Specified'}</div>
              </div>
            </div>
            
            <div className="bg-navy rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <Shield className="w-5 h-5 text-gold" />
                <span className="text-[10px] font-black uppercase tracking-widest">Verification</span>
              </div>
              <div className="flex items-center gap-2 relative z-10">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-bold text-emerald-400">Academic Access Active</span>
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
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Professional Summary</label>
                <div className="relative group">
                   <Briefcase className="absolute left-5 top-5 w-4 h-4 text-slate-300 group-focus-within:text-gold transition-all" />
                   <textarea 
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl pl-14 pr-6 py-4 font-bold focus:border-gold outline-none min-h-[120px] transition-all text-navy"
                    value={profile.address || ''}
                    onChange={e => setProfile({...profile, address: e.target.value})}
                    placeholder="Describe your teaching experience and expertise..."
                  />
                </div>
              </div>

              <button type="submit" disabled={saving} className="btn-primary w-full py-5 flex items-center justify-center gap-3 shadow-xl shadow-navy/10 rounded-2xl">
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Commit Changes</>}
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
