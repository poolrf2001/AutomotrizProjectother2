"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";

function normalizeIds(value) {
  if (Array.isArray(value)) {
    return [...new Set(value.map(Number).filter((n) => Number.isInteger(n) && n > 0))];
  }

  if (typeof value === "string" && value.trim()) {
    return [
      ...new Set(
        value
          .split(",")
          .map((x) => Number(x.trim()))
          .filter((n) => Number.isInteger(n) && n > 0)
      ),
    ];
  }

  return [];
}

export function useUserScope() {
  const { user, loading: authLoading } = useAuth();

  const [scope, setScope] = useState({
    centros: [],
    mostradores: [],
    talleres: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!user?.id) {
      setScope({
        centros: [],
        mostradores: [],
        talleres: [],
      });
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadScope() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`/api/usuarios/${user.id}`, {
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message || "No se pudo cargar el scope del usuario");
        }

        if (cancelled) return;

        setScope({
          centros: normalizeIds(data.centros),
          mostradores: normalizeIds(data.mostradores),
          talleres: normalizeIds(data.talleres),
        });
      } catch (err) {
        if (cancelled) return;

        setError(err.message || "Error cargando scope");
        setScope({
          centros: [],
          mostradores: [],
          talleres: [],
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadScope();

    return () => {
      cancelled = true;
    };
  }, [user?.id, authLoading]);

  const centroSet = useMemo(() => new Set(scope.centros.map(Number)), [scope.centros]);
  const mostradorSet = useMemo(() => new Set(scope.mostradores.map(Number)), [scope.mostradores]);
  const tallerSet = useMemo(() => new Set(scope.talleres.map(Number)), [scope.talleres]);

  return {
    userId: user?.id || null,
    centros: scope.centros,
    mostradores: scope.mostradores,
    talleres: scope.talleres,

    hasCentro: (id) => centroSet.has(Number(id)),
    hasMostrador: (id) => mostradorSet.has(Number(id)),
    hasTaller: (id) => tallerSet.has(Number(id)),

    loading: authLoading || loading,
    error,
  };
}