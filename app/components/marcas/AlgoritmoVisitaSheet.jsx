"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import AlgoritmoVisitaDialog from "./AlgoritmoVisitaDialog";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";

export default function AlgoritmoVisitaSheet({
  open,
  onOpenChange,
  canEdit = true,
  canDelete = true,
  canCreate = true,
  onChanged,
}) {
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [marcas, setMarcas] = useState([]);

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [recordsRes, marcasRes] = await Promise.all([
        fetch("/api/algoritmo_visita", { cache: "no-store" }),
        fetch("/api/marcas", { cache: "no-store" }),
      ]);

      const recordsData = await recordsRes.json();
      const marcasData = await marcasRes.json();

      setRecords(Array.isArray(recordsData) ? recordsData : []);
      setMarcas(Array.isArray(marcasData) ? marcasData : []);
    } catch (e) {
      toast.error("Error cargando datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) loadData();
  }, [open]);

  const recordsSorted = useMemo(() => {
    return [...records].sort((a, b) =>
      String(a.modelo_name || "").localeCompare(String(b.modelo_name || ""))
    );
  }, [records]);

  const onNewRecord = () => {
    setSelectedRecord(null);
    setFormMode("create");
    setFormDialogOpen(true);
  };

  const onEditRecord = (record) => {
    setSelectedRecord(record);
    setFormMode("edit");
    setFormDialogOpen(true);
  };

  const askDeleteRecord = (record) => {
    setRecordToDelete(record);
    setDeleteDialogOpen(true);
  };

  const saveRecord = async (data) => {
    const isEdit = !!data.id;
    const url = isEdit
      ? `/api/algoritmo_visita/${data.id}`
      : `/api/algoritmo_visita`;
    const method = isEdit ? "PUT" : "POST";

    if (!Array.isArray(data.años)) {
      toast.error("El campo 'años' debe ser un array.");
      return;
    }

    for (const range of data.años) {
      if (!/^\d{4}-\d{4}$/.test(range)) {
        toast.error("Cada rango de 'años' debe tener el formato YYYY-YYYY.");
        return;
      }
    }

    try {
      const payload = {
        ...data,
        modelo_id: Number(data.modelo_id),
        marca_id: Number(data.marca_id),
        kilometraje: Number(data.kilometraje),
        meses: Number(data.meses),
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Error al guardar el registro");
      }

      toast.success(isEdit ? "Registro actualizado" : "Registro creado");
      setFormDialogOpen(false);
      setSelectedRecord(null);
      await loadData();
      onChanged?.();
    } catch (e) {
      console.error(e);
      toast.error("No se pudo guardar el registro");
    }
  };

  const confirmDelete = async () => {
    if (!recordToDelete) return;

    try {
      const res = await fetch(`/api/algoritmo_visita/${recordToDelete.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Error al eliminar el registro");
      }

      toast.success("Registro eliminado");
      setDeleteDialogOpen(false);
      setRecordToDelete(null);
      await loadData();
      onChanged?.();
    } catch (e) {
      console.error(e);
      toast.error("No se pudo eliminar el registro");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Configuracion de tiempo de mantenimiento</SheetTitle>
          <SheetDescription>
            Gestionar tus tiempos de mantenimiento
          </SheetDescription>
        </SheetHeader>

        <div className="mt-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <Button variant="outline" onClick={loadData} disabled={loading}>
              Recargar
            </Button>

            {canCreate && (
              <Button onClick={onNewRecord} disabled={loading}>
                <Plus size={16} /> Nuevo registro
              </Button>
            )}
          </div>

          <div className="border rounded-md overflow-hidden">
            <div className="max-h-[65vh] overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="p-3 text-left">Modelo</th>
                    <th className="p-3 text-left">Marca</th>
                    <th className="p-3 text-left">Kilometraje</th>
                    <th className="p-3 text-left">Meses</th>
                    <th className="p-3 text-right">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {recordsSorted.map((record) => (
                    <tr key={record.id} className="border-t">
                      <td className="p-3">{record.modelo_name}</td>
                      <td className="p-3">{record.marca_name}</td>
                      <td className="p-3">{record.kilometraje}</td>
                      <td className="p-3">{record.meses}</td>

                      <td className="p-3 text-right space-x-2">
                        {canEdit && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onEditRecord(record)}
                            disabled={loading}
                            title="Editar"
                          >
                            <Pencil size={16} />
                          </Button>
                        )}

                        {canDelete && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => askDeleteRecord(record)}
                            disabled={loading}
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}

                  {!loading && recordsSorted.length === 0 && (
                    <tr>
                      <td
                        className="p-4 text-sm text-muted-foreground"
                        colSpan={5}
                      >
                        No hay registros aún.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <SheetFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </SheetFooter>

        <AlgoritmoVisitaDialog
          open={formDialogOpen}
          onOpenChange={setFormDialogOpen}
          mode={formMode}
          record={selectedRecord}
          marcas={marcas}
          onSave={saveRecord}
        />

        <ConfirmDeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Eliminar registro"
          description={`¿Seguro que deseas eliminar este registro de modelo ID "${recordToDelete?.modelo_id}"?`}
          onConfirm={confirmDelete}
        />
      </SheetContent>
    </Sheet>
  );
}