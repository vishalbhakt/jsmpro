"use client";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion } from "framer-motion";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Column {
  key: string;
  header: string;
  render?: (val: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data?: any[];
  isLoading?: boolean;
}

export default function DataTable({ columns, data = [], isLoading }: DataTableProps) {
  const safeData = Array.isArray(data) ? data : [];
  console.log('DataTable received', safeData.length, 'rows');

  if (isLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-white rounded-[2.5rem] border border-[#001f3f]/5 shadow-sm">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Synchronizing Ledger...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden bg-white rounded-[2.5rem] border border-[#001f3f]/5 shadow-xl shadow-slate-200/40 transition-all">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-[#001f3f]/5">
              {columns.map((col) => (
                <th key={col.key} className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 whitespace-nowrap">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#001f3f]/5">
            {safeData.map((row, i) => (
              <motion.tr 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                key={i} 
                className="hover:bg-slate-50/80 transition-colors group"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-8 py-5 text-sm font-bold text-[#001f3f] whitespace-nowrap">
                    {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? "-")}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      {!safeData.length && (
        <div className="py-32 text-center text-slate-300 font-bold uppercase tracking-widest text-xs flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
             <div className="w-2 h-2 bg-slate-200 rounded-full animate-ping" />
          </div>
          No records found
        </div>
      )}
    </div>
  );
}
