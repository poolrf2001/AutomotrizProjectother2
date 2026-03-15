"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash, Plus } from "lucide-react";

export default function MotivosVisitaCard({ value = [], onChange }) {
  const [motivos, setMotivos] = useState([]);

  useEffect(() => {
    fetch("/api/motivos_citas?active=1", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => setMotivos(Array.isArray(data) ? data : []))
      .catch((e) => {
        console.log(e);
        setMotivos([]);
      });
  }, []);

  function updateRow(i, data) {
    const copy = [...value];
    copy[i] = { ...copy[i], ...data };
    onChange(copy);
  }

  async function fetchSubmotivos(motivoId) {
    if (!motivoId) return [];

    try {
      const subs = await fetch(
        `/api/submotivos-citas?motivo_id=${motivoId}&active=1`,
        { cache: "no-store" }
      ).then((r) => r.json());

      return Array.isArray(subs) ? subs : [];
    } catch (e) {
      console.log(e);
      return [];
    }
  }

  async function cargarSubmotivos(motivoId, i) {
    const subs = await fetchSubmotivos(motivoId);

    updateRow(i, {
      motivo_id: Number(motivoId),
      submotivos: subs,
      submotivo_id: null,
    });
  }

  // 🔥 cargar submotivos iniciales cuando entras a editar
  useEffect(() => {
    if (!value.length) return;

    value.forEach(async (row, i) => {
      if (row?.motivo_id && (!Array.isArray(row.submotivos) || row.submotivos.length === 0)) {
        const subs = await fetchSubmotivos(row.motivo_id);

        const stillSameRow =
          value[i] && Number(value[i].motivo_id) === Number(row.motivo_id);

        if (!stillSameRow) return;

        updateRow(i, {
          submotivos: subs,
          submotivo_id: row.submotivo_id ?? null,
        });
      }
    });
  }, [value.length]);

  function addRow() {
    onChange([
      ...value,
      { motivo_id: null, submotivo_id: null, submotivos: [] },
    ]);
  }

  function removeRow(i) {
    const copy = [...value];
    copy.splice(i, 1);
    onChange(copy);
  }

  return (
    <Card>
      <CardHeader className="font-semibold">
        PASO 2 — Motivo de visita
      </CardHeader>

      <CardContent className="space-y-4">
        {value.map((row, i) => (
          <div
            key={`motivo-${i}-${row.motivo_id ?? "new"}`}
            className="grid md:grid-cols-[1fr_1fr_auto] gap-3 items-start"
          >
            {/* MOTIVO */}
            <Select
              value={row.motivo_id ? String(row.motivo_id) : undefined}
              onValueChange={(v) => {
                updateRow(i, {
                  motivo_id: Number(v),
                  submotivo_id: null,
                  submotivos: [],
                });

                cargarSubmotivos(v, i);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Motivo de visita" />
              </SelectTrigger>
              <SelectContent>
                {motivos.map((m) => (
                  <SelectItem key={m.id} value={String(m.id)}>
                    {m.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* SUBMOTIVO */}
            <Select
              value={row.submotivo_id ? String(row.submotivo_id) : undefined}
              onValueChange={(v) =>
                updateRow(i, { submotivo_id: Number(v) })
              }
              disabled={!row.motivo_id || !row.submotivos?.length}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    row.motivo_id
                      ? row.submotivos?.length
                        ? "Detalle del motivo"
                        : "Sin submotivos"
                      : "Seleccione un motivo primero"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {row.submotivos?.map((sm) => (
                  <SelectItem key={sm.id} value={String(sm.id)}>
                    {sm.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* ELIMINAR */}
            <div>
              {value.length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => removeRow(i)}
                  className="w-full md:w-auto"
                >
                  <Trash size={16} />
                </Button>
              )}
            </div>
          </div>
        ))}

        {/* AGREGAR */}
        <Button type="button" variant="link" onClick={addRow}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar motivo
        </Button>
      </CardContent>
    </Card>
  );
}