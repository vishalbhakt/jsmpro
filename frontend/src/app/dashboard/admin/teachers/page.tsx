"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DataTable from "@/components/DataTable";
import { teachersAPI } from "@/lib/api";
import { fetchList } from "@/lib/apiUtils";
import { Users, Search, Plus, Trash2, Eye, Edit, Download, ShieldCheck, Briefcase, X, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToastStore } from "@/store/useToastStore";

export default function AdminTeachers() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<any | null>(null);
  const [viewTeacher, setViewTeacher] = useState<any | null>(null);
  const [form, setForm] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    password: "Teacher@12345",
    employee_id: "",
    designation: "Assistant Professor",
    specialization: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const addToast = useToastStore(s => s.addToast);



  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const list = await fetchList(teachersAPI.list(), 'Teachers', addToast);
      setData(list);
    } catch (err) {
      console.error('Failed to fetch teachers', err);
      addToast('Failed to load faculty list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingTeacher) {
        await teachersAPI.update(editingTeacher.id, {
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          designation: form.designation,
          specialization: form.specialization,
          employee_id: form.employee_id
        });
        addToast("Faculty profile updated successfully!");
      } else {
        await teachersAPI.create(form);
        addToast("Faculty member onboarded.");
      }
      setIsAdding(false);
      setEditingTeacher(null);
      setForm({ username: "", email: "", first_name: "", last_name: "", phone: "", password: "Teacher@12345", employee_id: "", designation: "Assistant Professor", specialization: "" });
      fetchTeachers();
    } catch (err: any) {
      console.error("Submission failed", err);
      addToast(err.response?.data?.error || "Submission failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Remove this faculty member?")) return;
    try {
      await teachersAPI.delete(id);
      setData(data.filter(t => t.id !== id));
      addToast("Faculty profile archived.");
    } catch {
      addToast("Action failed", "error");
    }
  };

  const filteredData = data.filter(t =>
    t.user_name?.toLowerCase().includes(search.toLowerCase()) ||
    t.employee_id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-10 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-[#001f3f] tracking-tight flex items-center gap-3">
              <Users className="w-10 h-10 text-[#d4af37]" /> Faculty Management
            </h1>
            <p className="text-slate-500 font-medium mt-1">Manage institutional staff, academic assignments, and faculty performance.</p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setIsAdding(true)} className="bg-[#001f3f] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-[#001f3f]/20 hover:scale-105 transition-all active:scale-95">
              <Plus className="w-4 h-4" /> Onboard Faculty
            </button>
            <button className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-400 hover:text-[#001f3f] transition-all">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-[2rem] border border-[#001f3f]/5 shadow-sm flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 group w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#d4af37] transition-all" />
            <input
              placeholder="Search by name, ID, or specialization..."
              className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-[#d4af37]/20 rounded-xl pl-12 pr-4 py-3.5 text-sm font-bold text-[#001f3f] outline-none transition-all"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* DataTable */}
        <DataTable
          isLoading={loading}
          data={filteredData}
          columns={[
            {
              key: "user_name",
              header: "Faculty Identity",
              render: (v, row) => (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-lg shadow-sm border border-indigo-100">
                    {(v?.[0] || "?").toUpperCase()}
                  </div>
                  <div>
                    <div className="font-black text-[#001f3f] text-base">{v}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{row.designation}</div>
                  </div>
                </div>
              )
            },
            { key: "employee_id", header: "Staff ID", render: v => (
                <span className="font-mono font-black text-[#001f3f] bg-slate-100 px-3 py-1.5 rounded-lg">{v || "EMP-000"}</span>
              )
            },
            { key: "qualification", header: "Qualification", render: v => (
                <span className="px-3 py-1.5 bg-[#d4af37]/5 text-[#d4af37] rounded-xl border border-[#d4af37]/10 text-[10px] font-black uppercase tracking-widest w-fit">{v || "N/A"}</span>
              )
            },
            { key: "email", header: "Email", render: v => (
                <span className="text-sm text-[#001f3f]">{v}</span>
              )
            },
            {
              key: "actions",
              header: "Control",
              render: (_, row) => (
                <div className="flex items-center justify-end gap-2">
                  <button className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-[#001f3f] hover:border-[#001f3f] rounded-xl transition-all"
                    onClick={async () => {
                      try {
                        const res = await teachersAPI.get(row.id);
                        setViewTeacher(res.data);
                      } catch (err) {
                        console.error("Failed to fetch teacher details", err);
                        addToast("Unable to load details", "error");
                      }
                    }}>
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      const nameParts = (row.user_name || "").split(" ");
                      const fName = nameParts[0] || "";
                      const lName = nameParts.slice(1).join(" ") || "";
                      setEditingTeacher(row);
                      setForm({
                        username: row.username || row.email || "",
                        email: row.email || "",
                        first_name: fName,
                        last_name: lName,
                        phone: row.phone || "",
                        password: "",
                        employee_id: row.employee_id || "",
                        designation: row.designation || "Assistant Professor",
                        specialization: row.specialization || ""
                      });
                    }}
                    className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-[#d4af37] hover:border-[#d4af37] rounded-xl transition-all">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(row.id)} className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-500 rounded-xl transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )
            }
          ]}
        />

        {/* Add/Edit Modal */}
        <AnimatePresence>
          {(isAdding || editingTeacher) && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#001f3f]/60 backdrop-blur-md">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-[3rem] p-12 max-w-4xl w-full shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-12"
              >
                <div className="flex-1 space-y-8">
                  <div>
                    <h3 className="text-3xl font-black text-[#001f3f]">{editingTeacher ? "Edit Faculty Profile" : "Faculty Onboarding"}</h3>
                    <p className="text-slate-400 font-medium mt-1 italic">{editingTeacher ? "Update designation and credentials for the faculty member." : "Assign credentials and roles to new academic staff."}</p>
                  </div>
                  <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {!editingTeacher && (
                      <>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Username</label>
                          <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-[#d4af37]"
                            value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-slate-380 ml-1">Password</label>
                          <input required type="password" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-[#d4af37]"
                            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                        </div>
                      </>
                    )}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Email Address</label>
                      <input required type="email" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-[#d4af37]"
                        value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1">First Name</label>
                      <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-[#d4af37]"
                        value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Last Name</label>
                      <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-[#d4af37]"
                        value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Staff Designation</label>
                      <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-[#d4af37]"
                        value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Employee ID</label>
                      <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-[#d4af37]"
                        value={form.employee_id} onChange={e => setForm({ ...form, employee_id: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Specialization</label>
                      <input className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-[#d4af37]"
                        value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })} placeholder="e.g. Machine Learning" />
                    </div>
                    <div className="md:col-span-2 pt-6 flex gap-4">
                      <button type="button" onClick={() => { setIsAdding(false); setEditingTeacher(null); setForm({ username: "", email: "", first_name: "", last_name: "", phone: "", password: "Teacher@12345", employee_id: "", designation: "Assistant Professor", specialization: "" }); }} className="flex-1 py-4 font-black uppercase text-slate-300 text-xs tracking-widest">Cancel</button>
                      <button type="submit" disabled={submitting} className="flex-[2] bg-[#001f3f] text-white py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-[#001f3f]/20 flex items-center justify-center gap-3 active:scale-95 transition-all">
                        {submitting ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : (editingTeacher ? "Update Profile" : "Commit Onboarding")}
                      </button>
                    </div>
                  </form>
                </div>
                <div className="hidden md:block w-72 bg-[#d4af37] rounded-[2.5rem] p-10 text-[#001f3f] relative overflow-hidden">
                  <div className="relative z-10 space-y-6">
                    <Star className="w-12 h-12 text-[#001f3f] fill-current" />
                    <h4 className="text-2xl font-black italic">Quality First</h4>
                    <p className="text-[#001f3f]/60 text-xs leading-relaxed font-medium">Faculty members are the backbone of JSM. Ensure high academic standards and background verification before onboarding.</p>
                  </div>
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#001f3f]/5 rounded-full blur-3xl"></div>
                </div>
                <button onClick={() => { setIsAdding(false); setEditingTeacher(null); }} className="absolute top-8 right-8 text-slate-300 hover:text-[#001f3f] transition-all"><X className="w-6 h-6" /></button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* View Teacher Modal */}
        {viewTeacher && (
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-6 bg-[#001f3f]/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[3rem] p-12 max-w-3xl w-full shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-12"
            >
              <div className="flex-1 space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <img src={viewTeacher.avatar || '/default-avatar.png'} alt="Profile Photo" className="w-16 h-16 rounded-full object-cover" />
                    <div className="flex-1">
                      <h3 className="text-3xl font-black text-[#001f3f]">Teacher Details</h3>
                    </div>
                  </div>
                  <button onClick={() => setViewTeacher(null)} className="text-slate-400 hover:text-[#001f3f]"><X className="w-6 h-6" /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Full Name</label><p className="font-medium">{viewTeacher.first_name} {viewTeacher.last_name}</p></div>
                  <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Employee ID</label><p className="font-mono font-black">{viewTeacher.employee_id}</p></div>
                  <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Email</label><p>{viewTeacher.email}</p></div>
                  <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Phone</label><p>{viewTeacher.phone || "N/A"}</p></div>
                  <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Designation</label><p>{viewTeacher.designation}</p></div>
                  <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Qualification</label><p>{viewTeacher.specialization || "N/A"}</p></div>
                  <div className="space-y-1 col-span-2"><label className="text-[10px] font-black uppercase text-slate-400">Bio</label><p>{viewTeacher.bio || "—"}</p></div>
<div className="space-y-1 col-span-2"><label className="text-[10px] font-black uppercase text-slate-400">Assigned Subjects</label><p>{viewTeacher.assigned_subjects?.join(', ') || "N/A"}</p></div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
