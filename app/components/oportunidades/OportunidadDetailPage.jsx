"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Save, X } from "lucide-react";

export default function OportunidadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const oportunidadId = params?.id;

  const [oportunidad, setOportunidad] = useState(null);
  const [etapaActual, setEtapaActual] = useState("en-atencion");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});

  // Etapas disponibles (sin "Reprogramado")
  const etapas = [
    { id: "nuevo", nombre: "Nuevo", label: "Nuevo" },
    { id: "asignado", nombre: "Asignado", label: "Asignado" },
    { id: "en-atencion", nombre: "En Atención", label: "En Atención" },
    { id: "test-drive", nombre: "Test Drive", label: "Test Drive" },
    { id: "cotizacion", nombre: "Cotización", label: "Cotización" },
    { id: "evaluacion-credit", nombre: "Evaluación Crédito", label: "Evaluación Crédit..." },
    { id: "reserva", nombre: "Reserva", label: "Reserva" },
    { id: "venta-facturada", nombre: "Venta Facturada", label: "Venta Facturada" },
    { id: "cerrada", nombre: "Cerrada", label: "Cerrada" },
  ];

  const indiceEtapaActual = etapas.findIndex((e) => e.id === etapaActual);

  useEffect(() => {
    if (!oportunidadId) return;

    const cargarOportunidad = async () => {
      try {
        const res = await fetch(`/api/oportunidades/${oportunidadId}`, {
          cache: "no-store",
        });
        const data = await res.json();
        setOportunidad(data);
        setFormData(data);

        // Cambiar a "En Atención" automáticamente
        setEtapaActual("en-atencion");
      } catch (error) {
        console.error("Error cargando oportunidad:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarOportunidad();
  }, [oportunidadId]);

  const handleGuardar = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/oportunidades/${oportunidadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          etapa_name: etapaActual,
        }),
      });

      if (res.ok) {
        alert("Cambios guardados exitosamente");
      }
    } catch (error) {
      console.error("Error guardando:", error);
      alert("Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelar = () => {
    router.back();
  };

  const handleAvanzar = () => {
    if (indiceEtapaActual < etapas.length - 1) {
      setEtapaActual(etapas[indiceEtapaActual + 1].id);
    }
  };

  const handleRetroceder = () => {
    if (indiceEtapaActual > 0) {
      setEtapaActual(etapas[indiceEtapaActual - 1].id);
    }
  };

  if (loading) return <div className="p-6">Cargando...</div>;
  if (!oportunidad) return <div className="p-6">Oportunidad no encontrada</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-6 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{oportunidad.cliente_name}</h1>
            <p className="text-gray-600">{oportunidad.oportunidad_id}</p>
          </div>
          <button
            onClick={handleCancelar}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Etapas Navigator */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4">
          {etapas.map((etapa, index) => (
            <div key={etapa.id} className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setEtapaActual(etapa.id)}
                className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
                  etapaActual === etapa.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {etapa.label}
              </button>

              {index < etapas.length - 1 && (
                <div className="w-8 h-0.5 bg-gray-300" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-3 gap-6">
          {/* Left: Información de la Oportunidad */}
          <div className="col-span-2 space-y-6">
            {/* Información General */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-semibold mb-4">Información General</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Cliente</label>
                  <p className="text-gray-900">{oportunidad.cliente_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Vehículo</label>
                  <p className="text-gray-900">
                    {oportunidad.modelo_name} - {oportunidad.marca_name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Origen</label>
                  <p className="text-gray-900">{oportunidad.origen_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Asignado a</label>
                  <p className="text-gray-900">{oportunidad.asignado_a_name}</p>
                </div>
              </div>
            </div>

            {/* Campos específicos por etapa */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-semibold mb-4">
                Información de {etapas.find((e) => e.id === etapaActual)?.nombre}
              </h2>
              <div className="space-y-4">
                {/* Aquí irán los campos específicos por etapa que te iré diciendo */}
                <div className="p-4 bg-gray-50 rounded text-gray-600 text-center">
                  Los campos de esta etapa serán configurados según necesites
                </div>
              </div>
            </div>
          </div>

          {/* Right: Panel de Acciones */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg border p-6">
              <h3 className="font-semibold mb-4">Etapa Actual</h3>
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
                <p className="text-lg font-bold text-blue-900">
                  {etapas.find((e) => e.id === etapaActual)?.nombre}
                </p>
              </div>

              {/* Botones de navegación */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Button
                    onClick={handleRetroceder}
                    disabled={indiceEtapaActual === 0}
                    variant="outline"
                    className="flex-1"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Atrás
                  </Button>
                  <Button
                    onClick={handleAvanzar}
                    disabled={indiceEtapaActual === etapas.length - 1}
                    variant="outline"
                    className="flex-1"
                  >
                    Adelante
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>

                <Button
                  onClick={handleGuardar}
                  disabled={saving}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Guardando..." : "Guardar"}
                </Button>

                <Button
                  onClick={handleCancelar}
                  variant="outline"
                  className="w-full"
                >
                  Cancelar
                </Button>
              </div>
            </div>

            {/* Información Adicional */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="font-semibold mb-4">Información Adicional</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Fecha de Creación</p>
                  <p className="font-medium">
                    {oportunidad.created_at
                      ? new Date(oportunidad.created_at).toLocaleDateString("es-ES")
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Última Actualización</p>
                  <p className="font-medium">
                    {oportunidad.updated_at
                      ? new Date(oportunidad.updated_at).toLocaleDateString("es-ES")
                      : "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}