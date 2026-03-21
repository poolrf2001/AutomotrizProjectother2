"use client";

import { useMemo, useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { ArrowUpDown, Pencil, UserPlus, Eye, Calendar, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { useRouter } from "next/navigation";

export default function LeadsTable({
  rows,
  loading,
  onEdit,
  onAssign,
  canEdit,
  canAssign,
}) {
  const router = useRouter();
  const [sorting, setSorting] = useState([]);
  const [estadosTiempo, setEstadosTiempo] = useState([]);
  const [filtroRango, setFiltroRango] = useState("dia");

  useEffect(() => {
    fetch("/api/configuracion-estados-tiempo", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        const lista = Array.isArray(data) ? data : [];
        setEstadosTiempo(lista);
      })
      .catch(() => setEstadosTiempo([]));
  }, []);

  function getRangoFechas() {
    const ahora = new Date();

    switch (filtroRango) {
      case "dia":
        return {
          inicio: startOfDay(ahora),
          fin: endOfDay(ahora),
        };
      case "semana":
        return {
          inicio: startOfWeek(ahora, { weekStartsOn: 1 }),
          fin: endOfWeek(ahora, { weekStartsOn: 1 }),
        };
      case "mes":
        return {
          inicio: startOfMonth(ahora),
          fin: endOfMonth(ahora),
        };
      default:
        return {
          inicio: startOfDay(ahora),
          fin: endOfDay(ahora),
        };
    }
  }

  const rowsFiltrados = useMemo(() => {
    const { inicio, fin } = getRangoFechas();

    return (rows || []).filter((row) => {
      if (!row?.fecha_agenda) return false;

      try {
        const fechaRow = new Date(row.fecha_agenda);
        return fechaRow >= inicio && fechaRow <= fin;
      } catch {
        return false;
      }
    });
  }, [rows, filtroRango]);

  function getMinutosRestantes(fechaAgenda, horaAgenda) {
    if (!fechaAgenda || !horaAgenda) return null;

    try {
      const fechaStr = String(fechaAgenda).trim().split("T")[0];
      const horaStr = String(horaAgenda)
        .trim()
        .split(":")
        .slice(0, 2)
        .join(":");

      const fechaHoraString = `${fechaStr}T${horaStr}:00`;

      const ahora = new Date();
      const agendaDateTime = new Date(fechaHoraString);

      if (isNaN(agendaDateTime.getTime())) {
        return null;
      }

      const diferencia = agendaDateTime.getTime() - ahora.getTime();
      const minutos = Math.floor(diferencia / 1000 / 60);

      return minutos;
    } catch (error) {
      console.error("Error calculando minutos:", error);
      return null;
    }
  }

  function getColorEstadoTiempo(minutosRestantes, etapasconversion_id) {
    if (etapasconversion_id !== 1 && etapasconversion_id !== 2) {
      return {
        bg: "#f0fdf4",
        text: "#000000",
        border: "border-green-200",
      };
    }

    if (minutosRestantes === null) {
      return {
        bg: "transparent",
        text: "#000000",
        border: "border-gray-200",
      };
    }

    const estadoActivo = estadosTiempo.find(
      (e) =>
        e.activo &&
        minutosRestantes >= e.minutos_desde &&
        minutosRestantes <= e.minutos_hasta
    );

    if (estadoActivo) {
      return {
        bg: estadoActivo.color_hexadecimal,
        text: esColorOscuro(estadoActivo.color_hexadecimal) ? "#ffffff" : "#000000",
        border: "border-gray-200",
      };
    }

    return {
      bg: "transparent",
      text: "#000000",
      border: "border-gray-200",
    };
  }

  function esColorOscuro(color) {
    const hex = color.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128;
  }

  function getEstadoTiempoTexto(minutosRestantes) {
    if (minutosRestantes === null) return "-";
    if (minutosRestantes < 0) return "Vencido";
    if (minutosRestantes === 0) return "Ahora";
    if (minutosRestantes < 60) return `${minutosRestantes}m`;
    if (minutosRestantes < 1440) return `${Math.floor(minutosRestantes / 60)}h`;
    return `${Math.floor(minutosRestantes / 1440)}d`;
  }

  const handleVerLead = (lead) => {
    router.push(`/leads/${lead.id}`);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "oportunidad_id",
        header: "Código",
        cell: ({ row }) => (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="font-semibold text-blue-600 cursor-help">
                #{row.original?.oportunidad_id || "-"}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top">
              ID de la oportunidad
            </TooltipContent>
          </Tooltip>
        ),
      },
      {
        accessorKey: "cliente_name",
        header: ({ column }) => (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className="px-0"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              >
                Cliente
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              Haz clic para ordenar
            </TooltipContent>
          </Tooltip>
        ),
        cell: ({ row }) => (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="font-medium cursor-help">
                {row.original?.cliente_name || "-"}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top">
              {row.original?.cliente_name || "Sin nombre"}
            </TooltipContent>
          </Tooltip>
        ),
      },
      {
        accessorKey: "asignado_a_name",
        header: "Asignado a",
        cell: ({ row }) => (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant={
                  row.original?.asignado_a_name && row.original?.asignado_a_name !== "Sin asignar"
                    ? "default"
                    : "secondary"
                }
                className="cursor-help"
              >
                {row.original?.asignado_a_name || "Sin asignar"}
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="top">
              Usuario responsable del lead
            </TooltipContent>
          </Tooltip>
        ),
      },
      {
        accessorKey: "origen_name",
        header: "Origen",
        cell: ({ row }) => (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-sm cursor-help">
                {row.original?.origen_name || "-"}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top">
              Origen del lead
            </TooltipContent>
          </Tooltip>
        ),
      },
      {
        accessorKey: "suborigen_name",
        header: "Suborigen",
        cell: ({ row }) => (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-sm text-gray-600 cursor-help">
                {row.original?.suborigen_name || "-"}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top">
              Suborigen del lead
            </TooltipContent>
          </Tooltip>
        ),
      },
      {
        id: "vehiculo",
        header: "Vehículo",
        cell: ({ row }) => {
          const modelo = row.original?.modelo_name || "";
          const marca = row.original?.marca_name || "";
          const texto = `${marca}${modelo && marca ? " " : ""}${modelo}`;
          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-sm font-medium cursor-help">
                  {texto || "-"}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top">
                {texto || "Sin vehículo"}
              </TooltipContent>
            </Tooltip>
          );
        },
      },
      {
        accessorKey: "etapa_name",
        header: "Etapa",
        cell: ({ row }) => (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline">
                {row.original?.etapa_name || "-"}
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="top">
              Etapa actual del lead
            </TooltipContent>
          </Tooltip>
        ),
      },
      {
        accessorKey: "fecha_agenda",
        header: "Fecha agendada",
        cell: ({ row }) => {
          if (!row.original?.fecha_agenda) {
            return (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-sm text-gray-400 cursor-help">-</span>
                </TooltipTrigger>
                <TooltipContent side="top">
                  No agendado
                </TooltipContent>
              </Tooltip>
            );
          }

          const minutos = getMinutosRestantes(
            row.original?.fecha_agenda,
            row.original?.hora_agenda
          );

          const esVencido = minutos !== null && minutos < 0;
          const esProximo = minutos !== null && minutos >= 0 && minutos <= 60;

          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-sm cursor-help">
                  <div className="font-medium">
                    {new Date(row.original.fecha_agenda).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "short",
                    })}
                    {" a las "}
                    {row.original?.hora_agenda
                      ? String(row.original.hora_agenda).slice(0, 5)
                      : "-"}
                  </div>
                  {esVencido && (
                    <div className="text-red-600 font-semibold flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Vencido
                    </div>
                  )}
                  {esProximo && (
                    <div className="text-orange-600 font-semibold">
                      En {getEstadoTiempoTexto(minutos)}
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                {esVencido
                  ? "Esta agenda ha vencido"
                  : `Faltan ${getEstadoTiempoTexto(minutos)}`}
              </TooltipContent>
            </Tooltip>
          );
        },
      },
      {
        accessorKey: "temperatura",
        header: "Temp.",
        cell: ({ row }) => {
          const temp = row.original?.temperatura ?? 0;
          let color = "bg-blue-100 text-blue-900";

          if (temp > 75) color = "bg-red-100 text-red-900";
          else if (temp > 50) color = "bg-orange-100 text-orange-900";
          else if (temp > 25) color = "bg-yellow-100 text-yellow-900";

          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className={`${color} cursor-help`}>
                  {temp}%
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="top">
                Temperatura del lead: {temp}%
              </TooltipContent>
            </Tooltip>
          );
        },
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="flex gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="text-white bg-blue-600 hover:bg-blue-700"
                  size="sm"
                  onClick={() => handleVerLead(row.original)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                Ver detalle completo
              </TooltipContent>
            </Tooltip>

            {canEdit && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(row.original)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  Editar lead
                </TooltipContent>
              </Tooltip>
            )}

            {canAssign && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAssign(row.original)}
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  Asignar a usuario
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        ),
      },
    ],
    [canEdit, canAssign, onEdit, onAssign]
  );

  const table = useReactTable({
    data: rowsFiltrados,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-4">
        {/* FILTRO DE RANGO */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
          <Calendar className="h-5 w-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Filtrar por período:</span>
          <Select value={filtroRango} onValueChange={setFiltroRango}>
            <SelectTrigger className="w-[180px] bg-white border-gray-300">
              <SelectValue placeholder="Selecciona rango" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dia">📅 Por día</SelectItem>
              <SelectItem value="semana">📆 Por semana</SelectItem>
              <SelectItem value="mes">📊 Por mes</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs text-gray-600 ml-auto">
            Mostrando <span className="font-semibold">{rowsFiltrados.length}</span> leads
          </span>
        </div>

        {/* TABLA */}
        <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={11}
                      className="px-4 py-12 text-center text-gray-500 font-medium"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                        Cargando datos...
                      </div>
                    </td>
                  </tr>
                ) : table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={11}
                      className="px-4 py-12 text-center text-gray-500 font-medium"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-3xl">📋</span>
                        <div>No hay leads registrados en este período</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row, idx) => {
                    const minutosRestantes = getMinutosRestantes(
                      row.original?.fecha_agenda,
                      row.original?.hora_agenda
                    );
                    const colores = getColorEstadoTiempo(
                      minutosRestantes,
                      row.original?.etapasconversion_id
                    );

                    return (
                      <tr
                        key={row.id}
                        className={`border-b transition-all hover:bg-blue-50 ${
                          idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                        style={{
                          backgroundColor:
                            colores.bg !== "transparent"
                              ? colores.bg
                              : idx % 2 === 0
                              ? "white"
                              : "#f9fafb",
                          color: colores.text,
                        }}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-4 py-3 whitespace-nowrap">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PAGINACIÓN */}
        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 font-medium">
            Página{" "}
            <span className="font-semibold text-gray-900">
              {table.getState().pagination.pageIndex + 1}
            </span>{" "}
            de{" "}
            <span className="font-semibold text-gray-900">
              {table.getPageCount() || 1}
            </span>{" "}
            •{" "}
            <span className="text-gray-600">
              {table.getRowModel().rows.length} de {rowsFiltrados.length} registros
            </span>
          </p>

          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="gap-2"
                >
                  ← Anterior
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                Ir a página anterior
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="gap-2"
                >
                  Siguiente →
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                Ir a página siguiente
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* INFO */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
          <span className="font-semibold">💡 Tip:</span> Pasa el mouse sobre cualquier elemento
          para ver más información. Los colores de fondo indican el estado temporal del lead.
        </div>
      </div>
    </TooltipProvider>
  );
}