"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DataTable from "@/components/DataTable";
import { academicsAPI, studentsAPI } from "@/lib/api";
import { 
  Trophy, 
  Search, 
  Plus, 
  Trash2, 
  Edit, 
  Filter,
  Download,
  Medal,
  User,
  X,
  Zap,
  CheckCircle2,
  TrendingUp,
  Award
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToastStore } from "@/store/useToastStore";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function AdminResults() {
  const [data, setData] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingResult, setEditingResult] = useState<any | null>(null);
  const [form, setForm] = useState({ 
    student: "", 
    assessment: "", 
    marks_obtained: "", 
    remarks: "" 
  });
  const [submitting, setSubmitting] = useState(false);
  const addToast = useToastStore(s => s.addToast);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rRes, sRes, aRes] = await Promise.all([
        academicsAPI.results.list(),
        studentsAPI.list(),
        academicsAPI.assessments.list()
      ]);
      setData(rRes.data);
      setStudents(sRes.data);
      setAssessments(aRes.data);
    } catch (err) {
      console.error("Failed to fetch results", err);
      addToast("Failed to sync gradebook", "error");
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
      if (editingResult) {
        await academicsAPI.results.update(editingResult.id, form);
        addToast("Grade record updated successfully!");
      } else {
        await academicsAPI.results.create(form);
        addToast("Grades recorded in official transcript.");
      }
      setIsAdding(false);
      setEditingResult(null);
      setForm({ student: "", assessment: "", marks_obtained: "", remarks: "" });
      fetchData();
    } catch (err: any) {
      console.error("Operation failed", err);
      addToast(getErrorMessage(err), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Permanently erase this grade record?")) return;
    try {
      await academicsAPI.results.delete(id);
      setData(data.filter(r => r.id !== id));
      addToast("Record purged.");
    } catch {
      addToast("Action failed", "error");
    }
  };

  const filteredData = data.filter(r => 
    r.student_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.assessment_title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-10 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-[#001f3f] tracking-tight flex items-center gap-3">
               <Trophy className="w-10 h-10 text-[#d4af37]" />
               Official Gradebook
            </h1>
            <p className="text-slate-500 font-medium mt-1">Official repository for student evaluation results and performance transcripts.</p>
          </div>
          <div className="flex gap-4">
             <button 
              onClick={() => setIsAdding(true)}
              className="bg-[#001f3f] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-[#001f3f]/20 hover:scale-105 transition-all active:scale-95"
             >
                <Plus className="w-4 h-4" /> Record Grade
             </button>
             <button className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-400 hover:text-[#001f3f] transition-all">
                <Download className="w-5 h-5" />
             </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-[2rem] border border-[#001f3f]/5 shadow-sm flex flex-col md:flex-row gap-4 items-center">
           <div className="relative flex-1 group w-full">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#d4af37] transition-all" />
              <input 
                placeholder="Search by student name or assessment..."
                className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-[#d4af37]/20 rounded-xl pl-12 pr-4 py-3.5 text-sm font-bold text-[#001f3f] outline-none transition-all"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
           </div>
        </div>

        <DataTable 
          isLoading={loading}
          data={filteredData}
          columns={[
            { key: "student_name", header: "Scholar Identity", render: (v, row) => (
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-[#001f3f] rounded-2xl flex items-center justify-center text-[#d4af37] font-black text-lg shadow-sm">
                    {(v?.[0] || "?").toUpperCase()}
                 </div>
                 <div>
                    <div className="font-black text-[#001f3f] text-base">{v}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{row.roll_number || "No Roll No."}</div>
                 </div>
              </div>
            )},
            { key: "assessment_title", header: "Assessment", render: v => <span className="font-black text-[#001f3f] uppercase text-xs tracking-wider">{v}</span> },
            { key: "marks_obtained", header: "Performance", render: (v, row) => (
              <div className="flex items-center gap-3">
                 <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-black text-lg text-[#001f3f]">{v}</span>
                    <span className="text-slate-300 font-bold text-xs ml-1">/ {row.max_marks}</span>
                 </div>
                 <div className={cn(
                   "w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs",
                   (v / row.max_marks) >= 0.8 ? "bg-emerald-50 text-emerald-600" :
                   (v / row.max_marks) >= 0.6 ? "bg-blue-50 text-blue-600" :
                   "bg-rose-50 text-rose-600"
                 )}>
                    {(v / row.max_marks) >= 0.9 ? 'A+' : (v / row.max_marks) >= 0.8 ? 'A' : (v / row.max_marks) >= 0.7 ? 'B' : 'C'}
                 </div>
              </div>
            )},
            { key: "actions", header: "Control", render: (_, row) => (
              <div className="flex items-center justify-end gap-2">
                 <button 
                  onClick={() => {
                    setEditingResult(row);
                    setForm({
                      student: row.student,
                      assessment: row.assessment,
                      marks_obtained: String(row.marks_obtained),
                      remarks: row.remarks || ""
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

        {/* Record/Edit Grade Modal */}
        <AnimatePresence>
          {(isAdding || editingResult) && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#001f3f]/60 backdrop-blur-md">
               <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-[3rem] p-12 max-w-4xl w-full shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-12"
               >
                  <div className="flex-1 space-y-8">
                     <div>
                        <h3 className="text-3xl font-black text-[#001f3f]">{editingResult ? "Edit Evaluation" : "Record Evaluation"}</h3>
                        <p className="text-slate-400 font-medium mt-1 italic">{editingResult ? "Update student performance metrics in the system." : "Log student performance metrics for official reporting."}</p>
                     </div>

                     <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                           <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Select Student</label>
                           <select required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-[#d4af37] appearance-none"
                             value={form.student} onChange={e => setForm({...form, student: e.target.value})}>
                              <option value="">-- Choose Scholar --</option>
                              {students.map(s => <option key={s.id} value={s.id}>{s.user_name} ({s.roll_number})</option>)}
                           </select>
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Select Assessment</label>
                           <select required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-[#d4af37] appearance-none"
                             value={form.assessment} onChange={e => setForm({...form, assessment: e.target.value})}>
                              <option value="">-- Choose Exam --</option>
                              {assessments.map(a => <option key={a.id} value={a.id}>{a.title} ({a.subject_name})</option>)}
                           </select>
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Marks Obtained</label>
                           <input required type="number" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-[#d4af37]"
                             value={form.marks_obtained} onChange={e => setForm({...form, marks_obtained: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Remarks</label>
                           <input className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-[#d4af37]"
                             value={form.remarks} onChange={e => setForm({...form, remarks: e.target.value})} placeholder="e.g. Excellent performance" />
                        </div>
                        <div className="md:col-span-2 pt-6 flex gap-4">
                           <button type="button" onClick={() => { setIsAdding(false); setEditingResult(null); setForm({ student: "", assessment: "", marks_obtained: "", remarks: "" }); }} className="flex-1 py-4 font-black uppercase text-slate-300 text-xs tracking-widest">Cancel</button>
                           <button type="submit" disabled={submitting} className="flex-[2] bg-[#001f3f] text-white py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-[#001f3f]/20 flex items-center justify-center gap-3 active:scale-95 transition-all">
                              {submitting ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : (editingResult ? "Update Grade" : "Commit to Gradebook")}
                           </button>
                        </div>
                     </form>
                  </div>

                  <div className="hidden md:block w-72 bg-[#001f3f] rounded-[2.5rem] p-10 text-white relative overflow-hidden">
                     <div className="relative z-10 space-y-6">
                        <Award className="w-12 h-12 text-[#d4af37] fill-current" />
                        <h4 className="text-2xl font-black italic">Academic Integrity</h4>
                        <p className="text-white/40 text-xs leading-relaxed font-medium">Recorded grades are permanent and reflect in student transcripts immediately. Double-verify marks obtained against the master mark-sheet before committing.</p>
                     </div>
                     <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#d4af37]/5 rounded-full blur-3xl"></div>
                  </div>

                  <button onClick={() => { setIsAdding(false); setEditingResult(null); setForm({ student: "", assessment: "", marks_obtained: "", remarks: "" }); }} className="absolute top-8 right-8 text-slate-300 hover:text-[#001f3f] transition-all"><X className="w-6 h-6" /></button>
               </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
