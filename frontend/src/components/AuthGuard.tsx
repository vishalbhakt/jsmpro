"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AuthGuard({ children, roles }: { children: React.ReactNode, roles?: string[] }) {
  const { user, token } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!token || !user) {
      router.push("/login");
      return;
    }

    const userRole = user.role?.toLowerCase() || "";
    const normalizedRoles = roles?.map(r => r.toLowerCase());

    if (normalizedRoles && !normalizedRoles.includes(userRole)) {
      router.push("/dashboard");
    }
  }, [user, token, roles, router]);

  const userRole = user?.role?.toLowerCase() || "";
  const normalizedRoles = roles?.map(r => r.toLowerCase());

  if (!token || !user) return null;
  if (normalizedRoles && !normalizedRoles.includes(userRole)) return null;

  return <>{children}</>;
}
