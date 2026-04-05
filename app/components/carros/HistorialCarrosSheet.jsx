"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, History, Plus, Upload } from "lucide-react";
import { toast } from "sonner";
import HistorialCarrosDialog from "@/app/components/carros/HistorialCarrosDialog";
import HistorialCarrosImport from "@/app/components/carros/HistorialCarrosImport";

export default function HistorialCarrosSheet({
  marcaId,
  modeloId,
  marcaNombre,
  modeloNombre,
}) {
  const [open, setOpen] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);

  async function loadHistorial() {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/historial-carros?marca_id=${marcaId}&modelo_id=${modeloId}&limite=100`,
        { cache: "no-store" }
      );
      const data = await res.json();
      setHistorial(data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Error cargando historial");
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(newOpen) {
    setOpen(newOpen);
    if (newOpen) {
      loadHistorial();
    }
  }

  function handleSuccess() {
    loadHistorial();
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <button
        onClick={() => setOpen(true)}
        className="flex gap-1 items-center justify-center hover:bg-slate-200 p-1 rounded transition-colors"
        title="Ver historial de carros"
      >
        <History size={16} className="text-slate-600" />
      </button>

      <SheetContent side="right" className="w-full sm:w-[700px] overflow-y-auto p-0">
        <SheetHeader className="space-y-4 p-6 border-b">
          <SheetTitle className="flex items-center gap-2">
            <History size={20} />
            Historial de Carros
          </SheetTitle>

          <div className="text-sm text-gray-600 space-y-1 bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p>
              <strong>Marca:</strong> {marcaNombre}
            </p>
            <p>
              <strong>Modelo:</strong> {modeloNombre}
            </p>
          </div>

          <div className="flex gap-2">
            <HistorialCarrosDialog
              marcaId={marcaId}
              modeloId={modeloId}
              marcaNombre={marcaNombre}
              modeloNombre={modeloNombre}
              onSuccess={handleSuccess}
              trigger={
                <Button size="sm" className="bg-green-600 hover:bg-green-700 gap-2">
                  <Plus size={16} />
                  Agregar Carro
                </Button>
              }
            />

            <HistorialCarrosImport
              marcaId={marcaId}
              modeloId={modeloId}
              marcaNombre={marcaNombre}
              modeloNombre={modeloNombre}
              onSuccess={handleSuccess}
              trigger={
                <Button size="sm" variant="outline" className="gap-2">
                  <Upload size={16} />
                  Importar
                </Button>
              }
            />
          </div>
        </SheetHeader>

        <div className="space-y-4 p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : historial.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600 text-sm">No hay carros registrados</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-semibold text-blue-900">
                  Total de carros: {historial.length}
                </p>
              </div>

              {historial.map((carro) => (
                <div
                  key={carro.vin}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-white"
                >
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-semibold text-gray-500 w-24 flex-shrink-0">
                        VIN
                      </span>
                      <code className="text-sm font-mono bg-slate-100 px-2 py-1 rounded flex-1 break-all">
                        {carro.vin}
                      </code>
                    </div>

                    {carro.numerofactura && (
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-semibold text-gray-500 w-24 flex-shrink-0">
                          Factura
                        </span>
                        <span className="text-sm text-gray-900">
                          {carro.numerofactura}
                        </span>
                      </div>
                    )}

                    {carro.preciocompra && (
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-semibold text-gray-500 w-24 flex-shrink-0">
                          Precio
                        </span>
                        <span className="text-sm font-semibold text-green-600">
                          ${parseFloat(carro.preciocompra).toLocaleString(
                            "es-PE",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}
                        </span>
                      </div>
                    )}

                    <div className="space-y-2 text-xs text-gray-600">
                      {carro.created_at && (
                        <p>
                          <span className="font-semibold text-gray-700">
                            Creado:
                          </span>{" "}
                          {new Date(carro.created_at).toLocaleDateString(
                            "es-PE"
                          )}
                        </p>
                      )}

                      {carro.created_at_facturacion && (
                        <p>
                          <span className="font-semibold text-gray-700">
                            Facturado:
                          </span>{" "}
                          {new Date(
                            carro.created_at_facturacion
                          ).toLocaleDateString("es-PE")}
                        </p>
                      )}

                      {carro.created_at_entrega && (
                        <p>
                          <span className="font-semibold text-gray-700">
                            Entregado:
                          </span>{" "}
                          {new Date(
                            carro.created_at_entrega
                          ).toLocaleDateString("es-PE")}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {carro.created_at_facturacion && (
                        <Badge className="bg-blue-100 text-blue-800 text-xs">
                          Facturado
                        </Badge>
                      )}
                      {carro.created_at_entrega && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          Entregado
                        </Badge>
                      )}
                      {!carro.created_at_facturacion && (
                        <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                          Pendiente
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}