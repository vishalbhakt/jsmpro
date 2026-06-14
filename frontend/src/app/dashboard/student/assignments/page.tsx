"use client";

import { useAuthStore } from "@/store/useAuthStore";
import DashboardLayout from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import { learningAPI } from "@/lib/api";
import { 
  Clock, 
  Download, 
  Send,
  Loader2,
  FileText,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToastStore } from "@/store/useToastStore";

export default function StudentAssignments() {
  const { user } = useAuthStore();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const addToast = useToastStore(s => s.addToast);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<number | null>(null);
  const [submitFile, setSubmitFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await learningAPI.assignments.list();
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch assignments", err);
      addToast("Failed to fetch assignments", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleAssignmentSubmit = async (assignmentId: number) => {
    if (!submitFile) return;
    setSubmitting(true);
    const fd = new FormData();
    fd.append("assignment", assignmentId.toString());
    fd.append("student", user?.profile?.id?.toString() || "");
    fd.append("file", submitFile);

    try {
      await learningAPI.submissions.create(fd);
      addToast("Assignment submitted successfully!");
      setIsSubmitting(null);
      setSubmitFile(null);
      fetchAssignments();
    } catch (err: any) {
      console.error("Submission failed", err);
      const msg = err.response?.data?.detail || err.response?.data?.error || "Submission failed. You might have already submitted.";
      addToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-10 pb-20">
        <div>
          <h1 className="text-4xl font-black text-[#001f3f] tracking-tight">
            Academic Tasks
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Track your deadlines and submit your homework.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="h-48 bg-white rounded-[2.5rem] animate-pulse border border-[#001f3f]/5"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {data.map((item) => (
              <div key={item.id} className="bg-white p-8 rounded-[2.5rem] border border-[#001f3f]/5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-8 group hover:border-[#d4af37]/30 transition-all relative overflow-hidden">
                <div className="space-y-4 max-w-xl relative z-10">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-[#001f3f]/5 text-[#001f3f] text-[10px] font-black uppercase tracking-widest rounded-lg">{item.subject_name}</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${item.status === 'closed' ? "text-slate-400" : "text-[#d4af37]"}`}>
                      <Clock className="w-3.5 h-3.5" />
                      {`Due: ${new Date(item.due_at).toLocaleDateString()}`}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-[#001f3f]">{item.title}</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-2">{item.description}</p>
                </div>
                
                <div className="shrink-0 flex flex-col gap-3 relative z-10">
                  {item.attachment && (
                    <a href={item.attachment} target="_blank" className="flex items-center justify-center gap-2 w-full bg-[#001f3f] text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-opacity-90 transition-all shadow-lg shadow-[#001f3f]/10">
                      <Download className="w-4 h-4" /> Resources
                    </a>
                  )}
                  <button 
                    onClick={() => setIsSubmitting(item.id)}
                    className="px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border-2 border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-white"
                  >
                    Hand In Now
                  </button>
                </div>
              </div>
            ))}
            {!data.length && (
              <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-[#001f3f]/5">
                <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-medium italic">No assignments posted for your course yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Submission Modal Overlay */}
        <AnimatePresence>
          {isSubmitting && (
            <div className="fixed inset-0 z-[100] bg-[#001f3f]/60 backdrop-blur-md flex items-center justify-center p-6">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[3rem] p-12 max-w-md w-full space-y-8 shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                 <div className="text-center relative z-10">
                    <h3 className="text-3xl font-black text-[#001f3f]">Submit Solution</h3>
                    <p className="text-slate-400 font-medium mt-1">Upload your completed task for evaluation.</p>
                 </div>
                 <div className="space-y-6 relative z-10">
                    <div className="border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center hover:border-[#d4af37]/50 transition-all group bg-slate-50 cursor-pointer relative overflow-hidden">
                       <input 
                         type="file" 
                         className="absolute inset-0 opacity-0 cursor-pointer z-20"
                         onChange={e => setSubmitFile(e.target.files?.[0] || null)} 
                       />
                       <div className="relative z-10 flex flex-col items-center gap-4">
                          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                             <FileText className="w-8 h-8 text-[#d4af37]" />
                          </div>
                          <span className="text-sm font-bold text-[#001f3f]">
                             {submitFile ? submitFile.name : "Select or Drop File"}
                          </span>
                       </div>
                    </div>
                    <div className="flex gap-4">
                       <button onClick={() => setIsSubmitting(null)} className="flex-1 py-4 text-slate-400 font-black uppercase tracking-widest text-xs">Cancel</button>
                       <button 
                        onClick={() => handleAssignmentSubmit(isSubmitting)}
                        disabled={!submitFile || submitting}
                        className="flex-1 bg-[#d4af37] text-[#001f3f] font-black text-xs uppercase tracking-widest py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50"
                       >
                          {submitting ? <Loader2 className="animate-spin" /> : <><Send className="w-4 h-4" /> Hand In</>}
                       </button>
                    </div>
                 </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
