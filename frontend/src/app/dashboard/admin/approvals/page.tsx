"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DataTable from "@/components/DataTable";
import api, { usersAPI } from "@/lib/api";
import { UserCheck, ShieldAlert, Clock } from "lucide-react";
import { useToastStore } from "@/store/useToastStore";

export default function AdminApprovals() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const addToast = useToastStore(s => s.addToast);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await usersAPI.pending();
      setData(res.data.data);
    } catch {
      addToast("Failed to fetch pending requests", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      await usersAPI.approve(id);
      addToast("User approved successfully!");
      fetchPending();
    } catch {
      addToast("Approval failed.", "error");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-10 pb-20">
        <div>
          <h1 className="text-4xl font-black text-navy tracking-tight">Authorization Gate</h1>
          <p className="text-slate-500 font-medium mt-1">Review and approve new school personnel registrations.</p>
        </div>

        <DataTable 
          isLoading={loading}
          data={data}
          columns={[
            { key: "username", header: "Identity", render: (v, row) => (
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 text-[10px] font-black"><Clock className="w-3.5 h-3.5" /></div>
                 <div>
                    <div className="font-bold text-navy">{v}</div>
                    <div className="text-[10px] text-slate-400 font-medium">{new Date(row.date_joined).toLocaleDateString()}</div>
                 </div>
              </div>
            )},
            { key: "email", header: "Email" },
            { key: "role", header: "Requested Role", render: r => (
               <span className="px-3 py-1 bg-navy/5 text-navy rounded-lg text-[10px] font-black uppercase tracking-widest">{r}</span>
            )},
            { key: "actions", header: "Actions", render: (_, row: any) => (
              <button 
                onClick={() => handleApprove(row.id)}
                className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                <UserCheck className="w-3.5 h-3.5" />
                Approve Now
              </button>
            )}
          ]}
        />
        
        {!data.length && !loading && (
           <div className="py-40 text-center bg-white rounded-[3rem] border-2 border-dashed border-navy/5 flex flex-col items-center">
              <ShieldAlert className="w-12 h-12 text-slate-200 mb-4" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No pending approval requests.</p>
           </div>
        )}
      </div>
    </DashboardLayout>
  );
}
