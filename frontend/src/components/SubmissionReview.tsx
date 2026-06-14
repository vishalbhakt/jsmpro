"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { FileText, Save, Check, X, User } from "lucide-react";
import { useToastStore } from "@/store/useToastStore";

export default function SubmissionReview({ assignmentId, onClose }: { assignmentId: number, onClose: () => void }) {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState<number | null>(null);
  const [gradeData, setGradingData] = useState({ marks: "", feedback: "" });
  const addToast = useToastStore(s => s.addToast);

  const fetchSubmissions = async () => {
    try {
      const res = await api.get(`/assignment-submissions/?assignment=${assignmentId}`);
      setSubmissions(res.data.data);
    } catch {
      addToast("Failed to load submissions", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [assignmentId]);

  const handleGrade = async (id: number) => {
    try {
      const res = await api.patch(`/assignment-submissions/${id}/grade/`, gradeData);
      if (res.data.success) {
        addToast("Grade saved!");
        setGrading(null);
        fetchSubmissions();
      } else {
        addToast(res.data.error || "Failed to save grade", "error");
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || "Failed to connect to grading service.";
      addToast(msg, "error");
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-navy/80 backdrop-blur-md flex items-center justify-center p-6">
      <div className="bg-white rounded-[3rem] max-w-4xl w-full h-[80vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="p-10 border-b border-navy/5 flex justify-between items-center">
          <div>
            <h3 className="text-3xl font-black text-navy">Review Submissions</h3>
            <p className="text-slate-400 font-medium">Evaluating student work for Assignment #{assignmentId}</p>
          </div>
          <button onClick={onClose} className="p-4 hover:bg-slate-50 rounded-full transition-all text-slate-400"><X /></button>
        </div>

        <div className="flex-1 overflow-auto p-10">
          {loading ? (
            <div className="flex items-center justify-center h-64 italic text-slate-400">Loading student files...</div>
          ) : (
            <div className="space-y-6">
              {submissions.map((sub) => (
                <div key={sub.id} className="p-6 bg-slate-50 rounded-3xl border border-navy/5 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:bg-white hover:shadow-xl">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-navy rounded-2xl flex items-center justify-center text-gold font-black shadow-lg">
                        {sub.student_name[0].toUpperCase()}
                     </div>
                     <div>
                        <div className="font-bold text-navy text-lg">{sub.student_name}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Submitted: {new Date(sub.submitted_at).toLocaleString()}</div>
                     </div>
                  </div>

                  <div className="flex items-center gap-4">
                     <a href={sub.file} target="_blank" className="flex items-center gap-2 px-5 py-2.5 bg-white border border-navy/10 rounded-xl text-xs font-black text-navy hover:text-gold transition-all uppercase tracking-widest">
                        <FileText className="w-4 h-4" /> View File
                     </a>
                     
                     {sub.status === 'Graded' ? (
                       <div className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
                          <Check className="w-4 h-4" /> Score: {sub.marks}
                       </div>
                     ) : (
                       <button 
                        onClick={() => setGrading(sub.id)}
                        className="btn-gold py-2.5 px-6 text-xs"
                       >
                          Grade Now
                       </button>
                     )}
                  </div>

                  {/* Grading Panel Overlay */}
                  {grading === sub.id && (
                    <div className="fixed inset-0 z-[120] bg-black/20 flex items-center justify-center p-6">
                       <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-sm w-full space-y-6 animate-in zoom-in-95 duration-300">
                          <h4 className="text-xl font-black text-navy">Marking Sheet</h4>
                          <div className="space-y-4">
                             <input type="number" placeholder="Enter Marks" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold"
                              onChange={e => setGradingData({...gradeData, marks: e.target.value})} />
                             <textarea placeholder="Feedback" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold min-h-[100px]"
                              onChange={e => setGradingData({...gradeData, feedback: e.target.value})} />
                             <div className="flex gap-4 pt-2">
                                <button onClick={() => setGrading(null)} className="flex-1 font-black text-slate-400 uppercase tracking-widest text-[10px]">Cancel</button>
                                <button onClick={() => handleGrade(sub.id)} className="flex-1 btn-primary py-3">Submit Grade</button>
                             </div>
                          </div>
                       </div>
                    </div>
                  )}
                </div>
              ))}
              {!submissions.length && <div className="text-center py-20 text-slate-400 font-medium italic">No submissions yet for this task.</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
