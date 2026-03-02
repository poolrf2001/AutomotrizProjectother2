"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";

export default function StockLocationDialog({
  open,
  onOpenChange,
  product,
  row,
  onSaved
}) {

  const isEdit = !!row;

  const [centros, setCentros] = useState([]);
  const [talleres, setTalleres] = useState([]);
  const [mostradores, setMostradores] = useState([]);

  const [centroId, setCentroId] = useState("");
  const [tallerId, setTallerId] = useState("");
  const [mostradorId, setMostradorId] = useState("");
  const [stock, setStock] = useState("");
  
  const [stockAsignado, setStockAsignado] = useState(0);
  const [stockDisponible, setStockDisponible] = useState(0);

  // Calcular stock disponible
  useEffect(() => {
    if (!open || !product?.id) return;

    async function calcularDisponible() {
      try {
        // Obtener todas las ubicaciones de este producto
        const r = await fetch(`/api/stock_parcial/producto/${product.id}`);
        const ubicaciones = await r.json();
        
        // Total asignado a TODAS las ubicaciones (incluyendo la actual)
        const totalAsignado = ubicaciones.reduce((sum, u) => {
          return sum + Number(u.stock || 0);
        }, 0);

        setStockAsignado(totalAsignado);
        // Disponible = lo que NO está asignado a ninguna ubicación
        const disponible = (product.stock_total || 0) - totalAsignado;
        
        // Si estamos editando, podemos usar el stock actual de esta ubicación + el disponible
        if (isEdit && row) {
          setStockDisponible(disponible + Number(row.stock || 0));
        } else {
          setStockDisponible(disponible);
        }
      } catch (error) {
        console.error("Error calculando stock disponible:", error);
      }
    }

    calcularDisponible();
  }, [open, product?.id, isEdit, row?.id, row?.stock]);

  // cargar centros
  useEffect(() => {
    if (!open) return;

    fetch("/api/centros")
      .then(r => r.json())
      .then(setCentros);
  }, [open]);

  // cargar dependientes
  useEffect(() => {
    if (!centroId) return;

    fetch(`/api/talleres/bycentro?centro_id=${centroId}`)
      .then(r => r.json())
      .then(setTalleres);

    fetch(`/api/mostradores/bycentro?centro_id=${centroId}`)
      .then(r => r.json())
      .then(setMostradores);

  }, [centroId]);

  // cargar data edición
  useEffect(() => {
    if (!open) return;

    if (row) {
      setCentroId(String(row.centro_id || ""));
      setTallerId(String(row.taller_id || ""));
      setMostradorId(String(row.mostrador_id || ""));
      setStock(String(row.stock || ""));
    } else {
      setCentroId("");
      setTallerId("");
      setMostradorId("");
      setStock("");
    }

  }, [row, open]);



  async function save() {

    try {

      // Validaciones
      if (!centroId) {
        return toast.warning("Centro es obligatorio");
      }

      if (!stock) {
        return toast.warning("Stock requerido");
      }

      const stockNumero = Number(stock);
      
      // Validar que el stock asignado no exceda el disponible
      if (stockNumero > stockDisponible) {
        return toast.error(`Solo hay ${stockDisponible} unidades disponibles para asignar`);
      }

      if (stockNumero <= 0) {
        return toast.warning("El stock debe ser mayor a 0");
      }

      // Validación: Solo taller O mostrador, no ambos
      if (tallerId && mostradorId) {
        return toast.warning("Solo puede seleccionar Taller O Mostrador, no ambos");
      }

      // Validación: Debe tener al menos uno (taller o mostrador)
      if (!tallerId && !mostradorId) {
        return toast.warning("Debe seleccionar un Taller o un Mostrador");
      }

      if (isEdit) {

        await fetch(`/api/stock_parcial/${row.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            centro_id: centroId ? Number(centroId) : null,
            taller_id: tallerId ? Number(tallerId) : null,
            mostrador_id: mostradorId ? Number(mostradorId) : null,
            stock: Number(stock)
          })
        });

      } else {

        await fetch("/api/stock_parcial", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            producto_id: product.id,
            centro_id: centroId ? Number(centroId) : null,
            taller_id: tallerId ? Number(tallerId) : null,
            mostrador_id: mostradorId ? Number(mostradorId) : null,
            stock: Number(stock)
          })
        });

      }

      toast.success("Guardado");
      onSaved?.();
      onOpenChange(false);

    } catch {
      toast.error("Error guardando");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>

        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar ubicación" : "Nueva ubicación"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">

          {/* CENTRO */}
          <div>
            <Label>
              Centro <span className="text-red-500">*</span>
            </Label>
            <Select value={centroId} onValueChange={setCentroId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione centro" />
              </SelectTrigger>
              <SelectContent>
                {centros.map(c => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* TALLER */}
          <div>
            <Label>Taller</Label>
            <Select 
              value={tallerId} 
              onValueChange={setTallerId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione taller" />
              </SelectTrigger>
              <SelectContent>
                {talleres.map(t => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    {t.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* MOSTRADOR */}
          <div>
            <Label>Mostrador</Label>
            <Select 
              value={mostradorId} 
              onValueChange={setMostradorId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione mostrador" />
              </SelectTrigger>
              <SelectContent>
                {mostradores.map(m => (
                  <SelectItem key={m.id} value={String(m.id)}>
                    {m.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* STOCK */}
          <div>
            <Label>Stock</Label>
            <Input
              type="number"
              value={stock}
              onChange={e => setStock(e.target.value)}
              max={stockDisponible}
            />
            <div className="mt-2 p-2 bg-muted rounded-md text-xs">
              <p><b>Stock total del producto:</b> {product?.stock_total || 0}</p>
              <p><b>Total asignado a ubicaciones:</b> {stockAsignado}</p>
              <p><b>Sin asignar:</b> {(product?.stock_total || 0) - stockAsignado}</p>
              {isEdit && (
                <p className="mt-1 text-blue-600">
                  <b>Máximo para esta ubicación:</b> {stockDisponible}
                  <span className="text-muted-foreground ml-1">
                    (incluye {row?.stock || 0} actual)
                  </span>
                </p>
              )}
              {!isEdit && (
                <p className="mt-1 text-green-600">
                  <b>Disponible para asignar:</b> {stockDisponible}
                </p>
              )}
            </div>
          </div>

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>

          <Button onClick={save}>
            Guardar
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}
