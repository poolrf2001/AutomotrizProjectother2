"use client";

import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ChevronLeft, ChevronRight, Package, Clock, DollarSign, FileText,
  Plus, Trash2, Search, Loader2, Check,
} from "lucide-react";

const STEPS = [
  { key: "productos", label: "Productos", icon: Package },
  { key: "mano_obra", label: "Mano de obra", icon: Clock },
  { key: "extras", label: "Gastos extras", icon: DollarSign },
  { key: "resumen", label: "Resumen", icon: FileText },
];

function formatCurrency(v) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(v || 0);
}

export default function CotizacionFormDialog({
  open,
  onOpenChange,
  tipo, // "taller" | "pyp"
  userId,
  editData = null,
  onSaved,
}) {
  // Step control
  const [step, setStep] = useState(0);

  // Step labels adapt to tipo
  const stepLabels = useMemo(() => {
    const labels = [...STEPS];
    labels[1] = {
      ...labels[1],
      label: tipo === "pyp" ? "Paños por hora" : "Mano de obra",
    };
    return labels;
  }, [tipo]);

  // ===== PRODUCTOS STATE =====
  const [allProducts, setAllProducts] = useState([]);
  const [prodSearch, setProdSearch] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);

  // ===== TARIFA STATE =====
  const [tarifas, setTarifas] = useState([]);
  const [selectedTarifaId, setSelectedTarifaId] = useState("");
  const [customTarifaHora, setCustomTarifaHora] = useState("");
  const [horasTrabajo, setHorasTrabajo] = useState("");

  // ===== EXTRAS STATE =====
  const [extras, setExtras] = useState([]);
  const [extraDesc, setExtraDesc] = useState("");
  const [extraMonto, setExtraMonto] = useState("");

  // ===== RESUMEN STATE =====
  const [clientes, setClientes] = useState([]);
  const [clienteSearch, setClienteSearch] = useState("");
  const [selectedClienteId, setSelectedClienteId] = useState("");
  const [descripcion, setDescripcion] = useState("");

  // ===== LOADING =====
  const [saving, setSaving] = useState(false);

  // Load products & tarifas on open
  useEffect(() => {
    if (!open) return;
    resetForm();
    loadProducts();
    loadTarifas();
    loadClientes();

    if (editData) {
      loadEditData(editData.id);
    }
  }, [open]);

  function resetForm() {
    setStep(0);
    setSelectedProducts([]);
    setProdSearch("");
    setSelectedTarifaId("");
    setCustomTarifaHora("");
    setHorasTrabajo("");
    setExtras([]);
    setExtraDesc("");
    setExtraMonto("");
    setSelectedClienteId("");
    setClienteSearch("");
    setDescripcion("");
  }

  async function loadProducts() {
    try {
      const r = await fetch("/api/productos", { cache: "no-store" });
      const data = await r.json();
      setAllProducts(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Error cargando productos");
    }
  }

  async function loadTarifas() {
    try {
      const tipoTarifa = tipo === "pyp" ? "panos" : "mano_obra";
      const r = await fetch(`/api/cotizacion-tarifas?tipo=${tipoTarifa}`, { cache: "no-store" });
      const data = await r.json();
      setTarifas(Array.isArray(data) ? data.filter((t) => t.activo) : []);
    } catch {
      toast.error("Error cargando tarifas");
    }
  }

  async function loadClientes() {
    try {
      const r = await fetch("/api/clientes", { cache: "no-store" });
      const data = await r.json();
      setClientes(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Error cargando clientes");
    }
  }

  async function loadEditData(id) {
    try {
      const r = await fetch(`/api/cotizaciones/${id}`, { cache: "no-store" });
      const data = await r.json();
      if (!r.ok) return;

      setSelectedProducts(
        (data.productos || []).map((p) => ({
          producto_id: p.producto_id,
          numero_parte: p.numero_parte,
          nombre: p.producto_nombre,
          cantidad: p.cantidad,
          precio_unitario: p.precio_unitario,
        }))
      );

      if (data.tarifa_id) setSelectedTarifaId(String(data.tarifa_id));
      setCustomTarifaHora(String(data.tarifa_hora || ""));
      setHorasTrabajo(String(data.horas_trabajo || ""));

      setExtras(
        (data.extras || []).map((e) => ({ descripcion: e.descripcion, monto: Number(e.monto) }))
      );

      setSelectedClienteId(data.cliente_id ? String(data.cliente_id) : "");
      setDescripcion(data.descripcion || "");
    } catch {
      toast.error("Error cargando datos de cotización");
    }
  }

  // ===== PRODUCT HELPERS =====
  const filteredProducts = useMemo(() => {
    if (!prodSearch) return allProducts.slice(0, 20);
    const s = prodSearch.toLowerCase();
    return allProducts
      .filter((p) =>
        (p.numero_parte || "").toLowerCase().includes(s) ||
        (p.descripcion || "").toLowerCase().includes(s)
      )
      .slice(0, 20);
  }, [allProducts, prodSearch]);

  function addProduct(product) {
    if (selectedProducts.find((p) => p.producto_id === product.id)) {
      toast.warning("Producto ya agregado");
      return;
    }
    setSelectedProducts((prev) => [
      ...prev,
      {
        producto_id: product.id,
        numero_parte: product.numero_parte,
        nombre: product.descripcion,
        cantidad: 1,
        precio_unitario: Number(product.precio_venta || 0),
      },
    ]);
  }

  function updateProductQty(idx, qty) {
    setSelectedProducts((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, cantidad: Math.max(1, Number(qty) || 1) } : p))
    );
  }

  function updateProductPrice(idx, price) {
    setSelectedProducts((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, precio_unitario: Number(price) || 0 } : p))
    );
  }

  function removeProduct(idx) {
    setSelectedProducts((prev) => prev.filter((_, i) => i !== idx));
  }

  // ===== TARIFA HELPERS =====
  const tarifaHora = useMemo(() => {
    if (selectedTarifaId && selectedTarifaId !== "custom") {
      const t = tarifas.find((t) => String(t.id) === selectedTarifaId);
      return Number(t?.precio_hora || 0);
    }
    return Number(customTarifaHora || 0);
  }, [selectedTarifaId, tarifas, customTarifaHora]);

  // ===== EXTRAS HELPERS =====
  function addExtra() {
    if (!extraDesc.trim() || !extraMonto) {
      toast.warning("Ingrese descripción y monto del gasto extra");
      return;
    }
    setExtras((prev) => [...prev, { descripcion: extraDesc.trim(), monto: Number(extraMonto) }]);
    setExtraDesc("");
    setExtraMonto("");
  }

  function removeExtra(idx) {
    setExtras((prev) => prev.filter((_, i) => i !== idx));
  }

  // ===== TOTALS =====
  const subtotalProductos = selectedProducts.reduce(
    (sum, p) => sum + p.cantidad * p.precio_unitario, 0
  );
  const subtotalManoObra = Number(horasTrabajo || 0) * tarifaHora;
  const subtotalExtras = extras.reduce((sum, e) => sum + e.monto, 0);
  const montoTotal = subtotalProductos + subtotalManoObra + subtotalExtras;

  // ===== CLIENT FILTER =====
  const filteredClientes = useMemo(() => {
    if (!clienteSearch) return clientes.slice(0, 20);
    const s = clienteSearch.toLowerCase();
    return clientes
      .filter((c) =>
        `${c.nombre} ${c.apellido || ""}`.toLowerCase().includes(s) ||
        (c.email || "").toLowerCase().includes(s) ||
        (c.celular || "").toLowerCase().includes(s)
      )
      .slice(0, 20);
  }, [clientes, clienteSearch]);

  // ===== SAVE =====
  async function handleSave() {
    if (!selectedClienteId) {
      toast.warning("Seleccione un cliente");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        tipo,
        cliente_id: Number(selectedClienteId),
        usuario_id: userId,
        descripcion,
        horas_trabajo: Number(horasTrabajo || 0),
        tarifa_id: selectedTarifaId && selectedTarifaId !== "custom" ? Number(selectedTarifaId) : null,
        tarifa_hora: tarifaHora,
        productos: selectedProducts.map((p) => ({
          producto_id: p.producto_id,
          cantidad: p.cantidad,
          precio_unitario: p.precio_unitario,
          subtotal: p.cantidad * p.precio_unitario,
        })),
        extras,
      };

      const url = editData ? `/api/cotizaciones/${editData.id}` : "/api/cotizaciones";
      const method = editData ? "PUT" : "POST";

      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await r.json();
      if (!r.ok) {
        toast.error(data.message || "Error al guardar");
        return;
      }

      toast.success(editData ? "Cotización actualizada" : "Cotización creada");
      onOpenChange(false);
      onSaved?.();
    } catch {
      toast.error("Error de conexión");
    } finally {
      setSaving(false);
    }
  }

  // ===== RENDER STEPS =====
  function renderStepContent() {
    switch (step) {
      case 0:
        return renderProductosStep();
      case 1:
        return renderManoObraStep();
      case 2:
        return renderExtrasStep();
      case 3:
        return renderResumenStep();
      default:
        return null;
    }
  }

  // ----- STEP 1: PRODUCTOS -----
  function renderProductosStep() {
    return (
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar producto por nombre o número de parte..."
            value={prodSearch}
            onChange={(e) => setProdSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Products to select */}
        <div className="border rounded-md max-h-[200px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nro. Parte</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                    No se encontraron productos
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((p) => {
                  const already = selectedProducts.some((sp) => sp.producto_id === p.id);
                  return (
                    <TableRow key={p.id} className={already ? "opacity-50" : ""}>
                      <TableCell className="font-mono text-sm">{p.numero_parte}</TableCell>
                      <TableCell>{p.descripcion}</TableCell>
                      <TableCell className="text-right">{formatCurrency(p.precio_venta)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost" size="icon"
                          onClick={() => addProduct(p)}
                          disabled={already}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Selected products */}
        {selectedProducts.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Productos seleccionados ({selectedProducts.length})</h4>
            <div className="border rounded-md max-h-[200px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="w-24">Cantidad</TableHead>
                    <TableHead className="w-32">Precio Unit.</TableHead>
                    <TableHead className="text-right w-28">Subtotal</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedProducts.map((p, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <span className="font-mono text-xs mr-2">{p.numero_parte}</span>
                        {p.nombre}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number" min={1}
                          value={p.cantidad}
                          onChange={(e) => updateProductQty(idx, e.target.value)}
                          className="h-8 w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number" min={0} step="0.01"
                          value={p.precio_unitario}
                          onChange={(e) => updateProductPrice(idx, e.target.value)}
                          className="h-8 w-28"
                        />
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(p.cantidad * p.precio_unitario)}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => removeProduct(idx)}
                          className="text-red-500 hover:text-red-700 h-8 w-8">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="text-right mt-2 font-semibold">
              Subtotal productos: {formatCurrency(subtotalProductos)}
            </p>
          </div>
        )}
      </div>
    );
  }

  // ----- STEP 2: MANO DE OBRA / PAÑOS -----
  function renderManoObraStep() {
    const label = tipo === "pyp" ? "Paños" : "Mano de obra";
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Seleccionar tarifa de {label}</Label>
          <Select value={selectedTarifaId} onValueChange={(v) => setSelectedTarifaId(v)}>
            <SelectTrigger>
              <SelectValue placeholder={`Seleccione tarifa de ${label.toLowerCase()}...`} />
            </SelectTrigger>
            <SelectContent>
              {tarifas.map((t) => (
                <SelectItem key={t.id} value={String(t.id)}>
                  {t.nombre} — {formatCurrency(t.precio_hora)}/hr
                </SelectItem>
              ))}
              <SelectItem value="custom">Ingresar precio personalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedTarifaId === "custom" && (
          <div className="space-y-2">
            <Label>Precio por hora personalizado</Label>
            <Input
              type="number" min={0} step="0.01"
              placeholder="0.00"
              value={customTarifaHora}
              onChange={(e) => setCustomTarifaHora(e.target.value)}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label>Horas de trabajo</Label>
          <Input
            type="number" min={0} step="0.5"
            placeholder="Ej: 3"
            value={horasTrabajo}
            onChange={(e) => setHorasTrabajo(e.target.value)}
          />
        </div>

        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Tarifa por hora:</span>
            <span className="font-medium">{formatCurrency(tarifaHora)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Horas:</span>
            <span className="font-medium">{horasTrabajo || 0}</span>
          </div>
          <hr />
          <div className="flex justify-between font-semibold">
            <span>Subtotal {label.toLowerCase()}:</span>
            <span>{formatCurrency(subtotalManoObra)}</span>
          </div>
        </div>
      </div>
    );
  }

  // ----- STEP 3: EXTRAS -----
  function renderExtrasStep() {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-[1fr_150px_auto] gap-2 items-end">
          <div className="space-y-1">
            <Label>Descripción del gasto</Label>
            <Input
              placeholder="Ej: Transporte, materiales adicionales..."
              value={extraDesc}
              onChange={(e) => setExtraDesc(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Monto</Label>
            <Input
              type="number" min={0} step="0.01"
              placeholder="0.00"
              value={extraMonto}
              onChange={(e) => setExtraMonto(e.target.value)}
            />
          </div>
          <Button onClick={addExtra} size="icon" className="mb-0.5">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {extras.length > 0 && (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {extras.map((e, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{e.descripcion}</TableCell>
                    <TableCell className="text-right">{formatCurrency(e.monto)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => removeExtra(idx)}
                        className="text-red-500 hover:text-red-700 h-8 w-8">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <p className="text-right font-semibold">
          Subtotal extras: {formatCurrency(subtotalExtras)}
        </p>
      </div>
    );
  }

  // ----- STEP 4: RESUMEN -----
  function renderResumenStep() {
    const label = tipo === "pyp" ? "Paños" : "Mano de obra";
    return (
      <div className="space-y-6">
        {/* Client selection */}
        <div className="space-y-2">
          <Label>Cliente *</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente..."
              value={clienteSearch}
              onChange={(e) => {
                setClienteSearch(e.target.value);
                if (!e.target.value) setSelectedClienteId("");
              }}
              className="pl-9"
            />
          </div>
          {clienteSearch && !selectedClienteId && (
            <div className="border rounded-md max-h-[120px] overflow-y-auto">
              {filteredClientes.map((c) => (
                <button
                  key={c.id}
                  className="w-full text-left px-3 py-2 hover:bg-muted/50 text-sm border-b last:border-b-0"
                  onClick={() => {
                    setSelectedClienteId(String(c.id));
                    setClienteSearch(`${c.nombre} ${c.apellido || ""}`.trim());
                  }}
                >
                  <span className="font-medium">{c.nombre} {c.apellido || ""}</span>
                  {c.celular && <span className="text-muted-foreground ml-2">({c.celular})</span>}
                </button>
              ))}
            </div>
          )}
          {selectedClienteId && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                <Check className="w-3 h-3 mr-1" />
                Cliente seleccionado
              </Badge>
              <Button variant="ghost" size="sm" onClick={() => {
                setSelectedClienteId("");
                setClienteSearch("");
              }}>Cambiar</Button>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label>Descripción de la cotización</Label>
          <Input
            placeholder="Descripción general de la cotización..."
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>

        {/* Summary */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <h4 className="font-semibold text-lg">Resumen de cotización</h4>

          <div className="flex justify-between text-sm">
            <span>Productos ({selectedProducts.length} items):</span>
            <span className="font-medium">{formatCurrency(subtotalProductos)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>{label} ({horasTrabajo || 0} hrs × {formatCurrency(tarifaHora)}/hr):</span>
            <span className="font-medium">{formatCurrency(subtotalManoObra)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Gastos extras ({extras.length}):</span>
            <span className="font-medium">{formatCurrency(subtotalExtras)}</span>
          </div>
          <hr />
          <div className="flex justify-between text-lg font-bold">
            <span>TOTAL:</span>
            <span className="text-green-600">{formatCurrency(montoTotal)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {editData ? "Editar" : "Nueva"} Cotización — {tipo === "pyp" ? "Planchado y Pintura" : "Taller"}
          </DialogTitle>
        </DialogHeader>

        {/* Stepper indicator */}
        <div className="flex items-center justify-between px-2 py-3 border-b">
          {stepLabels.map((s, idx) => {
            const Icon = s.icon;
            const isActive = idx === step;
            const isDone = idx < step;
            return (
              <button
                key={s.key}
                onClick={() => setStep(idx)}
                className={[
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold"
                    : isDone
                    ? "bg-green-100 text-green-700"
                    : "text-muted-foreground hover:bg-muted/50",
                ].join(" ")}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{idx + 1}</span>
              </button>
            );
          })}
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto px-1 py-4 min-h-[300px]">
          {renderStepContent()}
        </div>

        {/* Footer with navigation */}
        <DialogFooter className="flex justify-between sm:justify-between border-t pt-4">
          <div>
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            {step < 3 ? (
              <Button onClick={() => setStep(step + 1)}>
                Siguiente <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editData ? "Actualizar" : "Guardar"} Cotización
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
