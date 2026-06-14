"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { ToastContainer } from "@/components/Toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  const setHydrated = useAuthStore(s => s.setHydrated);

  useEffect(() => {
    setHydrated();
  }, [setHydrated]);

  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
}
