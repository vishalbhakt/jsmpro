"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Plus, Trash2, HelpCircle, CheckCircle, Clock, Play, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToastStore } from "@/store/useToastStore";

export default function QuizPortal({ role, subjects }: { role: string, subjects: any[] }) {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [isCreating, setIsAdding] = useState(false);
  const addToast = useToastStore(s => s.addToast);

  const fetchQuizzes = async () => {
    try {
      const res = await api.get("/quizzes/");
      setQuizzes(res.data.data);
    } catch {
      addToast("Failed to load quizzes", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  if (loading) return <div className="h-64 flex items-center justify-center italic text-slate-400">Syncing assessment data...</div>;

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
        {quizzes.map((q) => (
          <div key={q.id} className="bg-white p-8 rounded-[2.5rem] border border-navy/5 shadow-sm hover:border-gold/30 transition-all flex flex-col group">
            <div className="flex justify-between items-start mb-6">
               <div className="px-3 py-1 bg-navy/5 text-navy text-[10px] font-black uppercase tracking-widest rounded-lg">{q.subject_name}</div>
               <div className="flex items-center gap-2 text-[10px] font-black text-slate-400">
                  <Clock className="w-3 h-3" /> {q.duration_minutes}m
               </div>
            </div>
            <h4 className="text-xl font-black text-navy mb-2">{q.title}</h4>
            <p className="text-sm text-slate-400 font-medium mb-8 leading-relaxed">{q.description}</p>
            
            <div className="mt-auto flex gap-4">
               {role === 'STUDENT' ? (
                 <button onClick={() => setActiveQuiz(q)} className="flex-1 btn-primary py-3 text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                    <Play className="w-4 h-4" /> Start Quiz
                 </button>
               ) : (
                 <>
                    <button className="flex-1 border-2 border-navy/10 text-navy py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-navy hover:text-white transition-all">View Results</button>
                    <button className="w-12 h-12 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
                 </>
               )}
            </div>
          </div>
        ))}
      </div>

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

import { X } from "lucide-react";
