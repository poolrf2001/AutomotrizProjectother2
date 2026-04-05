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
import { Loader2, AlertCircle,Upload } from "lucide-react";
import { toast } from "sonner";

function parseCSV(text) {
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    const obj = {};

    headers.forEach((header, index) => {
      obj[header] = values[index] || null;
    });

    return obj;
  });
}

export default function HistorialCarrosImportGlobal({
  onSuccess,
  trigger,
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [validating, setValidating] = useState(false);
  const [validationResults, setValidationResults] = useState(null);
  const [step, setStep] = useState("upload");
  const fileInputRef = useRef(null);

  async function handleValidate() {
    if (!file) {
      toast.error("Selecciona un archivo");
      return;
    }

    setValidating(true);

    try {
      const text = await file.text();
      let carros = [];

      if (file.name.endsWith(".csv")) {
        carros = parseCSV(text);
      } else {
        carros = JSON.parse(text);
      }

      const res = await fetch("/api/historial-carros/validar-importacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ carros }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message);
        return;
      }

      setValidationResults(data);
      setStep("validate");
    } catch (error) {
      console.error(error);
      toast.error("Error al validar: " + error.message);
    } finally {
      setValidating(false);
    }
  }

  async function handleImport() {
    if (!file) return;

    setLoading(true);

    try {
      const text = await file.text();
      let carros = [];

      if (file.name.endsWith(".csv")) {
        carros = parseCSV(text);
      } else {
        carros = JSON.parse(text);
      }

      const res = await fetch("/api/historial-carros/importar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ carros }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message);
        return;
      }

      toast.success(data.message);

      setStep("upload");
      setFile(null);
      setValidationResults(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error("Error al importar: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  function resetDialog() {
    setStep("upload");
    setFile(null);
    setValidationResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div onClick={() => setOpen(true)}>
        {trigger}
      </div>

      <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar Carros en Masa</DialogTitle>
        </DialogHeader>

        {step === "upload" && (
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

            {/* Border dashed para archivo */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
                id="file-input"
              />
              <label htmlFor="file-input" className="cursor-pointer">
                <div>
                  <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                  <p className="text-gray-600">
                    Arrastra un archivo aquí o haz clic para seleccionar
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    CSV o JSON
                  </p>
                </div>
              </label>
            </div>

            {file && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-900">
                  ✓ Archivo seleccionado: <strong>{file.name}</strong>
                </p>
              </div>
            )}

            {/* Formato esperado */}
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs font-semibold text-gray-900 mb-2">
                Formato esperado (CSV):
              </p>
              <div className="text-xs text-gray-600 space-y-1 font-mono overflow-x-auto">
                <p>vin,marca_id,modelo_id,version_id,numerofactura,preciocompra</p>
                <p>WBADT43452G917604,8,11,1,FAC-001,25000</p>
                <p>JTHBP5C2XA5034186,8,11,1,FAC-002,28000</p>
              </div>
            </div>
          </div>
        )}

        {step === "validate" && validationResults && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-green-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">
                  {validationResults.validos}
                </p>
                <p className="text-sm text-green-700">Válidos</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-red-600">
                  {validationResults.invalidos}
                </p>
                <p className="text-sm text-red-700">Inválidos</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {validationResults.total}
                </p>
                <p className="text-sm text-blue-700">Total</p>
              </div>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {validationResults.detalles.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded text-sm ${
                    item.estado === "válido"
                      ? "bg-green-50 text-green-900"
                      : "bg-red-50 text-red-900"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0">
                      {item.estado === "válido" ? "✓" : "✗"}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium">
                        Fila {item.fila}: {item.vin}
                      </p>
                      {item.errores.length > 0 && (
                        <ul className="text-xs mt-1 list-disc list-inside">
                          {item.errores.map((err, i) => (
                            <li key={i}>{err}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter>
          {step === "upload" && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  resetDialog();
                  setOpen(false);
                }}
                disabled={validating}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleValidate}
                disabled={!file || validating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {validating ? <Loader2 className="animate-spin mr-2" /> : null}
                Validar
              </Button>
            </>
          )}

          {step === "validate" && (
            <>
              <Button
                variant="outline"
                onClick={() => setStep("upload")}
                disabled={loading}
              >
                Atrás
              </Button>
              {validationResults?.invalidos === 0 && (
                <Button
                  onClick={handleImport}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                  Importar {validationResults?.validos} registros
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}