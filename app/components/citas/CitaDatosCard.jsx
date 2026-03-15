"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CitaDatosCard({ value, onChange }) {
  const [origenes, setOrigenes] = useState([]);

  useEffect(() => {
    fetch("/api/origenes_citas")
      .then((r) => r.json())
      .then((data) => setOrigenes(Array.isArray(data) ? data : []))
      .catch(() => setOrigenes([]));
  }, []);

  function setField(field, val) {
    onChange((prev) => ({ ...prev, [field]: val }));
  }

  function addFiles(files) {
    setField("files", [...(value.files || []), ...files]);
  }

  function removeFile(index) {
    const copy = [...(value.files || [])];
    copy.splice(index, 1);
    setField("files", copy);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos de la cita</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <Label>Origen</Label>
          <Select
            value={value.origen_id ? String(value.origen_id) : undefined}
            onValueChange={(v) => setField("origen_id", Number(v))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione" />
            </SelectTrigger>

            <SelectContent>
              {origenes
                .filter((o) => Number(o.is_active) === 1)
                .map((o) => (
                  <SelectItem key={o.id} value={String(o.id)}>
                    {o.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Tipo servicio</Label>
          <Select
            value={value.tipo_servicio || "TALLER"}
            onValueChange={(v) => setField("tipo_servicio", v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TALLER">Taller</SelectItem>
              <SelectItem value="PLANCHADO_PINTURA">
                Planchado / Pintura
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-between items-center">
          <Label>Servicio recojo y entrega de carro</Label>
          <Switch
            checked={!!value.servicio_valet}
            onCheckedChange={(v) => setField("servicio_valet", v)}
          />
        </div>

        {value.servicio_valet && (
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="date"
              value={value.fecha_promesa || ""}
              onChange={(e) => setField("fecha_promesa", e.target.value)}
            />
            <Input
              type="time"
              value={value.hora_promesa || ""}
              onChange={(e) => setField("hora_promesa", e.target.value)}
            />
          </div>
        )}

        <Textarea
          placeholder="Notas cliente"
          value={value.nota_cliente || ""}
          onChange={(e) => setField("nota_cliente", e.target.value)}
        />

        <Textarea
          placeholder="Notas internas"
          value={value.nota_interna || ""}
          onChange={(e) => setField("nota_interna", e.target.value)}
        />

        <div className="space-y-3">
          <label className="cursor-pointer">
            <Button asChild variant="outline" size="sm">
              <span>
                <Paperclip className="mr-2 h-4 w-4" />
                Adjuntar
              </span>
            </Button>

            <input
              type="file"
              hidden
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (files.length > 0) addFiles(files);
                e.target.value = "";
              }}
            />
          </label>

          {!!value.files?.length && (
            <div className="space-y-2">
              <Label>Archivos adjuntos</Label>

              <div className="space-y-2">
                {value.files.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between border rounded-md px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}