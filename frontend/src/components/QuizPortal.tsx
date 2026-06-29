"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Plus, Trash2, HelpCircle, CheckCircle, Clock, Play, Save, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToastStore } from "@/store/useToastStore";

export default function QuizPortal({ role, subjects }: { role: string, subjects: any[] }) {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [isCreating, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    instructions: "",
    subject: "",
    total_questions: "10",
    max_marks: "100",
    starts_at: "",
    ends_at: ""
  });
  const addToast = useToastStore(s => s.addToast);

  const fetchQuizzes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/quizzes/");
      setQuizzes(Array.isArray(res.data) ? res.data : (res.data?.results || res.data?.data || []));
    } catch {
      setError("Failed to sync the academic quiz repository. Please check connection.");
      addToast("Failed to load quizzes", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      title: form.title,
      description: form.description,
      instructions: form.instructions,
      subject: form.subject,
      total_questions: parseInt(form.total_questions) || 0,
      max_marks: parseInt(form.max_marks) || 0,
      starts_at: form.starts_at || null,
      ends_at: form.ends_at || null
    };

    try {
      await api.post("/quizzes/", payload);
      setIsAdding(false);
      setForm({
        title: "",
        description: "",
        instructions: "",
        subject: "",
        total_questions: "10",
        max_marks: "100",
        starts_at: "",
        ends_at: ""
      });
      addToast("Quiz created successfully!");
      fetchQuizzes();
    } catch (err: any) {
      console.error("Failed to create quiz", err);
      let msg = "Failed to create quiz";
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === "string") msg = data;
        else if (typeof data === "object") {
          msg = Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join(" | ");
        }
      }
      addToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this quiz?")) return;
    try {
      await api.delete(`/quizzes/${id}/`);
      setQuizzes(quizzes.filter(q => q.id !== id));
      addToast("Quiz deleted successfully.");
    } catch {
      addToast("Failed to delete quiz", "error");
    }
  };

  if (loading) return <div className="h-64 flex items-center justify-center italic text-slate-400">Syncing assessment data...</div>;

  if (error) return (
    <div className="p-10 text-center bg-rose-50 border-2 border-dashed border-rose-200 rounded-[3rem] text-rose-600 font-bold max-w-xl mx-auto my-10">
      <p className="text-sm">{error}</p>
      <button onClick={() => fetchQuizzes()} className="mt-4 px-6 py-2.5 bg-rose-600 text-white rounded-xl text-xs uppercase tracking-widest font-black transition-all hover:bg-rose-700 active:scale-95">
         Retry Sync
      </button>
    </div>
  );

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-black text-navy">Academic Quizzes</h3>
        {role === 'TEACHER' && (
          <button onClick={() => setIsAdding(true)} className="btn-gold flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Quiz
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.isArray(quizzes) && quizzes.map((q) => (
          <div key={q.id} className="bg-white p-8 rounded-[2.5rem] border border-navy/5 shadow-sm hover:border-gold/30 transition-all flex flex-col group">
            <div className="flex justify-between items-start mb-6">
               <div className="px-3 py-1 bg-navy/5 text-navy text-[10px] font-black uppercase tracking-widest rounded-lg">{q.subject_name || `Subject #${q.subject}`}</div>
               <div className="flex items-center gap-2 text-[10px] font-black text-slate-400">
                  <HelpCircle className="w-3.5 h-3.5" /> {q.total_questions} Questions
               </div>
            </div>
            <h4 className="text-xl font-black text-navy mb-2">{q.title}</h4>
            <p className="text-sm text-slate-400 font-medium mb-8 leading-relaxed italic">"{q.description || "No description provided."}"</p>
            
            <div className="mt-auto flex gap-4">
               {role === 'STUDENT' ? (
                 <button onClick={() => setActiveQuiz(q)} className="flex-1 btn-primary py-3 text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                    <Play className="w-4 h-4" /> Start Quiz
                 </button>
               ) : (
                 <>
                    <button className="flex-1 border-2 border-navy/10 text-navy py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-navy hover:text-white transition-all">View Results</button>
                    <button onClick={() => handleDelete(q.id)} className="w-12 h-12 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
                 </>
               )}
            </div>
          </div>
        ))}
        {!quizzes.length && (
          <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-navy/5 italic text-slate-400">
             No quizzes scheduled at the moment.
          </div>
        )}
      </div>

      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-navy/60 backdrop-blur-md">
             <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[3rem] p-12 max-w-3xl w-full shadow-2xl relative overflow-hidden max-h-[85vh] overflow-y-auto"
             >
                <div className="space-y-8">
                   <div className="flex justify-between items-start">
                      <div>
                         <h3 className="text-3xl font-black text-navy">Create Academic Quiz</h3>
                         <p className="text-slate-400 font-medium mt-1">Configure automated periodic evaluations.</p>
                      </div>
                      <button onClick={() => setIsAdding(false)} className="text-slate-300 hover:text-navy transition-all"><X className="w-6 h-6" /></button>
                   </div>

                   <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1 col-span-2">
                         <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Quiz Title</label>
                         <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-gold text-navy"
                           value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Mid-term Assessment" />
                      </div>
                      <div className="space-y-1 col-span-2">
                         <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Instructions</label>
                         <textarea className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-gold text-navy min-h-[80px]"
                           value={form.instructions} onChange={e => setForm({...form, instructions: e.target.value})} placeholder="Guidelines for students..." />
                      </div>
                      <div className="space-y-1">
                         <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Subject</label>
                         <select required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-gold appearance-none text-navy"
                           value={form.subject} onChange={e => setForm({...form, subject: e.target.value})}>
                            <option value="">-- Choose Subject --</option>
                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name} (Class {s.classroom_name || s.classroom})</option>)}
                         </select>
                      </div>
                      <div className="space-y-1">
                         <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Total Questions</label>
                         <input required type="number" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-gold text-navy"
                           value={form.total_questions} onChange={e => setForm({...form, total_questions: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                         <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Max Marks</label>
                         <input required type="number" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-gold text-navy"
                           value={form.max_marks} onChange={e => setForm({...form, max_marks: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                         <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Starts At</label>
                         <input type="datetime-local" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-gold text-navy"
                           value={form.starts_at} onChange={e => setForm({...form, starts_at: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                         <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Ends At</label>
                         <input type="datetime-local" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-gold text-navy"
                           value={form.ends_at} onChange={e => setForm({...form, ends_at: e.target.value})} />
                      </div>
                      <div className="space-y-1 col-span-2">
                         <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Brief Description</label>
                         <textarea className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-gold text-navy min-h-[80px]"
                           value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Short description..." />
                      </div>

                      <div className="md:col-span-2 pt-6 flex gap-4">
                         <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-4 font-black uppercase text-slate-300 text-xs tracking-widest">Cancel</button>
                         <button type="submit" disabled={saving} className="flex-[2] bg-navy text-white py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95 transition-all">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Publish Quiz"}
                         </button>
                      </div>
                   </form>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeQuiz && (
          <div className="fixed inset-0 z-[150] bg-navy flex items-center justify-center p-6">
             <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[3rem] max-w-2xl w-full p-12 space-y-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8">
                   <button onClick={() => setActiveQuiz(null)} className="text-slate-300 hover:text-navy"><X className="w-6 h-6" /></button>
                </div>
                <div className="space-y-2">
                   <h2 className="text-3xl font-black text-navy">{activeQuiz.title}</h2>
                   <p className="text-slate-400 font-medium italic">Please read every question carefully before answering.</p>
                </div>
                
                <div className="py-20 text-center text-slate-300 font-black uppercase tracking-widest italic border-2 border-dashed border-navy/5 rounded-3xl">
                   [Interactive Exam Interface Placeholder]
                </div>

                <button className="w-full btn-gold py-5 uppercase font-black tracking-[0.2em] shadow-2xl shadow-gold/20">Submit Final Answers</button>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
