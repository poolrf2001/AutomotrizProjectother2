"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const BRAND_PRIMARY = "#5d16ec";
const BRAND_SECONDARY = "#81929c";

export default function PerfilPage() {
  const { user } = useAuth();

  const [loadingUser, setLoadingUser] = useState(true);
  const [savingPassword, setSavingPassword] = useState(false);

  const [perfil, setPerfil] = useState(null);

  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const userId = useMemo(() => user?.id, [user]);

  async function loadPerfil() {
    if (!userId) return;

    try {
      setLoadingUser(true);
      const res = await fetch(`/api/usuarios/${userId}`, { cache: "no-store" });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        toast.error(data?.message || "No se pudo cargar el perfil");
        setPerfil(null);
        return;
      }

      setPerfil(data);
    } catch (e) {
      console.error(e);
      toast.error("Error cargando perfil");
      setPerfil(null);
    } finally {
      setLoadingUser(false);
    }
  }

  useEffect(() => {
    loadPerfil();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function onChangePassword(e) {
    e.preventDefault();

    const newPass = form.newPassword.trim();
    const confirm = form.confirmPassword.trim();

    if (!newPass || !confirm) {
      toast.error("Completa ambos campos");
      return;
    }

    if (newPass.length < 6) {
      toast.error("La contraseña debe tener mínimo 6 caracteres");
      return;
    }

    if (newPass !== confirm) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    try {
      setSavingPassword(true);

      const res = await fetch(`/api/usuarios/${userId}/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPass }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data?.message || "No se pudo actualizar la contraseña");
        return;
      }

      toast.success(data?.message || "Password actualizado");
      setForm({ newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error(err);
      toast.error("Error actualizando contraseña");
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      {/* HEADER */}
      <div className="border-b pb-4">
        <h1
          className="text-2xl sm:text-3xl font-bold"
          style={{ color: BRAND_PRIMARY }}
        >
          Mi perfil
        </h1>
        <p className="text-sm mt-1" style={{ color: BRAND_SECONDARY }}>
          Revisa tu información y actualiza tu contraseña.
        </p>
      </div>

      {/* INFO */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-slate-50">
          <CardTitle className="text-base sm:text-lg">
            Información de usuario
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          {loadingUser ? (
            <p className="text-sm" style={{ color: BRAND_SECONDARY }}>
              Cargando perfil...
            </p>
          ) : !perfil ? (
            <p className="text-sm text-red-600">No se pudo cargar el perfil.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <InfoRow label="Nombre" value={perfil.fullname} />
              <InfoRow label="Usuario" value={perfil.username} />
              <InfoRow label="Email" value={perfil.email} />
              <InfoRow label="Teléfono" value={perfil.phone} />
              <InfoRow label="Rol" value={perfil.role_name} />
              <InfoRow
                label="Estado"
                value={Number(perfil.is_active) === 1 ? "Activo" : "Inactivo"}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* PASSWORD */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-slate-50">
          <CardTitle className="text-base sm:text-lg">
            Cambiar contraseña
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <form onSubmit={onChangePassword} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nueva contraseña</Label>
                <Input
                  type="password"
                  value={form.newPassword}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, newPassword: e.target.value }))
                  }
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                />
              </div>

              <div className="space-y-2">
                <Label>Repetir nueva contraseña</Label>
                <Input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, confirmPassword: e.target.value }))
                  }
                  placeholder="Repite la contraseña"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!userId || savingPassword}
                className="text-white"
                style={{ backgroundColor: BRAND_PRIMARY }}
              >
                {savingPassword ? "Guardando..." : "Actualizar contraseña"}
              </Button>
            </div>

            <p className="text-xs" style={{ color: BRAND_SECONDARY }}>
              Nota: por seguridad, usa una contraseña fuerte y no la compartas.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-medium text-slate-900 break-words">{value || "—"}</p>
    </div>
  );
}