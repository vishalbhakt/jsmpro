"use client";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
  data: any[];
  isLoading?: boolean;
}

export default function DataTable({ columns, data, isLoading }: DataTableProps) {
  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-white rounded-3xl border border-navy/5">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-black uppercase tracking-widest text-slate-400">Syncing Data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden bg-white rounded-3xl border border-navy/5 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-navy/5">
              {columns.map((col) => (
                <th key={col.key} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-navy/5">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 text-sm font-bold text-navy whitespace-nowrap">
                    {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? "-")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!data.length && (
        <div className="py-20 text-center text-slate-400 font-medium italic">
          No records found.
        </div>
      )}
    </div>
  );
}
