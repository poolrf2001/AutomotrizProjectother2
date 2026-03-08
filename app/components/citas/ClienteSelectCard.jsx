"use client";

import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";

import { Check, ChevronsUpDown } from "lucide-react";

import ClienteDialog from "@/app/components/clientes/ClienteDialog";
import VehiculoDialog from "@/app/components/clientes/VehiculoDialog";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function ClienteSelectCard({ onSelect }) {
  const [clientes, setClientes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);

  const [clienteOpen, setClienteOpen] = useState(false);
  const [vehiculoOpen, setVehiculoOpen] = useState(false);

  const [selectedCliente, setSelectedCliente] = useState(null);
  const [selectedVehiculo, setSelectedVehiculo] = useState(null);

  const [clienteDialog, setClienteDialog] = useState({
    open: false,
    mode: "create",
    data: null,
  });

  const [vehiculoDialog, setVehiculoDialog] = useState({
    open: false,
    mode: "create",
    data: null,
  });

  useEffect(() => {
    (async () => {
      try {
        const cRes = await fetch("/api/clientes", { cache: "no-store" });
        const cJson = await cRes.json();
        setClientes(Array.isArray(cJson) ? cJson : []);

        const vRes = await fetch("/api/vehiculos", { cache: "no-store" });
        const vJson = await vRes.json();
        setVehiculos(Array.isArray(vJson) ? vJson : []);
      } catch (e) {
        console.error(e);
        toast.error("Error cargando clientes/vehículos");
        setClientes([]);
        setVehiculos([]);
      }
    })();
  }, []);

  const vehiculosVisibles = useMemo(() => {
    if (!selectedCliente?.id) return vehiculos;
    return vehiculos.filter(
      (v) => Number(v.cliente_id) === Number(selectedCliente.id)
    );
  }, [vehiculos, selectedCliente]);

  function emitir(cliente, vehiculo) {
    onSelect?.({
      cliente: cliente || null,
      vehiculo: vehiculo || null,
    });
  }

  function pickCliente(c) {
    setSelectedCliente(c);
    setSelectedVehiculo(null);
    setClienteOpen(false);
    emitir(c, null);
  }

  function pickVehiculo(v) {
    const cliente = clientes.find(
      (c) => Number(c.id) === Number(v.cliente_id)
    );

    setSelectedVehiculo(v);
    setSelectedCliente(cliente || null);
    setVehiculoOpen(false);
    emitir(cliente || null, v);
  }

  const clienteLabel = selectedCliente
    ? `${selectedCliente.nombre ?? ""} ${selectedCliente.apellido ?? ""}`.trim()
    : "Seleccionar cliente...";

  const vehiculoLabel = selectedVehiculo
    ? `${selectedVehiculo.placas ?? selectedVehiculo.placa ?? "-"}${
        selectedVehiculo.vin ? ` · VIN: ${selectedVehiculo.vin}` : ""
      }`
    : "Seleccionar vehículo...";

  async function handleSaveCliente(data) {
    const method = clienteDialog.mode === "edit" ? "PUT" : "POST";
    const url =
      clienteDialog.mode === "edit"
        ? `/api/clientes/${clienteDialog.data.id}`
        : `/api/clientes`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json?.message || "Error al guardar cliente");
        return;
      }

      toast.success("Cliente guardado");
      setClienteDialog({ open: false, mode: "create", data: null });

      const cRes = await fetch("/api/clientes", { cache: "no-store" });
      const cJson = await cRes.json();
      setClientes(Array.isArray(cJson) ? cJson : []);
    } catch (err) {
      console.error(err);
      toast.error("Error al guardar cliente");
    }
  }

  async function handleSaveVehiculo(data) {
    if (!selectedCliente) {
      toast.warning("Primero seleccione un cliente");
      return;
    }

    const method = vehiculoDialog.mode === "edit" ? "PUT" : "POST";
    const url =
      vehiculoDialog.mode === "edit"
        ? `/api/vehiculos/${vehiculoDialog.data.id}`
        : `/api/vehiculos`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          cliente_id: selectedCliente.id,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json?.message || "Error al guardar vehículo");
        return;
      }

      toast.success("Vehículo guardado");
      setVehiculoDialog({ open: false, mode: "create", data: null });

      const vRes = await fetch("/api/vehiculos", { cache: "no-store" });
      const vJson = await vRes.json();
      setVehiculos(Array.isArray(vJson) ? vJson : []);
    } catch (err) {
      console.error(err);
      toast.error("Error al guardar vehículo");
    }
  }

  return (
    <Card>
      <CardHeader className="font-semibold">Cliente y Vehículo</CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-1">
          <div className="text-sm font-medium">Cliente</div>

          <Popover open={clienteOpen} onOpenChange={setClienteOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={clienteOpen}
                className="w-full justify-between"
              >
                <span className="truncate">{clienteLabel}</span>
                <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <Command>
                <CommandInput placeholder="Buscar cliente..." />
                <CommandList>
                  <CommandEmpty>Sin resultados</CommandEmpty>

                  <CommandGroup heading="Clientes">
                    {clientes.length > 0 ? (
                      clientes.map((c) => {
                        const label = `${c.nombre ?? ""} ${c.apellido ?? ""}`.trim();
                        const selected =
                          Number(selectedCliente?.id) === Number(c.id);

                        return (
                          <CommandItem
                            key={c.id}
                            value={`${label} ${c.celular ?? ""}`.toLowerCase()}
                            onSelect={() => pickCliente(c)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selected ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span className="font-medium">{label || "—"}</span>
                              <span className="text-xs text-muted-foreground">
                                Cel: {c.celular || "-"}
                              </span>
                            </div>
                          </CommandItem>
                        );
                      })
                    ) : (
                      <CommandEmpty>No hay clientes disponibles</CommandEmpty>
                    )}

                    <CommandItem
                      onSelect={() =>
                        setClienteDialog({ open: true, mode: "create", data: null })
                      }
                    >
                      <Button variant="outline" size="sm" className="w-full">
                        Agregar Cliente
                      </Button>
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-1">
          <div className="text-sm font-medium">Vehículo</div>

          <Popover open={vehiculoOpen} onOpenChange={setVehiculoOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={vehiculoOpen}
                className="w-full justify-between"
              >
                <span className="truncate">{vehiculoLabel}</span>
                <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <Command>
                <CommandInput placeholder="Buscar por placa o VIN..." />
                <CommandList>
                  <CommandEmpty>Sin resultados</CommandEmpty>

                  <CommandGroup
                    heading={selectedCliente ? "Vehículos del cliente" : "Vehículos"}
                  >
                    {vehiculosVisibles.map((v) => {
                      const label = `${v.placas ?? v.placa ?? "-"}${
                        v.vin ? ` · VIN: ${v.vin}` : ""
                      }`;

                      const selected =
                        Number(selectedVehiculo?.id) === Number(v.id);

                      const filterValue = `${v.placas ?? ""} ${v.placa ?? ""} ${
                        v.vin ?? ""
                      } ${v.cliente_nombre ?? ""}`.toLowerCase();

                      return (
                        <CommandItem
                          key={v.id}
                          value={filterValue}
                          onSelect={() => pickVehiculo(v)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selected ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span className="font-medium">{label}</span>
                            <span className="text-xs text-muted-foreground">
                              Cliente: {v.cliente_nombre || v.nombre_cliente || "-"}
                            </span>
                          </div>
                        </CommandItem>
                      );
                    })}

                    <CommandItem
                      onSelect={() =>
                        setVehiculoDialog({ open: true, mode: "create", data: null })
                      }
                    >
                      <Button variant="outline" size="sm" className="w-full">
                        Agregar Vehículo
                      </Button>
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {(selectedCliente || selectedVehiculo) && (
          <div className="bg-muted p-4 rounded-lg text-sm space-y-4">
            {selectedCliente && (
              <div>
                <div className="font-semibold mb-1 text-base">
                  Datos del cliente
                </div>

                <div><b>Nombre:</b> {selectedCliente.nombre} {selectedCliente.apellido}</div>
                <div><b>Celular:</b> {selectedCliente.celular || "-"}</div>
                <div><b>Email:</b> {selectedCliente.email || "-"}</div>
                <div><b>DNI:</b> {selectedCliente.dni || "-"}</div>
                <div><b>Dirección:</b> {selectedCliente.direccion || "-"}</div>
              </div>
            )}

            {selectedVehiculo && (
              <div>
                <div className="font-semibold mb-1 text-base">
                  Datos del vehículo
                </div>

                <div><b>Placa:</b> {selectedVehiculo.placa || selectedVehiculo.placas || "-"}</div>
                <div><b>VIN:</b> {selectedVehiculo.vin || "-"}</div>
                <div><b>Marca:</b> {selectedVehiculo.marca_nombre || "-"}</div>
                <div><b>Modelo:</b> {selectedVehiculo.modelo_nombre || "-"}</div>
                <div><b>Año:</b> {selectedVehiculo.anio || "-"}</div>
                <div><b>Color:</b> {selectedVehiculo.color || "-"}</div>
                <div><b>Kilometraje:</b> {selectedVehiculo.kilometraje || "-"}</div>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <ClienteDialog
        open={clienteDialog.open}
        mode={clienteDialog.mode}
        cliente={clienteDialog.data}
        onSave={handleSaveCliente}
        onOpenChange={(v) =>
          setClienteDialog((prev) => ({ ...prev, open: v }))
        }
      />

      <VehiculoDialog
        open={vehiculoDialog.open}
        mode={vehiculoDialog.mode}
        vehiculo={vehiculoDialog.data}
        onSave={handleSaveVehiculo}
        onOpenChange={(v) =>
          setVehiculoDialog((prev) => ({ ...prev, open: v }))
        }
      />
    </Card>
  );
}