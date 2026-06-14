"use client";

import { useAuthStore } from "@/store/useAuthStore";
import DashboardLayout from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import { studentsAPI } from "@/lib/api";
import { 
  Users, 
  Search,
  Filter,
  Eye,
  ChevronRight,
  MoreVertical,
  Mail,
  Phone
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToastStore } from "@/store/useToastStore";

export default function MyStudents() {
  const { user } = useAuthStore();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const addToast = useToastStore(s => s.addToast);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await studentsAPI.list();
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch students", err);
        addToast("Failed to fetch student directory", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const filteredData = data.filter(s => 
    s.user_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.roll_number?.toLowerCase().includes(search.toLowerCase()) ||
    s.admission_number?.toLowerCase().includes(search.toLowerCase())
  );

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-10 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-[#001f3f] tracking-tight">
              Class Registry
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              View and manage student profiles in your assigned classes.
            </p>
          </div>
          
          <div className="relative w-full max-w-md group">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#d4af37] transition-all" />
             <input 
               placeholder="Search by name, roll no, or ID..."
               className="w-full bg-white border border-[#001f3f]/5 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-[#001f3f] focus:border-[#d4af37] outline-none shadow-sm transition-all"
               value={search}
               onChange={e => setSearch(e.target.value)}
             />
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-[2.5rem] border border-[#001f3f]/5 p-12 space-y-4">
             {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-slate-50 rounded-2xl animate-pulse"></div>)}
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] border border-[#001f3f]/5 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <th className="px-8 py-6 w-20 text-center">#</th>
                    <th className="px-6 py-6">Student Information</th>
                    <th className="px-6 py-6 text-center">Roll Number</th>
                    <th className="px-6 py-6 text-center">Class</th>
                    <th className="px-8 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#001f3f]/5">
                  {filteredData.map((s, i) => (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-all group">
                      <td className="px-8 py-6 text-center text-slate-300 font-black">{i+1}</td>
                      <td className="px-6 py-6">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#001f3f] rounded-2xl flex items-center justify-center text-[#d4af37] font-black shadow-lg">
                               {(s.user_name?.[0] || "?").toUpperCase()}
                            </div>
                            <div>
                               <div className="font-bold text-[#001f3f] text-lg">{s.user_name}</div>
                               <div className="text-xs text-slate-400 font-medium">{s.email}</div>
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                         <div className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black w-fit mx-auto">{s.roll_number || "N/A"}</div>
                      </td>
                      <td className="px-6 py-6 text-center font-black text-[#d4af37] uppercase tracking-widest text-xs">{s.classroom_name || "Unassigned"}</td>
                      <td className="px-8 py-6 text-right">
                         <div className="flex justify-end gap-2">
                            <button className="p-2.5 bg-white border border-[#001f3f]/10 rounded-xl text-[#001f3f] hover:text-[#d4af37] hover:border-[#d4af37] transition-all shadow-sm"><Eye className="w-4 h-4" /></button>
                            <button className="p-2.5 bg-white border border-[#001f3f]/10 rounded-xl text-[#001f3f] hover:text-indigo-500 transition-all shadow-sm"><Phone className="w-4 h-4" /></button>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!filteredData.length && (
              <div className="py-32 text-center text-slate-300 font-medium italic">No students found matching your search.</div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
