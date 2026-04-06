"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function HistorialCarrosImport({
  marcaId,
  modeloId,
  marcaNombre,
  modeloNombre,
  onSuccess,
  trigger,
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  async function handleImport() {
    if (!file) {
      toast.error("Selecciona un archivo");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("marca_id", marcaId.toString());
      formData.append("modelo_id", modeloId.toString());

      const res = await fetch("/api/historial-carros/importar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message);
        return;
      }

      toast.success(`✓ ${data.resultados.importados} carros importados`);

      if (data.resultados.errores > 0) {
        toast.error(`${data.resultados.errores} errores durante la importación`);
      }

      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error("Error al importar carros");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div onClick={() => setOpen(true)}>
        {trigger}
      </div>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Importar Carros en Masa</DialogTitle>
          <div className="text-sm text-gray-600 space-y-1 mt-2">
            <p>
              <strong>Marca:</strong> {marcaNombre}
            </p>
            <p>
              <strong>Modelo:</strong> {modeloNombre}
            </p>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Información */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex gap-2">
            <AlertCircle
              size={16}
              className="text-blue-600 flex-shrink-0 mt-0.5"
            />
            <p className="text-xs text-blue-700">
              Sube un archivo CSV o JSON con los carros a importar
            </p>
          </div>

          {/* Input de archivo */}
          <div className="space-y-2">
            <Input
              ref={fileInputRef}
              type="file"
              accept=".csv,.json,.xlsx,.xls"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              placeholder="Selecciona archivo"
            />
            {file && (
              <p className="text-sm text-green-600 flex items-center gap-1">
                ✓ {file.name}
              </p>
            )}
          </div>

          {/* Formato esperado */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs font-semibold text-gray-900 mb-2">
              Formato esperado:
            </p>
            <div className="text-xs text-gray-600 space-y-1 font-mono">
              <p>vin, numerofactura, preciocompra</p>
              <p>WBADT43452G917604, FAC-001, 25000</p>
              <p>JTHBP5C2XA5034186, FAC-002, 28000</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleImport}
            disabled={!file || loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : null}
            Importar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}