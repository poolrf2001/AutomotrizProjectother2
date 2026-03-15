"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function formatHour(value) {
  if (!value) return "--";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "--";
  return d.toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function estadoColor(estado) {
  const e = String(estado || "").toLowerCase();
  if (e === "confirmada") return "text-green-700";
  if (e === "pendiente") return "text-amber-700";
  if (e === "cancelada") return "text-red-700";
  if (e === "reprogramada") return "text-blue-700";
  return "text-gray-700";
}

export default function CitaResumenDialog({
  open,
  onOpenChange,
  cita,
}) {
  const router = useRouter();

  if (!cita) return null;

  const clienteNombre =
    [cita.nombre, cita.apellido].filter(Boolean).join(" ") ||
    cita.cliente ||
    "--";

  const vehiculo = [
    cita.placa || cita.placas || "SIN PLACA",
    cita.vin || "--",
    cita.marca || "--",
    cita.modelo || "--",
  ].join(", ");

  function handleEditar() {
    if (!cita?.id) {
      toast.error("No se encontró el ID de la cita");
      return;
    }

    onOpenChange(false);
    router.push(`/citas/${cita.id}/editar`);
  }

  function handleCrearOrden() {
    toast.success("Crear orden");
  }

  function handleClienteNoLlego() {
    toast("Cliente no llegó");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="pr-10">
          <div className="flex items-center justify-between gap-2">
            <DialogTitle>Detalle de cita</DialogTitle>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleEditar}
              className="h-8 w-8"
              title="Editar"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div>
            <div className={`font-semibold uppercase ${estadoColor(cita.estado)}`}>
              {cita.estado || "--"}
            </div>
            <div className="text-xs text-muted-foreground">
              Cita #{cita.id}
            </div>
          </div>

          <div className="border-t pt-3 space-y-1">
            <div className="font-medium">Cliente</div>
            <div className="font-semibold">{clienteNombre}</div>
            <div>{cita.correo || "--"}</div>
            <div>{cita.celular || "--"}</div>
          </div>

          <div className="border-t pt-3 space-y-1">
            <div className="font-medium">Vehículo</div>
            <div className="font-semibold">{vehiculo}</div>
          </div>

          <div className="border-t pt-3 space-y-1">
            <div className="font-medium">Duración</div>
            <div className="font-semibold">
              {formatHour(cita.start_at)} - {formatHour(cita.end_at)}
            </div>
          </div>

          <div className="border-t pt-3 space-y-1">
            <div className="font-medium">Asesor de Servicio</div>
            <div className="font-semibold">{cita.asesor || "Sin asesor"}</div>
          </div>

          <div className="border-t pt-3 space-y-1">
            <div className="font-medium">Motivo de visita</div>
            {Array.isArray(cita.motivos) && cita.motivos.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1">
                {cita.motivos.map((m) => (
                  <li key={m.id || `${m.motivo_id}-${m.submotivo_id || "x"}`}>
                    <span className="font-semibold">
                      {m.motivo || "--"}
                    </span>
                    {m.submotivo ? ` - ${m.submotivo}` : ""}
                  </li>
                ))}
              </ul>
            ) : (
              <div>{cita.motivo || "--"}</div>
            )}
          </div>

          <div className="border-t pt-3 space-y-1">
            <div className="font-medium">Notas visibles para el cliente</div>
            <div>{cita.nota_cliente || "--"}</div>
          </div>

          <div className="border-t pt-3 space-y-1">
            <div className="font-medium">Notas internas</div>
            <div>{cita.nota_interna || "--"}</div>
          </div>
        </div>

        <div className="pt-4 space-y-2">
          <Button className="w-full" onClick={handleCrearOrden}>
            Crear orden
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleClienteNoLlego}
          >
            Cliente no llegó
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}