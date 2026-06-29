"use client";

import { ChangeEvent } from "react";

export interface FormInputProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

export function FormInput({ id, label, type = "text", value, onChange, required = false }: FormInputProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
        {label}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        aria-required={required}
        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 font-bold focus:border-gold outline-none transition-all"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

export interface FormTextareaProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
}

export function FormTextarea({ id, label, value, onChange, required = false }: FormTextareaProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
        {label}
      </label>
      <textarea
        id={id}
        required={required}
        aria-required={required}
        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 font-bold focus:border-gold outline-none transition-all min-h-[120px]"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
