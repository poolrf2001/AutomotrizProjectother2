"use client";

import { useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Eye, Pencil, Trash2, Search } from "lucide-react";

const estadoColor = {
  pendiente: "bg-yellow-100 text-yellow-800 border-yellow-300",
  aprobada: "bg-green-100 text-green-800 border-green-300",
  rechazada: "bg-red-100 text-red-800 border-red-300",
};

const estadoLabel = {
  pendiente: "Pendiente",
  aprobada: "Aprobada",
  rechazada: "Rechazada",
};

function formatCurrency(v) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(v || 0);
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-MX", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

export default function CotizacionesTable({
  items = [],
  showTipo = false,
  onView,
  onEdit,
  onDelete,
  permEdit = false,
  permDelete = false,
}) {
  const [q, setQ] = useState("");

  const filtered = items.filter((item) => {
    const search = q.toLowerCase();
    return (
      !q ||
      (item.cliente_nombre || "").toLowerCase().includes(search) ||
      (item.descripcion || "").toLowerCase().includes(search) ||
      (item.usuario_nombre || "").toLowerCase().includes(search) ||
      String(item.id).includes(search)
    );
  });

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar cotización..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">#</TableHead>
              <TableHead>Fecha</TableHead>
              {showTipo && <TableHead>Tipo</TableHead>}
              <TableHead>Cliente</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Creado por</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={showTipo ? 9 : 8} className="text-center py-8 text-muted-foreground">
                  No se encontraron cotizaciones
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>{formatDate(item.created_at)}</TableCell>
                  {showTipo && (
                    <TableCell>
                      <Badge variant="outline">
                        {item.tipo === "taller" ? "Taller" : "Planchado y Pintura"}
                      </Badge>
                    </TableCell>
                  )}
                  <TableCell>{item.cliente_nombre || "Sin cliente"}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {item.descripcion || "—"}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(item.monto_total)}
                  </TableCell>
                  <TableCell>
                    <Badge className={estadoColor[item.estado] || ""}>
                      {estadoLabel[item.estado] || item.estado}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.usuario_nombre || "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => onView?.(item)} title="Ver detalle">
                        <Eye className="w-4 h-4" />
                      </Button>
                      {permEdit && (
                        <Button variant="ghost" size="icon" onClick={() => onEdit?.(item)} title="Editar">
                          <Pencil className="w-4 h-4" />
                        </Button>
                      )}
                      {permDelete && (
                        <Button variant="ghost" size="icon" onClick={() => onDelete?.(item)} title="Eliminar"
                          className="text-red-500 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
