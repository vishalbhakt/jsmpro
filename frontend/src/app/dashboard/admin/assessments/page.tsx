"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DataTable from "@/components/DataTable";
import { academicsAPI, subjectsAPI, classesAPI, teachersAPI } from "@/lib/api";
import { 
  ClipboardCheck, 
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
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToastStore } from "@/store/useToastStore";

export default function AdminAssessments() {
  const [data, setData] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<any | null>(null);
  const [form, setForm] = useState({ 
    title: "", 
    subject: "", 
    classroom: "",
    created_by: "",
    max_marks: "100", 
    date: "", 
    type: "exam" 
  });
  const [submitting, setSubmitting] = useState(false);
  const addToast = useToastStore(s => s.addToast);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [aRes, sRes, cRes, tRes] = await Promise.all([
        academicsAPI.assessments.list(),
        subjectsAPI.list(),
        classesAPI.list(),
        teachersAPI.list()
      ]);
      setData(aRes.data || []);
      setSubjects(sRes.data || []);
      setClasses(cRes.data || []);
      setTeachers(tRes.data || []);
    } catch (err) {
      console.error("Failed to fetch assessments", err);
      addToast("Failed to sync assessment data", "error");
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
    const payload = {
      title: form.title,
      subject: form.subject,
      classroom: form.classroom || null,
      created_by: form.created_by || null,
      max_marks: form.max_marks,
      scheduled_for: form.date || null,
      assessment_type: form.type === "exam" ? "test" : form.type
    };
    try {
      if (editingAssessment) {
        await academicsAPI.assessments.update(editingAssessment.id, payload);
        addToast("Assessment updated successfully.");
      } else {
        await academicsAPI.assessments.create(payload);
        addToast("Assessment scheduled successfully.");
      }
      setIsAdding(false);
      setEditingAssessment(null);
      setForm({ title: "", subject: "", classroom: "", created_by: "", max_marks: "100", date: "", type: "exam" });
      fetchData();
    } catch (err: any) {
      console.error("Operation failed", err);
      addToast(getErrorMessage(err), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Permanently delete this assessment?")) return;
    try {
      await academicsAPI.assessments.delete(id);
      const safeData = Array.isArray(data) ? data : [];
      setData(safeData.filter(s => s.id !== id));
      addToast("Assessment cancelled.");
    } catch {
      addToast("Action failed", "error");
    }
  };

  const filteredData = data.filter(a => 
    a.title?.toLowerCase().includes(search.toLowerCase()) ||
    a.subject_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-10 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-[#001f3f] tracking-tight flex items-center gap-3">
               <ClipboardCheck className="w-10 h-10 text-[#d4af37]" />
               Academic Assessments
            </h1>
            <p className="text-slate-500 font-medium mt-1">Schedule and monitor institutional examinations and periodic evaluations.</p>
          </div>
          <div className="flex gap-4">
             <button 
              onClick={() => setIsAdding(true)}
              className="bg-[#001f3f] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-[#001f3f]/20 hover:scale-105 transition-all active:scale-95"
             >
                <Plus className="w-4 h-4" /> Schedule Exam
             </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-[2rem] border border-[#001f3f]/5 shadow-sm flex flex-col md:flex-row gap-4 items-center">
           <div className="relative flex-1 group w-full">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#d4af37] transition-all" />
              <input 
                placeholder="Search exams by title or subject..."
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
            { key: "title", header: "Assessment Title", render: (v, row) => (
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 font-black text-lg shadow-sm border border-rose-100">
                    <Target className="w-6 h-6" />
                 </div>
                 <div>
                    <div className="font-black text-[#001f3f] text-base">{v}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{row.type}</div>
                 </div>
              </div>
            )},
            { key: "subject_name", header: "Subject", render: v => <span className="text-[#d4af37] font-black uppercase text-[10px] tracking-widest">{v}</span> },
            { key: "max_marks", header: "Weightage", render: v => <span className="font-black text-[#001f3f]">{v} Marks</span> },
            { key: "scheduled_for", header: "Scheduled Date", render: v => (
              <div className="flex items-center gap-2 font-bold text-slate-500">
                 <Calendar className="w-4 h-4" />
                 {v ? new Date(v).toLocaleDateString() : "-"}
              </div>
            )},
            { key: "actions", header: "Control", render: (_, row) => (
              <div className="flex items-center justify-end gap-2">
                 <button 
                  onClick={() => {
                    setEditingAssessment(row);
                    setForm({
                      title: row.title || "",
                      subject: row.subject || "",
                      classroom: row.classroom || "",
                      created_by: row.created_by || "",
                      max_marks: String(row.max_marks || "100"),
                      date: row.scheduled_for || "",
                      type: row.assessment_type || "exam"
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

        {/* Schedule / Edit Modal */}
        <AnimatePresence>
          {(isAdding || editingAssessment) && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#001f3f]/60 backdrop-blur-md">
               <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-[3rem] p-12 max-w-4xl w-full shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-12"
               >
                  <div className="flex-1 space-y-8 max-h-[80vh] overflow-y-auto pr-4">
                     <div>
                        <h3 className="text-3xl font-black text-[#001f3f]">{editingAssessment ? "Edit Assessment" : "Schedule Assessment"}</h3>
                        <p className="text-slate-400 font-medium mt-1 italic">{editingAssessment ? "Update institutional evaluation event in the academic calendar." : "Initiate a formal evaluation event in the academic calendar."}</p>
                     </div>

                     <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1 col-span-2">
                           <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Assessment Title</label>
                           <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-[#d4af37]"
                             value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Subject</label>
                           <select required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-[#d4af37] appearance-none"
                             value={form.subject} onChange={e => setForm({...form, subject: e.target.value})}>
                              <option value="">-- Choose Subject --</option>
                              {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.classroom_name})</option>)}
                           </select>
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Assigned Classroom</label>
                           <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-[#d4af37] appearance-none"
                             value={form.classroom} onChange={e => setForm({...form, classroom: e.target.value})}>
                              <option value="">-- Auto-resolve from Subject --</option>
                              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                           </select>
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Assigned Examiner (Teacher)</label>
                           <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-[#d4af37] appearance-none"
                             value={form.created_by} onChange={e => setForm({...form, created_by: e.target.value})}>
                              <option value="">-- Unassigned --</option>
                              {teachers.map(t => <option key={t.id} value={t.id}>{t.user_name}</option>)}
                           </select>
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Max Marks</label>
                           <input required type="number" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-[#d4af37]"
                             value={form.max_marks} onChange={e => setForm({...form, max_marks: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Examination Date</label>
                           <input required type="date" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-[#d4af37]"
                             value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Evaluation Type</label>
                           <select required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-[#d4af37] appearance-none"
                             value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                              <option value="exam">Formal Exam</option>
                              <option value="quiz">Periodic Quiz</option>
                              <option value="viva">Viva / Oral</option>
                              <option value="project">Project Work</option>
                           </select>
                        </div>
                        <div className="md:col-span-2 pt-6 flex gap-4">
                           <button type="button" onClick={() => { setIsAdding(false); setEditingAssessment(null); setForm({ title: "", subject: "", classroom: "", created_by: "", max_marks: "100", date: "", type: "exam" }); }} className="flex-1 py-4 font-black uppercase text-slate-300 text-xs tracking-widest">Cancel</button>
                           <button type="submit" disabled={submitting} className="flex-[2] bg-[#001f3f] text-white py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-[#001f3f]/20 flex items-center justify-center gap-3 active:scale-95 transition-all">
                              {submitting ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : (editingAssessment ? "Update Event" : "Schedule Event")}
                           </button>
                        </div>
                     </form>
                  </div>

                  <div className="hidden md:block w-72 bg-rose-500 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
                     <div className="relative z-10 space-y-6">
                        <Target className="w-12 h-12 text-[#001f3f] fill-current" />
                        <h4 className="text-2xl font-black italic">Precision Control</h4>
                        <p className="text-white/80 text-xs leading-relaxed font-medium">Scheduled assessments automatically notify assigned faculty and enrolled students. Ensure the weightage aligns with the institutional policy.</p>
                     </div>
                     <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#001f3f]/5 rounded-full blur-3xl"></div>
                  </div>

                  <button onClick={() => { setIsAdding(false); setEditingAssessment(null); setForm({ title: "", subject: "", classroom: "", created_by: "", max_marks: "100", date: "", type: "exam" }); }} className="absolute top-8 right-8 text-slate-300 hover:text-[#001f3f] transition-all"><X className="w-6 h-6" /></button>
               </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
