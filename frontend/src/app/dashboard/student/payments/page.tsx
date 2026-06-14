"use client";

import { useAuthStore } from "@/store/useAuthStore";
import DashboardLayout from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import { financeAPI } from "@/lib/api";
import { 
  CreditCard, 
  Download, 
  ShieldCheck,
  Receipt,
  Clock
} from "lucide-react";
import { motion } from "framer-motion";
import { useToastStore } from "@/store/useToastStore";

export default function StudentPayments() {
  const { user } = useAuthStore();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const addToast = useToastStore(s => s.addToast);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await financeAPI.payments.list();
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch payments", err);
        addToast("Failed to fetch payment history", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const totalPending = Array.isArray(data) ? data.filter(p => p.status === 'pending').reduce((sum, p) => sum + parseFloat(p.amount), 0) : 0;

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-10 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-[#001f3f] tracking-tight">
              My Fees & Ledger
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              View your payment history and outstanding dues.
            </p>
          </div>
          <div className="bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100 flex items-center gap-3">
             <ShieldCheck className="w-5 h-5 text-emerald-500" />
             <span className="text-sm font-black text-emerald-700 uppercase tracking-widest">Official Record</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-1 bg-white p-10 rounded-[3rem] border border-[#001f3f]/5 shadow-sm flex flex-col justify-between h-72 group hover:border-[#d4af37]/30 transition-all relative overflow-hidden">
              <div className="space-y-1 relative z-10">
                 <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Outstanding Dues</div>
                 <div className="text-5xl font-black text-[#001f3f] group-hover:text-[#d4af37] transition-colors">₹{totalPending.toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 relative z-10">
                 <Clock className="w-4 h-4" /> Please contact Admin for payments.
              </div>
              <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                 <CreditCard className="w-32 h-32 rotate-12" />
              </div>
           </div>

           <div className="lg:col-span-2 bg-[#001f3f] rounded-[3rem] p-10 text-white shadow-2xl flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
              <div className="space-y-6 relative z-10">
                 <h3 className="text-2xl font-black text-[#d4af37] uppercase tracking-wider">Fee Policy</h3>
                 <p className="text-white/40 text-sm leading-relaxed max-w-sm">Monthly fees must be cleared by the 10th of each month. Late payments may incur a penalty. Contact the school office for bank details.</p>
              </div>
              <div className="shrink-0 relative z-10">
                 <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                    <Receipt className="w-12 h-12 text-[#d4af37]" />
                 </div>
              </div>
              {/* Decor */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37]/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
           </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-[#001f3f]/5 shadow-sm overflow-hidden">
           <div className="p-8 border-b border-[#001f3f]/5 font-black text-[#001f3f] flex items-center gap-3 uppercase tracking-widest text-xs">
              <Receipt className="w-4 h-4 text-[#d4af37]" /> Ledger History
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead>
                   <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <th className="px-8 py-5">Due Date</th>
                      <th className="px-6 py-5">Description</th>
                      <th className="px-6 py-5">Amount</th>
                      <th className="px-8 py-5 text-center">Status</th>
                      <th className="px-8 py-5 text-right">Receipt</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-[#001f3f]/5">
                   {data.map((p, i) => (
                     <tr key={i} className="hover:bg-slate-50/50 transition-all">
                        <td className="px-8 py-5 font-bold text-[#001f3f]">{new Date(p.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                        <td className="px-6 py-5 text-slate-500 font-medium">{p.description || "Monthly Tuition"}</td>
                        <td className="px-6 py-5 font-black text-[#001f3f] text-lg">₹{parseFloat(p.amount).toLocaleString()}</td>
                        <td className="px-8 py-5 text-center">
                           <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.15em] ${
                             p.status === 'paid' ? "bg-emerald-500/10 text-emerald-600" :
                             p.status === 'overdue' ? "bg-rose-500/10 text-rose-600" :
                             "bg-amber-500/10 text-amber-600"
                           }`}>
                              {p.status}
                           </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                           {p.status === 'paid' ? (
                             <button className="p-2 bg-[#001f3f]/5 text-[#001f3f] rounded-xl hover:bg-[#001f3f] hover:text-white transition-all"><Download className="w-4 h-4" /></button>
                           ) : (
                             <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">N/A</span>
                           )}
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
           </div>
           {!data.length && !loading && (
             <div className="py-32 text-center text-slate-300 font-medium italic text-sm">No transaction records found in your ledger.</div>
           )}
        </div>
      </div>
    </DashboardLayout>
  );
}
