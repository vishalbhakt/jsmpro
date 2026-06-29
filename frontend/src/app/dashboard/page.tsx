"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role) {
      router.replace(`/dashboard/${user.role.toLowerCase()}`);
    } else {
      router.replace("/login");
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#001f3f]/40">Loading Command Core...</span>
      </div>
    </div>
  );
}
