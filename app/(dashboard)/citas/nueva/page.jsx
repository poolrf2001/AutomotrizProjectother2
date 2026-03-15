"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import ClienteSelectCard from "@/app/components/citas/ClienteSelectCard";
import Paso3Horario from "@/app/components/citas/Paso3Horario";
import CitaDatosCard from "@/app/components/citas/CitaDatosCard";
import MotivosVisitaCard from "@/app/components/citas/MotivosVisitaCard";

import { Button } from "@/components/ui/button";
import { useUserScope } from "@/hooks/useUserScope";
import { useAuth } from "@/context/AuthContext";

export default function NuevaCitaPage() {
  const router = useRouter();
  const { user } = useAuth();

  const {
    centros: allowedCentros,
    talleres: allowedTalleres,
    loading: scopeLoading,
  } = useUserScope();

  const [clienteId, setClienteId] = useState(null);
  const [vehiculoId, setVehiculoId] = useState(null);

  const [motivos, setMotivos] = useState([
    { motivo_id: null, submotivo_id: null, submotivos: [] },
  ]);

  const [horario, setHorario] = useState(null);

  const [datos, setDatos] = useState({
    origen_id: null,
    tipo_servicio: "TALLER",
    servicio_valet: false,
    fecha_promesa: "",
    hora_promesa: "",
    nota_cliente: "",
    nota_interna: "",
    files: [],
  });

  const [saving, setSaving] = useState(false);

  function handleClienteSelect(data) {
    setClienteId(data?.cliente?.id || null);
    setVehiculoId(data?.vehiculo?.id || null);
  }

  const motivosValidos = motivos.filter((m) => !!m.motivo_id);

  const canSave =
    !!clienteId &&
    !!horario?.centro_id &&
    !!horario?.taller_id &&
    !!horario?.start &&
    !!horario?.end &&
    !saving &&
    !scopeLoading;

  async function handleSave() {
    if (!user?.id) {
      toast.error("No se encontró el usuario logueado");
      return;
    }

    if (!clienteId) {
      toast.warning("Seleccione cliente");
      return;
    }

    if (!horario?.centro_id || !horario?.taller_id || !horario?.start || !horario?.end) {
      toast.warning("Seleccione horario");
      return;
    }

    if (!allowedCentros.includes(Number(horario.centro_id))) {
      toast.error("No tienes permiso para usar ese centro");
      return;
    }

    if (!allowedTalleres.includes(Number(horario.taller_id))) {
      toast.error("No tienes permiso para usar ese taller");
      return;
    }

    if (motivosValidos.length === 0) {
      toast.warning("Seleccione al menos un motivo");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        cliente_id: clienteId,
        vehiculo_id: vehiculoId,
        centro_id: horario.centro_id,
        taller_id: horario.taller_id,
        asesor_id: horario.asesor_id,
        start_at: horario.start,
        end_at: horario.end,
        origen_id: datos.origen_id,
        tipo_servicio: datos.tipo_servicio || "TALLER",
        servicio_valet: !!datos.servicio_valet,
        fecha_promesa: datos.servicio_valet ? datos.fecha_promesa || null : null,
        hora_promesa: datos.servicio_valet ? datos.hora_promesa || null : null,
        nota_cliente: datos.nota_cliente || null,
        nota_interna: datos.nota_interna || null,
        created_by: user.id,
      };

      const citaRes = await fetch("/api/citas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const citaJson = await citaRes.json();

      if (!citaRes.ok) {
        throw new Error(
          citaJson?.missing?.length
            ? `Faltan campos: ${citaJson.missing.join(", ")}`
            : citaJson?.message || "No se pudo crear la cita"
        );
      }

      const citaId = citaJson.id;

      if (!citaId) {
        throw new Error("La API no devolvió el id de la cita");
      }

      for (const m of motivosValidos) {
        const motivoRes = await fetch(`/api/citas/${citaId}/motivos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            motivo_id: m.motivo_id,
            submotivo_id: m.submotivo_id || null,
          }),
        });

        const motivoJson = await motivoRes.json();

        if (!motivoRes.ok) {
          throw new Error(motivoJson?.message || "Error guardando motivos");
        }
      }

      if (datos.files?.length) {
        for (const file of datos.files) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("user_id", String(user.id));

          const fileRes = await fetch(`/api/citas/${citaId}/archivos`, {
            method: "POST",
            body: formData,
          });

          const fileJson = await fileRes.json();

          if (!fileRes.ok) {
            throw new Error(fileJson?.message || "Error subiendo archivos");
          }
        }
      }

      toast.success("Cita creada correctamente");
      router.push("/citas");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Error creando cita");
    } finally {
      setSaving(false);
    }
  }

  if (scopeLoading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Nueva cita</h1>
        <p className="text-sm text-muted-foreground mt-2">Cargando permisos de centros y talleres...</p>
      </div>
    );
  }

  if (allowedCentros.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Nueva cita</h1>
        <p className="text-sm text-muted-foreground mt-2">
          No tienes centros asignados para crear citas.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Nueva cita</h1>
        <p className="text-sm text-muted-foreground">
          Complete la información de la cita
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          <div className="space-y-6">
            <ClienteSelectCard onSelect={handleClienteSelect} />

            <MotivosVisitaCard
              value={motivos}
              onChange={setMotivos}
            />

            <Paso3Horario
              onChange={setHorario}
              allowedCentros={allowedCentros}
              allowedTalleres={allowedTalleres}
            />
          </div>

          <aside className="border rounded-xl p-4 bg-gray-50 h-fit sticky top-4">
            <CitaDatosCard
              value={datos}
              onChange={setDatos}
            />
          </aside>
        </div>
      </div>

      <div className="pt-4 flex justify-end gap-3 border-t mt-4">
        <Button
          variant="outline"
          onClick={() => router.push("/citas")}
          disabled={saving}
        >
          Cancelar
        </Button>

        <Button onClick={handleSave} disabled={!canSave}>
          {saving ? "Guardando..." : "Guardar cita"}
        </Button>
      </div>

      <div className="mt-3 text-xs text-muted-foreground">
        userId: {String(user?.id)} | clienteId: {String(clienteId)} | vehiculoId: {String(vehiculoId)} | centro: {String(horario?.centro_id)} | taller: {String(horario?.taller_id)} | start: {String(horario?.start)} | end: {String(horario?.end)} | tipo_servicio: {String(datos?.tipo_servicio)}
      </div>
    </div>
  );
}