"use client";

import AuthGuard from "@/components/AuthGuard";

export default function ProtectedDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      {children}
    </AuthGuard>
  );
}
