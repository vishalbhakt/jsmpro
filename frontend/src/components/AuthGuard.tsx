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

    if (roles && !roles.includes(user.role)) {
      router.push("/dashboard");
    }
  }, [user, token, roles, router]);

  if (!token || !user) return null;
  if (roles && !roles.includes(user.role)) return null;

  return <>{children}</>;
}
