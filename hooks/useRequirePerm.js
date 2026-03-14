"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { hasPermission } from "@/lib/permissions";
import { useAuth } from "@/context/AuthContext";

export function useRequirePerm(module, action = "view") {
  const router = useRouter();
  const { permissions, loading } = useAuth();

  const allowed = useMemo(() => {
    if (loading) return false;
    return hasPermission(permissions, module, action);
  }, [permissions, loading, module, action]);

  useEffect(() => {
    if (loading) return;

    if (!allowed) {
      router.replace("/403");
    }
  }, [allowed, loading, router]);

  return allowed;
}