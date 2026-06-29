"use client";

import { useState, useEffect } from "react";
import { attendanceAPI, studentsAPI } from "@/lib/api";
import { Check, X, Save, Calendar, User, Loader2 } from "lucide-react";
import { useToastStore } from "@/store/useToastStore";

export default function AttendanceManager({ subjects = [] }: { subjects?: any[] }) {
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const addToast = useToastStore(s => s.addToast);

  const fetchStudents = async () => {
    if (!selectedSubjectId) return;
    setLoading(true);
    try {
      const subject = subjects.find(s => s.id === parseInt(selectedSubjectId));
      if (!subject || !subject.classroom) {
        addToast("Subject or classroom info missing", "error");
        return;
      }
      
      const res = await studentsAPI.list({ classroom: subject.classroom });
      setStudents(res.data);
      
      const initial: Record<number, string> = {};
      res.data.forEach((s: any) => initial[s.id] = 'present');
      setAttendance(initial);
    } catch (err) {
      console.error("Failed to fetch students", err);
      addToast("Failed to fetch students", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [selectedSubjectId]);

  const handleMark = async () => {
    if (!selectedSubjectId) return;
    const subject = subjects.find(s => s.id === parseInt(selectedSubjectId));
    if (!subject) return;

    setSaving(true);
    const payload = {
      classroom: subject.classroom,
      subject: subject.id,
      date,
      records: Object.entries(attendance).map(([id, status]) => ({
        student: parseInt(id),
        status
      }))
    };

    try {
      await attendanceAPI.bulkMark(payload);
      addToast("Attendance saved successfully!");
    } catch (err: any) {
      console.error("Attendance error:", err);
      addToast(err.response?.data?.error || "Failed to save attendance", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-[2.5rem] border border-[#001f3f]/5 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Select Subject</label>
          <select 
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 font-bold focus:border-[#d4af37] outline-none transition-all text-[#001f3f]"
            value={selectedSubjectId}
            onChange={e => setSelectedSubjectId(e.target.value)}
          >
            <option value="">-- Choose Subject --</option>
            {subjects && subjects.map(s => <option key={s.id} value={s.id}>{s.name} (Class {s.classroom})</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Attendance Date</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input 
              type="date" 
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-4 py-3 font-bold focus:border-[#d4af37] outline-none transition-all text-[#001f3f]"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {selectedSubjectId && (
        <div className="bg-white rounded-[2.5rem] border border-[#001f3f]/5 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
           {loading ? (
             <div className="p-20 text-center">
                <Loader2 className="w-10 h-10 animate-spin text-[#d4af37] mx-auto mb-4" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Class Register...</p>
             </div>
           ) : (
             <>
               <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-[#001f3f]/5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <th className="px-8 py-5 w-20 text-center">#</th>
                      <th className="px-6 py-5">Student Name</th>
                      <th className="px-6 py-5">Roll No.</th>
                      <th className="px-8 py-5 text-center">Mark Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#001f3f]/5">
                    {students.map((s, i) => (
                      <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5 text-center text-slate-300 font-black">{i+1}</td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 bg-[#001f3f]/5 rounded-full flex items-center justify-center text-[#001f3f] font-black text-xs">{(s.user_name?.[0] || "?").toUpperCase()}</div>
                             <div className="font-bold text-[#001f3f]">{s.user_name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-5 font-bold text-slate-400">{s.roll_number || "N/A"}</td>
                        <td className="px-8 py-5">
                          <div className="flex items-center justify-center gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit mx-auto">
                            {['present', 'absent', 'late'].map(status => (
                              <button
                                key={status}
                                onClick={() => setAttendance({...attendance, [s.id]: status})}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                  attendance[s.id] === status 
                                    ? (status === 'present' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 
                                       status === 'absent' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 
                                       'bg-amber-500 text-white shadow-lg shadow-amber-500/20')
                                    : 'text-slate-400 hover:text-[#001f3f]'
                                }`}
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
               
               <div className="p-8 border-t border-[#001f3f]/5 bg-slate-50/30 flex justify-end">
                  <button 
                    onClick={handleMark} 
                    disabled={saving}
                    className="bg-[#001f3f] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-[#001f3f]/10 disabled:opacity-70 active:scale-95"
                  >
                    {saving ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Saving Log...</>
                    ) : (
                      <><Save className="w-5 h-5" /> Save Attendance Log</>
                    )}
                  </button>
               </div>
             </>
           )}
        </div>
      )}

      {!selectedSubjectId && (
        <div className="py-32 text-center text-slate-400 font-medium italic bg-white rounded-[2.5rem] border-2 border-dashed border-[#001f3f]/5">
          Please select a subject above to load the class register.
        </div>
      )}
    </div>
  );
}
