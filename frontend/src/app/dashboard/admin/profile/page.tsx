"use client";

import { useAuthStore } from "@/store/useAuthStore";
import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
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
  ChevronRight,
  Eye,
  Bell,
  Palette,
  Globe,
  Settings,
  Trash2,
  LockKeyhole
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToastStore } from "@/store/useToastStore";
import { useRouter } from "next/navigation";

export default function AdminProfile() {
  const { user, setUser, logout } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"general" | "settings" | "security">("general");
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const addToast = useToastStore(s => s.addToast);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    address: "",
    bio: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    profile_visibility: true,
    email_notifications: true,
    system_notifications: true,
    theme: "light",
    language: "en"
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_new_password: ""
  });

  // Pre-fill existing data once user object hydrates
  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
        date_of_birth: user.date_of_birth || "",
        gender: user.gender || "",
        address: user.address || "",
        bio: user.bio || "",
        city: user.city || "",
        state: user.state || "",
        country: user.country || "",
        pincode: user.pincode || "",
        profile_visibility: user.profile_visibility ?? true,
        email_notifications: user.email_notifications ?? true,
        system_notifications: user.system_notifications ?? true,
        theme: user.theme || "light",
        language: user.language || "en"
      });
    }
  }, [user]);

  if (!user) return null;

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.updateProfile(form);
      setUser(res.data);
      addToast("Administrative profile saved successfully.");
    } catch (err: any) {
      console.error(err);
      addToast("Failed to update profile info.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_new_password) {
      addToast("Passwords do not match.", "error");
      return;
    }
    setPasswordLoading(true);
    try {
      await authAPI.changePassword(passwordForm);
      addToast("Credentials updated successfully. Please sign in again.");
      setPasswordForm({ current_password: "", new_password: "", confirm_new_password: "" });
      
      // Force re-login after password change
      setTimeout(() => {
        logout();
        router.push("/login");
      }, 1500);
    } catch (err: any) {
      console.error(err);
      if (err.response?.data) {
        const errorMsg = Object.values(err.response.data).flat().join(" ");
        addToast(errorMsg || "Failed to update credentials.", "error");
      } else {
        addToast("Failed to update credentials.", "error");
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      addToast("File size too large. Max 5MB allowed.", "error");
      return;
    }

    // Validate type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      addToast("Invalid file type. Supported formats: JPG, JPEG, PNG, WEBP", "error");
      return;
    }

    const fd = new FormData();
    fd.append("avatar", file);

    setLoading(true);
    try {
      const res = await authAPI.updateProfile(fd);
      setUser(res.data);
      addToast("Profile picture updated successfully.");
    } catch (err) {
      console.error(err);
      addToast("Failed to upload avatar.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarRemove = async () => {
    if (!confirm("Are you sure you want to remove your profile picture?")) return;
    setLoading(true);
    try {
      // Send null to clear ImageField
      const res = await authAPI.updateProfile({ avatar: null });
      setUser(res.data);
      addToast("Profile picture removed.");
    } catch (err) {
      console.error(err);
      addToast("Failed to remove profile picture.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-12 pb-20 max-w-6xl mx-auto">
        {/* Banner Section */}
        <div className="bg-gradient-to-r from-[#001f3f] to-[#001429] rounded-[3rem] p-10 md:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border border-white/5">
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10 text-center md:text-left">
            <div className="relative group shrink-0">
              <div className="w-28 h-28 bg-[#001429] rounded-[2.5rem] flex items-center justify-center text-[#d4af37] font-black text-4xl shadow-inner border-4 border-white/10 overflow-hidden relative">
                {user.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user.username?.[0].toUpperCase()
                )}
              </div>
              <label className="absolute inset-0 bg-slate-900/60 rounded-[2.5rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="w-8 h-8 text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tight">{user.first_name} {user.last_name}</h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <span className="bg-[#d4af37] text-[#001f3f] text-[9px] px-3.5 py-1 rounded-full uppercase tracking-widest font-black border border-white/10 shadow-sm">
                  {user.role}
                </span>
                <span className="text-white/60 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> System Authorized Profile
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3 relative z-10">
            {user.avatar && (
              <button 
                onClick={handleAvatarRemove}
                className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border border-rose-500/20 transition-all flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Remove Photo
              </button>
            )}
            <label className="bg-white/10 hover:bg-white/20 text-white px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest border border-white/10 transition-all cursor-pointer flex items-center gap-2">
              <Camera className="w-4 h-4" /> Change Photo
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>
          {/* Decorative shapes */}
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-[#d4af37]/5 rounded-full blur-3xl"></div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 gap-6 pb-px">
          {(["general", "settings", "security"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-2 text-xs font-black uppercase tracking-widest border-b-2 transition-all capitalize ${
                activeTab === tab 
                  ? "border-[#d4af37] text-[#001f3f] font-black" 
                  : "border-transparent text-slate-400 hover:text-[#001f3f]"
              }`}
            >
              {tab === "general" ? "General Info" : tab === "settings" ? "Account Settings" : "Security & Password"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {activeTab === "general" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white rounded-[3rem] border border-[#001f3f]/5 shadow-xl p-10 space-y-10"
                >
                  <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                    <h3 className="text-xl font-black text-[#001f3f]">Personal Details</h3>
                    <UserCircle className="text-[#d4af37] w-6 h-6" />
                  </div>

                  <form onSubmit={handleSubmitProfile} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Username</label>
                        <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none focus:border-[#d4af37] text-[#001f3f]"
                          value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                          <input required type="email" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-5 py-4 font-bold outline-none focus:border-[#d4af37] text-[#001f3f]"
                            value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
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
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Date of Birth</label>
                        <input type="date" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none focus:border-[#d4af37] text-[#001f3f]"
                          value={form.date_of_birth} onChange={e => setForm({...form, date_of_birth: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Gender</label>
                        <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none focus:border-[#d4af37] text-[#001f3f] appearance-none"
                          value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-50 pb-6 pt-4">
                      <h3 className="text-xl font-black text-[#001f3f]">Address Details</h3>
                      <MapPin className="text-[#d4af37] w-6 h-6" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2 space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Street Address</label>
                        <textarea className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none focus:border-[#d4af37] min-h-[100px] text-[#001f3f]"
                          value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
                      </div>
                      <div className="md:col-span-2 space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Professional Bio</label>
                        <textarea className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none focus:border-[#d4af37] min-h-[100px] text-[#001f3f]"
                          placeholder="Tell us about yourself..."
                          value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">City</label>
                        <input className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none focus:border-[#d4af37] text-[#001f3f]"
                          value={form.city} onChange={e => setForm({...form, city: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">State / Province</label>
                        <input className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none focus:border-[#d4af37] text-[#001f3f]"
                          value={form.state} onChange={e => setForm({...form, state: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Country</label>
                        <input className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none focus:border-[#d4af37] text-[#001f3f]"
                          value={form.country} onChange={e => setForm({...form, country: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Pincode / ZIP</label>
                        <input className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none focus:border-[#d4af37] text-[#001f3f]"
                          value={form.pincode} onChange={e => setForm({...form, pincode: e.target.value})} />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-[#001f3f] text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-[#001f3f]/10 flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-opacity-90"
                    >
                      {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <><Save className="w-4 h-4" /> Save Profile Info</>}
                    </button>
                  </form>
                </motion.div>
              )}

              {activeTab === "settings" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white rounded-[3rem] border border-[#001f3f]/5 shadow-xl p-10 space-y-10"
                >
                  <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                    <h3 className="text-xl font-black text-[#001f3f]">Account Settings</h3>
                    <Settings className="text-[#d4af37] w-6 h-6" />
                  </div>

                  <form onSubmit={handleSubmitProfile} className="space-y-8">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="space-y-1">
                          <div className="text-sm font-bold text-[#001f3f] flex items-center gap-2">
                            <Eye className="w-4 h-4 text-[#d4af37]" /> Profile Visibility
                          </div>
                          <p className="text-xs text-slate-400">Allow other admin users and teachers to view your profile registry details.</p>
                        </div>
                        <input type="checkbox" className="w-5 h-5 rounded-xl border-[#d4af37] accent-[#001f3f] cursor-pointer"
                          checked={form.profile_visibility} onChange={e => setForm({...form, profile_visibility: e.target.checked})} />
                      </div>

                      <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="space-y-1">
                          <div className="text-sm font-bold text-[#001f3f] flex items-center gap-2">
                            <Bell className="w-4 h-4 text-[#d4af37]" /> Email Notifications
                          </div>
                          <p className="text-xs text-slate-400">Receive system audit alerts and system activity logs via email.</p>
                        </div>
                        <input type="checkbox" className="w-5 h-5 rounded-xl border-[#d4af37] accent-[#001f3f] cursor-pointer"
                          checked={form.email_notifications} onChange={e => setForm({...form, email_notifications: e.target.checked})} />
                      </div>

                      <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="space-y-1">
                          <div className="text-sm font-bold text-[#001f3f] flex items-center gap-2">
                            <Bell className="w-4 h-4 text-[#d4af37]" /> Push/System Notifications
                          </div>
                          <p className="text-xs text-slate-400">Enable on-screen system alert toasts for urgent actions.</p>
                        </div>
                        <input type="checkbox" className="w-5 h-5 rounded-xl border-[#d4af37] accent-[#001f3f] cursor-pointer"
                          checked={form.system_notifications} onChange={e => setForm({...form, system_notifications: e.target.checked})} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-1">
                          <Palette className="w-3.5 h-3.5" /> Color Theme Preference
                        </label>
                        <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none focus:border-[#d4af37] text-[#001f3f] appearance-none"
                          value={form.theme} onChange={e => setForm({...form, theme: e.target.value})}>
                          <option value="light">Classic Light Theme</option>
                          <option value="dark">Professional Slate Dark</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5" /> Language Preference
                        </label>
                        <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none focus:border-[#d4af37] text-[#001f3f] appearance-none"
                          value={form.language} onChange={e => setForm({...form, language: e.target.value})}>
                          <option value="en">English (US/UK)</option>
                          <option value="es">Español (Latin)</option>
                          <option value="hi">Hindi (India)</option>
                        </select>
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-[#001f3f] text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-[#001f3f]/10 flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-opacity-90"
                    >
                      {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <><Save className="w-4 h-4" /> Save System Settings</>}
                    </button>
                  </form>
                </motion.div>
              )}

              {activeTab === "security" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white rounded-[3rem] border border-[#001f3f]/5 shadow-xl p-10 space-y-10"
                >
                  <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                    <h3 className="text-xl font-black text-[#001f3f]">Update Credentials</h3>
                    <LockKeyhole className="text-[#d4af37] w-6 h-6" />
                  </div>

                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Current Password</label>
                      <input required type="password" placeholder="••••••••" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none focus:border-[#d4af37] text-[#001f3f]"
                        value={passwordForm.current_password} onChange={e => setPasswordForm({...passwordForm, current_password: e.target.value})} />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1">New Password (Min 8 characters)</label>
                      <input required type="password" placeholder="••••••••" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none focus:border-[#d4af37] text-[#001f3f]"
                        value={passwordForm.new_password} onChange={e => setPasswordForm({...passwordForm, new_password: e.target.value})} />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Confirm New Password</label>
                      <input required type="password" placeholder="••••••••" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none focus:border-[#d4af37] text-[#001f3f]"
                        value={passwordForm.confirm_new_password} onChange={e => setPasswordForm({...passwordForm, confirm_new_password: e.target.value})} />
                    </div>

                    <button 
                      type="submit" 
                      disabled={passwordLoading}
                      className="w-full bg-[#001f3f] text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-[#001f3f]/10 flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-opacity-90"
                    >
                      {passwordLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <><Lock className="w-4 h-4" /> Save Credentials</>}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Sidebar Metadata */}
          <div className="space-y-8">
            <div className="bg-[#001f3f] rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between h-72 border border-white/5">
              <div className="relative z-10 space-y-4">
                <Lock className="w-10 h-10 text-[#d4af37]" />
                <h3 className="text-2xl font-black italic">Security Node</h3>
                <p className="text-white/40 text-xs font-medium leading-relaxed">Protect your admin registry node by configuring multi-factor tokens and rotating passwords regularly.</p>
              </div>
              <button 
                onClick={() => setActiveTab("security")}
                className="relative z-10 w-full bg-[#d4af37] hover:scale-[1.02] text-[#001f3f] py-4 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-[#d4af37]/10"
              >
                Change Password <ChevronRight className="w-3 h-3" />
              </button>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#d4af37]/5 rounded-full blur-3xl"></div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-[#001f3f]/5 p-10 shadow-xl space-y-6">
              <h4 className="text-xl font-black text-[#001f3f]">Registry Metadata</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-400 uppercase tracking-widest">Employee ID</span>
                  <span className="font-black text-[#001f3f]">{user.employee_id || "EMP001"}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-400 uppercase tracking-widest">Joining Date</span>
                  <span className="font-black text-[#001f3f]">
                    {user.joining_date ? new Date(user.joining_date).toLocaleDateString() : (user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A")}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-400 uppercase tracking-widest">Account Created</span>
                  <span className="font-black text-[#001f3f]">{user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-400 uppercase tracking-widest">Account Status</span>
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${user.is_active ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                    {user.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-400 uppercase tracking-widest">Last Login</span>
                  <span className="font-black text-[#001f3f]">{user.last_login ? new Date(user.last_login).toLocaleString() : "Just now"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
