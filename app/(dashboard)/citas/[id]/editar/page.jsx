"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";

import ClienteSelectCard from "@/app/components/citas/ClienteSelectCard";
import Paso3Horario from "@/app/components/citas/Paso3Horario";
import CitaDatosCard from "@/app/components/citas/CitaDatosCard";
import MotivosVisitaCard from "@/app/components/citas/MotivosVisitaCard";

import { Button } from "@/components/ui/button";

export default function EditarCitaPage() {
  const router = useRouter();
  const params = useParams();
  const citaId = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  function handleClienteSelect(data) {
    setClienteId(data?.cliente?.id || null);
    setVehiculoId(data?.vehiculo?.id || null);
  }

  useEffect(() => {
    if (!citaId) return;

    async function loadCita() {
      try {
        setLoading(true);

        const [citaRes, motivosRes] = await Promise.all([
          fetch(`/api/citas/${citaId}`, { cache: "no-store" }),
          fetch(`/api/citas/${citaId}/motivos`, { cache: "no-store" }),
        ]);

        const citaJson = await citaRes.json();
        const motivosJson = await motivosRes.json();

        if (!citaRes.ok) {
          throw new Error(citaJson?.message || "No se pudo cargar la cita");
        }

        setClienteId(citaJson.cliente_id || null);
        setVehiculoId(citaJson.vehiculo_id || null);

        setHorario({
          centro_id: citaJson.centro_id || null,
          taller_id: citaJson.taller_id || null,
          asesor_id: citaJson.asesor_id || null,
          start: citaJson.start_at || null,
          end: citaJson.end_at || null,
        });

        setDatos({
          origen_id: citaJson.origen_id || null,
          tipo_servicio: citaJson.tipo_servicio || "TALLER",
          servicio_valet: !!citaJson.servicio_valet,
          fecha_promesa: citaJson.fecha_promesa || "",
          hora_promesa: citaJson.hora_promesa || "",
          nota_cliente: citaJson.nota_cliente || "",
          nota_interna: citaJson.nota_interna || "",
          files: [],
        });

        if (Array.isArray(motivosJson) && motivosJson.length > 0) {
          setMotivos(
            motivosJson.map((m) => ({
              motivo_id: m.motivo_id || null,
              submotivo_id: m.submotivo_id || null,
              submotivos: [],
            }))
          );
        } else {
          setMotivos([
            { motivo_id: null, submotivo_id: null, submotivos: [] },
          ]);
        }
      } catch (error) {
        console.error(error);
        toast.error(error.message || "Error cargando cita");
        router.push("/citas");
      } finally {
        setLoading(false);
      }
    }

    loadCita();
  }, [citaId, router]);

  const motivosValidos = motivos.filter((m) => !!m.motivo_id);

  const canSave =
    !!clienteId &&
    !!horario?.centro_id &&
    !!horario?.taller_id &&
    !!horario?.start &&
    !!horario?.end &&
    !saving &&
    !loading;

  async function handleSave() {
    if (!clienteId) {
      toast.warning("Seleccione cliente");
      return;
    }

    if (!horario?.centro_id || !horario?.taller_id || !horario?.start || !horario?.end) {
      toast.warning("Seleccione horario");
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
      };

      const citaRes = await fetch(`/api/citas/${citaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const citaJson = await citaRes.json();

      if (!citaRes.ok) {
        throw new Error(citaJson?.message || "No se pudo actualizar la cita");
      }

      const motivosRes = await fetch(`/api/citas/${citaId}/motivos`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          motivosValidos.map((m) => ({
            motivo_id: m.motivo_id,
            submotivo_id: m.submotivo_id || null,
          }))
        ),
      });

      const motivosJson = await motivosRes.json();

      if (!motivosRes.ok) {
        throw new Error(motivosJson?.message || "No se pudieron actualizar los motivos");
      }

      if (datos.files?.length) {
        for (const file of datos.files) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("user_id", "1");

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

      toast.success("Cita actualizada correctamente");
      router.push("/citas");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Error actualizando cita");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Editar cita</h1>
        <p className="text-sm text-muted-foreground mt-2">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Editar cita</h1>
        <p className="text-sm text-muted-foreground">
          Actualice la información de la cita
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          <div className="space-y-6">
            <ClienteSelectCard
              onSelect={handleClienteSelect}
              initialClienteId={clienteId}
              initialVehiculoId={vehiculoId}
            />

            <MotivosVisitaCard
              value={motivos}
              onChange={setMotivos}
            />

            <Paso3Horario
              onChange={setHorario}
              initialValue={horario}
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
          {saving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>

      <div className="mt-3 text-xs text-muted-foreground">
        citaId: {String(citaId)} | clienteId: {String(clienteId)} | vehiculoId: {String(vehiculoId)} | centro: {String(horario?.centro_id)} | taller: {String(horario?.taller_id)} | start: {String(horario?.start)} | end: {String(horario?.end)} | tipo_servicio: {String(datos?.tipo_servicio)}
      </div>
    </div>
  );
}