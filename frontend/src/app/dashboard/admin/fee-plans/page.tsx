"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DataTable from "@/components/DataTable";
import { financeAPI, classesAPI } from "@/lib/api";
import { fetchList } from "@/lib/apiUtils";
import { 
  Layers, 
  Search, 
  Plus, 
  Trash2, 
  Edit, 
  Filter,
  Download,
  BookOpen,
  Calendar,
  X,
  Target,
  Zap,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToastStore } from "@/store/useToastStore";

export default function AdminFeePlans() {
  const [data, setData] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  
  const [form, setForm] = useState({ 
    title: "", 
    classroom: "", 
    amount: "5000", 
    due_date: "", 
    description: "", 
    is_active: true 
  });
  
  const [submitting, setSubmitting] = useState(false);
  const addToast = useToastStore(s => s.addToast);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fees, cls] = await Promise.all([
        fetchList(financeAPI.feePlans.list(), 'Fee Plans', addToast),
        fetchList(classesAPI.list(), 'Classes', addToast)
      ]);
      setData(fees);
      setClasses(cls);
    } catch (err) {
      console.error('Failed to fetch fee plans data', err);
      addToast('Failed to load fee plans', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getErrorMessage = (err: any) => {
    if (err.response?.data) {
      const data = err.response.data;
      if (typeof data === "string") return data;
      if (Array.isArray(data)) return data.join(", ");
      if (typeof data === "object") {
        return Object.entries(data)
          .map(([key, val]) => {
            const valStr = Array.isArray(val) ? val.join(", ") : String(val);
            return `${key}: ${valStr}`;
          })
          .join(" | ");
      }
    }
    return "Operation failed.";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingPlan) {
        await financeAPI.feePlans.update(editingPlan.id, form);
        addToast("Fee plan updated successfully.");
      } else {
        await financeAPI.feePlans.create(form);
        addToast("Fee plan established successfully.");
      }
      setIsAdding(false);
      setEditingPlan(null);
      setForm({ title: "", classroom: "", amount: "5000", due_date: "", description: "", is_active: true });
      fetchData();
    } catch (err: any) {
      console.error("Operation failed", err);
      addToast(getErrorMessage(err), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Permanently archive this fee plan?")) return;
    try {
      await financeAPI.feePlans.delete(id);
      setData(data.filter(p => p.id !== id));
      addToast("Fee plan archived.");
    } catch {
      addToast("Delete failed", "error");
    }
  };

  const filteredData = data.filter(p => 
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.classroom_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-10 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-[#001f3f] tracking-tight flex items-center gap-3">
               <Layers className="w-10 h-10 text-[#d4af37]" />
               Fee Plans
            </h1>
            <p className="text-slate-500 font-medium mt-1">Configure structural tuition structures, schedules, and due dates.</p>
          </div>
          <button 
            onClick={() => { setEditingPlan(null); setForm({ title: "", classroom: "", amount: "5000", due_date: "", description: "", is_active: true }); setIsAdding(true); }}
            className="bg-[#001f3f] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-[#001f3f]/20 hover:scale-105 transition-all active:scale-95"
          >
             <Plus className="w-4 h-4" /> Add Fee Plan
          </button>
        </div>

        {/* Search Filter */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-6 rounded-[2.5rem] border border-[#001f3f]/5 shadow-sm">
           <div className="relative flex-1 group w-full">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#d4af37] transition-all" />
              <input 
                placeholder="Search fee plans by title, classroom..."
                className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-[#d4af37]/20 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-[#001f3f] outline-none transition-all"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
           </div>
        </div>

        {/* Data Table */}
        <DataTable 
          isLoading={loading}
          data={filteredData}
          columns={[
            { key: "title", header: "Plan Title", render: (v, r) => (
              <div>
                 <div className="font-bold text-[#001f3f]">{v}</div>
                 <div className="text-[10px] text-slate-400 font-medium">{r.description || "No description"}</div>
              </div>
            )},
            { key: "classroom_name", header: "Classroom", render: v => <span className="font-bold text-slate-500">{v || "Global"}</span> },
            { key: "amount", header: "Amount", render: v => <span className="font-black text-[#001f3f]">${parseFloat(v).toLocaleString()}</span> },
            { key: "due_date", header: "Due Date", render: v => (
              <div className="flex items-center gap-2 font-bold text-slate-500">
                 <Calendar className="w-4 h-4" />
                 {new Date(v).toLocaleDateString()}
              </div>
            )},
            { key: "actions", header: "Control", render: (_, row) => (
              <div className="flex items-center justify-end gap-2">
                 <button 
                  onClick={() => {
                    setEditingPlan(row);
                    setForm({
                      title: row.title || "",
                      classroom: row.classroom || "",
                      amount: String(row.amount || "5000"),
                      due_date: row.due_date || "",
                      description: row.description || "",
                      is_active: row.is_active ?? true
                    });
                  }}
                  className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-[#d4af37] hover:border-[#d4af37] rounded-xl transition-all"
                 >
                   <Edit className="w-4 h-4" />
                 </button>
                 <button onClick={() => handleDelete(row.id)} className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-500 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
              </div>
            )}
          ]}
        />

        {/* Create / Edit Modal */}
        <AnimatePresence>
          {(isAdding || editingPlan) && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#001f3f]/60 backdrop-blur-md">
               <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-[3rem] p-12 max-w-4xl w-full shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-12"
               >
                  <div className="flex-1 space-y-8">
                     <div>
                        <h3 className="text-3xl font-black text-[#001f3f]">{editingPlan ? "Edit Fee Plan" : "Add Fee Plan"}</h3>
                        <p className="text-slate-400 font-medium mt-1 italic">{editingPlan ? "Modify tuition details and due schedules." : "Establish a new billing schedule in the financial system."}</p>
                     </div>

                     <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1 col-span-2">
                           <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Fee Plan Title</label>
                           <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-[#d4af37]"
                             value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Target Classroom</label>
                           <select required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-[#d4af37] appearance-none"
                             value={form.classroom} onChange={e => setForm({...form, classroom: e.target.value})}>
                              <option value="">-- Select Classroom --</option>
                              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                           </select>
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Plan Amount ($)</label>
                           <input required type="number" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-[#d4af37]"
                             value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Due Date</label>
                           <input required type="date" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-[#d4af37]"
                             value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Active Status</label>
                           <select required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-[#d4af37] appearance-none"
                             value={String(form.is_active)} onChange={e => setForm({...form, is_active: e.target.value === "true"})}>
                              <option value="true">Active billing</option>
                              <option value="false">Paused billing</option>
                           </select>
                        </div>
                        <div className="space-y-1 col-span-2">
                           <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Description</label>
                           <textarea className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-[#d4af37]"
                             value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                        </div>
                        <div className="md:col-span-2 pt-6 flex gap-4">
                           <button type="button" onClick={() => { setIsAdding(false); setEditingPlan(null); }} className="flex-1 py-4 font-black uppercase text-slate-300 text-xs tracking-widest">Cancel</button>
                           <button type="submit" disabled={submitting} className="flex-[2] bg-[#001f3f] text-white py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-[#001f3f]/20 flex items-center justify-center gap-3 active:scale-95 transition-all">
                              {submitting ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : (editingPlan ? "Update Plan" : "Establish Plan")}
                           </button>
                        </div>
                     </form>
                  </div>

                  <button onClick={() => { setIsAdding(false); setEditingPlan(null); }} className="absolute top-8 right-8 text-slate-300 hover:text-[#001f3f] transition-all"><X className="w-6 h-6" /></button>
               </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
