"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function MonedasTab() {
  const [monedas, setMonedas] = useState([]);
  const [impuestos, setImpuestos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ================= MONEDAS =================
  const [openMonedaDialog, setOpenMonedaDialog] = useState(false);
  const [openMonedaDelete, setOpenMonedaDelete] = useState(false);
  const [monedaEditId, setMonedaEditId] = useState(null);
  const [monedaToDelete, setMonedaToDelete] = useState(null);

  const [monedaForm, setMonedaForm] = useState({
    codigo: "",
    nombre: "",
    simbolo: "",
    is_active: true,
  });

  // ================= IMPUESTOS =================
  const [openImpuestoDialog, setOpenImpuestoDialog] = useState(false);
  const [openImpuestoDelete, setOpenImpuestoDelete] = useState(false);
  const [impuestoEditId, setImpuestoEditId] = useState(null);
  const [impuestoToDelete, setImpuestoToDelete] = useState(null);

  const [impuestoForm, setImpuestoForm] = useState({
    nombre: "",
    porcentaje: "",
    is_active: true,
  });

  async function loadData() {
    try {
      setLoading(true);

      const [monedasRes, impuestosRes] = await Promise.all([
        fetch("/api/monedas", { cache: "no-store" }),
        fetch("/api/impuestos", { cache: "no-store" }),
      ]);

      const monedasData = await monedasRes.json();
      const impuestosData = await impuestosRes.json();

      setMonedas(Array.isArray(monedasData) ? monedasData : []);
      setImpuestos(Array.isArray(impuestosData) ? impuestosData : []);
    } catch (e) {
      console.log(e);
      toast.error("Error cargando datos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // ================= HELPERS MONEDA =================
  function resetMonedaForm() {
    setMonedaForm({
      codigo: "",
      nombre: "",
      simbolo: "",
      is_active: true,
    });
    setMonedaEditId(null);
  }

  function handleCreateMoneda() {
    resetMonedaForm();
    setOpenMonedaDialog(true);
  }

  function handleEditMoneda(row) {
    setMonedaEditId(row.id);
    setMonedaForm({
      codigo: row.codigo || "",
      nombre: row.nombre || "",
      simbolo: row.simbolo || "",
      is_active: Number(row.is_active) === 1,
    });
    setOpenMonedaDialog(true);
  }

  async function handleSaveMoneda() {
    if (!monedaForm.codigo || !monedaForm.nombre || !monedaForm.simbolo) {
      toast.error("Completa código, nombre y símbolo");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        codigo: monedaForm.codigo.trim().toUpperCase(),
        nombre: monedaForm.nombre.trim(),
        simbolo: monedaForm.simbolo.trim(),
        is_active: monedaForm.is_active ? 1 : 0,
      };

      const res = await fetch(
        monedaEditId ? `/api/monedas/${monedaEditId}` : "/api/monedas",
        {
          method: monedaEditId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.message || "Error guardando moneda");
        return;
      }

      toast.success(monedaEditId ? "Moneda actualizada" : "Moneda creada");
      setOpenMonedaDialog(false);
      resetMonedaForm();
      loadData();
    } catch (e) {
      console.log(e);
      toast.error("Error guardando moneda");
    } finally {
      setSaving(false);
    }
  }

  function handleAskDeleteMoneda(row) {
    setMonedaToDelete(row);
    setOpenMonedaDelete(true);
  }

  async function handleDeleteMoneda() {
    if (!monedaToDelete) return;

    try {
      const res = await fetch(`/api/monedas/${monedaToDelete.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.message || "Error eliminando moneda");
        return;
      }

      toast.success("Moneda eliminada");
      setOpenMonedaDelete(false);
      setMonedaToDelete(null);
      loadData();
    } catch (e) {
      console.log(e);
      toast.error("Error eliminando moneda");
    }
  }

  async function handleToggleMoneda(row, checked) {
    try {
      const res = await fetch(`/api/monedas/${row.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo: row.codigo,
          nombre: row.nombre,
          simbolo: row.simbolo,
          is_active: checked ? 1 : 0,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.message || "Error actualizando moneda");
        return;
      }

      toast.success("Estado de moneda actualizado");
      loadData();
    } catch (e) {
      console.log(e);
      toast.error("Error actualizando moneda");
    }
  }

  // ================= HELPERS IMPUESTO =================
  function resetImpuestoForm() {
    setImpuestoForm({
      nombre: "",
      porcentaje: "",
      is_active: true,
    });
    setImpuestoEditId(null);
  }

  function handleCreateImpuesto() {
    resetImpuestoForm();
    setOpenImpuestoDialog(true);
  }

  function handleEditImpuesto(row) {
    setImpuestoEditId(row.id);
    setImpuestoForm({
      nombre: row.nombre || "",
      porcentaje: row.porcentaje ?? "",
      is_active: Number(row.is_active) === 1,
    });
    setOpenImpuestoDialog(true);
  }

  async function handleSaveImpuesto() {
    if (!impuestoForm.nombre || impuestoForm.porcentaje === "") {
      toast.error("Completa nombre y porcentaje");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        nombre: impuestoForm.nombre.trim(),
        porcentaje: Number(impuestoForm.porcentaje),
        is_active: impuestoForm.is_active ? 1 : 0,
      };

      const res = await fetch(
        impuestoEditId ? `/api/impuestos/${impuestoEditId}` : "/api/impuestos",
        {
          method: impuestoEditId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.message || "Error guardando impuesto");
        return;
      }

      toast.success(impuestoEditId ? "Impuesto actualizado" : "Impuesto creado");
      setOpenImpuestoDialog(false);
      resetImpuestoForm();
      loadData();
    } catch (e) {
      console.log(e);
      toast.error("Error guardando impuesto");
    } finally {
      setSaving(false);
    }
  }

  function handleAskDeleteImpuesto(row) {
    setImpuestoToDelete(row);
    setOpenImpuestoDelete(true);
  }

  async function handleDeleteImpuesto() {
    if (!impuestoToDelete) return;

    try {
      const res = await fetch(`/api/impuestos/${impuestoToDelete.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.message || "Error eliminando impuesto");
        return;
      }

      toast.success("Impuesto eliminado");
      setOpenImpuestoDelete(false);
      setImpuestoToDelete(null);
      loadData();
    } catch (e) {
      console.log(e);
      toast.error("Error eliminando impuesto");
    }
  }

  async function handleToggleImpuesto(row, checked) {
    try {
      const res = await fetch(`/api/impuestos/${row.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: row.nombre,
          porcentaje: Number(row.porcentaje),
          is_active: checked ? 1 : 0,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.message || "Error actualizando impuesto");
        return;
      }

      toast.success("Estado de impuesto actualizado");
      loadData();
    } catch (e) {
      console.log(e);
      toast.error("Error actualizando impuesto");
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold">Configuración de moneda e impuesto</h1>

      {/* ================= TABLA MONEDAS ================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Monedas</h2>
          <Button onClick={handleCreateMoneda}>Nueva moneda</Button>
        </div>

        <div className="border rounded-lg overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="border p-2 text-left">ID</th>
                <th className="border p-2 text-left">Código</th>
                <th className="border p-2 text-left">Nombre</th>
                <th className="border p-2 text-left">Símbolo</th>
                <th className="border p-2 text-center">Activo</th>
                <th className="border p-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {monedas.map((row) => (
                <tr key={row.id}>
                  <td className="border p-2">{row.id}</td>
                  <td className="border p-2">{row.codigo}</td>
                  <td className="border p-2">{row.nombre}</td>
                  <td className="border p-2">{row.simbolo}</td>
                  <td className="border p-2 text-center">
                    <div className="flex justify-center">
                      <Switch
                        checked={Number(row.is_active) === 1}
                        onCheckedChange={(checked) => handleToggleMoneda(row, checked)}
                      />
                    </div>
                  </td>
                  <td className="border p-2">
                    <div className="flex justify-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditMoneda(row)}>
                        Editar
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleAskDeleteMoneda(row)}>
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && monedas.length === 0 && (
                <tr>
                  <td colSpan={6} className="border p-4 text-center text-muted-foreground">
                    No hay monedas registradas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= TABLA IMPUESTOS ================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Impuestos</h2>
          <Button onClick={handleCreateImpuesto}>Nuevo impuesto</Button>
        </div>

        <div className="border rounded-lg overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="border p-2 text-left">ID</th>
                <th className="border p-2 text-left">Nombre</th>
                <th className="border p-2 text-left">Porcentaje</th>
                <th className="border p-2 text-center">Activo</th>
                <th className="border p-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {impuestos.map((row) => (
                <tr key={row.id}>
                  <td className="border p-2">{row.id}</td>
                  <td className="border p-2">{row.nombre}</td>
                  <td className="border p-2">{row.porcentaje}%</td>
                  <td className="border p-2 text-center">
                    <div className="flex justify-center">
                      <Switch
                        checked={Number(row.is_active) === 1}
                        onCheckedChange={(checked) => handleToggleImpuesto(row, checked)}
                      />
                    </div>
                  </td>
                  <td className="border p-2">
                    <div className="flex justify-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditImpuesto(row)}>
                        Editar
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleAskDeleteImpuesto(row)}>
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && impuestos.length === 0 && (
                <tr>
                  <td colSpan={5} className="border p-4 text-center text-muted-foreground">
                    No hay impuestos registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= DIALOG MONEDA ================= */}
      <Dialog open={openMonedaDialog} onOpenChange={setOpenMonedaDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{monedaEditId ? "Editar moneda" : "Nueva moneda"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Código</Label>
              <Input
                value={monedaForm.codigo}
                onChange={(e) =>
                  setMonedaForm((prev) => ({ ...prev, codigo: e.target.value }))
                }
                placeholder="Ej: PEN"
              />
            </div>

            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={monedaForm.nombre}
                onChange={(e) =>
                  setMonedaForm((prev) => ({ ...prev, nombre: e.target.value }))
                }
                placeholder="Ej: Sol Peruano"
              />
            </div>

            <div className="space-y-2">
              <Label>Símbolo</Label>
              <Input
                value={monedaForm.simbolo}
                onChange={(e) =>
                  setMonedaForm((prev) => ({ ...prev, simbolo: e.target.value }))
                }
                placeholder="Ej: S/"
              />
            </div>

            <div className="flex items-center gap-3">
              <Label>Activo</Label>
              <Switch
                checked={monedaForm.is_active}
                onCheckedChange={(checked) =>
                  setMonedaForm((prev) => ({ ...prev, is_active: checked }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenMonedaDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveMoneda} disabled={saving}>
              {monedaEditId ? "Actualizar" : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================= DELETE MONEDA ================= */}
      <AlertDialog open={openMonedaDelete} onOpenChange={setOpenMonedaDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Eliminar la moneda "{monedaToDelete?.nombre}"?
            </AlertDialogTitle>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMoneda}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ================= DIALOG IMPUESTO ================= */}
      <Dialog open={openImpuestoDialog} onOpenChange={setOpenImpuestoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{impuestoEditId ? "Editar impuesto" : "Nuevo impuesto"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={impuestoForm.nombre}
                onChange={(e) =>
                  setImpuestoForm((prev) => ({ ...prev, nombre: e.target.value }))
                }
                placeholder="Ej: IGV"
              />
            </div>

            <div className="space-y-2">
              <Label>Porcentaje</Label>
              <Input
                type="number"
                step="0.01"
                value={impuestoForm.porcentaje}
                onChange={(e) =>
                  setImpuestoForm((prev) => ({ ...prev, porcentaje: e.target.value }))
                }
                placeholder="Ej: 18"
              />
            </div>

            <div className="flex items-center gap-3">
              <Label>Activo</Label>
              <Switch
                checked={impuestoForm.is_active}
                onCheckedChange={(checked) =>
                  setImpuestoForm((prev) => ({ ...prev, is_active: checked }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenImpuestoDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveImpuesto} disabled={saving}>
              {impuestoEditId ? "Actualizar" : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================= DELETE IMPUESTO ================= */}
      <AlertDialog open={openImpuestoDelete} onOpenChange={setOpenImpuestoDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Eliminar el impuesto "{impuestoToDelete?.nombre}"?
            </AlertDialogTitle>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteImpuesto}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}